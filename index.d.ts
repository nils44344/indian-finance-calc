export function emi(principal: number, annualRatePct: number, months: number): number;
export function amortize(principal: number, annualRatePct: number, instalment: number, cap?: number): { months: number; interest: number; last: number; never: boolean };
export function loanSchedule(principal: number, annualRatePct: number, months: number): { year: number; principalPaid: number; interestPaid: number; balance: number }[];
export function prepayment(i: { outstanding: number; ratePct: number; monthsLeft: number; prepay: number }): {
  emiNow: number;
  reduceEmi: { emi: number; months: number; interest: number; interestSaved: number };
  reduceTenure: { emi: number; months: number; lastInstalment: number; interest: number; interestSaved: number; monthsSaved: number };
};
export function rateReset(i: { outstanding: number; oldRatePct: number; newRatePct: number; monthsLeft: number }): {
  emiNow: number;
  before: { months: number; interest: number };
  changeEmi: { emi: number; months: number; interest: number };
  changeTenure: { emi: number; months: number; lastInstalment: number; interest: number; never: boolean };
};
export function sipFutureValue(monthly: number, annualReturnPct: number, years: number): number;
export function stepUpSip(monthly: number, stepUpPct: number, annualReturnPct: number, years: number): { value: number; invested: number };
export function epfInterestForYear(openingBalance: number, contributions: number[], ratePct: number): {
  months: { startBalance: number; contribution: number; interest: number }[];
  interest: number;
  closingBalance: number;
};
export function daArrear(basic: number, oldPct: number, newPct: number, months: number): { oldDa: number; newDa: number; monthlyIncrease: number; totalArrear: number };
export function ruleOf72(annualPct: number): number;
export function formatINR(amount: number, opts?: { symbol?: boolean; decimals?: number }): string;
export function toLakhCrore(amount: number, decimals?: number): string;
