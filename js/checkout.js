(function () {
  function formatRM(amount) {
    return 'RM ' + amount.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function itemImage(i) {
    return i.image || ('assets/products/' + i.sku + '.svg');
  }

  function lineKey(sku, size) {
    return size ? sku + '::' + size : sku;
  }

  function render() {
    if (!window.TravelaCart) return;

    var gridEl = document.querySelector('[data-checkout-grid]');
    var emptyPageEl = document.querySelector('[data-checkout-empty-page]');
    var body = document.querySelector('[data-checkout-body]');
    if (!gridEl || !emptyPageEl || !body) return;

    var items = window.TravelaCart.readCart();

    if (!items.length) {
      gridEl.style.display = 'none';
      emptyPageEl.style.display = '';
      return;
    }

    gridEl.style.display = '';
    emptyPageEl.style.display = 'none';

    var countEl = document.querySelector('[data-checkout-count]');
    var subtotalEl = document.querySelector('[data-checkout-subtotal]');
    var orderField = document.querySelector('[data-checkout-order-field]');

    var count = 0;
    var amount = 0;

    body.innerHTML = items.map(function (i) {
      count += i.qty;
      amount += i.qty * i.price;
      var thumb = '<img class="cart-line__thumb" src="' + itemImage(i) + '" alt="" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement(\'div\'),{className:\'cart-line__thumb cart-line__thumb--empty\'}))">';
      var skuLine = i.sku + (i.size ? ' &middot; Size ' + i.size : '') + ' &middot; ' + formatRM(i.price) + ' / set';
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

    if (countEl) countEl.textContent = count;
    if (subtotalEl) subtotalEl.textContent = formatRM(amount);

    if (orderField) {
      var lines = items.map(function (i) {
        return '- ' + i.name + ' (' + i.sku + ')' + (i.size ? ' [Size ' + i.size + ']' : '') + ' x' + i.qty + ' @ ' + formatRM(i.price) + '/set = ' + formatRM(i.qty * i.price);
      });
      orderField.value =
        'Order:\n' + lines.join('\n') +
        '\n\nEstimated subtotal: ' + formatRM(amount) +
        ' (' + count + ' set' + (count === 1 ? '' : 's') + ' total)';
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!document.querySelector('[data-checkout-grid]')) return;

    render();

    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-line-increase], [data-line-decrease], [data-line-remove]')) {
        render();
      }
    });

    document.addEventListener('change', function (e) {
      if (e.target.matches('[data-line-qty]')) render();
    });
  });
})();
