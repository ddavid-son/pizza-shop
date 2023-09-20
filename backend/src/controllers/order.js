import dbPool from "../db.js";
import {
  validatePrices,
  validatePricesUpdate,
  validateDate,
} from "../helpers.js";

export const addOrder = async (req, res) => {
  const { order, customer } = req.body;
  await dbPool.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");
  const connection = await dbPool.getConnection();
  await connection.beginTransaction();

  try {
    const insertCustomerQuery =
      "INSERT INTO customers (name, email) VALUES (?,?);";

    await connection.execute(insertCustomerQuery, [
      customer.name,
      customer.email,
    ]); // todo: add creation only if not exists

    const [customerRow] = await connection.execute(
      "SELECT * FROM customers WHERE customer_id = LAST_INSERT_ID();"
    );

    validatePrices(order);

    const insertOrderQuery =
      "INSERT INTO orders (customer_id, total_price) VALUES (?,?);";

    await connection.execute(insertOrderQuery, [
      customerRow[0].customer_id,
      order.totalPrice,
    ]);

    const [orderRow] = await connection.execute(
      "SELECT * FROM orders WHERE order_id = LAST_INSERT_ID();"
    );

    const insertProductQuery =
      "INSERT INTO product (order_id,size,amount,price) VALUES (?,?,?,?);";

    const productsToServe = [];
    for (const product of order) {
      await connection.execute(insertProductQuery, [
        orderRow[0].order_id,
        product.size,
        1, //product.amount // todo: maybe
        product.price,
      ]);

      const [productRow] = await connection.execute(
        "SELECT * FROM product WHERE product_id = LAST_INSERT_ID();"
      );
      productsToServe.push(productRow[0]);
      await addToppings(product, productRow[0], connection);
    }

    const [toppingsRows] = await connection.execute(
      "select * from toppingsProducts where product_id in (?)",
      [productsToServe.map((p) => p.product_id).join(",")]
    );

    await connection.commit();
    res.send({
      order: orderRow,
      product: productsToServe,
      customer: customerRow,
      toppings: toppingsRows,
    });
  } catch (err) {
    console.error(`Error occurred ${err}`);
    connection.rollback();
    console.info("Rollback successful");
    res.status(400).send({ err });
  } finally {
    connection.release();
  }
};

async function addToppings(product, productRow, connection) {
  const toppingsToInsert = [
    ...product.toppingsAll.map((topping) => ({ topping, type: "ALL" })),
    ...product.toppingsLeft.map((topping) => ({ topping, type: "Left" })),
    ...product.toppingsRight.map((topping) => ({ topping, type: "Right" })),
  ];

  const queries = toppingsToInsert.map((toppingData) =>
    connection.execute(
      "INSERT INTO toppingsProducts (topping_name, product_id, topping_type) VALUES (?, ?, ?);",
      [toppingData.topping, productRow.product_id, toppingData.type]
    )
  );

  const a = await Promise.all(queries);
  // await Promise.allSettled(queries);
}

async function addToppingsUpdate(product, connection) {
  const queries = product.toppings.map((topping) =>
    connection.query(
      "INSERT INTO toppingsProducts (topping_name, product_id, topping_type) VALUES (?, ?, ?);",
      [topping.topping_name, topping.product_id, topping.topping_type]
    )
  );

  await Promise.all(queries);
  // await Promise.allSettled(queries);
}

export const updateOrder = async (req, res) => {
  const { orderId } = req.params; // todo: can be omitted technically
  const { order } = req.body;
  validatePricesUpdate(order);

  const connection = await dbPool.getConnection();
  await connection.beginTransaction();

  try {
    await connection.query(
      "UPDATE orders SET notes = ?, status = ?, total_price = ? WHERE order_id = ?;",
      [order.notes, order.status, order.totalPrice, orderId]
    );

    await connection.query(
      `DELETE tp FROM toppingsProducts tp
      JOIN product p ON tp.product_id = p.product_id
      JOIN orders o ON o.order_id = p.order_id
      WHERE o.order_id = ?; `,
      [orderId]
    );

    const toppingsToServe = [];
    for (const product of order.products) {
      await connection.query(
        "UPDATE product Set size = ?, amount = ?, price = ? WHERE product_id = ?;",
        [product.size, product.amount ?? 1, product.price, product.product_id]
      );

      addToppingsUpdate(product, connection);
      toppingsToServe.push(product.product_id);
    }

    const [newOrder] = await connection.query(
      "select * from orders where order_id = ?;",
      [orderId]
    );
    const [newProducts] = await connection.query(
      "select * from product where order_id = ?;",
      [orderId]
    );
    const [newToppings] = await connection.execute(
      "select * from toppingsProducts where product_id IN (?)",
      [toppingsToServe.join(",")]
    );

    connection.commit();
    res.send({ order: newOrder, products: newProducts, toppings: newToppings });
  } catch (err) {
    console.error(`Error occurred: ${err}`);
    connection.rollback();
    console.info("Rollback successful");
    res.status(400).send({ err });
  } finally {
    connection.release();
  }
};

export const getNextOrder = async (req, res) => {
  const connection = await dbPool.getConnection();
  connection.beginTransaction();

  try {
    const [orderProductRows] = await connection.query(`
      select * from orders o
      join product  p on p.order_id = o.order_id
      where p.order_id = (
        select order_id from orders 
        where orders.status = 'Received'
        order by created_at 
        limit 1
      )
      order by p.product_id;
  `);

    const queries = orderProductRows.map((product) =>
      connection.query(
        "select * from toppingsProducts tp where tp.product_id = ? order by tp.product_id;",
        [product.product_id]
      )
    );

    const toppingsRows = (await Promise.all(queries)).map((tr) => tr[0]);

    connection.commit();
    const order = {
      order_id: orderProductRows[0].order_id,
      notes: orderProductRows[0].notes,
      total_price: orderProductRows[0].total_price,
      status: orderProductRows[0].status,
      created_at: orderProductRows[0].created_at,
      updated_at: orderProductRows[0].updated_at,
      products: orderProductRows.map((product, i) => {
        return {
          product_id: product.product_id,
          size: product.size,
          amount: product.amount ?? 1,
          price: product.price,
          toppings: toppingsRows[i],
        };
      }),
    };

    res.send({ order });
  } catch (err) {
    console.error(`Error occurred: ${err}`);
    connection.rollback();
    console.info("Rollback successful");
    res.status(400).send({ err });
  } finally {
    connection.release();
  }
};

export const changeOrderStatus = async (req, res) => {
  const { orderId, status } = req.params;
  const connection = await dbPool.getConnection();
  await connection.beginTransaction();

  try {
    await connection.query(
      "UPDATE orders SET orders.status = ? WHERE orders.order_id = ?;",
      [status, orderId]
    );

    const [order] = await connection.query(
      "SELECT * FROM orders o WHERE o.order_id = ?;",
      [orderId]
    );

    connection.commit();
    res.send({ order });
  } catch (err) {
    console.error(`Error occurred: ${err}`);
    connection.rollback();
    console.info("Rollback successful");
    res.status(400).send({ err });
  } finally {
    connection.release();
  }
};

export const order_status = async (req, res) => {
  const connection = await dbPool.getConnection();
  await connection.beginTransaction();

  try {
    const [activeOrders] = await connection.query(
      `SELECT o.order_id, o.status, c.name FROM orders o
      JOIN customers c ON c.customer_id = o.customer_id
      WHERE 
        (o.status != 'Finished') 
          OR 
        (o.status = 'Finished' AND o.updated_at >= NOW() - INTERVAL 15 MINUTE); `
    );

    await connection.commit();
    res.send({ activeOrders });
  } catch (err) {
    console.error(`Error occurred: ${err}`);
    await connection.rollback();
    console.info("Rollback successful");
    res.status(400).send({ err });
  } finally {
    connection.release();
  }
};

export const dailyRevenue = async (req, res) => {
  //  if no date was provided revenue will be calculated for today
  // will be in a dd-mm-yyyy or add your include custom delimiter in body named delimiter
  let { date } = req.params;
  const { delimiter } = req.body;

  date ??= new Date().toLocaleDateString("is-il").split(".").join("-");
  const queryDate = validateDate(date, delimiter);
  if (!queryDate) return res.status(400).send("err: date format not allowed");

  const connection = await dbPool.getConnection();
  await connection.beginTransaction();

  try {
    const [dayRevenue] = await connection.query(
      `SELECT SUM(total_price) AS day_revenue 
      FROM orders o
      WHERE o.created_at between ? AND ?;`,
      [queryDate + " 00:00:00", queryDate + " 23:59:59"]
    );

    await connection.commit();
    res.send({ dayRevenue });
  } catch (err) {
    console.error(`Error occurred: ${err}`);
    await connection.rollback();
    console.info("Rollback successful");
    res.status(400).send({ err });
  } finally {
    connection.release();
  }
};

export const getOrder = async (req, res) => {
  const connection = await dbPool.getConnection();
  connection.beginTransaction();

  const { orderId } = req.params;
  try {
    const [orderProductRows] = await connection.query(
      `
      select * from orders o
      join product  p on p.order_id = o.order_id
      where p.order_id = ?`,
      [orderId]
    );

    if (orderProductRows.length === 0)
      return res.status(400).send({ err: "order does not exist" });

    const queries = orderProductRows.map((product) =>
      connection.query(
        "select * from toppingsProducts tp where tp.product_id = ? order by tp.product_id;",
        [product.product_id]
      )
    );

    const toppingsRows = (await Promise.all(queries)).map((tr) => tr[0]);

    connection.commit();
    const order = {
      order_id: orderProductRows[0].order_id,
      notes: orderProductRows[0].notes,
      total_price: orderProductRows[0].total_price,
      status: orderProductRows[0].status,
      created_at: orderProductRows[0].created_at,
      updated_at: orderProductRows[0].updated_at,
      products: orderProductRows.map((product, i) => {
        return {
          product_id: product.product_id,
          size: product.size,
          amount: product.amount ?? 1,
          price: product.price,
          toppings: toppingsRows[i],
        };
      }),
    };

    res.send({ order });
  } catch (err) {
    console.error(`Error occurred: ${err}`);
    connection.rollback();
    console.info("Rollback successful");
    res.status(400).send({ err });
  } finally {
    connection.release();
  }
};

/* final order shape
order : {
  order_id,
  total_price,
  notes,
  status,
  products : [
    {
      product_id, V
      order_id, X
      size, 
      amount, X
      price, V
      toppings:[
        {
          id,
          topping_name,
          product_id,
          topping_type,
        }
      ]
    }
  ]
}
*/
