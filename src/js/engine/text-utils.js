const LETTER = 'A-Za-zÀ-ÖØ-öø-ÿ';
const TOKEN_PATTERN = new RegExp(`[${LETTER}]+(?:[-'][${LETTER}]+)*|\\s+|[^${LETTER}\\s]`, 'g');
const LETTER_PATTERN = new RegExp(`[${LETTER}]`);

export function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Copies the capitalization style of `source` (lower, Capitalized, UPPER) onto `output`. */
export function matchCase(source, output) {
  if (!output) return output;
  if (source.length > 1 && source === source.toUpperCase()) return output.toUpperCase();
  if (source[0] === source[0].toUpperCase()) return output.charAt(0).toUpperCase() + output.slice(1);
  return output;
}

/** Splits text into word, whitespace, and punctuation tokens. */
export function tokenize(text) {
  return text.match(TOKEN_PATTERN) || [];
}

export function isWord(token) {
  return LETTER_PATTERN.test(token.charAt(0));
}

export function stripParentheses(text) {
  return text.replace(/\([^)]*\)/g, '').trim();
}
