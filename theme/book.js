(() => {
  'use strict';

  const html = document.documentElement;
  const body = document.body;
  const root = window.MOXI_ROOT || '';
  const currentPath = normalizeSourcePath(window.MOXI_CURRENT_PATH || body.dataset.sourcePath || 'index.md');
  const chapters = normalizeChapters(window.MOXI_CHAPTERS);

  const sectionConfig = {
    home: { title: '首页', prefix: '', index: 'index.md' },
    about: { title: '我', prefix: 'about/', index: 'about/index.md' },
    ysyx: { title: '一生一芯', prefix: 'ysyx/', index: 'ysyx/index.md' },
    development: { title: '开发', prefix: 'development/', index: 'development/index.md' },
    tools: { title: '工具', prefix: 'tools/', index: 'tools/index.md' },
    essays: { title: '随笔', prefix: 'essays/', index: 'essays/index.md' },
  };

  function normalizeChapters(value) {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try { return JSON.parse(value); } catch (_) { return []; }
    }
    return [];
  }

  function normalizeSourcePath(value) {
    return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  }

  function outputPath(sourcePath) {
    const path = normalizeSourcePath(sourcePath);
    if (/\/(README|readme)\.md$/.test(path)) return path.replace(/\/(README|readme)\.md$/, '/index.html');
    if (/^(README|readme)\.md$/.test(path)) return 'index.html';
    return path.replace(/\.md$/, '.html');
  }

  function sectionKeyForPath(path) {
    if (path.startsWith('about/')) return 'about';
    if (path.startsWith('ysyx/')) return 'ysyx';
    if (path.startsWith('development/')) return 'development';
    if (path.startsWith('tools/')) return 'tools';
    if (path.startsWith('essays/')) return 'essays';
    return 'home';
  }

  function chapterSection(chapter) {
    return String(chapter?.section || '').replace(/\.$/, '');
  }

  function chapterPath(chapter) {
    return normalizeSourcePath(chapter?.path || '');
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    })[char]);
  }

  function initTheme() {
    const button = document.querySelector('.theme-toggle');
    button?.addEventListener('click', () => {
      const theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
      html.dataset.theme = theme;
      localStorage.setItem('moxi-theme', theme);
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#3949ab' : '#3f51b5');
    });
  }

  function initTopNavigation() {
    const key = sectionKeyForPath(currentPath);
    document.querySelectorAll('.tab-link').forEach((link) => {
      const active = link.dataset.section === key;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  function findChapter(path) {
    return chapters.find((chapter) => chapterPath(chapter) === path);
  }

  function createTree(items) {
    const nodes = items.map((chapter) => ({ chapter, children: [] }));
    const bySection = new Map(nodes.map((node) => [chapterSection(node.chapter), node]));
    const roots = [];

    nodes.forEach((node) => {
      const section = chapterSection(node.chapter);
      const parentSection = section.includes('.') ? section.slice(0, section.lastIndexOf('.')) : '';
      const parent = parentSection ? bySection.get(parentSection) : null;
      if (parent) parent.children.push(node);
      else roots.push(node);
    });
    return roots;
  }

  function renderSidebarNode(node, currentSectionNumber) {
    const source = chapterPath(node.chapter);
    const section = chapterSection(node.chapter);
    const current = source === currentPath;
    const inCurrentPath = Boolean(section && currentSectionNumber && (currentSectionNumber === section || currentSectionNumber.startsWith(`${section}.`)));
    const li = document.createElement('li');
    li.className = `sidebar-item${current ? ' current' : ''}${inCurrentPath ? ' in-current-path' : ''}`;

    const link = document.createElement('a');
    link.href = `${root}${outputPath(source)}`;
    link.textContent = node.chapter.name || source;
    if (current) link.setAttribute('aria-current', 'page');
    li.appendChild(link);

    if (node.children.length) {
      const ul = document.createElement('ul');
      ul.className = 'sidebar-list nested';
      node.children.forEach((child) => ul.appendChild(renderSidebarNode(child, currentSectionNumber)));
      li.appendChild(ul);
    }
    return li;
  }

  function initSidebar() {
    const nav = document.getElementById('sidebar-nav');
    const heading = document.getElementById('sidebar-heading');
    if (!nav || !heading) return;

    const key = sectionKeyForPath(currentPath);
    const config = sectionConfig[key];
    heading.textContent = config.title;

    let items = [];
    if (key === 'home') {
      const homePaths = Object.values(sectionConfig).map((item) => item.index);
      items = homePaths.map(findChapter).filter(Boolean);
    } else {
      const rootChapter = findChapter(config.index);
      const rootSection = chapterSection(rootChapter);
      items = chapters.filter((chapter) => {
        const path = chapterPath(chapter);
        const section = chapterSection(chapter);
        if (!path.startsWith(config.prefix)) return false;
        return !rootSection || section === rootSection || section.startsWith(`${rootSection}.`);
      });
    }

    const currentChapter = findChapter(currentPath);
    const currentSectionNumber = chapterSection(currentChapter);
    const ul = document.createElement('ul');
    ul.className = 'sidebar-list';
    createTree(items).forEach((node) => ul.appendChild(renderSidebarNode(node, currentSectionNumber)));
    nav.replaceChildren(ul);
  }

  function initArticleHeading() {
    const articleBody = document.querySelector('.article-body');
    const articleHeading = document.querySelector('.article-heading');
    const editLink = articleHeading?.querySelector('.edit-link');
    if (!articleBody || !articleHeading) return;

    let h1 = Array.from(articleBody.children).find((element) => element.tagName === 'H1');
    if (!h1) {
      h1 = document.createElement('h1');
      h1.textContent = body.dataset.chapterTitle || 'Moxi';
    } else {
      h1.textContent = h1.textContent.trim();
    }
    articleHeading.insertBefore(h1, editLink || null);
  }

  function initPageNavigation() {
    const nav = document.getElementById('page-navigation');
    if (!nav) return;
    const index = chapters.findIndex((chapter) => chapterPath(chapter) === currentPath);
    if (index < 0) {
      nav.hidden = true;
      return;
    }

    const previous = index > 0 ? chapters[index - 1] : null;
    const next = index + 1 < chapters.length ? chapters[index + 1] : null;
    if (!previous && !next) {
      nav.hidden = true;
      return;
    }

    if (previous) {
      const link = document.createElement('a');
      link.className = 'page-navigation-link previous';
      link.href = `${root}${outputPath(chapterPath(previous))}`;
      link.innerHTML = `<span>上一篇</span><b>${escapeHtml(previous.name || chapterPath(previous))}</b>`;
      nav.appendChild(link);
    } else {
      nav.appendChild(document.createElement('span'));
    }

    if (next) {
      const link = document.createElement('a');
      link.className = 'page-navigation-link next';
      link.href = `${root}${outputPath(chapterPath(next))}`;
      link.innerHTML = `<span>下一篇</span><b>${escapeHtml(next.name || chapterPath(next))}</b>`;
      nav.appendChild(link);
    }
  }

  function initPageToc() {
    const toc = document.getElementById('page-toc');
    if (!toc) return;
    const headings = Array.from(document.querySelectorAll('.article-body h2[id], .article-body h3[id], .article-body h4[id]'));
    if (!headings.length) {
      const empty = document.createElement('p');
      empty.className = 'toc-empty';
      empty.textContent = '本页暂无小标题。';
      toc.replaceWith(empty);
      return;
    }

    const linkMap = new Map();
    headings.forEach((heading) => {
      const link = document.createElement('a');
      link.className = `toc-level-${heading.tagName.slice(1)}`;
      link.href = `#${encodeURIComponent(heading.id)}`;
      link.textContent = heading.textContent.trim();
      toc.appendChild(link);
      linkMap.set(heading, link);
    });

    if (!('IntersectionObserver' in window)) return;
    const activate = (heading) => {
      linkMap.forEach((link) => link.classList.remove('active'));
      linkMap.get(heading)?.classList.add('active');
    };
    activate(headings[0]);
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length) activate(visible[0].target);
    }, { rootMargin: '-120px 0px -65% 0px', threshold: [0, 1] });
    headings.forEach((heading) => observer.observe(heading));
  }

  function initMobileSidebar() {
    const button = document.querySelector('.mobile-menu-button');
    const backdrop = document.querySelector('.sidebar-backdrop');
    const sidebar = document.querySelector('.site-sidebar');

    const setOpen = (open) => {
      body.classList.toggle('sidebar-opened', open);
      button?.setAttribute('aria-expanded', String(open));
      if (backdrop) backdrop.hidden = !open;
    };
    button?.addEventListener('click', () => setOpen(!body.classList.contains('sidebar-opened')));
    backdrop?.addEventListener('click', () => setOpen(false));
    sidebar?.addEventListener('click', (event) => {
      if (event.target.closest('a') && window.matchMedia('(max-width: 840px)').matches) setOpen(false);
    });
    window.addEventListener('resize', () => {
      if (!window.matchMedia('(max-width: 840px)').matches) setOpen(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && body.classList.contains('sidebar-opened')) setOpen(false);
    });
  }

  function initSearch() {
    const dialog = document.querySelector('.search-dialog');
    const input = document.querySelector('.search-input');
    const results = document.querySelector('.search-results');
    const closeButton = document.querySelector('.search-close');
    const backdrop = document.querySelector('.search-backdrop');

    const open = () => {
      if (!dialog) return;
      dialog.hidden = false;
      body.classList.add('search-opened');
      window.setTimeout(() => input?.focus(), 20);
    };
    const close = () => {
      if (!dialog) return;
      dialog.hidden = true;
      body.classList.remove('search-opened');
      if (input) input.value = '';
      if (results) results.innerHTML = '<p class="search-hint">输入关键词开始搜索。</p>';
    };

    document.querySelectorAll('.search-open').forEach((button) => button.addEventListener('click', open));
    closeButton?.addEventListener('click', close);
    backdrop?.addEventListener('click', close);
    document.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        dialog?.hidden ? open() : close();
      } else if (event.key === 'Escape' && dialog && !dialog.hidden) {
        close();
      }
    });

    input?.addEventListener('input', () => {
      const query = input.value.trim().toLowerCase();
      if (!results) return;
      if (!query) {
        results.innerHTML = '<p class="search-hint">输入关键词开始搜索。</p>';
        return;
      }
      const matches = chapters.filter((chapter) => {
        const title = String(chapter.name || '').toLowerCase();
        const path = chapterPath(chapter).toLowerCase();
        return title.includes(query) || path.includes(query);
      }).slice(0, 15);

      if (!matches.length) {
        results.innerHTML = '<p class="search-hint">没有找到相关标题。</p>';
        return;
      }
      results.innerHTML = matches.map((chapter) => {
        const source = chapterPath(chapter);
        const key = sectionKeyForPath(source);
        return `<a class="search-result" href="${root}${escapeHtml(outputPath(source))}"><b>${escapeHtml(chapter.name || source)}</b><span>${escapeHtml(sectionConfig[key].title)} · ${escapeHtml(source)}</span></a>`;
      }).join('');
    });
  }

  function initExternalLinks() {
    document.querySelectorAll('.article-body a[href^="http"]').forEach((link) => {
      try {
        if (new URL(link.href, window.location.href).origin === window.location.origin) return;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      } catch (_) { /* ignore malformed URL */ }
    });
  }

  initTheme();
  initTopNavigation();
  initSidebar();
  initArticleHeading();
  initPageNavigation();
  initPageToc();
  initMobileSidebar();
  initSearch();
  initExternalLinks();
})();
