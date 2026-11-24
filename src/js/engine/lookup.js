import dictionary from '../../data/dictionary.json';
import phrases from '../../data/phrases.json';
import { stripParentheses } from './text-utils.js';

const MAX_SINGLE_WORD_MEANING_LENGTH = 24;

/** Ogan word -> its first Indonesian meaning. */
export const oganToIndo = new Map();
/** Single-word Indonesian meaning -> Ogan headword. */
export const indoToOgan = new Map();
/** Multi-word phrases, longest first. Each item: { words: string[], target: string }. */
export const oganPhrases = [];
export const indoPhrases = [];

function addPhrase(list, seen, source, target) {
  const key = source.toLowerCase();
  if (seen.has(key)) return;
  seen.add(key);
  list.push({ words: key.split(' '), target });
}

// The order of dictionary.json is the lookup priority: the first entry that claims
// a word wins. The dictionary screen sorts its own copy, so this order is untouched.
const seenOgan = new Set();
const seenIndo = new Set();

for (const entry of dictionary) {
  const headword = entry.ogan[0];
  const firstMeaning = stripParentheses(entry.indo[0]);

  for (const variant of entry.ogan) {
    if (variant.includes(' ')) addPhrase(oganPhrases, seenOgan, variant, firstMeaning);
    else if (!oganToIndo.has(variant)) oganToIndo.set(variant, firstMeaning);
  }

  for (const meaning of entry.indo) {
    const word = stripParentheses(meaning).toLowerCase();
    const isSingleWord = word && !word.includes(' ') && word.length <= MAX_SINGLE_WORD_MEANING_LENGTH;
    if (isSingleWord && !indoToOgan.has(word)) indoToOgan.set(word, headword);
  }
}

for (const phrase of phrases) {
  for (const source of phrase.ogan) addPhrase(oganPhrases, seenOgan, source, phrase.indo[0]);
  for (const source of phrase.indo) addPhrase(indoPhrases, seenIndo, source, phrase.ogan[0]);
}

const longestFirst = (a, b) => b.words.length - a.words.length;
oganPhrases.sort(longestFirst);
indoPhrases.sort(longestFirst);

/** Finds the meaning of an Ogan word, also accepting the "gh" spelling of "h". */
export function findOganMeaning(word) {
  return oganToIndo.get(word) ?? oganToIndo.get(word.replace(/gh/g, 'h'));
}
