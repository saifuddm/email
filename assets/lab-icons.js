/* Lucide icon helpers for Email Learning Lab */
(function (global) {
  var ICON_DEFAULTS = {
    'stroke-width': 2,
    width: 18,
    height: 18,
  };

  function render(root) {
    if (typeof lucide === 'undefined') return;
    lucide.createIcons({
      attrs: ICON_DEFAULTS,
      nameAttr: 'data-lucide',
      root: root || document,
    });
  }

  function enhanceCheckboxes(root) {
    var scope = root || document;
    scope.querySelectorAll('.check-item:not([data-lucide-enhanced])').forEach(function (input) {
      input.dataset.lucideEnhanced = '1';
      input.classList.add('check-input');

      var wrap = document.createElement('span');
      wrap.className = 'check-wrap';

      var box = document.createElement('span');
      box.className = 'check-box';
      box.setAttribute('aria-hidden', 'true');

      var icon = document.createElement('i');
      icon.setAttribute('data-lucide', 'check');
      icon.className = 'check-icon';
      box.appendChild(icon);

      input.parentNode.insertBefore(wrap, input);
      wrap.appendChild(box);
      wrap.appendChild(input);

      function sync() {
        wrap.classList.toggle('is-checked', input.checked);
        input.setAttribute('aria-checked', input.checked ? 'true' : 'false');
      }

      input.addEventListener('change', sync);
      sync();
    });
  }

  function enhanceBulletLists(root) {
    var scope = root || document;
    scope.querySelectorAll('.bullet-list li:not([data-lucide-enhanced])').forEach(function (li) {
      li.dataset.lucideEnhanced = '1';
      var icon = document.createElement('i');
      icon.setAttribute('data-lucide', 'arrow-right');
      icon.className = 'list-icon';
      li.insertBefore(icon, li.firstChild);
    });
  }

  function enhanceCheckpoints(root) {
    var scope = root || document;
    scope.querySelectorAll('.checkpoint:not([data-lucide-enhanced])').forEach(function (el) {
      el.dataset.lucideEnhanced = '1';
      el.classList.add('checkpoint-row');
      var icon = document.createElement('i');
      icon.setAttribute('data-lucide', 'circle-check');
      icon.className = 'checkpoint-icon';
      el.insertBefore(icon, el.firstChild);
    });
  }

  function enhanceTextLinks(root) {
    var scope = root || document;
    scope.querySelectorAll('.back-link:not([data-lucide-enhanced])').forEach(function (el) {
      el.dataset.lucideEnhanced = '1';
      el.classList.add('icon-text-link');
      var text = el.textContent.replace(/^\s*←\s*/, '').trim();
      el.textContent = '';
      var icon = document.createElement('i');
      icon.setAttribute('data-lucide', 'arrow-left');
      icon.className = 'link-icon';
      el.appendChild(icon);
      el.appendChild(document.createTextNode(' ' + text));
    });

    scope.querySelectorAll('.cta-btn:not([data-lucide-enhanced])').forEach(function (el) {
      el.dataset.lucideEnhanced = '1';
      el.classList.add('icon-text-link');
      var text = el.textContent.replace(/\s*→\s*$/, '').trim();
      el.textContent = '';
      el.appendChild(document.createTextNode(text + ' '));
      var icon = document.createElement('i');
      icon.setAttribute('data-lucide', 'arrow-right');
      icon.className = 'link-icon';
      el.appendChild(icon);
    });

    scope.querySelectorAll('.nav-link-ext:not([data-lucide-enhanced])').forEach(function (el) {
      el.dataset.lucideEnhanced = '1';
      el.classList.add('icon-text-link');
      var text = el.textContent.replace(/\s*→\s*$/, '').trim();
      el.textContent = '';
      el.appendChild(document.createTextNode(text + ' '));
      var icon = document.createElement('i');
      icon.setAttribute('data-lucide', 'arrow-right');
      icon.className = 'link-icon';
      el.appendChild(icon);
    });
  }

  function enhanceQuestionGroups(root) {
    var scope = root || document;
    scope.querySelectorAll('.question-group > summary:not([data-lucide-enhanced])').forEach(function (summary) {
      summary.dataset.lucideEnhanced = '1';
      summary.classList.add('question-summary');
      var icon = document.createElement('i');
      icon.setAttribute('data-lucide', 'chevron-down');
      icon.className = 'question-chevron';
      summary.appendChild(icon);
    });
  }

  function refresh(root) {
    enhanceCheckboxes(root);
    enhanceBulletLists(root);
    enhanceCheckpoints(root);
    enhanceTextLinks(root);
    enhanceQuestionGroups(root);
    render(root);
  }

  global.LabIcons = {
    render: render,
    refresh: refresh,
  };
})(window);
