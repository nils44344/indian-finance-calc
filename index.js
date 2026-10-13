/**
 * indian-finance-calc — Indian personal-finance formulas, plain JavaScript, no dependencies.
 * The same maths as the free calculators at https://paisatools.co.in (each function names its page).
 * All rates are annual percentages (8.5 means 8.5%). Amounts are in rupees. Results are not rounded
 * unless the rule itself rounds (DA is rounded to the rupee by the government memorandum).
 * MIT licence.
 */

const mrate = (annualPct) => annualPct / 12 / 100;

/** Level EMI for a reducing-balance loan. EMI = P·r·(1+r)^n / ((1+r)^n − 1).
 *  Live: https://paisatools.co.in/emi-calculator */
export function emi(principal, annualRatePct, months) {
  const p = Math.max(0, principal), n = Math.max(0, Math.round(months)), r = mrate(annualRatePct);
  if (!p || !n) return 0;
  if (r === 0) return p / n;
  const f = Math.pow(1 + r, n);
  return (p * r * f) / (f - 1);
}

/** Repay `principal` with a fixed `instalment`, month by month. Returns months (the last one may be
 *  smaller), total interest, the last instalment, and `never: true` if the instalment doesn't cover interest. */
export function amortize(principal, annualRatePct, instalment, cap = 1200) {
  const r = mrate(annualRatePct);
  let bal = Math.max(0, principal), months = 0, interest = 0, last = 0;
  if (!bal) return { months: 0, interest: 0, last: 0, never: false };
  if (instalment <= bal * r + 1e-9) return { months: Infinity, interest: Infinity, last: 0, never: true };
  while (bal > 0.005 && months < cap) {
    const i = bal * r, pay = Math.min(instalment, bal + i);
    interest += i; bal = bal + i - pay; last = pay; months++;
  }
  return { months, interest, last, never: false };
}

/** Year-by-year schedule: [{ year, principalPaid, interestPaid, balance }].
 *  Live: https://paisatools.co.in/emi-calculator */
export function loanSchedule(principal, annualRatePct, months) {
  const r = mrate(annualRatePct), e = emi(principal, annualRatePct, months), rows = [];
  let bal = Math.max(0, principal);
  for (let y = 0; bal > 0.005 && y * 12 < months; y++) {
    let pp = 0, ip = 0;
    for (let m = 0; m < 12 && bal > 0.005; m++) {
      const i = bal * r, pay = Math.min(e, bal + i);
      ip += i; pp += pay - i; bal = bal + i - pay;
    }
    rows.push({ year: y + 1, principalPaid: pp, interestPaid: ip, balance: Math.max(0, bal) });
  }
  return rows;
}

/** Part-prepayment: reduce the EMI (same end date) or reduce the tenure (same EMI)?
 *  Live, with a letter to the bank: https://paisatools.co.in/reduce-emi-or-tenure-calculator */
export function prepayment({ outstanding, ratePct, monthsLeft, prepay }) {
  const n = Math.max(1, Math.round(monthsLeft)), p = Math.max(0, outstanding), x = Math.min(Math.max(0, prepay), p);
  const emiNow = emi(p, ratePct, n), base = amortize(p, ratePct, emiNow);
  const left = p - x, emiLow = emi(left, ratePct, n);
  const e = amortize(left, ratePct, emiLow), t = amortize(left, ratePct, emiNow);
  return {
    emiNow,
    reduceEmi: { emi: emiLow, months: left > 0 ? e.months : 0, interest: e.interest, interestSaved: base.interest - e.interest },
    reduceTenure: { emi: emiNow, months: t.months, lastInstalment: t.last, interest: t.interest, interestSaved: base.interest - t.interest, monthsSaved: base.months - t.months },
  };
}

/** Floating-rate reset: change the EMI (same end date) or keep the EMI and move the end date.
 *  RBI's reset rules (RBI/2023-24/55) let the borrower choose.
 *  Live: https://paisatools.co.in/reduce-emi-or-tenure-calculator?mode=reset */
export function rateReset({ outstanding, oldRatePct, newRatePct, monthsLeft }) {
  const n = Math.max(1, Math.round(monthsLeft)), p = Math.max(0, outstanding);
  const emiNow = emi(p, oldRatePct, n), emiNew = emi(p, newRatePct, n);
  const ce = amortize(p, newRatePct, emiNew), ct = amortize(p, newRatePct, emiNow), before = amortize(p, oldRatePct, emiNow);
  return {
    emiNow,
    before: { months: before.months, interest: before.interest },
    changeEmi: { emi: emiNew, months: ce.months, interest: ce.interest },
    changeTenure: { emi: emiNow, months: ct.months, lastInstalment: ct.last, interest: ct.interest, never: ct.never },
  };
}

/** SIP future value, invested at the start of each month: FV = P·[((1+r)^n − 1)/r]·(1+r).
 *  Live: https://paisatools.co.in/sip-calculator */
export function sipFutureValue(monthly, annualReturnPct, years) {
  const P = Math.max(0, monthly), r = mrate(annualReturnPct), n = Math.round(years * 12);
  if (!P || !n) return 0;
  if (r === 0) return P * n;
  return P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
}

/** Step-up SIP: the monthly amount rises by `stepUpPct` every year. Returns { value, invested }.
 *  Live: https://paisatools.co.in/step-up-sip-calculator */
export function stepUpSip(monthly, stepUpPct, annualReturnPct, years) {
  const i = mrate(annualReturnPct), step = stepUpPct / 100;
  let bal = 0, invested = 0, sip = Math.max(0, monthly);
  for (let y = 0; y < Math.round(years); y++) {
    for (let m = 0; m < 12; m++) { bal = (bal + sip) * (1 + i); invested += sip; }
    sip *= 1 + step;
  }
  return { value: bal, invested };
}

/** EPF interest for one financial year, the way EPFO computes it: interest on the balance at the START
 *  of each month (a month's contribution earns from the next month), annual rate / 12, credited once at
 *  year end. `contributions` = 12 monthly EPF credits April→March (employee + employer share, WITHOUT EPS).
 *  Live check against your passbook: https://paisatools.co.in/pf-interest-calculator */
export function epfInterestForYear(openingBalance, contributions, ratePct) {
  const r = ratePct / 100 / 12, c = Array.from({ length: 12 }, (_, k) => Math.max(0, contributions[k] || 0));
  let bal = Math.max(0, openingBalance), interest = 0;
  const months = c.map((amt) => { const i = bal * r; interest += i; const row = { startBalance: bal, contribution: amt, interest: i }; bal += amt; return row; });
  return { months, interest, closingBalance: bal + interest };
}

/** DA / DR arrear: DA is a percentage of basic, rounded to the rupee each month.
 *  Live (central govt, pensioners): https://paisatools.co.in/da-arrear-calculator */
export function daArrear(basic, oldPct, newPct, months) {
  const da = (pct) => Math.round((Math.max(0, basic) * Math.max(0, pct)) / 100);
  const monthlyIncrease = da(newPct) - da(oldPct);
  return { oldDa: da(oldPct), newDa: da(newPct), monthlyIncrease, totalArrear: monthlyIncrease * Math.max(0, Math.round(months)) };
}

/** Rule of 72: approximate years to double money at an annual rate.
 *  Read more: https://paisatools.co.in/blog/paisa-double-kaise-kare */
export const ruleOf72 = (annualPct) => (annualPct > 0 ? 72 / annualPct : Infinity);

/** Indian digit grouping: 2500000 → "₹25,00,000". */
export function formatINR(amount, { symbol = true, decimals = 0 } = {}) {
  const s = Math.abs(amount).toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (amount < 0 ? "-" : "") + (symbol ? "₹" : "") + s;
}

/** Lakh/crore words: 2500000 → "25 lakh", 15000000 → "1.5 crore", 75000 → "75 thousand". */
export function toLakhCrore(amount, decimals = 2) {
  const a = Math.abs(amount), sign = amount < 0 ? "-" : "";
  const fmt = (v) => String(+v.toFixed(decimals));
  if (a >= 1e7) return `${sign}${fmt(a / 1e7)} crore`;
  if (a >= 1e5) return `${sign}${fmt(a / 1e5)} lakh`;
  if (a >= 1e3) return `${sign}${fmt(a / 1e3)} thousand`;
  return `${sign}${fmt(a)}`;
}
