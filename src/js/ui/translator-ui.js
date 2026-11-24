import quickExamples from '../../data/quick-examples.json';
import { DIRECTION, translate } from '../engine/translate.js';
import { STATUS } from '../engine/word-rules.js';
import { escapeHtml } from '../engine/text-utils.js';
import { t } from './labels.js';
import { showToast } from './toast.js';

const byId = (id) => document.getElementById(id);

let direction = DIRECTION.OGAN_TO_INDO;
let lastPlainText = '';

const flip = (value) =>
  value === DIRECTION.OGAN_TO_INDO ? DIRECTION.INDO_TO_OGAN : DIRECTION.OGAN_TO_INDO;

function renderWord(unit) {
  const text = escapeHtml(unit.text);
  if (unit.status === STATUS.DICTIONARY) return text;
  if (unit.status === STATUS.UNKNOWN) {
    return `<span class="w-unknown" title="${t('translator.unknownTooltip')}">${text}</span>`;
  }
  return `<span class="w-rule" title="${t('translator.ruleTooltip')}">${text}</span>`;
}

function showUnknownWords(words) {
  const noteEl = byId('unknownNote');
  if (!words.length) {
    noteEl.className = 'unknown-note';
    noteEl.innerHTML = '';
    return;
  }
  const chips = words.map((word) => `<span class="chip">${escapeHtml(word)}</span>`).join(' ');
  noteEl.className = 'unknown-note show';
  noteEl.innerHTML = `<b>${t('translator.unknownTitle')}</b> ${chips}<br/>${t('translator.unknownFooter')}`;
}

function render() {
  const text = byId('inputText').value;
  const outputEl = byId('outputText');
  byId('charCount').textContent = t('translator.charCount', { count: text.length });

  if (!text.trim()) {
    outputEl.innerHTML = `<span class="ph">${t('translator.resultPlaceholder')}</span>`;
    showUnknownWords([]);
    lastPlainText = '';
    return;
  }

  let html = '';
  let plain = '';
  const unknownWords = [];

  for (const unit of translate(text, direction)) {
    if (unit.type === 'separator') {
      html += escapeHtml(unit.raw);
      plain += unit.raw;
      continue;
    }
    html += renderWord(unit);
    plain += unit.text;
    const lowered = unit.raw.toLowerCase();
    if (unit.status === STATUS.UNKNOWN && !unknownWords.includes(lowered)) unknownWords.push(lowered);
  }

  outputEl.innerHTML = html;
  lastPlainText = plain;
  showUnknownWords(unknownWords);
}

function setDirection(next, keepText = false) {
  direction = next;
  const fromOgan = direction === DIRECTION.OGAN_TO_INDO;
  byId('langFromName').textContent = t(`translator.languages.${fromOgan ? 'ogan' : 'indo'}`);
  byId('langToName').textContent = t(`translator.languages.${fromOgan ? 'indo' : 'ogan'}`);
  byId('inputLabel').textContent = t(`translator.inputLabel.${direction}`);
  byId('outputLabel').textContent = t(`translator.outputLabel.${direction}`);
  byId('inputText').placeholder = t(`translator.inputPlaceholder.${direction}`);
  if (!keepText) render();
}

/** Puts `text` into the translator in the given direction and scrolls it into view. */
export function useInTranslator(nextDirection, text) {
  setDirection(nextDirection, true);
  byId('inputText').value = text;
  render();
  document.querySelector('.translator').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function copyWithFallback(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    showToast(t('toast.copied'));
  } catch {
    showToast(t('toast.copyFailed'));
  }
  document.body.removeChild(textarea);
}

function copyResult() {
  if (!lastPlainText) {
    showToast(t('toast.nothingToCopy'));
    return;
  }
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(lastPlainText).then(
      () => showToast(t('toast.copied')),
      () => copyWithFallback(lastPlainText)
    );
  } else {
    copyWithFallback(lastPlainText);
  }
}

function renderQuickExamples() {
  const container = byId('quickExamples');
  for (const example of quickExamples) {
    const button = document.createElement('button');
    button.className = 'ex-chip';
    button.type = 'button';
    button.textContent = `“${example.text}”`;
    button.addEventListener('click', () => useInTranslator(example.direction, example.text));
    container.appendChild(button);
  }
}

export function initTranslator() {
  const inputEl = byId('inputText');

  inputEl.addEventListener('input', render);

  byId('swapBtn').addEventListener('click', () => {
    const previousOutput = lastPlainText;
    setDirection(flip(direction), true);
    if (previousOutput && inputEl.value.trim()) inputEl.value = previousOutput;
    render();
  });

  byId('clearBtn').addEventListener('click', () => {
    inputEl.value = '';
    render();
    inputEl.focus();
  });

  byId('useOutputBtn').addEventListener('click', () => {
    if (!lastPlainText) return;
    const text = lastPlainText;
    setDirection(flip(direction), true);
    inputEl.value = text;
    render();
  });

  byId('copyBtn').addEventListener('click', copyResult);

  renderQuickExamples();
  setDirection(DIRECTION.OGAN_TO_INDO);
}
