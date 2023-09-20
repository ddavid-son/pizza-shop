addonsUrls = {
  onions:
    "https://files.mishloha.co.il/files/menu_food_pic/PSII_199_636892027589824730.png?v=2",

  olives:
    "https://files.mishloha.co.il/files/menu_food_pic/PSII_191_636891984342560900.png?v=2",

  tomatoes:
    "https://files.mishloha.co.il/files/menu_food_pic/PB_63873770_636875732140472052.png?v=2",

  mozzarella:
    "https://files.mishloha.co.il/files/menu_food_pic/PB_328424_636881716320189516.png?v=2",

  parmesan:
    "https://files.mishloha.co.il/files/menu_food_pic/PB_154998_636867003250305304.png?v=2",
};
const avilableToppings = [
  "onions",
  "olives",
  "mozzarella",
  "parmesan",
  "tomatoes",
];

const itemBtns = document.querySelectorAll(".item-btn");
const pizzaStack = document.querySelector(".pizza-preview");
const orderForm = document.getElementById("orderForm");
const priceSpan = document.getElementById("price");
const notes = document.getElementById("notes");

const orders = [];
let price = 25;
let addonsCount = 0;
const toppingsMap = new Map([["size", "xl"]]);

let order = {
  size: "xl",
  toppingsLeft: new Set(),
  toppingsRight: new Set(),
  toppingsAll: new Set(),
  notes: "",
};

const getSiblings = (e) => {
  let siblings = [];
  if (!e.parentNode) {
    return siblings;
  }

  let sibling = e.parentNode.firstChild;
  while (sibling) {
    if (sibling.nodeType === 1 && sibling !== e) {
      siblings.push(sibling);
    }
    sibling = sibling.nextSibling;
  }
  return siblings;
};

const updateToppingImg = (topping, spread) => {
  removeTopping(topping);
  toppingsMap.set(topping, spread);
  updatePrice(topping, spread);
  if (!(spread === "e" || topping === "size")) addTopping(topping, spread);
};

const addTopping = (topping, spread) => {
  const imgElement = document.createElement("img");

  imgElement.id = topping;
  imgElement.width = 340;
  imgElement.className = `stack-toppings ${
    spread === "l" ? "show-l" : spread === "r" ? "show-r" : ""
  }`;
  imgElement.src = addonsUrls[topping];

  imgElement.src = addonsUrls[topping];
  pizzaStack.appendChild(imgElement);
};

const updatePrice = (topping, spread) => {
  let newPrice = 25;

  for (const [k, v] of toppingsMap.entries()) {
    if (v === "xl") {
      newPrice += 20;
    }
    if ((v === "l" && k !== "size") || v === "r") {
      newPrice += 1.5;
    }
    if (v === "f") {
      newPrice += 3;
    }
  }

  price = Math.max(newPrice - 6, toppingsMap.get("size") === "xl" ? 45 : 25);
  priceSpan.innerText = price;
};

const removeTopping = (topping) => {
  for (const child of pizzaStack.children) {
    if (child.id === topping) {
      pizzaStack.removeChild(child);
    }
  }
};

itemBtns.forEach((item) => {
  item.addEventListener("click", (e) => {
    const sibling = getSiblings(e.target);
    sibling.forEach((sib) => {
      sib.classList.remove("active");
    });
    e.target.classList.add("active");
    updateToppingImg(
      e.target.parentElement.dataset.topping,
      e.target.innerText.toLowerCase()
    );
  });
});

orderForm.addEventListener("submit", (e) => {
  e.preventDefault();

  order.size = toppingsMap.get("size");
  order.notes = notes.value; // todo: add sanitization here
  for (let [k, v] of toppingsMap.entries()) {
    if (k !== "size" && v === "l") {
      order.toppingsLeft.add(k);
    }
    if (v === "r") {
      order.toppingsRight.add(k);
    }
    if (v === "f") {
      order.toppingsAll.add(k);
    }
  }

  orders.push(order);
});

function sendOrder() {
  const url = "http://localhost:3001/create-order";

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      orders,
      customer: { name: "david", email: "d@d.com" },
    }),
  });
}
