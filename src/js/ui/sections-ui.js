import about from '../../data/about.json';
import soundRules from '../../data/sound-rules.json';
import support from '../../data/support.json';

// The JSON files in src/data are trusted, repo-owned content that may contain
// inline markup (<b>, <i>, <a>), so they are written with innerHTML on purpose.

const card = ({ title, text }) => `<div class="card"><h3>${title}</h3><p>${text}</p></div>`;

const directionCell = ({ word, meaning }) =>
  `<div class="dir-cell"><span class="w">${word}</span><span class="m">${meaning}</span></div>`;

function soundRuleCard({ title, text, examples }) {
  const pairs = examples
    .map(({ indo, ogan }) => `<span class="idn">${indo}</span><span class="arr">→</span><span class="og">${ogan}</span>`)
    .join('<span>·</span>');
  return `<div class="card"><h3>${title}</h3><p>${text}</p><div class="rule-ex">${pairs}</div></div>`;
}

function fill(id, items, render) {
  document.getElementById(id).innerHTML = items.map((item) => render(item)).join('');
}

export function renderSections() {
  fill('aboutCards', about.regionCards, card);
  fill('directionGrid', about.directions, directionCell);
  fill('soundRules', soundRules, soundRuleCard);
  fill('howItWorks', about.howItWorks, card);
  document.getElementById('donateBtn').href = support.url;
}
