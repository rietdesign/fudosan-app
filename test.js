const assert = require("node:assert/strict");
const { monthlyPayment, loanBalance, calculate } = require("./logic.js");

assert.ok(Math.abs(monthlyPayment(2200, 3, 35) - 8.466) < 0.01, "元利均等の月返済額");
assert.ok(Math.abs(monthlyPayment(1200, 0, 10) - 10) < 1e-10, "金利0%の返済額");
assert.ok(Math.abs(loanBalance(1200, 0, 10, 60) - 600) < 1e-10, "金利0%の残高");
assert.equal(loanBalance(2200, 3, 35, 420), 0, "完済時の残高");

const initial = calculate({ propertyPrice: 2200, loanAmount: 2200, annualRate: 3, loanYears: 35,
  monthlyRent: 14, annualExpenses: 35, occupancy: 100, holdingYears: 10,
  salePrice: 2000, saleCostRate: 4, purchaseCosts: 0 });
assert.ok(Math.abs(initial.annualRent - 168) < 1e-10);
assert.equal(initial.schedule.length, 10);
assert.ok(Math.abs(initial.finalProfit - (initial.cumulativeCashFlow + initial.netSaleProceeds)) < 1e-10);
const atBreakEven = calculate({ propertyPrice: 2200, loanAmount: 2200, annualRate: 3, loanYears: 35,
  monthlyRent: 14, annualExpenses: 35, occupancy: 100, holdingYears: 10,
  salePrice: initial.breakEvenPrice, saleCostRate: 4, purchaseCosts: 0 });
assert.ok(Math.abs(atBreakEven.finalProfit) < 1e-8, "損益分岐価格");
const afterPayoff = calculate({ propertyPrice: 1200, loanAmount: 1200, annualRate: 0, loanYears: 1,
  monthlyRent: 20, annualExpenses: 0, occupancy: 100, holdingYears: 2,
  salePrice: 0, saleCostRate: 0, purchaseCosts: 0 });
assert.equal(afterPayoff.schedule[0].annualCashFlow, -960, "返済中の年間CF");
assert.equal(afterPayoff.schedule[1].annualCashFlow, 240, "完済後の年間CF");
assert.equal(afterPayoff.cumulativeCashFlow, -720, "完済をまたぐ累計CF");
console.log("All calculation tests passed.");
