import { BondInputs, BondResults, CashFlow } from "../data/types/BondCalculator";

export function calculateBond(inputs: BondInputs): BondResults {
  const {
    faceValue,
    annualCouponRate,
    marketPrice,
    yearsToMaturity,
    couponFrequency,
    issueDate,
  } = inputs;

  const periodsPerYear = couponFrequency === "annual" ? 1 : 2;
  const totalPeriods = Math.ceil(yearsToMaturity * periodsPerYear);
  const couponRatePerPeriod = annualCouponRate / 100 / periodsPerYear;
  const couponPayment = faceValue * couponRatePerPeriod;

  // 1. Current Yield
  const annualCoupon = faceValue * (annualCouponRate / 100);
  const currentYield = (annualCoupon / marketPrice) * 100;

  // 2. YTM (Yield to Maturity) calculation using Newton-Raphson
  // Price = sum [ C / (1+y)^t ] + F / (1+y)^T
  const ytmPerPeriod = calculateYTM(
    marketPrice,
    faceValue,
    totalPeriods,
    couponPayment
  );
  const ytm = ytmPerPeriod * periodsPerYear * 100;

  // 3. Total Interest
  const totalInterest = couponPayment * totalPeriods;

  // 4. Premium / Discount indicator
  let premiumDiscountIndicator: "Premium" | "Discount" | "Par" = "Par";
  if (marketPrice > faceValue) {
    premiumDiscountIndicator = "Premium";
  } else if (marketPrice < faceValue) {
    premiumDiscountIndicator = "Discount";
  }

  // 5. Cash Flow Schedule
  const cashFlowSchedule: CashFlow[] = [];
  let cumulativeInterest = 0;
  const startDate = new Date(issueDate);

  for (let i = 1; i <= totalPeriods; i++) {
    const paymentDate = new Date(startDate);
    if (couponFrequency === "annual") {
      paymentDate.setFullYear(startDate.getFullYear() + i);
    } else {
      paymentDate.setMonth(startDate.getMonth() + i * 6);
    }

    cumulativeInterest += couponPayment;
    cashFlowSchedule.push({
      period: i,
      paymentDate: paymentDate.toLocaleDateString(),
      couponPayment,
      cumulativeInterest,
      remainingPrincipal: faceValue, // Principal usually paid at the end, but remaining principal in this context often refers to the face value until it's paid.
    });
  }

  return {
    currentYield,
    ytm,
    totalInterest,
    premiumDiscountIndicator,
    cashFlowSchedule,
  };
}

function calculateYTM(
  price: number,
  faceValue: number,
  periods: number,
  coupon: number
): number {
  let y = coupon / price; // Initial guess
  const tolerance = 0.000001;
  const maxIterations = 100;

  for (let i = 0; i < maxIterations; i++) {
    let f_y = 0;
    let f_prime_y = 0;

    for (let t = 1; t <= periods; t++) {
      const denom = Math.pow(1 + y, t);
      f_y += coupon / denom;
      f_prime_y -= (t * coupon) / (denom * (1 + y));
    }

    const faceDenom = Math.pow(1 + y, periods);
    f_y += faceValue / faceDenom - price;
    f_prime_y -= (periods * faceValue) / (faceDenom * (1 + y));

    const nextY = y - f_y / f_prime_y;
    if (Math.abs(nextY - y) < tolerance) {
      return nextY;
    }
    y = nextY;
  }

  return y;
}
