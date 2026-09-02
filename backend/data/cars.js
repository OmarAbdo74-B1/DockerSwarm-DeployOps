const pool = require("../db/pool");

// Maps a DB row (snake_case) to the API shape (camelCase) the frontend expects.
function toApiShape(row) {
  return {
    id: row.id,
    name: row.name,
    title: row.title,
    subtitle: row.subtitle,
    fuel: row.fuel,
    transmission: row.transmission,
    mileageKm: row.mileage_km,
    price: Number(row.price),
    location: row.location,
    condition: row.condition,
    category: row.category,
    image: row.image,
    phone: row.phone
  };
}

async function search({ q, condition, location, category, minPrice, maxPrice } = {}) {
  const clauses = [];
  const values = [];

  if (q) {
    values.push(`%${q.toLowerCase()}%`);
    clauses.push(`(LOWER(name) LIKE $${values.length} OR LOWER(title) LIKE $${values.length})`);
  }
  if (condition && condition !== "Any condition") {
    values.push(condition);
    clauses.push(`condition ILIKE $${values.length}`);
  }
  if (location && location !== "All locations") {
    values.push(location);
    clauses.push(`location ILIKE $${values.length}`);
  }
  if (category) {
    values.push(category);
    clauses.push(`category ILIKE $${values.length}`);
  }
  if (minPrice) {
    values.push(Number(minPrice));
    clauses.push(`price >= $${values.length}`);
  }
  if (maxPrice) {
    values.push(Number(maxPrice));
    clauses.push(`price <= $${values.length}`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const { rows } = await pool.query(
    `SELECT * FROM cars ${where} ORDER BY created_at DESC`,
    values
  );
  return rows.map(toApiShape);
}

async function getById(id) {
  const { rows } = await pool.query("SELECT * FROM cars WHERE id = $1", [id]);
  return rows[0] ? toApiShape(rows[0]) : null;
}

async function add(car) {
  const { rows } = await pool.query(
    `INSERT INTO cars
      (name, title, subtitle, fuel, transmission, mileage_km, price, location, condition, category, image, phone)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING *`,
    [
      car.name,
      car.title,
      car.subtitle || null,
      car.fuel || null,
      car.transmission || null,
      car.mileageKm || 0,
      car.price,
      car.location || null,
      car.condition || null,
      car.category || null,
      car.image || null,
      car.phone || null
    ]
  );
  return toApiShape(rows[0]);
}

async function remove(id) {
  const { rowCount } = await pool.query("DELETE FROM cars WHERE id = $1", [id]);
  return rowCount > 0;
}

module.exports = { search, getById, add, remove, toApiShape };
