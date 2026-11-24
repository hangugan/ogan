import { indoPhrases, oganPhrases, oganToIndo } from './lookup.js';
import { indoWordToOgan, oganWordToIndo, STATUS } from './word-rules.js';
import { isWord, matchCase, tokenize } from './text-utils.js';

export const DIRECTION = Object.freeze({
  OGAN_TO_INDO: 'og2id',
  INDO_TO_OGAN: 'id2og'
});

/** Collects consecutive words separated by exactly one space, starting at `start`. */
function collectWordSequence(tokens, start) {
  const sequence = [tokens[start]];
  let cursor = start;
  while (cursor + 2 < tokens.length && tokens[cursor + 1] === ' ' && isWord(tokens[cursor + 2])) {
    sequence.push(tokens[cursor + 2]);
    cursor += 2;
  }
  return sequence;
}

function findPhrase(phrases, sequence) {
  const lowered = sequence.map((word) => word.toLowerCase());
  return phrases.find((phrase) =>
    phrase.words.length <= lowered.length && phrase.words.every((word, i) => word === lowered[i])
  );
}

/**
 * Indonesian -> Ogan: "ke" before a/u and "se" before a vowel fuse with the next word
 * (ke + ume -> kume, se + ikok -> sikok).
 */
function mergeContractions(units) {
  for (let i = 0; i + 2 < units.length; i++) {
    const [first, gap, next] = [units[i], units[i + 1], units[i + 2]];
    if (first.type !== 'word' || gap.type !== 'separator' || gap.raw !== ' ' || next.type !== 'word') continue;

    const prefix = first.raw.toLowerCase();
    const following = next.text.toLowerCase();
    let letter = null;
    if (prefix === 'ke' && /^[au]/.test(following)) letter = 'k';
    else if (prefix === 'se' && /^[aiueo]/.test(following)) letter = 's';
    if (!letter) continue;

    first.text = matchCase(first.raw, letter + following);
    first.status = oganToIndo.has(first.text.toLowerCase()) ? STATUS.VERIFIED_RULE : STATUS.RULE;
    units.splice(i + 1, 2);
    i--;
  }
}

/**
 * Translates text and returns a list of units:
 *   { type: 'word', raw, text, status } or { type: 'separator', raw }
 */
export function translate(text, direction) {
  const toIndo = direction === DIRECTION.OGAN_TO_INDO;
  const phrases = toIndo ? oganPhrases : indoPhrases;
  const translateWord = toIndo ? oganWordToIndo : indoWordToOgan;

  const tokens = tokenize(text);
  const units = [];
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i];
    if (!isWord(token)) {
      units.push({ type: 'separator', raw: token });
      i++;
      continue;
    }

    const sequence = collectWordSequence(tokens, i);
    const phrase = findPhrase(phrases, sequence);
    if (phrase) {
      const length = phrase.words.length;
      units.push({
        type: 'word',
        raw: sequence.slice(0, length).join(' '),
        text: matchCase(sequence[0], phrase.target),
        status: STATUS.DICTIONARY
      });
      i += length * 2 - 1;
      continue;
    }

    const translated = translateWord(token.toLowerCase());
    units.push({ type: 'word', raw: token, text: matchCase(token, translated.text), status: translated.status });
    i++;
  }

  if (!toIndo) mergeContractions(units);
  return units;
}
