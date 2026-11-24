import uiText from '../../data/ui-text.json';

/**
 * Looks up a UI string by dotted path, e.g. t('toast.copied'),
 * and fills {placeholders} from `values`.
 */
export function t(path, values = {}) {
  const template = path.split('.').reduce((node, key) => node?.[key], uiText);
  if (typeof template !== 'string') {
    console.warn(`Missing UI text: ${path}`);
    return path;
  }
  return template.replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? ''));
}
