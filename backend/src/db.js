import { createPool } from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();
const dbPool = createPool(process.env.DATABASE_URL);

export default dbPool;
