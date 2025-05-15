// yclients-modal.js
(function(){
  if (window.YCLIENTS_MODAL_LOADED) return;
  window.YCLIENTS_MODAL_LOADED = true;

  // 1. Создаём разметку модального окна
  const panel = document.createElement('div');
  panel.id = 'yclients-panel';
  panel.style.cssText = 'position:fixed;top:0;right:-100%;width:100vw;max-width:600px;height:100vh;background:white;z-index:9999;transition:right 0.4s ease;box-shadow:-4px 0 20px rgba(0,0,0,0.2);display:flex;flex-direction:column;overflow:hidden;';
  panel.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:flex-end;gap:12px;margin:16px;">
      <img src="https://static.tildacdn.com/tild3338-3631-4636-a339-643666316464/full.svg"
           alt="Открыть в новой вкладке"
           title="Открыть на весь экран"
           style="width:24px;height:24px;cursor:pointer;filter:grayscale(1) brightness(0.7);" id="yclients-open-blank">
      <img src="https://static.tildacdn.com/tild3135-3162-4863-b363-336638316430/Close.svg"
           alt="Закрыть"
           title="Закрыть"
           style="width:24px;height:24px;cursor:pointer;" id="yclients-close">
    </div>
    <div id="yclients-frame-wrapper" style="flex-grow:1;width:100%;"></div>
  `;
  document.body.appendChild(panel);

  // 2. Overlay
  const overlay = document.createElement('div');
  overlay.id = 'yclients-overlay';
  overlay.onclick = closeYclientsPanel;
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.5);z-index:9998;opacity:0;pointer-events:none;transition:opacity 0.4s ease;';
  document.body.appendChild(overlay);

  // 3. Адаптивные стили
  const style = document.createElement('style');
  style.innerHTML = `
    @media (max-width: 600px) {
      #yclients-panel {
        width: 100vw !important;
        max-width: 100vw !important;
      }
    }
    @supports (height: 100dvh) {
      #yclients-panel {
        height: 100dvh;
      }
      #yclients-overlay {
        height: 100dvh;
      }
    }
  `;
  document.head.appendChild(style);

  // 4. Логика работы модалки
  let inactivityTimer, focusTimer;
  window._yclientsUrl = '';

  function openYclientsPanel(href) {
    window._yclientsUrl = href;
    const fullUrl = href + (href.includes('?') ? '&' : '?') + 'rnd=' + Date.now();
    const wrapper = document.getElementById('yclients-frame-wrapper');
    wrapper.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.src = fullUrl;
    iframe.style = 'flex-grow:1;width:100%;height:100%;border:none;overflow:auto;';
    iframe.allowFullscreen = true;
    wrapper.appendChild(iframe);

    panel.style.right = '0';
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'auto';
    document.body.style.overflow = 'hidden';
    resetInactivityTimer();
  }

  function closeYclientsPanel() {
    panel.style.right = '-100%';
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    document.getElementById('yclients-frame-wrapper').innerHTML = '';
    document.body.style.overflow = '';
    clearTimeout(inactivityTimer);
    clearTimeout(focusTimer);
  }

  function openYclientsFullPage() {
    closeYclientsPanel();
    if (window._yclientsUrl) window.open(window._yclientsUrl, '_blank');
  }

  // Навешиваем обработчики на иконки
  setTimeout(() => {
    document.getElementById('yclients-close').onclick = closeYclientsPanel;
    document.getElementById('yclients-open-blank').onclick = openYclientsFullPage;
  }, 500);

  // Перехват ссылок на yclients
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a');
    if (!link || !link.href) return;
    if (link.href.includes('yclients.com')) {
      e.preventDefault();
      e.stopPropagation();
      openYclientsPanel(link.href);
    }
  }, true);

  // Закрытие по Esc
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeYclientsPanel();
  });

  // Свайп для закрытия (мобилки)
  let touchStartX = 0, touchEndX = 0;
  panel.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX, { passive: true });
  panel.addEventListener('touchmove', e => touchEndX = e.changedTouches[0].screenX, { passive: true });
  panel.addEventListener('touchend', () => {
    if (touchEndX - touchStartX > 100) closeYclientsPanel();
  });

  // Anti-zavis: закрытие по неактивности и фокусу
  function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      closeYclientsPanel();
    }, 5 * 60 * 1000);
  }
  ['mousemove', 'keydown', 'touchstart'].forEach(event =>
    window.addEventListener(event, resetInactivityTimer, true)
  );
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
      focusTimer = setTimeout(() => {
        closeYclientsPanel();
      }, 3 * 60 * 1000);
    } else {
      clearTimeout(focusTimer);
    }
  });

  // Экспорт функций для внешнего вызова (если нужно)
  window.openYclientsPanel = openYclientsPanel;
  window.closeYclientsPanel = closeYclientsPanel;
  window.openYclientsFullPage = openYclientsFullPage;
})();
