

export default class NumbersHelper {

    static formatCurrency = (value: number) => {
        return `$${value.toFixed(2)}`;
    };

    static formatPercentage = (value: number) => {
        return `${value.toFixed(4)}%`;
    };

}