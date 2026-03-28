import { BondInputs } from '@/src/data/types/BondCalculator';
import NumbersHelper from '@/src/helpers/NumbersHelper';
import { LocalizationContext } from '@/src/localization/LocalizationContext';
import { useBondStore } from '@/src/store/useBondStore';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useContext, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, DataTable, HelperText, SegmentedButtons, Text, TextInput, useTheme } from 'react-native-paper';

export default function BondCalculatorScreen() {

  //Context API for both multiple-themes and languages

  const { translations } = useContext(LocalizationContext);

  const theme = useTheme();

  //Zustand store for bond calculator as State managment
  const { inputs, results, calculate } = useBondStore();

  //react-hook-form for form validation and submission
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BondInputs>({
    defaultValues: inputs,
  });

  const onSubmit = (data: BondInputs) => {
    calculate({
      ...data,
      faceValue: Number(data.faceValue),
      annualCouponRate: Number(data.annualCouponRate),
      marketPrice: Number(data.marketPrice),
      yearsToMaturity: Number(data.yearsToMaturity),
    });
  };

  useEffect(() => {
    calculate(inputs);
  }, []);


  //Date picker state 
  const [date, setDate] = useState(new Date());

  const [show, setShow] = useState(false);

  const onDateChange = (selectedDate: Date | undefined) => {
    var innerDate = selectedDate || date;
    setValue('issueDate', innerDate);
    setShow(Platform.OS === 'ios'); // iOS stays open
    setDate(innerDate);
  };

  //react-native-paper as material design library
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.card}>
        <Card.Title title={translations.bondCalculator} />
        <Card.Content>
          <Controller
            control={control}
            rules={{ required: true }}
            name="faceValue"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label={translations.faceValue}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value.toString()}
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
              />
            )}
          />
          {errors.faceValue && <HelperText type="error">{translations.fieldRequired}</HelperText>}

          <Controller
            control={control}
            rules={{ required: true }}
            name="annualCouponRate"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label={translations.annualCouponRate}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value.toString()}
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
              />
            )}
          />
          {errors.annualCouponRate && <HelperText type="error">{translations.fieldRequired}</HelperText>}

          <Controller
            control={control}
            rules={{ required: true }}
            name="marketPrice"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label={translations.marketPrice}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value.toString()}
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
              />
            )}
          />
          {errors.marketPrice && <HelperText type="error">{translations.fieldRequired}</HelperText>}

          <Controller
            control={control}
            rules={{ required: true }}
            name="yearsToMaturity"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label={translations.yearsToMaturity}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value.toString()}
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
              />
            )}
          />
          {errors.yearsToMaturity && <HelperText type="error">{translations.fieldRequired}</HelperText>}

          <Text style={styles.label}>{translations.couponFrequency}</Text>
          <Controller
            control={control}
            name="couponFrequency"
            render={({ field: { onChange, value } }) => (
              <SegmentedButtons
                value={value}
                onValueChange={onChange}
                buttons={[
                  { value: 'annual', label: translations.annual },
                  { value: 'semi-annual', label: translations.semiAnnual },
                ]}
                style={styles.input}
              />
            )}
          />

          <Controller
            control={control}
            rules={{ required: true }}
            name="issueDate"
            render={({ field: { onBlur, value } }) => (
              <TextInput
                label={translations.issueDate}
                onBlur={onBlur}
                value={value instanceof Date ? value.toLocaleDateString() : new Date(value).toLocaleDateString()}
                onPress={() => {
                  setShow(true);
                }}
                placeholder="MM/DD/YYYY"
                mode="outlined"
                style={styles.input}
              />
            )}
          />

          {errors.issueDate && <HelperText type="error">{translations.fieldRequired}</HelperText>}

          {show && (
            <DateTimePicker
              value={date}
              mode="date" // "time" or "datetime"
              display="default"
              onChange={(type, date) => {
                onDateChange(date)
              }}
            />
          )}

          <Button mode="contained" onPress={handleSubmit(onSubmit)} style={styles.button}>
            {translations.calculate}
          </Button>
        </Card.Content>
      </Card>

      {results && (
        <>
          <Card style={styles.card}>
            <Card.Title title={translations.about} />
            <Card.Content>
              <View style={styles.resultRow}>
                <Text variant="titleMedium">{translations.currentYield}:</Text>
                <Text variant="titleMedium">{NumbersHelper.formatPercentage(results.currentYield)}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text variant="titleMedium">{translations.ytm}:</Text>
                <Text variant="titleMedium">{NumbersHelper.formatPercentage(results.ytm)}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text variant="titleMedium">{translations.totalInterest}:</Text>
                <Text variant="titleMedium">{NumbersHelper.formatCurrency(results.totalInterest)}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text variant="titleMedium">{translations.premiumDiscount}:</Text>
                <Text variant="titleMedium" style={{ color: results.premiumDiscountIndicator === 'Premium' ? 'green' : results.premiumDiscountIndicator === 'Discount' ? 'red' : 'gray' }}>
                  {results.premiumDiscountIndicator === 'Premium' ? translations.premium : results.premiumDiscountIndicator === 'Discount' ? translations.discount : translations.par}
                </Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Title title={translations.cashFlowSchedule} />
            <ScrollView horizontal>
              <DataTable style={{ minWidth: 600 }}>
                <DataTable.Header>
                  <DataTable.Title style={styles.tableCell}>{translations.period}</DataTable.Title>
                  <DataTable.Title style={styles.tableCell}>{translations.paymentDate}</DataTable.Title>
                  <DataTable.Title numeric style={styles.tableCell}>{translations.couponPayment}</DataTable.Title>
                  <DataTable.Title numeric style={styles.tableCell}>{translations.cumulativeInterest}</DataTable.Title>
                  <DataTable.Title numeric style={styles.tableCell}>{translations.remainingPrincipal}</DataTable.Title>
                </DataTable.Header>

                {results.cashFlowSchedule.map((cf) => (
                  <DataTable.Row key={cf.period}>
                    <DataTable.Cell style={styles.tableCell}>{cf.period}</DataTable.Cell>
                    <DataTable.Cell style={styles.tableCell}>{cf.paymentDate}</DataTable.Cell>
                    <DataTable.Cell numeric style={styles.tableCell}>{cf.couponPayment.toFixed(2)}</DataTable.Cell>
                    <DataTable.Cell numeric style={styles.tableCell}>{cf.cumulativeInterest.toFixed(2)}</DataTable.Cell>
                    <DataTable.Cell numeric style={styles.tableCell}>{cf.remainingPrincipal.toFixed(2)}</DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            </ScrollView>
          </Card>
        </>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  button: {
    marginTop: 8,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  tableCell: {
    flex: 1,
    justifyContent: 'center',
  },
});
