const express = require("express");
const router = express.Router();

// POST /api/finance/calculate
// body: { price, downPayment, termMonths, annualInterest }
router.post("/calculate", (req, res) => {
  const price = Number(req.body.price) || 0;
  const downPayment = Number(req.body.downPayment) || 0;
  const termMonths = Number(req.body.termMonths) || 60;
  const annualInterest = Number(req.body.annualInterest) || 0;

  const principal = Math.max(0, price - downPayment);
  const monthlyRate = annualInterest / 100 / 12;

  const monthlyPayment = monthlyRate
    ? (principal *
        monthlyRate *
        Math.pow(1 + monthlyRate, termMonths)) /
      (Math.pow(1 + monthlyRate, termMonths) - 1)
    : principal / termMonths;

  res.json({
    principal,
    termMonths,
    annualInterest,
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalPayment: Math.round(monthlyPayment * termMonths * 100) / 100
  });
});

module.exports = router;
