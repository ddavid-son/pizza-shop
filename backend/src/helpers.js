export function validatePrices(order) {
  // todo: maybe throw if prices dont match
  let totalPrice = 0;

  order.forEach((product) => {
    let price = product.size.toLowerCase() === "l" ? 25 : 45;
    price += (product.toppingsAll || []).length * 3;
    price +=
      ((product.toppingsLeft || []).length +
        (product.toppingsRight || []).length) *
      1.5;

    price = Math.max(product.size.toLowerCase() === "l" ? 25 : 45, price - 6); // 2 free toppings
    product.price = price;
    totalPrice += price;
  });

  order.totalPrice = totalPrice;
}

export function validatePricesUpdate(order) {
  // todo: maybe throw if prices dont match
  const products = order.products;
  let totalPrice = 0;

  products.forEach((product) => {
    let price = product.size.toLowerCase() === "l" ? 25 : 45;

    product.toppings.forEach((topping) => {
      if (topping.topping_type.toLowerCase() === "all") price += 3;
      // if ( topping.topping_type.toLowerCase() === "right" || topping.topping_type.toLowerCase() === "left")
      else price += 1.5;
    });
    price = Math.max(product.size.toLowerCase() === "l" ? 25 : 45, price - 6); // 2 free toppings
    product.price = price;
    totalPrice += price;
  });

  order.totalPrice = totalPrice;

  console.log(order);
}

export function validateDate(date, delimiter) {
  delimiter ??= "-";
  const regex = new RegExp(
    `\^([0]?[1-9]|[1|2][0-9]|[3][0|1])[${delimiter}]([0]?[1-9]|[1][0-2])[${delimiter}]([0-9]{4})$`
  );

  if (!regex.test(date)) {
    return false;
  }

  const [day, month, year] = date.split(delimiter);
  return `${year}-${month}-${day}`;
}
