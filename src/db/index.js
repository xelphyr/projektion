import dotenv from "dotenv";
dotenv.config()

import pkg from 'pg';
const {Pool} = pkg;

const pool = new Pool({
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWD,
    port:5432,
    ssl: false
})

export default pool;