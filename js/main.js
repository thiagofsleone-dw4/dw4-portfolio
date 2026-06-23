(() => {
  'use strict';

  let allProjects = [];
  let visibleProjects = [];
  let currentProjectIndex = 0;
  let lightboxImages = [];
  let lightboxIndex = 0;

  const grid = document.getElementById('projects-grid');
  const modalOverlay = document.getElementById('modal-overlay');
  const modalContent = document.getElementById('modal-content');
  const modalClose = document.getElementById('modal-close');
  const modalPrev = document.getElementById('modal-prev');
  const modalNext = document.getElementById('modal-next');
  const lightboxOverlay = document.getElementById('lightbox-overlay');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');

  // ---- DATA LOADING ----

  async function loadProjects() {
    try {
      const res = await fetch('content/projects.json');
      if (!res.ok) throw new Error('not found');
      allProjects = await res.json();
    } catch {
      // fallback: try to load individually — this path only for local dev without build
      allProjects = [];
    }
    renderGrid(allProjects.filter(p => p.published !== false));
  }

  // ---- GRID RENDERING ----

  function renderGrid(projects) {
    visibleProjects = projects;
    grid.innerHTML = '';

    if (projects.length === 0) {
      grid.innerHTML = '<div class="no-results"><p>Nenhum projeto encontrado nesta categoria.</p></div>';
      return;
    }

    projects.forEach((project, i) => {
      const card = createCard(project, i);
      grid.appendChild(card);
    });
  }

  function createCard(project, index) {
    const card = document.createElement('article');
    card.className = 'project-card';
    card.style.animationDelay = `${Math.min(index * 60, 400)}ms`;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Ver projeto: ${project.title}`);

    const cover = project.cover || '';
    const categories = Array.isArray(project.categories) ? project.categories : [];

    card.innerHTML = `
      <div class="card-image-wrap">
        <img src="${escHtml(cover)}" alt="${escHtml(project.title)}" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23111%22 width=%22400%22 height=%22300%22/%3E%3C/svg%3E';" />
        <div class="card-overlay">
          <h3 class="card-overlay-title">${escHtml(project.title)}</h3>
          <p class="card-overlay-cats">${categories.join(', ')}</p>
        </div>
      </div>
      <div class="card-body"></div>
    `;

    card.addEventListener('click', () => openModal(index));
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(index); } });
    return card;
  }

  // ---- FILTERS ----

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      const published = allProjects.filter(p => p.published !== false);
      const filtered = filter === 'all'
        ? published
        : published.filter(p => Array.isArray(p.categories) && p.categories.includes(filter));

      renderGrid(filtered);
    });
  });

  // ---- MODAL ----

  function openModal(index) {
    currentProjectIndex = index;
    const project = visibleProjects[index];
    renderModal(project);
    modalOverlay.classList.add('open');
    modalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modalClose.focus();
    updateModalNav();
  }

  function closeModal() {
    modalOverlay.classList.remove('open');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    // stop any youtube iframe
    const iframe = modalContent.querySelector('iframe');
    if (iframe) iframe.src = iframe.src;
  }

  function renderModal(project) {
    const gallery = Array.isArray(project.gallery) ? project.gallery : [];
    const images = gallery.map(g => g.image || g).filter(Boolean);
    lightboxImages = images;

    let videoHtml = '';
    if (project.youtube) {
      videoHtml = `
        <p class="modal-section-title">Vídeo Imersivo</p>
        <div class="modal-video"><iframe src="${escHtml(toEmbedUrl(project.youtube))}" allowfullscreen loading="lazy" title="Vídeo do projeto ${escHtml(project.title)}"></iframe></div>
      `;
    }

    let galleryHtml = '';
    if (images.length > 0) {
      galleryHtml = `
        <p class="modal-section-title">Galeria de fotos</p>
        <div class="modal-gallery">
          ${images.map((src, i) => `
            <div class="modal-gallery-item" data-index="${i}" role="button" tabindex="0" aria-label="Ver foto ${i + 1}">
              <img src="${escHtml(src)}" alt="Foto ${i + 1} — ${escHtml(project.title)}" loading="lazy" onerror="this.parentElement.style.display='none';" />
            </div>
          `).join('')}
        </div>
      `;
    }

    const categories = Array.isArray(project.categories) ? project.categories : [];

    modalContent.innerHTML = `
      <h2 class="modal-title">${escHtml(project.title)}</h2>
      ${categories.length ? `<div class="card-badges" style="margin-bottom:20px">${categories.map(c => `<span class="badge">${escHtml(c)}</span>`).join('')}</div>` : ''}
      ${project.description ? `<p class="modal-description">${escHtml(project.description)}</p>` : ''}
      ${videoHtml}
      ${galleryHtml}
    `;

    modalContent.querySelectorAll('.modal-gallery-item').forEach(item => {
      const idx = parseInt(item.dataset.index, 10);
      item.addEventListener('click', () => openLightbox(idx));
      item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(idx); } });
    });

    modalContent.scrollTop = 0;
    modalOverlay.querySelector('.modal-container').scrollTop = 0;
  }

  function updateModalNav() {
    modalPrev.style.display = currentProjectIndex > 0 ? '' : 'none';
    modalNext.style.display = currentProjectIndex < visibleProjects.length - 1 ? '' : 'none';
  }

  modalClose.addEventListener('click', closeModal);
  modalPrev.addEventListener('click', () => { if (currentProjectIndex > 0) { currentProjectIndex--; renderModal(visibleProjects[currentProjectIndex]); updateModalNav(); } });
  modalNext.addEventListener('click', () => { if (currentProjectIndex < visibleProjects.length - 1) { currentProjectIndex++; renderModal(visibleProjects[currentProjectIndex]); updateModalNav(); } });

  modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });

  // ---- LIGHTBOX ----

  function openLightbox(index) {
    lightboxIndex = index;
    lightboxImg.src = lightboxImages[index];
    lightboxImg.alt = `Foto ${index + 1}`;
    lightboxOverlay.classList.add('open');
    lightboxOverlay.setAttribute('aria-hidden', 'false');
    updateLightboxNav();
  }

  function closeLightbox() {
    lightboxOverlay.classList.remove('open');
    lightboxOverlay.setAttribute('aria-hidden', 'true');
  }

  function updateLightboxNav() {
    lightboxPrev.style.display = lightboxIndex > 0 ? '' : 'none';
    lightboxNext.style.display = lightboxIndex < lightboxImages.length - 1 ? '' : 'none';
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', () => { lightboxIndex--; lightboxImg.src = lightboxImages[lightboxIndex]; updateLightboxNav(); });
  lightboxNext.addEventListener('click', () => { lightboxIndex++; lightboxImg.src = lightboxImages[lightboxIndex]; updateLightboxNav(); });
  lightboxOverlay.addEventListener('click', e => { if (e.target === lightboxOverlay) closeLightbox(); });

  // ---- KEYBOARD ----

  document.addEventListener('keydown', e => {
    if (lightboxOverlay.classList.contains('open')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft' && lightboxIndex > 0) { lightboxIndex--; lightboxImg.src = lightboxImages[lightboxIndex]; updateLightboxNav(); }
      if (e.key === 'ArrowRight' && lightboxIndex < lightboxImages.length - 1) { lightboxIndex++; lightboxImg.src = lightboxImages[lightboxIndex]; updateLightboxNav(); }
      return;
    }
    if (modalOverlay.classList.contains('open')) {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft' && currentProjectIndex > 0) { currentProjectIndex--; renderModal(visibleProjects[currentProjectIndex]); updateModalNav(); }
      if (e.key === 'ArrowRight' && currentProjectIndex < visibleProjects.length - 1) { currentProjectIndex++; renderModal(visibleProjects[currentProjectIndex]); updateModalNav(); }
    }
  });

  // ---- UTILS ----

  function toEmbedUrl(url) {
    if (!url) return '';
    // já é embed
    if (url.includes('/embed/')) return url;
    // youtu.be/ID
    const short = url.match(/youtu\.be\/([^?&]+)/);
    if (short) return `https://www.youtube.com/embed/${short[1]}`;
    // youtube.com/watch?v=ID
    const watch = url.match(/[?&]v=([^?&]+)/);
    if (watch) return `https://www.youtube.com/embed/${watch[1]}`;
    return url;
  }

  function escHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ---- INIT ----
  loadProjects();
})();
