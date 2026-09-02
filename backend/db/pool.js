const { Pool } = require("pg");

// Reads DATABASE_URL, e.g.:
//   postgres://user:password@localhost:5432/automarket
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.PGSSL === "true"
      ? { rejectUnauthorized: false }
      : false
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle Postgres client", err);
});

module.exports = pool;
