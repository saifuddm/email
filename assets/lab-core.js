/* Shared utilities for Email Learning Lab pages */
(function (global) {
  const THEME_KEY = 'email-study-plan-theme';

  function initTheme() {
    function syncIcons() {
      const dark = document.documentElement.classList.contains('dark');
      document.querySelectorAll('.theme-toggle').forEach(function (btn) {
        btn.querySelectorAll('.icon-sun, .lucide-sun').forEach(function (el) {
          el.classList.toggle('hidden', !dark);
        });
        btn.querySelectorAll('.icon-moon, .lucide-moon').forEach(function (el) {
          el.classList.toggle('hidden', dark);
        });
        var label = btn.querySelector('.theme-label');
        if (label) label.textContent = dark ? 'Light mode' : 'Dark mode';
      });
    }

    function setTheme(dark) {
      document.documentElement.classList.toggle('dark', dark);
      localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
      syncIcons();
    }

    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setTheme(!document.documentElement.classList.contains('dark'));
      });
    });
    syncIcons();
  }

  function initSidebar() {
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('sidebar-overlay');
    var toggle = document.getElementById('menu-toggle');

    function closeSidebar() {
      if (sidebar) sidebar.classList.remove('open');
      if (overlay) overlay.classList.remove('visible');
    }

    function openSidebar() {
      if (sidebar) sidebar.classList.add('open');
      if (overlay) overlay.classList.add('visible');
    }

    if (toggle) {
      toggle.addEventListener('click', function () {
        if (sidebar && sidebar.classList.contains('open')) closeSidebar();
        else openSidebar();
      });
    }

    if (overlay) overlay.addEventListener('click', closeSidebar);

    document.querySelectorAll('#sidebar a').forEach(function (a) {
      a.addEventListener('click', closeSidebar);
    });
  }

  function initNavHighlight() {
    var sections = document.querySelectorAll('section[id], article[id]');
    var navLinks = document.querySelectorAll('.nav-link[href^="#"]');

    window.addEventListener('scroll', function () {
      var current = '';
      sections.forEach(function (s) {
        if (window.scrollY >= s.offsetTop - 120) current = s.id;
      });
      navLinks.forEach(function (l) {
        l.classList.toggle('active', l.getAttribute('href') === '#' + current);
      });
    });
  }

  function initCheckboxes(storageKey, migrateFn) {
    if (typeof LabIcons !== 'undefined') LabIcons.refresh();

    function loadChecks() {
      try {
        return JSON.parse(localStorage.getItem(storageKey) || '{}');
      } catch (e) {
        return {};
      }
    }

    function saveChecks(state) {
      localStorage.setItem(storageKey, JSON.stringify(state));
    }

    function updateProgress() {
      var all = document.querySelectorAll('.check-item');
      var checked = document.querySelectorAll('.check-item:checked');
      var pct = all.length ? Math.round((checked.length / all.length) * 100) : 0;
      var bar = document.getElementById('progress-bar');
      var text = document.getElementById('progress-text');
      if (bar) bar.style.width = pct + '%';
      if (text) text.textContent = pct + '%';
    }

    var state = migrateFn ? migrateFn(loadChecks()) : loadChecks();

    document.querySelectorAll('.check-item').forEach(function (el) {
      if (state[el.dataset.id]) {
        el.checked = true;
        var wrap = el.closest('.check-wrap');
        if (wrap) wrap.classList.toggle('is-checked', true);
      }
      el.addEventListener('change', function () {
        state[el.dataset.id] = el.checked;
        saveChecks(state);
        updateProgress();
        var wrap = el.closest('.check-wrap');
        if (wrap) wrap.classList.toggle('is-checked', el.checked);
      });
    });
    document.querySelectorAll('.check-wrap').forEach(function (wrap) {
      var input = wrap.querySelector('.check-item');
      if (input) wrap.classList.toggle('is-checked', input.checked);
    });
    updateProgress();
  }

  function expandAll(open) {
    document.querySelectorAll('details').forEach(function (d) {
      d.open = open;
    });
  }

  global.LabCore = {
    initTheme: initTheme,
    initSidebar: initSidebar,
    initNavHighlight: initNavHighlight,
    initCheckboxes: initCheckboxes,
    expandAll: expandAll,
  };
})(window);
