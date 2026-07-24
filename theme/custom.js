(() => {
  const bar = document.createElement('div');
  bar.id = 'reading-progress';
  document.body.appendChild(bar);

  const updateProgress = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const ratio = max > 0 ? doc.scrollTop / max : 0;
    bar.style.width = `${Math.min(100, Math.max(0, ratio * 100))}%`;
  };

  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
})();
