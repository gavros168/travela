(function () {
  var STORAGE_KEY = 'travela_quote_cart';

  function readCart() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function writeCart(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function formatRM(amount) {
    return 'RM ' + amount.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function itemImage(i) {
    return i.image || ('assets/products/' + i.sku + '.svg');
  }

  function lineKey(sku, size) {
    return size ? sku + '::' + size : sku;
  }

  function totals(items) {
    return items.reduce(function (acc, i) {
      acc.count += i.qty;
      acc.amount += i.qty * i.price;
      return acc;
    }, { count: 0, amount: 0 });
  }

  function addItem(sku, name, price, qty, image, size) {
    var items = readCart();
    var key = lineKey(sku, size);
    var existing = items.filter(function (i) { return lineKey(i.sku, i.size) === key; })[0];
    if (existing) {
      existing.qty += qty;
      if (image && !existing.image) existing.image = image;
    } else {
      items.push({ sku: sku, name: name, price: price, qty: qty, image: image || '', size: size || '' });
    }
    writeCart(items);
    renderAll();
  }

  function setQty(key, qty) {
    var items = readCart();
    var item = items.filter(function (i) { return lineKey(i.sku, i.size) === key; })[0];
    if (!item) return;
    item.qty = Math.max(1, qty);
    writeCart(items);
    renderAll();
  }

  function removeItem(key) {
    var items = readCart().filter(function (i) { return lineKey(i.sku, i.size) !== key; });
    writeCart(items);
    renderAll();
  }

  function clearCart() {
    writeCart([]);
    renderAll();
  }

  function buildDrawer() {
    if (document.querySelector('[data-cart-drawer]')) return;

    var overlay = document.createElement('div');
    overlay.className = 'cart-overlay';
    overlay.setAttribute('data-cart-overlay', '');

    var drawer = document.createElement('aside');
    drawer.className = 'cart-drawer';
    drawer.setAttribute('data-cart-drawer', '');
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-label', 'Quote cart');
    drawer.innerHTML =
      '<div class="cart-drawer__head">' +
        '<h3>Cart</h3>' +
        '<button type="button" class="cart-drawer__close" data-cart-close aria-label="Close cart">&times;</button>' +
      '</div>' +
      '<div class="cart-drawer__body" data-cart-body></div>' +
      '<div class="cart-drawer__foot">' +
        '<div class="cart-drawer__subtotal">' +
          '<span>Subtotal</span>' +
          '<strong data-cart-subtotal>RM 0</strong>' +
        '</div>' +
        '<a href="checkout" class="btn btn--amber" style="width:100%;">Proceed to Checkout</a>' +
        '<button type="button" class="cart-drawer__clear" data-cart-clear>Clear cart</button>' +
      '</div>';

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);
  }

  function renderDrawer(items) {
    var body = document.querySelector('[data-cart-body]');
    var subtotalEl = document.querySelector('[data-cart-subtotal]');
    if (!body || !subtotalEl) return;

    if (!items.length) {
      body.innerHTML = '<p class="cart-empty">Your cart is empty. Browse the catalog and add products to checkout.</p>';
    } else {
      body.innerHTML = items.map(function (i) {
        var thumb = '<img class="cart-line__thumb" src="' + itemImage(i) + '" alt="" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement(\'div\'),{className:\'cart-line__thumb cart-line__thumb--empty\'}))">';
        var skuLine = i.sku + (i.size ? ' &middot; Size ' + i.size : '') + ' &middot; ' + formatRM(i.price) + ' / unit';
        return (
          '<div class="cart-line" data-line-key="' + lineKey(i.sku, i.size) + '">' +
            thumb +
            '<div class="cart-line__main">' +
              '<div class="cart-line__info">' +
                '<span class="cart-line__name">' + i.name + '</span>' +
                '<span class="cart-line__sku mono">' + skuLine + '</span>' +
              '</div>' +
              '<div class="cart-line__controls">' +
                '<div class="qty-stepper qty-stepper--sm">' +
                  '<button type="button" class="qty-btn" data-line-decrease aria-label="Decrease quantity">&minus;</button>' +
                  '<input type="number" class="qty-input" min="1" value="' + i.qty + '" data-line-qty aria-label="Quantity">' +
                  '<button type="button" class="qty-btn" data-line-increase aria-label="Increase quantity">+</button>' +
                '</div>' +
                '<span class="cart-line__price mono">' + formatRM(i.qty * i.price) + '</span>' +
                '<button type="button" class="cart-line__remove" data-line-remove aria-label="Remove ' + i.name + '">&times;</button>' +
              '</div>' +
            '</div>' +
          '</div>'
        );
      }).join('');
    }

    subtotalEl.textContent = formatRM(totals(items).amount);
  }

  function renderBadges(items) {
    var t = totals(items);
    var countEls = document.querySelectorAll('[data-cart-count]');
    var totalEls = document.querySelectorAll('[data-cart-total]');
    var toggleEls = document.querySelectorAll('[data-cart-toggle]');
    for (var i = 0; i < countEls.length; i++) countEls[i].textContent = t.count;
    for (var j = 0; j < totalEls.length; j++) totalEls[j].textContent = formatRM(t.amount);
    for (var k = 0; k < toggleEls.length; k++) {
      if (t.count > 0) toggleEls[k].classList.add('has-items');
      else toggleEls[k].classList.remove('has-items');
    }
  }

  function renderAll() {
    var items = readCart();
    renderBadges(items);
    renderDrawer(items);
  }

  function openDrawer() {
    var overlay = document.querySelector('[data-cart-overlay]');
    var drawer = document.querySelector('[data-cart-drawer]');
    if (overlay) overlay.classList.add('is-open');
    if (drawer) drawer.classList.add('is-open');
    var toggles = document.querySelectorAll('[data-cart-toggle]');
    for (var i = 0; i < toggles.length; i++) toggles[i].setAttribute('aria-expanded', 'true');
    document.body.classList.add('cart-open');
  }

  function pulseToggle() {
    var toggles = document.querySelectorAll('[data-cart-toggle]');
    for (var i = 0; i < toggles.length; i++) {
      var el = toggles[i];
      el.classList.remove('cart-toggle--pulse');
      void el.offsetWidth;
      el.classList.add('cart-toggle--pulse');
    }
  }

  function closeDrawer() {
    var overlay = document.querySelector('[data-cart-overlay]');
    var drawer = document.querySelector('[data-cart-drawer]');
    if (overlay) overlay.classList.remove('is-open');
    if (drawer) drawer.classList.remove('is-open');
    var toggles = document.querySelectorAll('[data-cart-toggle]');
    for (var i = 0; i < toggles.length; i++) toggles[i].setAttribute('aria-expanded', 'false');
    document.body.classList.remove('cart-open');
  }

  document.addEventListener('DOMContentLoaded', function () {
    buildDrawer();
    renderAll();

    var toggles = document.querySelectorAll('[data-cart-toggle]');
    for (var i = 0; i < toggles.length; i++) {
      toggles[i].addEventListener('click', openDrawer);
    }

    document.addEventListener('click', function (e) {
      var target = e.target;

      if (target.closest('[data-cart-close]') || target === document.querySelector('[data-cart-overlay]')) {
        closeDrawer();
        return;
      }

      if (target.closest('[data-cart-clear]')) {
        clearCart();
        return;
      }

      var addBtn = target.closest('.add-to-cart');
      if (addBtn) {
        var card = addBtn.closest('[data-sku]');
        if (!card) return;
        var sku = card.dataset.sku;
        var name = card.dataset.name;
        var price = parseFloat(card.dataset.price);
        var mediaImg = card.querySelector('.product-card__media img');
        var image = card.dataset.image || (mediaImg ? mediaImg.getAttribute('src') : '');
        var qtyInput = card.querySelector('.qty-input');
        var qty = qtyInput ? Math.max(1, parseInt(qtyInput.value, 10) || 1) : 1;
        var sizeSelect = card.querySelector('[data-size-select]');
        var size = sizeSelect ? sizeSelect.value : '';
        addItem(sku, name, price, qty, image, size);
        if (qtyInput) qtyInput.value = 1;
        pulseToggle();
        return;
      }

      if (target.closest('[data-qty-increase]')) {
        var incWrap = target.closest('.qty-stepper');
        var incInput = incWrap.querySelector('.qty-input');
        incInput.value = Math.max(1, (parseInt(incInput.value, 10) || 1) + 1);
        return;
      }

      if (target.closest('[data-qty-decrease]')) {
        var decWrap = target.closest('.qty-stepper');
        var decInput = decWrap.querySelector('.qty-input');
        decInput.value = Math.max(1, (parseInt(decInput.value, 10) || 1) - 1);
        return;
      }

      if (target.closest('[data-line-increase]')) {
        var incLine = target.closest('[data-line-key]');
        var incLineInput = incLine.querySelector('[data-line-qty]');
        setQty(incLine.dataset.lineKey, Math.max(1, (parseInt(incLineInput.value, 10) || 1) + 1));
        return;
      }

      if (target.closest('[data-line-decrease]')) {
        var decLine = target.closest('[data-line-key]');
        var decLineInput = decLine.querySelector('[data-line-qty]');
        setQty(decLine.dataset.lineKey, Math.max(1, (parseInt(decLineInput.value, 10) || 1) - 1));
        return;
      }

      if (target.closest('[data-line-remove]')) {
        var removeLine = target.closest('[data-line-key]');
        removeItem(removeLine.dataset.lineKey);
        return;
      }

      var productCard = target.closest('.product-card[data-sku]');
      if (productCard && !target.closest('a, button, input, select, textarea, label')) {
        window.location.href = 'product?sku=' + encodeURIComponent(productCard.dataset.sku);
        return;
      }
    });

    document.addEventListener('change', function (e) {
      if (e.target.matches('[data-line-qty]')) {
        var line = e.target.closest('[data-line-key]');
        setQty(line.dataset.lineKey, parseInt(e.target.value, 10) || 1);
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDrawer();
    });
  });

  window.TravelaCart = {
    addItem: addItem,
    removeItem: removeItem,
    setQty: setQty,
    clearCart: clearCart,
    readCart: readCart
  };
})();
