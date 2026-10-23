/** Run inline in BaseHead, before styles paint. Keep audio out of this script. */
export const themeInitScript = `(() => {
  let mode = 'system';
  try { mode = localStorage.getItem('suiyi-theme') || 'system'; } catch {}
  if (!['light', 'dark', 'system'].includes(mode)) mode = 'system';
  const dark = typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = mode === 'system' ? (dark ? 'dark' : 'light') : mode;
  document.documentElement.dataset.themeMode = mode;
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#232724' : '#f8f7f2');
})();`;
