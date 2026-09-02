const express = require("express");
const router = express.Router();
const { requireAuth } = require("./auth");
const pool = require("../db/pool");
const { toApiShape } = require("../data/cars");

router.use(requireAuth);

// GET /api/favorites - list current user's favorite cars
router.get("/", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT cars.* FROM favorites
       JOIN cars ON cars.id = favorites.car_id
       WHERE favorites.user_id = $1
       ORDER BY favorites.created_at DESC`,
      [req.user.sub]
    );
    res.json(rows.map(toApiShape));
  } catch (err) {
    next(err);
  }
});

// POST /api/favorites/:carId - add a favorite
router.post("/:carId", async (req, res, next) => {
  try {
    const carId = Number(req.params.carId);
    const carExists = await pool.query("SELECT id FROM cars WHERE id = $1", [carId]);
    if (!carExists.rows.length) {
      return res.status(404).json({ error: "Car not found" });
    }

    await pool.query(
      `INSERT INTO favorites (user_id, car_id) VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [req.user.sub, carId]
    );
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// DELETE /api/favorites/:carId - remove a favorite
router.delete("/:carId", async (req, res, next) => {
  try {
    await pool.query(
      "DELETE FROM favorites WHERE user_id = $1 AND car_id = $2",
      [req.user.sub, Number(req.params.carId)]
    );
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
