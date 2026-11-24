import './styles/variables.css';
import './styles/base.css';
import './styles/hero.css';
import './styles/translator.css';
import './styles/sections.css';
import './styles/dictionary.css';
import './styles/toast.css';

import { renderSections } from './js/ui/sections-ui.js';
import { initTranslator } from './js/ui/translator-ui.js';
import { initDictionary } from './js/ui/dictionary-ui.js';

renderSections();
initTranslator();
initDictionary();
