import * as RNLocalize from 'react-native-localize';
import i18n from 'i18n-js';

const en = require('./en');
const es = require('./es');

const EN = 'en';
const ES = 'es';

// Should the app fallback to English if user locale doesn't exists
i18n.fallbacks = true;

// Define the supported translation
i18n.translations = {
  en,
  es,
};
//App in english
// Change line 21 ES to EN & uncommant line 23 & commant 24

const fallback = {languageTag: ES, isRTL: false};

//const { languageTag } =  RNLocalize.findBestAvailableLanguage(Object.keys(i18n.translations)) ||   fallback;
const languageTag = ES || fallback;

i18n.locale = languageTag;

// NOTE : Also Change Language tag in Image.ts File to Update Intro Slides As per active language
