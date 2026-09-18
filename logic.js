(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.CashFlowCalculator = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function monthlyPayment(principal, annualRate, years) {
    const months = Math.max(0, Math.round(years * 12));
    if (!principal || !months) return 0;
    const rate = annualRate / 100 / 12;
    if (rate === 0) return principal / months;
    return principal * rate * Math.pow(1 + rate, months) / (Math.pow(1 + rate, months) - 1);
  }

  function loanBalance(principal, annualRate, years, paidMonths) {
    const totalMonths = Math.max(0, Math.round(years * 12));
    const elapsed = Math.min(Math.max(0, Math.round(paidMonths)), totalMonths);
    if (!principal || elapsed >= totalMonths) return 0;
    const rate = annualRate / 100 / 12;
    if (rate === 0) return principal * (1 - elapsed / totalMonths);
    const payment = monthlyPayment(principal, annualRate, years);
    return principal * Math.pow(1 + rate, elapsed) - payment * (Math.pow(1 + rate, elapsed) - 1) / rate;
  }

  function calculate(input) {
    const payment = monthlyPayment(input.loanAmount, input.annualRate, input.loanYears);
    const annualRent = input.monthlyRent * 12 * input.occupancy / 100;
    const holdingYears = Math.max(0, Math.floor(input.holdingYears));
    const balance = loanBalance(input.loanAmount, input.annualRate, input.loanYears, holdingYears * 12);
    const totalLoanMonths = Math.max(0, Math.round(input.loanYears * 12));
    let runningCashFlow = 0;
    const schedule = Array.from({ length: holdingYears }, (_, index) => {
      const year = index + 1;
      const paymentMonths = Math.min(12, Math.max(0, totalLoanMonths - index * 12));
      const annualCashFlow = annualRent - input.annualExpenses - payment * paymentMonths;
      runningCashFlow += annualCashFlow;
      return { year, annualCashFlow, cumulativeCashFlow: runningCashFlow,
        balance: loanBalance(input.loanAmount, input.annualRate, input.loanYears, year * 12) };
    });
    const annualCashFlow = annualRent - input.annualExpenses - payment * Math.min(12, totalLoanMonths);
    const cumulativeCashFlow = runningCashFlow;
    const saleCosts = input.salePrice * input.saleCostRate / 100;
    const netSaleProceeds = input.salePrice - saleCosts - balance;
    const initialInvestment = Math.max(0, input.propertyPrice - input.loanAmount) + input.purchaseCosts;
    const finalProfit = cumulativeCashFlow + netSaleProceeds - initialInvestment;
    const saleKeepRate = 1 - input.saleCostRate / 100;
    const breakEvenPrice = saleKeepRate > 0
      ? (balance + initialInvestment - cumulativeCashFlow) / saleKeepRate
      : Infinity;
    return { payment, annualRent, annualCashFlow, balance, cumulativeCashFlow, saleCosts,
      netSaleProceeds, initialInvestment, finalProfit, breakEvenPrice, schedule };
  }

  return { monthlyPayment, loanBalance, calculate };
});
