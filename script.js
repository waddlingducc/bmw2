
const data = JSON.parse(document.getElementById('dataset').textContent);
const allCategories = [...new Set(data.flatMap(x => x.categories))].sort();
const allTags = [...new Set(data.flatMap(x => x.tags))].sort();
function option(v){return `<option value="${v}">${v}</option>`}
function renderFilters(){
  const c = document.getElementById('categories');
  const t = document.getElementById('tags');
  if(c) c.innerHTML = allCategories.map(option).join('');
  if(t) t.innerHTML = allTags.map(option).join('');
}
renderFilters();
function fmtPrice(n){return n.toLocaleString('en-US',{style:'currency',currency:'USD'});}
function imgWithFallback(src, alt){
  return `<div class="thumb-wrapper"><img class="thumb" src="${src}" alt="${alt}" onerror="this.onerror=null;this.src='/assets/car-placeholder.svg';"></div>`;
}
function card(item){
  const logo = `<div class="logo-badge">${item.badge}</div>`;
  const verified = `<div class="verified">Verified</div>`;
  const cats = item.categories.map(c=>`<span class="badge">${c}</span>`).join('');
  const tags = item.tags.map(t=>`<span class="badge">${t}</span>`).join('');
  return `
  <article class="card" data-id="${item.id}">
    <div style="position:relative">
      ${imgWithFallback(item.image, item.name)}
      ${logo}
      ${verified}
    </div>
    <div class="content">
      <h3 style="margin:0 0 6px 0">${item.name}</h3>
      <div class="price">${fmtPrice(item.price)}</div>
      <div class="badges">${cats}</div>
      <div class="badges">${tags}</div>
      <p class="excerpt">${item.excerpt}</p>
    </div>
    <a class="cta" href="/listings/${item.id}.html">VIEW DETAILS</a>
  </article>`;
}
let priceMin = null, priceMax = null;
function sortItems(arr, mode){
  if(mode==='price-asc') return arr.sort((a,b)=>a.price-b.price);
  if(mode==='price-desc') return arr.sort((a,b)=>b.price-a.price);
  if(mode==='name-asc') return arr.sort((a,b)=>a.name.localeCompare(b.name));
  if(mode==='name-desc') return arr.sort((a,b)=>b.name.localeCompare(a.name));
  return arr;
}
function filterAndRender(){
  const q = (document.getElementById('q')||{value:''}).value.toLowerCase().trim();
  const catSel = Array.from((document.getElementById('categories')||{selectedOptions:[]}).selectedOptions||[]).map(o=>o.value);
  const tagSel = Array.from((document.getElementById('tags')||{selectedOptions:[]}).selectedOptions||[]).map(o=>o.value);
  const sortMode = (document.getElementById('sort')||{value:'relevance'}).value || 'relevance';
  let result = data.filter(x=>{
    const matchQ = !q || x.name.toLowerCase().includes(q);
    const matchCat = catSel.length===0 || catSel.every(c => x.categories.includes(c));
    const matchTag = tagSel.length===0 || tagSel.every(t => x.tags.includes(t));
    const matchPrice = (priceMin===null || x.price>=priceMin) && (priceMax===null || x.price<=priceMax);
    return matchQ && matchCat && matchTag && matchPrice;
  });
  result = sortItems(result, sortMode);
  const grid = document.getElementById('grid');
  if(grid) grid.innerHTML = result.map(card).join('');
  const rc = document.getElementById('results-count');
  if(rc) rc.textContent = `${result.length} result${result.length===1?'':'s'}`;
}
(function(){
  const q = document.getElementById('q');
  const cat = document.getElementById('categories');
  const tag = document.getElementById('tags');
  const ap = document.getElementById('applyPrice');
  const sort = document.getElementById('sort');
  q && q.addEventListener('input', filterAndRender);
  cat && cat.addEventListener('change', filterAndRender);
  tag && tag.addEventListener('change', filterAndRender);
  ap && ap.addEventListener('click', ()=>{
    const min = document.getElementById('minPrice').value;
    const max = document.getElementById('maxPrice').value;
    priceMin = min? parseInt(min,10): null;
    priceMax = max? parseInt(max,10): null;
    filterAndRender();
  });
  sort && sort.addEventListener('change', filterAndRender);
  filterAndRender();
  try { localStorage.setItem('bmw_data', JSON.stringify(data)); } catch(e){}
})();
