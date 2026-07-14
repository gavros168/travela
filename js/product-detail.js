(function () {
  function formatRM(amount) {
    return 'RM ' + amount.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function categorySlug(code) {
    return code.toLowerCase();
  }

  function renderRelated(product, all) {
    var related = all.filter(function (p) {
      return p.category === product.category && p.sku !== product.sku;
    }).slice(0, 3);

    if (!related.length) return;

    document.getElementById('related-wrap').style.display = '';
    document.getElementById('related-code').textContent = product.categoryCode;
    document.getElementById('related-category-name').textContent = product.category;

    var grid = document.getElementById('related-grid');
    grid.innerHTML = related.map(function (p) {
      return (
        '<a class="product-card product-card--link" href="product?sku=' + encodeURIComponent(p.sku) + '">' +
          '<div class="product-card__media">' +
            '<img src="' + p.image + '" alt="' + p.name + '" loading="lazy">' +
            '<span class="tag-code mono">' + p.sku + '</span>' +
          '</div>' +
          '<div class="product-card__body">' +
            '<h3>' + p.name + '</h3>' +
            '<p>' + p.shortDescription + '</p>' +
            '<div class="product-card__footer">' +
              '<span class="product-price">' + formatRM(p.price) + '<small>/ unit</small></span>' +
            '</div>' +
          '</div>' +
        '</a>'
      );
    }).join('');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var params = new URLSearchParams(window.location.search);
    var sku = params.get('sku');
    var products = window.TRAVELA_PRODUCTS || [];
    var product = products.filter(function (p) { return p.sku === sku; })[0];

    if (!product) {
      document.getElementById('product-detail').style.display = 'none';
      document.getElementById('product-not-found').style.display = '';
      return;
    }

    document.title = product.name + ' | TRAVELA SDN. BHD.';
    var metaDesc = document.getElementById('page-description');
    if (metaDesc) metaDesc.setAttribute('content', product.shortDescription);

    document.getElementById('crumb-category').textContent = product.category;
    document.getElementById('crumb-category').href = 'products#cat-' + categorySlug(product.categoryCode);
    document.getElementById('crumb-name').textContent = product.name;

    document.getElementById('detail-sku').textContent = product.sku;

    var mediaEl = document.getElementById('detail-media');
    var imageEl = document.getElementById('detail-image');
    if (product.image) {
      imageEl.src = product.image;
      imageEl.alt = product.name;
    } else {
      mediaEl.classList.add('product-detail__media--placeholder');
      imageEl.remove();
      var label = document.createElement('span');
      label.className = 'product-detail__media-label';
      label.textContent = 'Photography coming soon — spec sheet shown below';
      mediaEl.appendChild(label);
    }

    document.getElementById('detail-category').textContent = product.category;
    document.getElementById('detail-name').textContent = product.name;
    document.getElementById('detail-short').textContent = product.shortDescription;
    document.getElementById('detail-description').textContent = product.description;
    document.getElementById('detail-measurement-note').textContent = window.TRAVELA_MEASUREMENT_NOTE || '';

    var priceEl = document.getElementById('detail-price');
    priceEl.innerHTML = formatRM(product.price) + '<small>/ unit</small>';

    var specsTable = document.getElementById('detail-specs');
    specsTable.innerHTML = product.specs.map(function (row) {
      return '<tr><th>' + row[0] + '</th><td>' + row[1] + '</td></tr>';
    }).join('');

    var buyPanel = document.getElementById('detail-buy-panel');
    buyPanel.setAttribute('data-sku', product.sku);
    buyPanel.setAttribute('data-name', product.name);
    buyPanel.setAttribute('data-price', product.price);
    buyPanel.setAttribute('data-image', product.image || '');

    var sizeSelect = document.getElementById('detail-size-select');
    if (sizeSelect) {
      if (product.sizes && product.sizes.length) {
        sizeSelect.innerHTML = product.sizes.map(function (s) {
          return '<option value="' + s + '">Size ' + s + '</option>';
        }).join('');
        var mid = Math.floor(product.sizes.length / 2);
        sizeSelect.value = product.sizes[mid];
        sizeSelect.style.display = '';
      } else {
        sizeSelect.style.display = 'none';
      }
    }

    renderRelated(product, products);
  });
})();
