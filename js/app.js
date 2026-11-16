/**
 * MD. NAFIZUR RAHMAN — PORTFOLIO APPLICATION LOGIC
 * Architecture: Modular Vanilla JavaScript (Zero External Framework Dependencies)
 * Features:
 *  - Dynamic JSON Data Loading with file:// Protocol Fallback
 *  - Interactive Filtering (Projects, Publications, Gallery, Certifications)
 *  - Full-Screen Lightbox Image Viewer
 *  - Scholarly Theme Switcher (Dark/Light) with localStorage persistence
 *  - Password-Protected Visual Content Manager Drawer with JSON Export
 *  - Quick Search / Command Palette (Ctrl+K)
 *  - Citation Modal & Copy to Clipboard
 */

(function () {
  'use strict';

  // State Management
  let portfolioData = null;
  let currentGalleryIndex = 0;
  let activeGalleryItems = [];

  // DOM Elements Cache
  const elements = {
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    mobileNavToggle: document.getElementById('mobile-nav-toggle'),
    navMenu: document.getElementById('nav-menu'),
    heroTypedText: document.getElementById('hero-typed-text'),
    projectsContainer: document.getElementById('projects-container'),
    publicationsContainer: document.getElementById('publications-container'),
    softwareContainer: document.getElementById('software-container'),
    skillsContainer: document.getElementById('skills-container'),
    fieldworkContainer: document.getElementById('fieldwork-container'),
    certsContainer: document.getElementById('certs-container'),
    galleryContainer: document.getElementById('gallery-container'),
    connectContainer: document.getElementById('connect-container'),
    lightboxModal: document.getElementById('lightbox-modal'),
    lightboxImg: document.getElementById('lightbox-img'),
    lightboxTitle: document.getElementById('lightbox-title'),
    lightboxDesc: document.getElementById('lightbox-desc'),
    lightboxClose: document.getElementById('lightbox-close'),
    lightboxPrev: document.getElementById('lightbox-prev'),
    lightboxNext: document.getElementById('lightbox-next'),
    adminLockBtn: document.getElementById('admin-lock-btn'),
    adminDrawer: document.getElementById('admin-drawer'),
    adminCloseBtn: document.getElementById('admin-close-btn'),
    adminAuthView: document.getElementById('admin-auth-view'),
    adminContentView: document.getElementById('admin-content-view'),
    adminPassInput: document.getElementById('admin-pass-input'),
    adminLoginBtn: document.getElementById('admin-login-btn'),
    adminExportBtn: document.getElementById('admin-export-btn'),
    adminCopyBtn: document.getElementById('admin-copy-btn'),
    searchTriggerBtn: document.getElementById('search-trigger-btn'),
    searchModal: document.getElementById('search-modal'),
    searchInput: document.getElementById('search-input'),
    searchResults: document.getElementById('search-results'),
    searchCloseBtn: document.getElementById('search-close-btn')
  };

  /* ==========================================================================
     1. THEME MANAGEMENT (DARK / LIGHT SCHOLARLY PALETTE)
     ========================================================================== */
  function initTheme() {
    const savedTheme = localStorage.getItem('nafiz_theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme ? savedTheme : 'dark'; // Default to Midnight Slate & Deep Teal

    document.documentElement.setAttribute('data-theme', initialTheme);
    updateThemeIcon(initialTheme);

    if (elements.themeToggleBtn) {
      elements.themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('nafiz_theme', newTheme);
        updateThemeIcon(newTheme);
      });
    }
  }

  function updateThemeIcon(theme) {
    if (!elements.themeToggleBtn) return;
    const icon = elements.themeToggleBtn.querySelector('i');
    if (icon) {
      if (theme === 'light') {
        icon.className = 'fa-solid fa-moon';
        elements.themeToggleBtn.setAttribute('title', 'Switch to Dark Mode');
      } else {
        icon.className = 'fa-solid fa-sun';
        elements.themeToggleBtn.setAttribute('title', 'Switch to Light Mode');
      }
    }
  }

  /* ==========================================================================
     2. HERO TYPING ANIMATION
     ========================================================================== */
  function initHeroTyping() {
    if (!elements.heroTypedText) return;

    const phrases = [
      "DVM Student · University of Rajshahi",
      "Bioinformatician & Computational Biologist",
      "One Health & Antimicrobial Stewardship Researcher",
      "Vibe Coder & HealthTech Innovator ✨",
      "Wildlife Rescue Advocate (SWAN Bangladesh)"
    ];

    let phraseIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let typingSpeed = 75;

    function typeLoop() {
      const currentPhrase = phrases[phraseIdx];

      if (isDeleting) {
        elements.heroTypedText.textContent = currentPhrase.substring(0, charIdx - 1);
        charIdx--;
        typingSpeed = 35;
      } else {
        elements.heroTypedText.textContent = currentPhrase.substring(0, charIdx + 1);
        charIdx++;
        typingSpeed = 75;
      }

      if (!isDeleting && charIdx === currentPhrase.length) {
        isDeleting = true;
        typingSpeed = 1800; // Pause at end of sentence
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        typingSpeed = 400; // Pause before typing new phrase
      }

      setTimeout(typeLoop, typingSpeed);
    }

    typeLoop();
  }

  /* ==========================================================================
     3. DATA FETCHING & RENDERING ENGINE
     ========================================================================== */
  async function loadPortfolioData() {
    try {
      const response = await fetch('data/portfolio-data.json');
      if (!response.ok) throw new Error('Network response was not ok');
      portfolioData = await response.json();
    } catch (err) {
      console.warn('Could not load data/portfolio-data.json via fetch (likely opened via file://). Using fallback data:', err);
      if (window.PORTFOLIO_FALLBACK_DATA) {
        portfolioData = window.PORTFOLIO_FALLBACK_DATA;
      }
    }

    if (portfolioData) {
      renderAllSections();
    }
  }

  function renderAllSections() {
    renderProjects('all');
    renderPublications('all');
    renderSoftware('all');
    renderSkills();
    renderFieldwork();
    renderCertifications('all');
    renderGallery('all');
    renderConnect();
    initFilters();
    initSearchIndex();
  }

  /* ==========================================================================
     4. PROJECTS RENDERER (8 IN-DEPTH PROJECTS)
     ========================================================================== */
  function renderProjects(category) {
    if (!elements.projectsContainer || !portfolioData || !portfolioData.researchProjects) return;

    const filtered = category === 'all'
      ? portfolioData.researchProjects
      : portfolioData.researchProjects.filter(p => p.category === category);

    let html = '';
    filtered.forEach(p => {
      const hasArtefacts = p.keyArtefacts && p.keyArtefacts.length > 0;
      const hasFeatures = p.features && p.features.length > 0;
      const statusPillClass = p.status.includes('Accepted') ? 'pill-success' : (p.status.includes('Active') || p.status.includes('Ongoing')) ? 'pill' : 'pill-amber';

      html += `
        <article class="project-card" data-category="${p.category}" id="${p.id}">
          <div class="project-header">
            <span class="project-number">PROJECT-${p.number}</span>
            <span class="pill ${statusPillClass}">${escapeHtml(p.status)}</span>
          </div>

          <h3 class="project-title">${escapeHtml(p.title)}</h3>
          ${p.subtitle ? `<div class="project-subtitle">${escapeHtml(p.subtitle)}</div>` : ''}

          <div class="project-role-badge">
            <i class="fa-solid fa-user-gear"></i>
            <span>${escapeHtml(p.role)} · ${escapeHtml(p.timeline)}</span>
          </div>

          <p class="project-overview">${escapeHtml(p.overview)}</p>

          <!-- Expandable In-Depth Methodology & Artefacts -->
          <div class="project-expandable" id="expand-${p.id}">
            ${p.objectives ? `
              <div class="expandable-block">
                <div class="expandable-block-title"><i class="fa-solid fa-bullseye"></i> Research Objectives</div>
                <div class="expandable-block-content">${escapeHtml(p.objectives)}</div>
              </div>` : ''}

            ${p.methodology ? `
              <div class="expandable-block">
                <div class="expandable-block-title"><i class="fa-solid fa-flask-vial"></i> Methodology & Investigation</div>
                <div class="expandable-block-content">${escapeHtml(p.methodology)}</div>
              </div>` : ''}

            ${hasArtefacts ? `
              <div class="expandable-block">
                <div class="expandable-block-title"><i class="fa-solid fa-microscope"></i> Key Artefacts & Findings</div>
                <ul class="artefacts-list">
                  ${p.keyArtefacts.map(art => `<li>${escapeHtml(art)}</li>`).join('')}
                </ul>
              </div>` : ''}

            ${hasFeatures ? `
              <div class="expandable-block">
                <div class="expandable-block-title"><i class="fa-solid fa-shield-virus"></i> Core AI & Epidemiological Features</div>
                <ul class="artefacts-list">
                  ${p.features.map(feat => `<li>${escapeHtml(feat)}</li>`).join('')}
                </ul>
              </div>` : ''}

            ${p.collaborations ? `
              <div class="expandable-block">
                <div class="expandable-block-title"><i class="fa-solid fa-people-group"></i> Interdisciplinary Collaboration</div>
                <div class="expandable-block-content">${escapeHtml(p.collaborations)}</div>
              </div>` : ''}

            ${p.outcomes ? `
              <div class="expandable-block">
                <div class="expandable-block-title"><i class="fa-solid fa-chart-line"></i> Outcomes & One Health Impact</div>
                <div class="expandable-block-content">${escapeHtml(p.outcomes)}</div>
              </div>` : ''}

            ${p.doi ? `
              <div class="expandable-block">
                <div class="expandable-block-title"><i class="fa-solid fa-fingerprint"></i> Protocol DOI / OSF Registry</div>
                <div class="expandable-block-content">
                  <a href="${p.doi}" target="_blank" rel="noopener noreferrer">${escapeHtml(p.doi)} <i class="fa-solid fa-arrow-up-right-from-square"></i></a>
                </div>
              </div>` : ''}

            ${p.githubUrl ? `
              <div class="expandable-block">
                <div class="expandable-block-title"><i class="fa-brands fa-github"></i> Repository Overview</div>
                <div class="expandable-block-content">
                  <a href="${p.githubUrl}" target="_blank" rel="noopener noreferrer">View Repository on GitHub <i class="fa-solid fa-arrow-up-right-from-square"></i></a>
                </div>
              </div>` : ''}
          </div>

          <div class="project-footer">
            <button class="btn-toggle-details" data-target="expand-${p.id}" aria-expanded="false">
              <span>Read Full Details</span>
              <i class="fa-solid fa-chevron-down"></i>
            </button>
            <div class="pill-container" style="margin: 0;">
              <span class="pill"><i class="fa-solid fa-tag"></i> ${escapeHtml(p.category)}</span>
            </div>
          </div>
        </article>
      `;
    });

    elements.projectsContainer.innerHTML = html;

    // Attach Toggle Listeners
    elements.projectsContainer.querySelectorAll('.btn-toggle-details').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const drawer = document.getElementById(targetId);
        const icon = btn.querySelector('i');
        const span = btn.querySelector('span');

        if (drawer.classList.contains('open')) {
          drawer.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
          span.textContent = 'Read Full Details';
          icon.className = 'fa-solid fa-chevron-down';
        } else {
          drawer.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
          span.textContent = 'Collapse Details';
          icon.className = 'fa-solid fa-chevron-up';
        }
      });
    });
  }

  /* ==========================================================================
     5. PUBLICATIONS RENDERER
     ========================================================================== */
  function renderPublications(filter) {
    if (!elements.publicationsContainer || !portfolioData) return;

    let items = [];
    if (portfolioData.publications) items = items.concat(portfolioData.publications);
    if (portfolioData.conferencePapers) items = items.concat(portfolioData.conferencePapers);

    let filtered = items;
    if (filter === 'journal') {
      filtered = items.filter(i => i.type === 'Journal Paper');
    } else if (filter === 'conference') {
      filtered = items.filter(i => i.conference || i.type === 'Conference Paper');
    } else if (filter === 'protocol') {
      filtered = items.filter(i => i.status?.includes('OSF') || i.doi);
    }

    let html = '';
    filtered.forEach(pub => {
      const isConf = !!pub.conference;
      const venue = isConf ? pub.conference : pub.journal;
      const dateOrYear = pub.date || pub.year || '';

      html += `
        <article class="pub-card">
          <div class="pub-info">
            <div class="pub-badge-row">
              <span class="pill pill-success">${escapeHtml(pub.badge || pub.type)}</span>
              ${pub.doi ? `<a href="${pub.doi}" target="_blank" class="pill" rel="noopener noreferrer"><i class="fa-solid fa-fingerprint"></i> DOI / OSF</a>` : ''}
              <span class="pill"><i class="fa-regular fa-calendar"></i> ${escapeHtml(dateOrYear)}</span>
            </div>

            <h3 class="pub-title">${escapeHtml(pub.title)}</h3>

            <div class="pub-meta">
              <span><strong>Venue:</strong> <span class="pub-journal">${escapeHtml(venue)}</span></span>
              ${pub.organizer ? `<div style="font-size: 0.85rem; color: var(--text-subtle); margin-top: 2px;">${escapeHtml(pub.organizer)}</div>` : ''}
              <div style="font-size: 0.88rem; margin-top: 4px;"><strong>Authorship:</strong> ${escapeHtml(pub.role || pub.authors || 'Author')}</div>
            </div>

            <p class="pub-abstract">${escapeHtml(pub.abstract || pub.description || '')}</p>

            ${pub.keywords ? `
              <div class="pill-container">
                ${pub.keywords.map(kw => `<span class="pill" style="font-size: 0.72rem;">#${escapeHtml(kw)}</span>`).join('')}
              </div>` : ''}
          </div>

          <div class="pub-actions">
            ${pub.doi || pub.url ? `
              <a href="${pub.doi || pub.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="padding: 0.55rem 1rem; font-size: 0.85rem;">
                <i class="fa-solid fa-arrow-up-right-from-square"></i> Open Record
              </a>` : ''}
            <button class="btn-citation" data-title="${escapeHtml(pub.title)}" data-venue="${escapeHtml(venue)}" data-year="${escapeHtml(dateOrYear)}">
              <i class="fa-regular fa-copy"></i> Copy Citation
            </button>
          </div>
        </article>
      `;
    });

    elements.publicationsContainer.innerHTML = html;

    // Attach Citation Copy Listeners
    elements.publicationsContainer.querySelectorAll('.btn-citation').forEach(btn => {
      btn.addEventListener('click', () => {
        const title = btn.getAttribute('data-title');
        const venue = btn.getAttribute('data-venue');
        const year = btn.getAttribute('data-year');
        const citation = `Rahman, M. N. (${year}). ${title}. ${venue}.`;

        navigator.clipboard.writeText(citation).then(() => {
          const originalText = btn.innerHTML;
          btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
          btn.style.borderColor = 'var(--accent-teal)';
          setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.borderColor = '';
          }, 2000);
        });
      });
    });
  }

  /* ==========================================================================
     6. SOFTWARE & "VIBE CODING" RENDERER
     ========================================================================== */
  function renderSoftware(category) {
    if (!elements.softwareContainer || !portfolioData || !portfolioData.softwareProjects) return;

    const filtered = category === 'all'
      ? portfolioData.softwareProjects
      : portfolioData.softwareProjects.filter(s => s.category === category);

    let html = '';
    filtered.forEach(sw => {
      html += `
        <article class="software-card">
          <div class="software-icon-row">
            <div class="software-icon-wrapper">
              <i class="fa-solid fa-laptop-code"></i>
            </div>
            <span class="pill ${sw.featured ? 'pill-success' : ''}">${sw.featured ? 'Featured App' : 'Project'}</span>
          </div>

          <h3 class="software-title">${escapeHtml(sw.title)}</h3>
          <div class="software-tagline">${escapeHtml(sw.tagline)}</div>
          <p class="software-desc">${escapeHtml(sw.description)}</p>

          <div class="software-tech-pills">
            ${sw.tech.map(t => `<span class="pill" style="font-size: 0.75rem;">${escapeHtml(t)}</span>`).join('')}
          </div>

          <div class="software-links">
            <a href="${sw.repoUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.85rem; width: 100%; justify-content: center;">
              <i class="fa-brands fa-github"></i> View Repository
            </a>
          </div>
        </article>
      `;
    });

    elements.softwareContainer.innerHTML = html;
  }

  /* ==========================================================================
     7. SKILLS MATRIX RENDERER
     ========================================================================== */
  function renderSkills() {
    if (!elements.skillsContainer || !portfolioData || !portfolioData.skillsCategorized) return;

    const cats = portfolioData.skillsCategorized;
    const catConfigs = [
      { key: 'generalResearch', title: 'General Research Skills', icon: 'fa-microscope' },
      { key: 'laboratoryClinical', title: 'Laboratory & Clinical Skills', icon: 'fa-vial-circle-check' },
      { key: 'softwareAnalytics', title: 'Software & Data Analytics', icon: 'fa-chart-pie' },
      { key: 'bioinformatics', title: 'Bioinformatics & Computational', icon: 'fa-dna' }
    ];

    let html = '';
    catConfigs.forEach(conf => {
      const skills = cats[conf.key] || [];
      html += `
        <div class="skills-column-card">
          <div class="skills-column-header">
            <i class="fa-solid ${conf.icon}"></i>
            <h3 class="skills-column-title">${conf.title}</h3>
          </div>
          <div class="skills-list">
            ${skills.map(s => `
              <div class="skill-bar-item">
                <div class="skill-info">
                  <span class="skill-name">${escapeHtml(s.name)}</span>
                  <span style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--accent-teal);">${s.level}%</span>
                </div>
                ${s.desc ? `<div class="skill-desc">${escapeHtml(s.desc)}</div>` : ''}
                <div class="skill-progress-bg">
                  <div class="skill-progress-fill" style="width: ${s.level}%;"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });

    elements.skillsContainer.innerHTML = html;
  }

  /* ==========================================================================
     8. FIELDWORK & WILDLIFE RESCUE RENDERER
     ========================================================================== */
  function renderFieldwork() {
    if (!elements.fieldworkContainer || !portfolioData) return;

    const fw = portfolioData.fieldworkWildlife || [];
    const hobbies = portfolioData.hobbies || [];

    let fwHtml = `
      <div class="fieldwork-main-card">
        <div class="fieldwork-badge">
          <i class="fa-solid fa-tree"></i> Save Wildlife and Nature (SWAN) Bangladesh
        </div>
        ${fw.map(item => `
          <div style="margin-bottom: 2rem;">
            <h3 style="font-size: 1.25rem; margin-bottom: 0.35rem; color: var(--text-main);">${escapeHtml(item.title)}</h3>
            <div style="font-size: 0.85rem; color: var(--accent-cyan); font-family: var(--font-mono); margin-bottom: 0.85rem;">
              <i class="fa-regular fa-building"></i> ${escapeHtml(item.organization)} · ${escapeHtml(item.period)}
            </div>
            <p style="font-size: 0.94rem; line-height: 1.65; color: var(--text-muted);">${escapeHtml(item.description)}</p>
          </div>
        `).join('')}
      </div>

      <div class="hobbies-grid">
        ${hobbies.map(h => `
          <div class="hobby-card">
            <div class="hobby-icon">
              <i class="fa-solid fa-${h.icon === 'camera' ? 'camera' : 'utensils'}"></i>
            </div>
            <div>
              <h3 class="hobby-title">${escapeHtml(h.title)}</h3>
              <p class="hobby-desc">${escapeHtml(h.description)}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    elements.fieldworkContainer.innerHTML = fwHtml;
  }

  /* ==========================================================================
     9. CERTIFICATIONS & AWARDS RENDERER
     ========================================================================== */
  function renderCertifications(category) {
    if (!elements.certsContainer || !portfolioData || !portfolioData.certificationsTraining) return;

    let certs = portfolioData.certificationsTraining;
    if (category === 'who') {
      certs = certs.filter(c => c.category === 'who-global');
    } else if (category === 'amr') {
      certs = certs.filter(c => c.category === 'epidemiology-amr');
    } else if (category === 'bio-code') {
      certs = certs.filter(c => c.category === 'bioinformatics-coding');
    }

    let html = '';
    certs.forEach(cert => {
      html += `
        <article class="cert-card">
          <span class="cert-badge">${escapeHtml(cert.badge || 'Certificate')}</span>
          <h3 class="cert-title">${escapeHtml(cert.title)}</h3>
          <div class="cert-issuer">
            <i class="fa-solid fa-award"></i>
            <span>${escapeHtml(cert.issuer)}</span>
          </div>
          <p class="cert-desc">${escapeHtml(cert.description)}</p>
          <div class="cert-footer">
            <span><i class="fa-regular fa-calendar-check"></i> ${escapeHtml(cert.date)}</span>
            <span class="pill pill-success" style="font-size: 0.7rem;"><i class="fa-solid fa-circle-check"></i> Verified</span>
          </div>
        </article>
      `;
    });

    elements.certsContainer.innerHTML = html;
  }

  /* ==========================================================================
     10. GALLERY & FULL-SCREEN LIGHTBOX RENDERER
     ========================================================================== */
  function renderGallery(category) {
    if (!elements.galleryContainer || !portfolioData || !portfolioData.galleryItems) return;

    activeGalleryItems = category === 'all'
      ? portfolioData.galleryItems
      : portfolioData.galleryItems.filter(g => g.category === category);

    let html = '';
    activeGalleryItems.forEach((item, index) => {
      html += `
        <div class="gallery-card" data-index="${index}">
          <div class="gallery-thumb-wrapper">
            <img src="${item.image}" alt="${escapeHtml(item.title)}" class="gallery-thumb" loading="lazy">
            <div class="gallery-overlay">
              <div class="gallery-zoom-icon">
                <i class="fa-solid fa-magnifying-glass-plus"></i>
              </div>
            </div>
          </div>
          <div class="gallery-content">
            <h4 class="gallery-title">${escapeHtml(item.title)}</h4>
            <p class="gallery-caption">${escapeHtml(item.caption)}</p>
            <div class="gallery-meta">
              <span class="pill" style="font-size: 0.7rem;">${escapeHtml(item.badge)}</span>
              <span>${escapeHtml(item.date)}</span>
            </div>
          </div>
        </div>
      `;
    });

    elements.galleryContainer.innerHTML = html;

    // Attach click to open Lightbox
    elements.galleryContainer.querySelectorAll('.gallery-card').forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.getAttribute('data-index'), 10);
        openLightbox(idx);
      });
    });
  }

  function openLightbox(index) {
    if (!elements.lightboxModal || !activeGalleryItems[index]) return;
    currentGalleryIndex = index;
    const item = activeGalleryItems[index];

    elements.lightboxImg.src = item.image;
    elements.lightboxTitle.textContent = item.title;
    elements.lightboxDesc.textContent = item.caption;
    elements.lightboxModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!elements.lightboxModal) return;
    elements.lightboxModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function navigateLightbox(direction) {
    if (activeGalleryItems.length === 0) return;
    currentGalleryIndex = (currentGalleryIndex + direction + activeGalleryItems.length) % activeGalleryItems.length;
    openLightbox(currentGalleryIndex);
  }

  function initLightboxListeners() {
    if (elements.lightboxClose) elements.lightboxClose.addEventListener('click', closeLightbox);
    if (elements.lightboxPrev) elements.lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
    if (elements.lightboxNext) elements.lightboxNext.addEventListener('click', () => navigateLightbox(1));

    if (elements.lightboxModal) {
      elements.lightboxModal.addEventListener('click', (e) => {
        if (e.target === elements.lightboxModal) closeLightbox();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (elements.lightboxModal && elements.lightboxModal.classList.contains('active')) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
      }
    });
  }

  /* ==========================================================================
     11. CONNECT WITH ME & HYPERLINKS (VERY LAST SECTION)
     ========================================================================== */
  function renderConnect() {
    if (!elements.connectContainer || !portfolioData || !portfolioData.profile) return;
    const p = portfolioData.profile;
    const links = p.socialLinks || {};

    const channels = [
      { name: "Primary Email", val: p.primaryEmail, url: `mailto:${p.primaryEmail}`, icon: "fa-solid fa-envelope", cssClass: "channel-gmail" },
      { name: "University Email", val: p.universityEmail, url: `mailto:${p.universityEmail}`, icon: "fa-solid fa-graduation-cap", cssClass: "channel-ru" },
      { name: "WhatsApp & Cell", val: p.phone, url: p.whatsapp, icon: "fa-brands fa-whatsapp", cssClass: "channel-whatsapp" },
      { name: "LinkedIn", val: "md-nafizur-rahman-ru", url: links.linkedin, icon: "fa-brands fa-linkedin", cssClass: "channel-linkedin" },
      { name: "Google Scholar", val: "Md. Nafizur Rahman", url: links.googleScholar, icon: "fa-solid fa-graduation-cap", cssClass: "channel-scholar" },
      { name: "ORCID", val: "0009-0008-3918-187X", url: links.orcid, icon: "fa-brands fa-orcid", cssClass: "channel-orcid" },
      { name: "ResearchGate", val: "Md-Rahman-1097", url: links.researchgate, icon: "fa-brands fa-researchgate", cssClass: "channel-rg" },
      { name: "OSF", val: "10.17605/OSF.IO/9AQS3", url: links.osf, icon: "fa-solid fa-atom", cssClass: "channel-osf" },
      { name: "GitHub", val: "mdnafizurrahman8024", url: links.github, icon: "fa-brands fa-github", cssClass: "channel-github" },
      { name: "Google Sites", val: "Portfolio Archive", url: p.googleSitesUrl, icon: "fa-brands fa-google", cssClass: "channel-sites" },
      { name: "Facebook", val: "mdnafizurrahman8024", url: links.facebook, icon: "fa-brands fa-facebook", cssClass: "channel-fb" },
      { name: "Instagram", val: "nafizun_8024", url: links.instagram, icon: "fa-brands fa-instagram", cssClass: "channel-insta" },
      { name: "Curriculum Vitae (PDF)", val: "View / Download CV", url: p.cvUrl, icon: "fa-solid fa-file-pdf", cssClass: "channel-cv" }
    ];

    let html = `
      <div class="connect-grid">
        ${channels.map(c => `
          <a href="${c.url}" target="_blank" rel="noopener noreferrer" class="connect-channel-card">
            <div class="connect-icon-box ${c.cssClass}">
              <i class="${c.icon}"></i>
            </div>
            <div class="connect-channel-info">
              <div class="connect-channel-name">${escapeHtml(c.name)}</div>
              <div class="connect-channel-val">${escapeHtml(c.val)}</div>
            </div>
          </a>
        `).join('')}
      </div>

      <div class="direct-msg-box">
        <h4 class="direct-msg-title">Have a Research Collaboration or Graduate Inquiry?</h4>
        <p class="direct-msg-desc">I welcome interdisciplinary discussions in One Health, computational biology, nanomedicine, and veterinary data science. Send me a direct email or message via WhatsApp.</p>
        <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
          <a href="mailto:${p.primaryEmail}?subject=Research%20Collaboration%20Inquiry%20-%20Md.%20Nafizur%20Rahman" class="btn btn-primary">
            <i class="fa-regular fa-paper-plane"></i> Send Direct Email
          </a>
          <a href="${p.whatsapp}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
            <i class="fa-brands fa-whatsapp"></i> Chat on WhatsApp
          </a>
        </div>
      </div>
    `;

    elements.connectContainer.innerHTML = html;
  }

  /* ==========================================================================
     12. TAB / FILTER CONTROLS
     ========================================================================== */
  function initFilters() {
    document.querySelectorAll('.filter-tabs').forEach(tabGroup => {
      const section = tabGroup.getAttribute('data-filter-group');
      tabGroup.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          tabGroup.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const filterValue = btn.getAttribute('data-filter');

          if (section === 'projects') renderProjects(filterValue);
          else if (section === 'publications') renderPublications(filterValue);
          else if (section === 'software') renderSoftware(filterValue);
          else if (section === 'certs') renderCertifications(filterValue);
          else if (section === 'gallery') renderGallery(filterValue);
        });
      });
    });
  }

  /* ==========================================================================
     13. NO-CODE FUTURE CONTENT & MEDIA MANAGER DRAWER (CRITICAL)
     ========================================================================== */
  function initAdminManager() {
    if (!elements.adminLockBtn || !elements.adminDrawer) return;

    elements.adminLockBtn.addEventListener('click', () => {
      elements.adminDrawer.classList.add('active');
      document.body.style.overflow = 'hidden';
      elements.adminPassInput.value = '';
      elements.adminPassInput.focus();
    });

    if (elements.adminCloseBtn) {
      elements.adminCloseBtn.addEventListener('click', closeAdmin);
    }

    elements.adminDrawer.addEventListener('click', (e) => {
      if (e.target === elements.adminDrawer) closeAdmin();
    });

    if (elements.adminLoginBtn) {
      elements.adminLoginBtn.addEventListener('click', handleAdminAuth);
    }

    if (elements.adminPassInput) {
      elements.adminPassInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleAdminAuth();
      });
    }

    // Admin Tab Navigation
    document.querySelectorAll('.admin-tab-btn').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab-btn').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const targetView = tab.getAttribute('data-admin-view');
        document.querySelectorAll('.admin-form-view').forEach(v => v.style.display = 'none');
        const viewElem = document.getElementById(targetView);
        if (viewElem) viewElem.style.display = 'block';
      });
    });

    // Form Submissions
    initAdminFormActions();

    // Export Updated JSON
    if (elements.adminExportBtn) {
      elements.adminExportBtn.addEventListener('click', exportPortfolioJSON);
    }

    // Copy JSON to Clipboard
    if (elements.adminCopyBtn) {
      elements.adminCopyBtn.addEventListener('click', copyPortfolioJSON);
    }
  }

  function handleAdminAuth() {
    const password = elements.adminPassInput.value.trim();
    // Passcode for no-code content manager (can be changed freely)
    if (password === 'nafiz2026' || password === 'admin') {
      elements.adminAuthView.style.display = 'none';
      elements.adminContentView.style.display = 'block';
    } else {
      alert('Incorrect passcode. Please try again.');
      elements.adminPassInput.value = '';
      elements.adminPassInput.focus();
    }
  }

  function closeAdmin() {
    elements.adminDrawer.classList.remove('active');
    document.body.style.overflow = '';
  }

  function initAdminFormActions() {
    // 1. Add Publication Form
    const pubForm = document.getElementById('admin-add-pub-form');
    if (pubForm) {
      pubForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newPub = {
          id: 'pub-' + Date.now(),
          type: document.getElementById('pub-type-input').value,
          status: document.getElementById('pub-status-input').value,
          title: document.getElementById('pub-title-input').value,
          journal: document.getElementById('pub-journal-input').value,
          year: document.getElementById('pub-year-input').value,
          role: document.getElementById('pub-role-input').value,
          badge: document.getElementById('pub-badge-input').value,
          doi: document.getElementById('pub-doi-input').value,
          description: document.getElementById('pub-desc-input').value
        };

        if (!portfolioData.publications) portfolioData.publications = [];
        portfolioData.publications.unshift(newPub);
        renderPublications('all');
        pubForm.reset();
        alert('Publication successfully added and preview updated! Remember to click "Download Updated JSON" below to save changes permanently.');
      });
    }

    // 2. Add Project Form
    const projForm = document.getElementById('admin-add-proj-form');
    if (projForm) {
      projForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newProj = {
          id: 'project-' + (portfolioData.researchProjects.length + 1).toString().padStart(2, '0'),
          number: (portfolioData.researchProjects.length + 1).toString().padStart(2, '0'),
          title: document.getElementById('proj-title-input').value,
          subtitle: document.getElementById('proj-subtitle-input').value,
          role: document.getElementById('proj-role-input').value,
          timeline: document.getElementById('proj-timeline-input').value,
          category: document.getElementById('proj-category-input').value,
          status: document.getElementById('proj-status-input').value,
          overview: document.getElementById('proj-overview-input').value,
          methodology: document.getElementById('proj-methodology-input').value,
          outcomes: document.getElementById('proj-outcomes-input').value
        };

        portfolioData.researchProjects.push(newProj);
        renderProjects('all');
        projForm.reset();
        alert('Research project successfully added! Click "Download Updated JSON" to save.');
      });
    }

    // 3. Add Media / Gallery Form
    const mediaForm = document.getElementById('admin-add-media-form');
    if (mediaForm) {
      mediaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newMedia = {
          id: 'gal-' + Date.now(),
          title: document.getElementById('media-title-input').value,
          category: document.getElementById('media-category-input').value,
          badge: document.getElementById('media-badge-input').value,
          date: document.getElementById('media-date-input').value,
          caption: document.getElementById('media-caption-input').value,
          image: document.getElementById('media-img-input').value || 'assets/images/cover-banner.jpg'
        };

        if (!portfolioData.galleryItems) portfolioData.galleryItems = [];
        portfolioData.galleryItems.unshift(newMedia);
        renderGallery('all');
        mediaForm.reset();
        alert('New gallery media added! Click "Download Updated JSON" to export.');
      });
    }

    // 4. Add Certificate Form
    const certForm = document.getElementById('admin-add-cert-form');
    if (certForm) {
      certForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newCert = {
          id: 'cert-' + Date.now(),
          title: document.getElementById('cert-title-input').value,
          issuer: document.getElementById('cert-issuer-input').value,
          date: document.getElementById('cert-date-input').value,
          category: document.getElementById('cert-category-input').value,
          badge: document.getElementById('cert-badge-input').value,
          description: document.getElementById('cert-desc-input').value
        };

        if (!portfolioData.certificationsTraining) portfolioData.certificationsTraining = [];
        portfolioData.certificationsTraining.unshift(newCert);
        renderCertifications('all');
        certForm.reset();
        alert('New certificate added! Click "Download Updated JSON" to export.');
      });
    }
  }

  function exportPortfolioJSON() {
    const jsonStr = JSON.stringify(portfolioData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('portfolio-data.json downloaded! Simply replace your existing "data/portfolio-data.json" file with this newly downloaded file to permanently persist your updates.');
  }

  function copyPortfolioJSON() {
    const jsonStr = JSON.stringify(portfolioData, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
      alert('Updated JSON copied to clipboard! You can paste it directly into data/portfolio-data.json.');
    });
  }

  /* ==========================================================================
     14. COMMAND PALETTE / QUICK SEARCH (CTRL+K)
     ========================================================================== */
  let searchIndex = [];

  function initSearchIndex() {
    searchIndex = [];
    if (!portfolioData) return;

    if (portfolioData.researchProjects) {
      portfolioData.researchProjects.forEach(p => {
        searchIndex.push({
          type: 'Project',
          title: p.title,
          desc: p.overview,
          link: `#${p.id}`,
          badge: `Project ${p.number}`
        });
      });
    }

    if (portfolioData.publications) {
      portfolioData.publications.forEach(pub => {
        searchIndex.push({
          type: 'Publication',
          title: pub.title,
          desc: pub.journal,
          link: '#publications',
          badge: pub.badge
        });
      });
    }

    if (portfolioData.softwareProjects) {
      portfolioData.softwareProjects.forEach(s => {
        searchIndex.push({
          type: 'Software',
          title: s.title,
          desc: s.tagline,
          link: '#software',
          badge: 'Vibe Code'
        });
      });
    }

    if (portfolioData.certificationsTraining) {
      portfolioData.certificationsTraining.forEach(c => {
        searchIndex.push({
          type: 'Certification',
          title: c.title,
          desc: c.issuer,
          link: '#certifications',
          badge: c.badge
        });
      });
    }
  }

  function initSearchListeners() {
    if (elements.searchTriggerBtn) {
      elements.searchTriggerBtn.addEventListener('click', openSearch);
    }

    if (elements.searchCloseBtn) {
      elements.searchCloseBtn.addEventListener('click', closeSearch);
    }

    if (elements.searchModal) {
      elements.searchModal.addEventListener('click', (e) => {
        if (e.target === elements.searchModal) closeSearch();
      });
    }

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openSearch();
      }
      if (e.key === 'Escape' && elements.searchModal && elements.searchModal.classList.contains('active')) {
        closeSearch();
      }
    });

    if (elements.searchInput) {
      elements.searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        handleSearch(query);
      });
    }
  }

  function openSearch() {
    if (!elements.searchModal) return;
    elements.searchModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    elements.searchInput.value = '';
    handleSearch('');
    elements.searchInput.focus();
  }

  function closeSearch() {
    if (!elements.searchModal) return;
    elements.searchModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function handleSearch(query) {
    if (!elements.searchResults) return;

    if (!query) {
      elements.searchResults.innerHTML = `
        <div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
          Type to search research projects, publications, code repositories, or certifications...
        </div>
      `;
      return;
    }

    const matched = searchIndex.filter(item =>
      item.title.toLowerCase().includes(query) ||
      (item.desc && item.desc.toLowerCase().includes(query)) ||
      item.type.toLowerCase().includes(query)
    );

    if (matched.length === 0) {
      elements.searchResults.innerHTML = `
        <div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
          No matching results found for "${escapeHtml(query)}"
        </div>
      `;
      return;
    }

    elements.searchResults.innerHTML = matched.map(item => `
      <div class="search-result-item" data-link="${item.link}">
        <div class="search-item-title">${escapeHtml(item.title)}</div>
        <div class="search-item-meta">
          <span class="pill" style="font-size: 0.68rem; padding: 0.15rem 0.5rem;">${escapeHtml(item.type)}</span>
          <span>${escapeHtml(item.desc || '')}</span>
        </div>
      </div>
    `).join('');

    elements.searchResults.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const link = item.getAttribute('data-link');
        closeSearch();
        window.location.hash = link;
      });
    });
  }

  /* ==========================================================================
     15. MOBILE NAVIGATION & SCROLLSPY
     ========================================================================== */
  function initNav() {
    if (elements.mobileNavToggle && elements.navMenu) {
      elements.mobileNavToggle.addEventListener('click', () => {
        elements.navMenu.classList.toggle('open');
      });

      elements.navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          elements.navMenu.classList.remove('open');
        });
      });
    }

    // Scroll Navbar blur
    const navbar = document.querySelector('.site-nav');
    window.addEventListener('scroll', () => {
      if (navbar) {
        if (window.scrollY > 40) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }
      updateActiveNavLink();
    });
  }

  function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      const navLink = document.querySelector(`.nav-menu a[href*="${sectionId}"]`);

      if (navLink) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          navLink.classList.add('active');
        } else {
          navLink.classList.remove('active');
        }
      }
    });
  }

  /* Helper utilities */
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* Initialization */
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initHeroTyping();
    initNav();
    initLightboxListeners();
    initAdminManager();
    initSearchListeners();
    loadPortfolioData();
  });

})();
