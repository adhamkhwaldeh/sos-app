import LocalizedStrings from "react-native-localization";
import arabic from './ar';
import german from './de';
import english from './en';

export const DEFAULT_LANGUAGE = 'en';

const translations = {
    en: english,
    ar: arabic,
    de: german
};

export default new LocalizedStrings(translations);
