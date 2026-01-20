import LocalizedStrings from "react-native-localization";
import english from './en'
import arabic from './ar'

export const DEFAULT_LANGUAGE = 'en';

const translations = {
    en: english,
    ar: arabic
};

export default new LocalizedStrings(translations);
