import exceptions from '../../data/exceptions.json';
import { findOganMeaning, indoToOgan, oganToIndo } from './lookup.js';

export const STATUS = Object.freeze({
  DICTIONARY: 'dict',       // found in the dictionary
  RULE: 'rule',             // produced by a sound rule
  VERIFIED_RULE: 'ruleok',  // produced by a sound rule and the result exists in the dictionary
  UNKNOWN: 'unknown'        // nothing matched, word is returned as typed
});

const result = (text, status) => ({ text, status });

/** Indonesian word -> Ogan word. Expects a lowercase word. */
export function indoWordToOgan(word) {
  const exception = exceptions.indoToOgan[word];
  if (exception) return result(exception, STATUS.DICTIONARY);

  const known = indoToOgan.get(word);
  if (known) return result(known, STATUS.DICTIONARY);

  // Suffix -nya -> -nye
  if (word.length > 4 && word.endsWith('nya')) {
    const stem = indoWordToOgan(word.slice(0, -3));
    if (stem.status !== STATUS.UNKNOWN) return result(stem.text + 'nye', stem.status);
  }

  let text = word;
  let changed = false;
  const rewrite = (value) => { text = value; changed = true; };

  // ber- / ter- lose their "r"
  if (/^ber/.test(text) && text.length > 4) rewrite('be' + text.slice(3));
  else if (/^ter/.test(text) && text.length > 4) rewrite('te' + text.slice(3));

  // me- + nasal: only the nasal remains (meng->ng, meny->ny, men->n, mem->m)
  if (/^meng/.test(text) && text.length > 5) rewrite('ng' + text.slice(4));
  else if (/^meny/.test(text) && text.length > 5) rewrite('ny' + text.slice(4));
  else if (/^men/.test(text) && text.length > 4) rewrite('n' + text.slice(3));
  else if (/^mem/.test(text) && text.length > 4) rewrite('m' + text.slice(3));

  // "h" is dropped at the start and between vowels. This must run before r -> h,
  // so that an "h" produced from an "r" is not dropped again.
  const withoutH = text.replace(/^h/, '').replace(/([aeiou])h([aeiou])/g, '$1$2');
  if (withoutH !== text) rewrite(withoutH);

  if (text.includes('r')) rewrite(text.replace(/r/g, 'h'));
  if (text.endsWith('a')) rewrite(text.slice(0, -1) + 'e');

  if (!changed) return result(word, STATUS.UNKNOWN);
  return result(text, oganToIndo.has(text) ? STATUS.VERIFIED_RULE : STATUS.RULE);
}

/** Ogan word -> Indonesian word. Reverses the sound rules and checks every guess against the dictionary. */
export function oganWordToIndo(word) {
  const exception = exceptions.oganToIndo[word];
  if (exception) return result(exception, STATUS.DICTIONARY);

  const meaning = findOganMeaning(word);
  if (meaning) return result(meaning, STATUS.DICTIONARY);

  // Suffix -nye -> -nya
  if (word.length > 4 && word.endsWith('nye')) {
    const stem = oganWordToIndo(word.slice(0, -3));
    if (stem.status !== STATUS.UNKNOWN) return result(stem.text + 'nya', stem.status);
  }

  const candidates = [];
  if (word.endsWith('e')) candidates.push(word.slice(0, -1) + 'a');                          // -e -> -a
  if (word.includes('h')) candidates.push(word.replace(/h/g, 'r'));                          // h -> r
  if (word.endsWith('e') && word.includes('h')) candidates.push(word.slice(0, -1).replace(/h/g, 'r') + 'a');
  candidates.push('h' + word);                                                               // ujan -> hujan
  if (/([aeiou])([aeiou])/.test(word)) candidates.push(word.replace(/([aeiou])([aeiou])/, '$1h$2')); // pait -> pahit
  if (/^be/.test(word)) candidates.push('ber' + word.slice(2));
  if (/^te/.test(word)) candidates.push('ter' + word.slice(2));
  if (/^ng/.test(word)) candidates.push('meng' + word.slice(2));
  if (/^ny/.test(word)) candidates.push('meny' + word.slice(2));

  const match = candidates.find((candidate) => indoToOgan.has(candidate));
  return match ? result(match, STATUS.RULE) : result(word, STATUS.UNKNOWN);
}
