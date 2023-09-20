import { salesChart } from "./sales-orders-graph.js";
import { toppingsChart } from "./toppings-graph.js";

const toggleButton = document.getElementById("sidebar-toggle");
const sidebar = document.querySelector(".sidebar");
const container = document.querySelector(".container");
// const lis = document.querySelectorAll(".sidebar li");
const cards = document.getElementById("cards-wrapper").children;
const dialog = document.getElementById("edit-dialog");

const date = new Date();

toggleButton.addEventListener("click", () => {
  sidebar.classList.toggle("visible");
  container.classList.toggle("grid-no-sidebar");
});

function updateTable(newData) {
  const table = document.querySelector("table");
  const prevBody = document.querySelector("tbody");
  const tbody = document.createElement("tbody");

  newData.forEach((row, i) => {
    const tr = document.createElement("tr");
    for (const [name, cell] of Object.entries(row)) {
      const td = document.createElement("td");

      switch (name) {
        case "status":
          const p = document.createElement("p");
          p.innerText = cell;
          p.classList = `status ${cell.toLowerCase().replace(" ", "")}`;
          td.appendChild(p);
          break;
        case "price":
          const s = document.createElement("strong");
          s.innerText = `$${cell}`;
          td.appendChild(s);
          break;
        case "actions":
          addActionButtons(tbody, td, row);

          break;
        default:
          td.innerText = cell;
      }

      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  });

  table.removeChild(prevBody);
  table.appendChild(tbody);
}

function addActionButtons(tbody, td, row) {
  const deleteAction = document.createElement("img");
  const editAction = document.createElement("img");

  deleteAction.width = 24;
  deleteAction.height = 24;
  editAction.width = 24;
  editAction.height = 24;

  editAction.src = "./assets/images/edit-icon.svg";
  deleteAction.src = "./assets/images/delete-icon.svg";

  editAction.alt = "edit order";
  deleteAction.alt = "delete order";

  deleteAction.addEventListener("click", async () => {
    const userConfirmed = window.confirm(
      "Are you sure you want to delete this order?"
    );

    if (!userConfirmed) return;

    const res = await fetch(`http://localhost:3001/order/${row.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // refetch or just delete from ui
    tbody.removeChild(tr);
  });

  editAction.addEventListener("click", async (e) => {
    const order = await fetch(`http://localhost:3001/order/${row.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    openEditDialog(row, (await order.json()).order);
  });
  td.appendChild(editAction);
  td.appendChild(deleteAction);
}

const updateUI = async () => {
  // "fetch data"
  const res = await orders_status();

  // update cards
  let i = 0;
  for (const card of cards) {
    card.children[1].innerText = `${i === 0 ? "$" : ""}${res.cards[i][0]}`;
    card.children[3].innerText = `${res.cards[i++][1]}% from yesterday`;
  }

  // update toppings chart
  toppingsChart.data.datasets[0].data = res.toppingsGraph.amount;
  toppingsChart.update();

  // update sales order graph
  salesChart.data.datasets[0].data = res.salesGraph.salesData;
  salesChart.data.datasets[1].data = res.salesGraph.ordersData;
  salesChart.update();

  // update table
  updateTable(res.table);
};

const interval = setInterval(updateUI, 5000);

async function orders_status() {
  try {
    const res = await fetch("http://localhost:3001/order", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {}
  return {
    cards: [
      [rand(100, 9000), rand(1, 30)],
      [rand(10, 90), rand(1, 30)],
      [rand(10, 300), rand(1, 30)],
      [rand(5, 30), rand(1, 30)],
    ],
    table: [
      {
        id: 7,
        name: "david davidson",
        branch: "Holon",
        date: date.toLocaleDateString(),
        status: "received",
        price: 128,
        actions: true,
      },
      {
        id: 6,
        name: "shalom bara",
        branch: "Tel Aviv",
        date: date.toLocaleDateString(),
        status: "finished",
        price: 88.5,
        actions: true,
      },
      {
        id: 5,
        name: "dana bar",
        branch: "Holon",
        date: date.toLocaleDateString(),
        status: "in progress",
        price: 74,
        actions: true,
      },
      {
        id: 4,
        name: "ben gerbi",
        branch: "Ramat Gan",
        date: date.toLocaleDateString(),
        status: "in progress",
        price: 90,
        actions: true,
      },
      {
        id: 3,
        name: "avi cohen",
        branch: "Tel Aviv",
        date: date.toLocaleDateString(),
        status: "finished",
        price: 88.5,
        actions: true,
      },
      {
        id: 2,
        name: "dana bar",
        branch: "Holon",
        date: date.toLocaleDateString(),
        status: "received",
        price: 74,
        actions: true,
      },
      {
        id: 1,
        name: "ben gerbi",
        branch: "Ramat Gan",
        date: date.toLocaleDateString(),
        status: "in progress",
        price: 90,
        actions: true,
      },
    ],
    salesGraph: {
      salesData: Array.from({ length: 10 }).map(
        () => Math.floor(Math.random() * (500 - 180 + 1)) + 180
      ),
      ordersData: Array.from({ length: 10 }).map(
        () => Math.floor(Math.random() * (50 - 18 + 1)) + 18
      ),
    },
    toppingsGraph: {
      toppings: ["Onions", "Olives", "tomatoes", "parmesan", "mozzarella"],
      amount: Array.from({ length: 5 }).map(
        () => Math.floor(Math.random() * (100 - 18 + 1)) + 18
      ),
    },
  };
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function openEditDialog(row, order) {
  const dialogContent = `
  <h2>Edit Order </h2>
  <form>
    <p>
      <label>
        order_id:
        <input type="text" value="${order.order_id}" disabled />
      </label>
    </p>

    <p>
      <label>
        total price:
        <input type="number" value="${order.total_price}" disabled />
      </label>
    </p>

    <p>
      <label>
        status:
        <select>
          <option value="default">${order.status}</option>
          <option>Received</option>
          <option>In Progress</option>
          <option>Finished</option>
        </select>
      </label>
    </p>

    <p>
      <label> notes: </label>
      <textarea cols="35" rows="4">${order.notes || ""}</textarea>
    </p>

    <p>order products:</p>

    ${order.products.map((product) => {
      return `
          <p>
          <label>
            product id:
            <input type="text" value="${product.product_id}" disabled />
          </label>
        </p>

        <p>
          <label>
            price:
            <input type="number" value="${product.price}" disabled />
          </label>
        </p>

        <p>
          <label>
            size:
            <select>
              <option value="default">${product.size.toUpperCase()}</option>
              <option>XL</option>
              <option>L</option>
            </select>
          </label>
        </p>

        <p>
          <label> toppings: </label>
          <textarea cols="35" rows="4">${product.toppings
            .map(
              (topping) =>
                `{'topping_name': '${topping.topping_name}', 'topping_type': '${topping.topping_type}'}`
            )
            .join(",\n")}
          </textarea>
        </p>
          `;
    })}

    

    <div id="btns">
    <button value="cancel" formmethod="dialog">Cancel</button>
    <button id="confirmBtn" value="default">Confirm</button>
    </div>`;

  dialog.innerHTML = dialogContent;
  dialog.showModal();
}
