import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/mysql2';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL must be set. Did you forget to provision a database?');
}

// Ubah DATABASE_URL menjadi konfigurasi object untuk mysql2
const getConnectionConfig = () => {
  const url = new URL(DATABASE_URL);
  return {
    host: url.hostname,
    port: Number(url.port),
    user: url.username,
    password: url.password,
    database: url.pathname.substring(1),
  };
};

export const pool = mysql.createPool(getConnectionConfig());
export const db = drizzle(pool);

export default pool;
