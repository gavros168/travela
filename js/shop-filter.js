document.addEventListener('DOMContentLoaded', function () {
  var pills = document.querySelectorAll('[data-filter]');
  var cards = document.querySelectorAll('.product-card[data-category]');
  var searchInputs = document.querySelectorAll('[data-shop-search]');
  var countEl = document.querySelector('[data-shop-count]');

  if (!cards.length) return;

  var state = { category: 'all', query: '' };

  function apply() {
    var visibleCount = 0;
    cards.forEach(function (card) {
      var matchesCategory = state.category === 'all' || card.dataset.category === state.category;
      var haystack = (card.dataset.name || card.textContent || '').toLowerCase();
      var matchesQuery = !state.query || haystack.indexOf(state.query) !== -1;
      var visible = matchesCategory && matchesQuery;
      card.style.display = visible ? '' : 'none';
      if (visible) visibleCount++;
    });

    document.querySelectorAll('.product-category').forEach(function (section) {
      var anyVisible = Array.prototype.some.call(section.querySelectorAll('.product-card'), function (c) {
        return c.style.display !== 'none';
      });
      section.style.display = anyVisible ? '' : 'none';
    });

    if (countEl) countEl.textContent = visibleCount + (visibleCount === 1 ? ' product' : ' products');
  }

  pills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      state.category = pill.dataset.filter;
      pills.forEach(function (p) { p.classList.toggle('is-active', p === pill); });
      apply();
    });
  });

  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      state.query = input.value.trim().toLowerCase();
      apply();
    });
  });

  var params = new URLSearchParams(window.location.search);
  var q = params.get('q');
  if (q) {
    searchInputs.forEach(function (input) { input.value = q; });
    state.query = q.trim().toLowerCase();
  }

  apply();
});
