# indian-finance-calc

Indian personal-finance formulas in plain JavaScript, with zero dependencies: EMI, **reduce EMI vs reduce tenure** (part-prepayment and RBI rate reset), SIP, step-up SIP, **EPF interest the way EPFO computes it**, DA arrear, and ₹ lakh/crore formatting.

These are the same formulas behind the free calculators at [PaisaTools](https://paisatools.co.in). Each function below links to its live calculator, so you can check your numbers against it.

```bash
npm install indian-finance-calc
```

```js
import { emi, prepayment, rateReset, epfInterestForYear, formatINR, toLakhCrore } from "indian-finance-calc";

emi(3000000, 8.5, 240);              // 26034.6…  (₹30 lakh, 8.5%, 20 years)

prepayment({ outstanding: 3000000, ratePct: 8.5, monthsLeft: 240, prepay: 200000 });
// reduceEmi:    EMI ₹24,299, interest saved ≈ ₹2.17 lakh
// reduceTenure: 204 EMIs (3 years sooner), interest saved ≈ ₹7.57 lakh

rateReset({ outstanding: 3000000, oldRatePct: 8.25, newRatePct: 8.5, monthsLeft: 240 });
// changeEmi:    EMI ₹25,562 → ₹26,035, same end date
// changeTenure: same EMI, 253 instalments (the last one smaller)

formatINR(2500000);    // "₹25,00,000"
toLakhCrore(15000000); // "1.5 crore"
```

## Functions

| Function | What it does | Live calculator |
|---|---|---|
| `emi(principal, ratePct, months)` | Level EMI on a reducing balance | [EMI calculator](https://paisatools.co.in/emi-calculator) |
| `loanSchedule(principal, ratePct, months)` | Year-by-year principal, interest and balance | [EMI calculator](https://paisatools.co.in/emi-calculator) |
| `prepayment({...})` | Reduce EMI vs reduce tenure after a part-prepayment | [Reduce EMI or Tenure](https://paisatools.co.in/reduce-emi-or-tenure-calculator) |
| `rateReset({...})` | Change EMI vs keep EMI after a floating-rate change (RBI/2023-24/55) | [Reduce EMI or Tenure, rate reset](https://paisatools.co.in/reduce-emi-or-tenure-calculator?mode=reset) |
| `amortize(principal, ratePct, instalment)` | Months and interest to repay with a fixed instalment | |
| `sipFutureValue(monthly, returnPct, years)` | SIP value, invested at the start of each month | [SIP calculator](https://paisatools.co.in/sip-calculator) |
| `stepUpSip(monthly, stepUpPct, returnPct, years)` | SIP rising by a fixed % every year | [Step-up SIP calculator](https://paisatools.co.in/step-up-sip-calculator) |
| `epfInterestForYear(opening, contributions[12], ratePct)` | EPF interest for one year, month by month | [PF interest calculator](https://paisatools.co.in/pf-interest-calculator) |
| `daArrear(basic, oldPct, newPct, months)` | DA / DR arrear, rounded to the rupee | [DA arrear calculator](https://paisatools.co.in/da-arrear-calculator) |
| `ruleOf72(ratePct)` | Years to double money (approximate) | [Paisa double kaise kare](https://paisatools.co.in/blog/paisa-double-kaise-kare) |
| `formatINR(amount)`, `toLakhCrore(amount)` | Indian digit grouping and lakh/crore words | |

## Notes on the rules
- **EPF:** EPFO pays interest on the balance at the *start* of each month, so a month's contribution earns only from the next month, and the year's interest is credited once at the end of March. That is why the credit looks smaller than "rate × closing balance". Use the passbook EPF credit (employee plus employer share), not the pension (EPS) part.
- **Loans:** banks compute on the reducing balance month by month. Their figures can differ by a few rupees (rounding, the posting date of a prepayment).
- **Rates:** pass the rate that applies to you; no rate is hard-coded.

Prefer a spreadsheet? The same formulas are in free Excel templates: [india-finance-excel-templates](https://github.com/nils44344/india-finance-excel-templates).

For planning, not financial advice. MIT licence © PaisaTools.
