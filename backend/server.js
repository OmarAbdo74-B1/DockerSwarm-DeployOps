require("dotenv").config();
const express = require("express");
const cors = require("cors");

const carsRouter = require("./routes/cars");
const { router: authRouter } = require("./routes/auth");
const favoritesRouter = require("./routes/favorites");
const financeRouter = require("./routes/finance");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/cars", carsRouter);
app.use("/api/auth", authRouter);
app.use("/api/favorites", favoritesRouter);
app.use("/api/finance", financeRouter);

app.get("/api/brands", (req, res) => {
  res.json([
    "BMW",
    "Mercedes-Benz",
    "Toyota",
    "Audi",
    "Porsche",
    "Ford",
    "Hyundai",
    "Kia"
  ]);
});

app.get("/api/categories", (req, res) => {
  res.json([
    { id: "sedans", label: "Sedans" },
    { id: "suvs", label: "SUVs" },
    { id: "sports", label: "Sports Cars" },
    { id: "electric", label: "Electric" },
    { id: "trucks", label: "Trucks" },
    { id: "vans", label: "Vans" }
  ]);
});

app.use((req, res) => res.status(404).json({ error: "Not found" }));

// Central error handler - keeps DB errors from leaking stack traces to clients
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`AutoMarket backend listening on port ${PORT}`);
});
