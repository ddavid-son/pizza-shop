import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import {
  addOrder,
  getNextOrder,
  updateOrder,
  changeOrderStatus,
  order_status,
  dailyRevenue,
  getOrder,
} from "./controllers/order.js";

const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 3001;

app.get("/", (_, res) => res.send("get req"));

app.post("/order", addOrder);

app.get("/order/:orderId", getOrder);

app.patch("/order/:orderId", updateOrder);

app.get("/order", getNextOrder);

app.patch("/order/:orderId/:status", changeOrderStatus);

app.get("/order/status", order_status);

app.get("/order/revenue/:date?", dailyRevenue);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
