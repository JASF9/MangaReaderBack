const { Pool } = require('pg')
require("dotenv").config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const pool = new Pool({
    host: process.env.HOST,
    user :process.env.USER, 
    password:process.env.PASSWORD, 
    database:process.env.DATABASE, 
    port: process.env.DBPORT

})

module.exports = {
  query: (text, params) => pool.query(text, params),
}