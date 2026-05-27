/* Mermaid diagram rendering for Email Learning Lab pages */
(function (global) {
  function isDark() {
    return document.documentElement.classList.contains('dark');
  }

  function mermaidTheme() {
    return isDark() ? 'dark' : 'default';
  }

  async function renderAll() {
    if (typeof mermaid === 'undefined') return;
    var blocks = document.querySelectorAll('.mermaid');
    if (!blocks.length) return;

    mermaid.initialize({
      startOnLoad: false,
      theme: mermaidTheme(),
      securityLevel: 'loose',
      flowchart: { curve: 'basis', htmlLabels: true },
    });

    /* Re-render after theme change: restore source from data attribute */
    blocks.forEach(function (el) {
      if (el.dataset.source) el.textContent = el.dataset.source;
      el.removeAttribute('data-processed');
    });

    await mermaid.run({ nodes: blocks });
  }

  function init() {
    blocksPreserveSource();
    renderAll();

    var observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        if (mutations[i].attributeName === 'class') {
          renderAll();
          break;
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }

  function blocksPreserveSource() {
    document.querySelectorAll('.mermaid').forEach(function (el) {
      if (!el.dataset.source) el.dataset.source = el.textContent.trim();
    });
  }

  global.LabDiagrams = {
    init: init,
    refresh: renderAll,
  };
})(window);
