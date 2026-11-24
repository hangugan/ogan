const VISIBLE_MS = 1600;
let hideTimer = null;

export function showToast(message) {
  const toastEl = document.getElementById('toast');
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => toastEl.classList.remove('show'), VISIBLE_MS);
}
