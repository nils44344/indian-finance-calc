import { test } from "node:test";
import assert from "node:assert/strict";
import { emi, prepayment, rateReset, sipFutureValue, stepUpSip, epfInterestForYear, daArrear, ruleOf72, formatINR, toLakhCrore, loanSchedule } from "../index.js";

test("EMI: ₹30 lakh, 20 years", () => {
  assert.equal(Math.round(emi(3000000, 8.25, 240)), 25562);
  assert.equal(Math.round(emi(3000000, 8.5, 240)), 26035);
  assert.equal(emi(120000, 0, 12), 10000);
});

test("rate reset 8.25% → 8.50%: +₹473 EMI, or 253 instalments", () => {
  const r = rateReset({ outstanding: 3000000, oldRatePct: 8.25, newRatePct: 8.5, monthsLeft: 240 });
  assert.equal(Math.round(r.changeEmi.emi - r.emiNow), 473);
  assert.equal(r.changeTenure.months, 253);
  assert.ok(r.changeTenure.interest > r.changeEmi.interest);
});

test("prepayment ₹2 lakh: tenure cut saves more interest", () => {
  const p = prepayment({ outstanding: 3000000, ratePct: 8.5, monthsLeft: 240, prepay: 200000 });
  assert.equal(Math.round(p.reduceEmi.emi), 24299);
  assert.equal(p.reduceTenure.months, 204);
  assert.ok(p.reduceTenure.interestSaved > p.reduceEmi.interestSaved);
});

test("schedule ends at zero", () => {
  const s = loanSchedule(1000000, 9, 120);
  assert.equal(s.length, 10);
  assert.ok(s[s.length - 1].balance < 1);
});

test("SIP and step-up", () => {
  assert.equal(Math.round(sipFutureValue(10000, 12, 10)), 2323391);
  const s = stepUpSip(10000, 0, 12, 10);
  assert.equal(Math.round(s.value), 2323391);
  assert.equal(s.invested, 1200000);
});

test("EPF: interest on start-of-month balance", () => {
  const r = epfInterestForYear(250000, Array(12).fill(7200), 8.25);
  assert.equal(r.months[0].interest, 1718.75);
  assert.equal(Math.round(r.interest), 23892);
});

test("DA arrear: ₹35,400 basic, 60% → 63%, 3 months", () => {
  const d = daArrear(35400, 60, 63, 3);
  assert.equal(d.monthlyIncrease, 1062);
  assert.equal(d.totalArrear, 3186);
});

test("formatting and rule of 72", () => {
  assert.equal(formatINR(2500000), "₹25,00,000");
  assert.equal(toLakhCrore(2500000), "25 lakh");
  assert.equal(toLakhCrore(15000000), "1.5 crore");
  assert.equal(ruleOf72(12), 6);
});
