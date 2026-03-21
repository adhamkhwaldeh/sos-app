import { BondInputs, BondState } from '@/src/data/types/BondCalculator';
import { create } from 'zustand';
import { calculateBond } from '../helpers/bondCalculations';

export const useBondStore = create<BondState>((set) => ({
  inputs: {
    faceValue: 1000,
    annualCouponRate: 5,
    marketPrice: 950,
    yearsToMaturity: 10,
    couponFrequency: "annual",
    issueDate: new Date(),
  },
  results: null,
  setInputs: (inputs) => set({ inputs }),
  calculate: (inputs) => {
    const results = calculateBond(inputs);
    set({ inputs, results });
  },
}));
