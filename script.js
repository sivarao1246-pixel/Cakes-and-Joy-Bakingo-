(() => {
  const CART_KEY = 'cakesAndJoyCart';

  const getCart = () => JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  const saveCart = cart => localStorage.setItem(CART_KEY, JSON.stringify(cart));

  function updateCartBadge() {
    const link = document.getElementById('cartLink');
    if (!link) return;
    const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
    let badge = link.querySelector('.cart-count');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'cart-count';
      Object.assign(badge.style, {
        position: 'absolute', marginLeft: '-8px', marginTop: '-10px',
        background: '#fff', color: 'red', borderRadius: '50%', minWidth: '20px',
        height: '20px', padding: '1px 5px', fontSize: '12px', fontWeight: '700',
        textAlign: 'center', lineHeight: '18px', border: '1px solid red'
      });
      link.style.position = 'relative';
      link.appendChild(badge);
    }
    badge.textContent = count;
    badge.style.display = count ? 'inline-block' : 'none';
  }

  function productFromCard(card, index) {
    const img = card.querySelector('img');
    const title = card.querySelector('h5.fw-bold')?.textContent.trim() || 'Cake';
    const priceText = [...card.querySelectorAll('h5')].find(x => x.textContent.includes('Price'))?.textContent || '';
    const weightText = [...card.querySelectorAll('h5')].find(x => x.textContent.includes('Weight'))?.textContent || '';
    const price = Number((priceText.match(/[\d,]+/) || ['0'])[0].replace(/,/g, ''));
    const weight = weightText.match(/([\d.]+)\s*kg/i)?.[1] ? Number(weightText.match(/([\d.]+)\s*kg/i)[1]) : 0;
    const popularityMap = { 'Chocolate Cake': 98, 'Vanila Cake': 86, 'Nutella Chocolate Cake': 95, 'White forest cake': 91, 'Spiderman cake': 99, 'Roblox Cake': 97, 'Strawberry Cake': 93, 'Fruit cake': 89 };
    const popularity = popularityMap[title] ?? (80 - index);
    const limited = ['Spiderman cake', 'Roblox Cake'].includes(title) ? 1 : 0;
    const newArrival = ['Fruit cake', 'Strawberry Cake'].includes(title) ? 1 : 0;
    return { id: `${title}-${index}`, name: title, price, weight, image: img?.getAttribute('src') || '', popularity, limited, newArrival };
  }

  function addToCart(product) {
    const cart = getCart();
    const existing = cart.find(item => item.id === product.id);
    if (existing) existing.quantity += 1;
    else cart.push({ ...product, quantity: 1 });
    saveCart(cart);
    updateCartBadge();

    const toast = document.createElement('div');
    toast.textContent = `${product.name} added to cart ✓`;
    Object.assign(toast.style, {
      position: 'fixed', right: '20px', bottom: '20px', zIndex: 9999,
      background: '#198754', color: 'white', padding: '12px 18px',
      borderRadius: '10px', boxShadow: '0 5px 20px rgba(0,0,0,.2)', fontWeight: '600'
    });
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1800);
  }

  function setupProducts() {
    const cards = [...document.querySelectorAll('.product-card')];
    cards.forEach((card, index) => {
      const button = [...card.querySelectorAll('button')].find(b => /add to cart/i.test(b.textContent));
      if (!button) return;
      const product = productFromCard(card, index);
      card.dataset.price = product.price;
      card.dataset.weight = product.weight;
      card.dataset.popularity = product.popularity;
      card.dataset.limited = product.limited;
      card.dataset.newArrival = product.newArrival;
      button.type = 'button';
      button.addEventListener('click', e => { e.stopPropagation(); addToCart(product); });
    });
  }

  function setupSorting() {
    const cakeSection = document.querySelector('#cakeThemes')?.previousElementSibling?.previousElementSibling;
    const allCakeRows = [...document.querySelectorAll('.product-card')].slice(0, 8);
    const parent = allCakeRows[0]?.closest('.container')?.parentElement;
    const sortButtons = document.querySelectorAll('.sort-btn');
    sortButtons.forEach(btn => btn.addEventListener('click', () => {
      const sort = btn.dataset.sort;
      const cards = [...document.querySelectorAll('.product-card')].slice(0, 8);
      const containers = cards.map(c => c.closest('.col'));
      const rows = [...new Set(containers.map(c => c.parentElement))];
      const ordered = containers.sort((a, b) => {
        const A = a.querySelector('.product-card').dataset;
        const B = b.querySelector('.product-card').dataset;
        if (sort === 'price') return Number(A.price) - Number(B.price);
        if (sort === 'weight') return Number(A.weight) - Number(B.weight);
        if (sort === 'popularity') return Number(B.popularity) - Number(A.popularity);
        if (sort === 'limited') return Number(B.limited) - Number(A.limited);
        if (sort === 'new') return Number(B.newArrival) - Number(A.newArrival);
        return 0;
      });
      // Keep the original two-row layout while reordering cakes.
      ordered.forEach((col, i) => {
        const row = i < 4 ? rows[0] : rows[1];
        row.appendChild(col);
      });
    }));
  }

  function setupSearch() {
    const form = document.querySelector('form[role="search"]');
    const input = form?.querySelector('input[type="search"]');
    if (!form || !input) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const q = input.value.trim().toLowerCase();
      if (!q) return;
      const cards = [...document.querySelectorAll('.product-card')];
      let found = false;
      cards.forEach(card => {
        const match = card.textContent.toLowerCase().includes(q);
        card.closest('.col').style.display = match ? '' : 'none';
        if (match && !found) { card.scrollIntoView({ behavior: 'smooth', block: 'center' }); found = true; }
      });
      if (!found) alert('No cake or dessert found for your search.');
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupProducts();
    setupSorting();
    setupSearch();
    updateCartBadge();
    document.getElementById('sortToggle')?.addEventListener('click', () => {
      document.querySelectorAll('.sort-btn').forEach(b => b.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }));
    });
  });
})();
