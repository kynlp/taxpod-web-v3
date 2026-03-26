(function () {
  /* ── Static content data ── */
  var SEARCH_DATA = [
    // Courses
    { title: 'e-Invoicing – Industry Focus: Healthcare', type: 'Course', category: 'E-Invoicing', url: 'webinar-detail.html', duration: '19 mins' },
    { title: 'e-Invoicing – Industry Focus: F&B', type: 'Course', category: 'E-Invoicing', url: 'webinar-detail.html', duration: '22 mins' },
    { title: 'e-Invoicing – Industry Focus: Retail', type: 'Course', category: 'E-Invoicing', url: 'webinar-detail.html', duration: '18 mins' },
    { title: 'e-Invoicing for SMEs: Getting Started', type: 'Course', category: 'E-Invoicing', url: 'e-invoicing.html', duration: '25 mins' },
    { title: 'MyInvois Portal: Step-by-Step Setup', type: 'Course', category: 'E-Invoicing', url: 'e-invoicing.html', duration: '30 mins' },
    { title: 'Self-Billed e-Invoice: When & How', type: 'Course', category: 'E-Invoicing', url: 'e-invoicing.html', duration: '15 mins' },
    { title: 'SST Registration & Filing', type: 'Course', category: 'SST', url: 'e-invoicing.html', duration: '40 mins' },
    { title: 'SST: Exemptions & Special Cases', type: 'Course', category: 'SST', url: 'e-invoicing.html', duration: '35 mins' },
    { title: 'Income Tax Basics for Individuals', type: 'Course', category: 'Income Tax', url: 'e-invoicing.html', duration: '45 mins' },
    { title: 'Benefit in Kind: Tax Treatment', type: 'Course', category: 'Income Tax', url: 'e-invoicing.html', duration: '28 mins' },
    { title: 'Corporate Tax: Key Updates 2025', type: 'Course', category: 'Income Tax', url: 'e-invoicing.html', duration: '50 mins' },
    { title: 'Transfer Pricing Documentation', type: 'Course', category: 'Income Tax', url: 'e-invoicing.html', duration: '60 mins' },
    // Webinars
    { title: 'e-Invoicing Live: Q&A Session', type: 'Webinar', category: 'E-Invoicing', url: 'webinars.html', duration: '1 CPE' },
    { title: 'Budget 2025 Tax Highlights', type: 'Webinar', category: 'Income Tax', url: 'webinars.html', duration: '2 CPE' },
    { title: 'SST Updates & Recent Changes', type: 'Webinar', category: 'SST', url: 'webinars.html', duration: '1 CPE' },
    { title: 'MyInvois API Integration Workshop', type: 'Webinar', category: 'E-Invoicing', url: 'webinars.html', duration: '3 CPE' },
    { title: 'Transfer Pricing: Case Studies', type: 'Webinar', category: 'Income Tax', url: 'webinars.html', duration: '2 CPE' },
    // Clips
    { title: 'What is e-Invoicing?', type: 'Clip', category: 'E-Invoicing', url: 'clips.html', duration: '3 mins' },
    { title: 'SST vs GST: Key Differences', type: 'Clip', category: 'SST', url: 'clips.html', duration: '4 mins' },
    { title: 'Top 5 Tax Mistakes to Avoid', type: 'Clip', category: 'Income Tax', url: 'clips.html', duration: '5 mins' },
    { title: 'e-Invoice for Foreign Transactions', type: 'Clip', category: 'E-Invoicing', url: 'clips.html', duration: '3 mins' },
  ];

  var HOT_TOPICS = ['e-Invoicing', 'SST', 'Income Tax', 'MyInvois', 'Budget 2025', 'Benefit in Kind'];

  var STORAGE_KEY = 'taxpod_recent_searches';
  var MAX_RECENT = 5;
  var activeIndex = -1;
  var currentResults = [];
  var debounceTimer = null;
  var activeCategory = 'All';

  /* ── DOM refs ── */
  var wrap, input, dropdown;

  function init() {
    wrap = document.querySelector('.topbar-search');
    input = wrap ? wrap.querySelector('input') : null;
    if (!wrap || !input) return;

    // Add id for input
    input.id = 'topbar-search-input';
    input.setAttribute('autocomplete', 'off');

    // Build dropdown
    dropdown = document.createElement('div');
    dropdown.className = 'search-dropdown';
    dropdown.setAttribute('role', 'listbox');
    wrap.appendChild(dropdown);

    // Events
    input.addEventListener('input', onInput);
    input.addEventListener('focus', onFocus);
    input.addEventListener('keydown', onKeydown);
    document.addEventListener('click', onOutsideClick);

    render();
  }

  /* ── Data helpers ── */
  function getRecent() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (e) { return []; }
  }
  function saveRecent(term) {
    var list = getRecent().filter(function (t) { return t !== term; });
    list.unshift(term);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
  }
  function removeRecent(term) {
    var list = getRecent().filter(function (t) { return t !== term; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    render();
  }
  function clearRecent() {
    localStorage.removeItem(STORAGE_KEY);
    render();
  }

  /* ── Search logic ── */
  function search(q) {
    var lq = q.toLowerCase();
    return SEARCH_DATA.filter(function (item) {
      return item.title.toLowerCase().indexOf(lq) !== -1 ||
        item.category.toLowerCase().indexOf(lq) !== -1 ||
        item.type.toLowerCase().indexOf(lq) !== -1;
    });
  }

  /* ── Event handlers ── */
  function onInput() {
    clearTimeout(debounceTimer);
    activeIndex = -1;
    activeCategory = 'All';
    debounceTimer = setTimeout(function () { render(); }, 250);
  }
  function onFocus() {
    dropdown.classList.add('open');
    render();
  }
  function onOutsideClick(e) {
    if (!wrap.contains(e.target)) {
      dropdown.classList.remove('open');
      activeIndex = -1;
    }
  }
  function onKeydown(e) {
    if (!dropdown.classList.contains('open')) return;
    var items = dropdown.querySelectorAll('.sr-item');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, items.length - 1);
      updateActive(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, -1);
      updateActive(items);
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && items[activeIndex]) {
        items[activeIndex].click();
      } else if (input.value.trim()) {
        commitSearch(input.value.trim());
      }
    } else if (e.key === 'Escape') {
      dropdown.classList.remove('open');
      input.blur();
    }
  }
  function updateActive(items) {
    items.forEach(function (el, i) {
      el.classList.toggle('active', i === activeIndex);
    });
  }

  /* ── Navigate ── */
  function commitSearch(term) {
    if (!term) return;
    saveRecent(term);
    dropdown.classList.remove('open');
    input.blur();
  }
  function goTo(url) {
    window.location.href = url;
  }

  /* ── Render ── */
  function render() {
    var q = input.value.trim();
    dropdown.innerHTML = '';
    activeIndex = -1;

    if (!q) {
      renderEmpty();
    } else {
      currentResults = search(q);
      renderResults(q);
    }
  }

  function renderEmpty() {
    var recent = getRecent();
    var html = '';

    if (recent.length) {
      html += '<div class="sr-section-label"><span>Recent Searches</span><button class="sr-clear-btn" onclick="(function(){' +
        'var k=\'taxpod_recent_searches\';localStorage.removeItem(k);' +
        'var d=document.querySelector(\'.search-dropdown\');if(d){' +
        'var i=d.previousSibling;while(i&&i.tagName!==\'INPUT\')i=i.previousSibling;' +
        'var wrap=document.querySelector(\'.topbar-search\');if(wrap){' +
        'var inp=wrap.querySelector(\'input\');if(inp){inp.dispatchEvent(new Event(\'input\'));}}}' +
        '})()">Clear all</button></div>';
      recent.forEach(function (term) {
        html += '<div class="sr-item sr-recent" data-term="' + esc(term) + '">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
          '<span>' + esc(term) + '</span>' +
          '<button class="sr-remove" data-term="' + esc(term) + '" title="Remove">✕</button>' +
          '</div>';
      });
    }

    html += '<div class="sr-section-label"><span>Hot Topics</span></div>';
    html += '<div class="sr-hot-topics">';
    HOT_TOPICS.forEach(function (t) {
      html += '<button class="sr-hot-tag" data-term="' + esc(t) + '">' + esc(t) + '</button>';
    });
    html += '</div>';

    dropdown.innerHTML = html;

    // Bind recent item clicks
    dropdown.querySelectorAll('.sr-recent').forEach(function (el) {
      el.addEventListener('click', function (e) {
        if (e.target.classList.contains('sr-remove')) return;
        input.value = el.dataset.term;
        onInput();
      });
    });
    dropdown.querySelectorAll('.sr-remove').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        removeRecent(btn.dataset.term);
      });
    });
    dropdown.querySelectorAll('.sr-hot-tag').forEach(function (btn) {
      btn.addEventListener('click', function () {
        input.value = btn.dataset.term;
        render();
      });
    });
  }

  function renderResults(q) {
    var filtered = activeCategory === 'All'
      ? currentResults
      : currentResults.filter(function (r) { return r.type === activeCategory; });

    var cats = ['All'];
    ['Course', 'Webinar', 'Clip'].forEach(function (c) {
      if (currentResults.some(function (r) { return r.type === c; })) cats.push(c);
    });

    var html = '';

    // Category tabs
    if (cats.length > 1) {
      html += '<div class="sr-tabs">';
      cats.forEach(function (c) {
        var count = c === 'All' ? currentResults.length : currentResults.filter(function (r) { return r.type === c; }).length;
        html += '<button class="sr-tab' + (activeCategory === c ? ' active' : '') + '" data-cat="' + c + '">' + c + ' <span class="sr-tab-count">' + count + '</span></button>';
      });
      html += '</div>';
    }

    if (!filtered.length) {
      html += '<div class="sr-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><span>No results found for "<strong>' + esc(q) + '</strong>"</span></div>';
    } else {
      var shown = filtered.slice(0, 6);
      shown.forEach(function (item) {
        html += '<div class="sr-item" data-url="' + esc(item.url) + '">' +
          '<div class="sr-item-icon sr-icon-' + item.type.toLowerCase() + '">' + typeIcon(item.type) + '</div>' +
          '<div class="sr-item-body">' +
          '<div class="sr-item-title">' + highlight(item.title, q) + '</div>' +
          '<div class="sr-item-meta"><span class="sr-badge sr-badge-' + item.type.toLowerCase() + '">' + item.type + '</span><span class="sr-item-dur">' + item.duration + '</span></div>' +
          '</div>' +
          '</div>';
      });
      if (filtered.length > 6) {
        html += '<div class="sr-see-all">See all ' + filtered.length + ' results for "<strong>' + esc(q) + '</strong>"</div>';
      }
    }

    dropdown.innerHTML = html;

    // Bind tab clicks
    dropdown.querySelectorAll('.sr-tab').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        activeCategory = btn.dataset.cat;
        render();
      });
    });

    // Bind result clicks
    dropdown.querySelectorAll('.sr-item[data-url]').forEach(function (el) {
      el.addEventListener('click', function () {
        saveRecent(q);
        goTo(el.dataset.url);
      });
    });

    dropdown.querySelector('.sr-see-all') && dropdown.querySelector('.sr-see-all').addEventListener('click', function () {
      commitSearch(q);
    });
  }

  /* ── Helpers ── */
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function highlight(text, q) {
    if (!q) return esc(text);
    var re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
    return esc(text).replace(re, '<mark>$1</mark>');
  }
  function typeIcon(type) {
    if (type === 'Course') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>';
    if (type === 'Webinar') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>';
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>';
  }

  // Init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
