import dictionary from '../../data/dictionary.json';
import { DIRECTION } from '../engine/translate.js';
import { escapeHtml } from '../engine/text-utils.js';
import { t } from './labels.js';
import { useInTranslator } from './translator-ui.js';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const byId = (id) => document.getElementById(id);

// Sorted copy for display only. dictionary.json keeps its own order (lookup priority).
const items = dictionary
  .map((entry) => ({
    entry,
    letter: entry.ogan[0].charAt(0).toUpperCase(),
    searchText: [...entry.ogan, ...entry.indo].join(' | ').toLowerCase()
  }))
  .sort((a, b) => a.entry.ogan[0].localeCompare(b.entry.ogan[0], 'id'));

let activeLetter = '';

function entryHtml({ ogan, indo, example }) {
  const [headword, ...variants] = ogan;
  const alt = variants.length
    ? `<span class="alt">${t('dictionary.alsoLabel', { variants: escapeHtml(variants.join(', ')) })}</span>`
    : '';
  const sample = example
    ? `<span class="ex"><i>“${escapeHtml(example.ogan)}”</i> — ${escapeHtml(example.indo)}</span>`
    : '';
  return `<div class="entry"><span class="w">${escapeHtml(headword)}</span>` +
    `<span class="d">${alt}${escapeHtml(indo.join(', '))}${sample}</span>` +
    `<button class="use" type="button" data-word="${escapeHtml(headword)}">${t('dictionary.use')}</button></div>`;
}

function renderDictionary() {
  const query = byId('dictSearch').value.trim().toLowerCase();
  const groups = new Map();
  let shown = 0;

  for (const item of items) {
    if (activeLetter && item.letter !== activeLetter) continue;
    if (query && !item.searchText.includes(query)) continue;
    if (!groups.has(item.letter)) groups.set(item.letter, []);
    groups.get(item.letter).push(item.entry);
    shown++;
  }

  let html = '';
  for (const [letter, entries] of groups) {
    html += `<div class="dict-group"><h3>${letter}</h3><div class="entries">` +
      entries.map(entryHtml).join('') + '</div></div>';
  }
  byId('dictList').innerHTML = html;

  let summary = t('dictionary.count', { shown, total: dictionary.length });
  if (activeLetter) summary += t('dictionary.countLetter', { letter: activeLetter });
  if (query) summary += t('dictionary.countQuery', { query });
  byId('dictCount').textContent = summary;
  byId('noResult').style.display = shown ? 'none' : 'block';
}

function markActiveLetter() {
  for (const button of byId('letterBar').querySelectorAll('button')) {
    const letter = button.dataset.letter ?? '';
    button.className = letter === activeLetter ? 'on' : '';
  }
}

function selectLetter(letter) {
  activeLetter = letter && letter === activeLetter ? '' : letter;
  markActiveLetter();
  renderDictionary();
}

function buildLetterBar() {
  const bar = byId('letterBar');
  for (const letter of ['', ...ALPHABET]) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = letter || t('dictionary.all');
    button.dataset.letter = letter;
    button.addEventListener('click', () => selectLetter(letter));
    bar.appendChild(button);
  }
  markActiveLetter();
}

export function initDictionary() {
  byId('statWords').textContent = t('dictionary.statWords', { count: dictionary.length });
  buildLetterBar();
  byId('dictSearch').addEventListener('input', renderDictionary);
  byId('dictList').addEventListener('click', (event) => {
    const button = event.target.closest('.use');
    if (button) useInTranslator(DIRECTION.OGAN_TO_INDO, button.dataset.word);
  });
  renderDictionary();
}
