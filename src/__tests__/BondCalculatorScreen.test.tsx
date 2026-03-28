import React from 'react';
import { render, fireEvent, waitFor, cleanup } from '@testing-library/react-native';
import BondCalculatorScreen from '@/app/(tabs)/bond-calculator';
import { LocalizationContext } from '@/src/localization/LocalizationContext';
import translations from '@/src/localization/translations';
import { Provider as PaperProvider } from 'react-native-paper';
import { useBondStore } from '@/src/store/useBondStore';

// Mock DateTimePicker
jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  return (props: any) => (
    <View testID="dateTimePicker">
      <TouchableOpacity onPress={() => props.onChange({ type: 'set' }, new Date('2024-01-01'))}>
        <Text>Select Date</Text>
      </TouchableOpacity>
    </View>
  );
});

// Mock react-native-localize
jest.mock('react-native-localize', () => ({
  getLocales: () => [{ languageCode: 'en' }],
}));

// Mock react-native-localization
jest.mock('react-native-localization', () => {
  return class {
    constructor(props: any) {
      Object.assign(this, props.en);
    }
    setLanguage() {}
    getAvailableLanguages() { return ['en']; }
  };
});


const AllProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <LocalizationContext.Provider
      value={{
        translations,
        setAppLanguage: async () => {},
        appLanguage: 'en',
        initializeAppLanguage: async () => {},
      }}
    >
      <PaperProvider>{children}</PaperProvider>
    </LocalizationContext.Provider>
  );
};

describe('BondCalculatorScreen', () => {
  beforeEach(() => {
    // Reset store before each test
    useBondStore.setState({
      inputs: {
        faceValue: 1000,
        annualCouponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 10,
        couponFrequency: "annual",
        issueDate: new Date('2024-01-01'),
      },
      results: null,
    });
  });

  afterEach(cleanup);

  it('renders all input fields correctly', () => {
    const { getAllByText, getByText, getByDisplayValue } = render(<BondCalculatorScreen />, { wrapper: AllProviders });

    // Check for labels
    expect(getAllByText(translations.faceValue).length).toBeGreaterThan(0);
    expect(getAllByText(translations.annualCouponRate).length).toBeGreaterThan(0);
    expect(getAllByText(translations.marketPrice).length).toBeGreaterThan(0);
    expect(getAllByText(translations.yearsToMaturity).length).toBeGreaterThan(0);
    expect(getByText(translations.couponFrequency)).toBeTruthy();
    expect(getAllByText(translations.issueDate).length).toBeGreaterThan(0);
    expect(getByText(translations.calculate)).toBeTruthy();
  });

  it('shows error messages when required fields are empty and calculate is pressed', async () => {
    const { getByText, getByDisplayValue, getAllByText } = render(<BondCalculatorScreen />, { wrapper: AllProviders });

    // Clear required fields
    fireEvent.changeText(getByDisplayValue('1000'), '');
    fireEvent.changeText(getByDisplayValue('5'), '');
    fireEvent.changeText(getByDisplayValue('950'), '');
    fireEvent.changeText(getByDisplayValue('10'), '');

    fireEvent.press(getByText(translations.calculate));

    await waitFor(() => {
      expect(getAllByText(translations.fieldRequired).length).toBeGreaterThan(0);
    });
  });

  it('calculates bond results when the calculate button is pressed', async () => {
    const { getByText, findByText } = render(<BondCalculatorScreen />, { wrapper: AllProviders });

    fireEvent.press(getByText(translations.calculate));

    // Check for results labels
    await waitFor(() => {
      expect(getByText(translations.currentYield + ':')).toBeTruthy();
      expect(getByText(translations.ytm + ':')).toBeTruthy();
      expect(getByText(translations.totalInterest + ':')).toBeTruthy();
    });
  });

  it('updates results and schedule when inputs are changed', async () => {
    const { getByText, getByDisplayValue, getAllByText } = render(<BondCalculatorScreen />, { wrapper: AllProviders });

    fireEvent.changeText(getByDisplayValue('1000'), '2000');
    fireEvent.changeText(getByDisplayValue('5'), '6');
    fireEvent.changeText(getByDisplayValue('950'), '1900');
    fireEvent.changeText(getByDisplayValue('10'), '5');

    fireEvent.press(getByText(translations.calculate));

    // Results should be updated based on new inputs
    // Current Yield = (2000 * 0.06) / 1900 * 100 = 120 / 1900 * 100 = 6.3158%
    await waitFor(() => {
      expect(getByText('6.3158%')).toBeTruthy();
      // For 5 years annual, we should see period 5 in the table
      // It might be '5' or '5.00' depending on formatting of other cells, but period is normally an integer string
      expect(getAllByText('5').length).toBeGreaterThan(0);
    });
  });
});
