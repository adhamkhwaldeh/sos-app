export type CouponFrequency = "annual" | "semi-annual";

export interface BondInputs {
  faceValue: number;
  annualCouponRate: number;
  marketPrice: number;
  yearsToMaturity: number;
  couponFrequency: CouponFrequency;
  issueDate: Date;
}

export interface CashFlow {
  period: number;
  paymentDate: string;
  couponPayment: number;
  cumulativeInterest: number;
  remainingPrincipal: number;
}

export interface BondResults {
  currentYield: number;
  ytm: number;
  totalInterest: number;
  premiumDiscountIndicator: "Premium" | "Discount" | "Par";
  cashFlowSchedule: CashFlow[];
}

export interface BondState {
  inputs: BondInputs;
  results: BondResults | null;
  setInputs: (inputs: BondInputs) => void;
  calculate: (inputs: BondInputs) => void;
}
