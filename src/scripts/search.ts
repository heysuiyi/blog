const form = document.querySelector<HTMLFormElement>('.search-form');
if (form) {
 const input = document.querySelector<HTMLInputElement>('#article-search')!;
 const grid = document.querySelector<HTMLElement>('.archive-grid')!;
 const status = document.querySelector<HTMLElement>('#search-status')!;
 const cards = Array.from(grid.querySelectorAll<HTMLElement>('[data-search]'));
 const update = (syncInput = true) => {
  const query = new URLSearchParams(location.search).get('q') || '';
  if (syncInput) input.value = query;
  const terms = query.normalize('NFKC').trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  let count = 0;
  for (const card of cards) {
   const match = terms.length > 0 && terms.every(term => card.dataset.search!.includes(term));
   card.hidden = !match;
   if (match) count++;
  }
  grid.hidden = terms.length === 0;
  status.textContent = terms.length === 0 ? '输入关键词，开始探索文章。' : count ? `找到 ${count} 篇相关文章` : '没有找到相关文章，试试其他关键词，或浏览分类与标签。';
 };
 const search = (push = false) => {
  const url = new URL(location.href);
  const query = input.value.trim();
  if (query) url.searchParams.set('q', query); else url.searchParams.delete('q');
  if (push) history.pushState(null, '', url); else history.replaceState(null, '', url);
  update(false);
 };
 form.addEventListener('submit', event => { event.preventDefault(); search(true); });
 input.addEventListener('input', () => search());
 window.addEventListener('popstate', () => update());
 update();
}
