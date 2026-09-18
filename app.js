(function () {
  "use strict";
  const ids = ["propertyPrice", "loanAmount", "annualRate", "loanYears", "monthlyRent",
    "annualExpenses", "occupancy", "holdingYears", "salePrice", "saleCostRate", "purchaseCosts"];
  const inputs = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));
  const yen = new Intl.NumberFormat("ja-JP", { maximumFractionDigits: 1 });
  const signed = value => `${value >= 0 ? "+" : "−"}${yen.format(Math.abs(value))}万円`;
  const money = value => Number.isFinite(value) ? `${yen.format(Math.max(0, value))}万円` : "算出不可";

  function values() {
    return Object.fromEntries(ids.map(id => [id, Math.max(0, Number(inputs[id].value) || 0)]));
  }

  function render() {
    const input = values();
    const result = CashFlowCalculator.calculate(input);
    document.getElementById("occupancyOutput").value = input.occupancy;
    document.getElementById("finalProfitLabel").textContent = `${Math.floor(input.holdingYears)}年間保有＋売却した場合の概算収支`;
    document.getElementById("monthlyPayment").textContent = money(result.payment);
    document.getElementById("annualRent").textContent = money(result.annualRent);
    document.getElementById("annualCashFlow").textContent = signed(result.annualCashFlow);
    document.getElementById("remainingBalance").textContent = money(result.balance);
    document.getElementById("cumulativeCashFlow").textContent = signed(result.cumulativeCashFlow);
    document.getElementById("saleCosts").textContent = money(result.saleCosts);
    document.getElementById("netSaleProceeds").textContent = signed(result.netSaleProceeds);
    document.getElementById("initialInvestment").textContent = money(result.initialInvestment);
    const final = document.getElementById("finalProfit");
    final.textContent = signed(result.finalProfit);
    final.classList.toggle("negative", result.finalProfit < 0);
    document.getElementById("breakEvenPrice").textContent = money(result.breakEvenPrice);

    const cases = [1800, 2000, 2200];
    document.getElementById("comparison").innerHTML = cases.map(price => {
      const compared = CashFlowCalculator.calculate({ ...input, salePrice: price });
      const active = price === input.salePrice ? " comparison-card--active" : "";
      return `<article class="comparison-card${active}"><p>売却価格</p><h3>${yen.format(price)}<small>万円</small></h3><div></div><span>最終収支</span><strong class="${compared.finalProfit < 0 ? "negative" : ""}">${signed(compared.finalProfit)}</strong></article>`;
    }).join("");

    document.getElementById("schedule").innerHTML = result.schedule.map(row =>
      `<tr><th>${row.year}年目</th><td class="${row.annualCashFlow < 0 ? "negative" : ""}">${signed(row.annualCashFlow)}</td><td class="${row.cumulativeCashFlow < 0 ? "negative" : ""}">${signed(row.cumulativeCashFlow)}</td><td>${money(row.balance)}</td></tr>`
    ).join("");
  }

  document.getElementById("calculator").addEventListener("input", render);
  render();
})();
