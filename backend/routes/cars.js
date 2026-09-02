const express = require("express");
const router = express.Router();
const carsStore = require("../data/cars");

// GET /api/cars - list + search/filter
router.get("/", async (req, res, next) => {
  try {
    const { q, condition, minPrice, maxPrice, location, category } = req.query;
    const results = await carsStore.search({
      q,
      condition,
      location,
      category,
      minPrice,
      maxPrice
    });
    res.json({ count: results.length, results });
  } catch (err) {
    next(err);
  }
});

// GET /api/cars/:id
router.get("/:id", async (req, res, next) => {
  try {
    const car = await carsStore.getById(req.params.id);
    if (!car) return res.status(404).json({ error: "Car not found" });
    res.json(car);
  } catch (err) {
    next(err);
  }
});

// POST /api/cars - create a listing ("Sell your car" form)
router.post("/", async (req, res, next) => {
  try {
    const { make, model, year, price, phone, city } = req.body;

    if (!make || !model || !year || !price) {
      return res
        .status(400)
        .json({ error: "make, model, year and price are required" });
    }

    const car = await carsStore.add({
      name: `${make} ${model}`,
      title: `${year} ${make} ${model}`,
      subtitle: "New listing",
      fuel: "Unknown",
      transmission: "Unknown",
      mileageKm: 0,
      price: Number(price),
      location: city || "Unknown",
      condition: "Used",
      category: "sedans",
      image: null,
      phone: phone || null
    });

    res.status(201).json(car);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cars/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const removed = await carsStore.remove(req.params.id);
    if (!removed) return res.status(404).json({ error: "Car not found" });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
