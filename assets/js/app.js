(() => {
  const root = document.documentElement;
  const statusCopy = {
    sent: { tr: 'Gönderildi', en: 'Sent' },
    failed: { tr: 'Gönderilemedi', en: 'Could not send' },
    draftOpened: {
      tr: 'E-posta taslağı açıldı. Göndermek için e-posta uygulamanızda Gönder’e basın.',
      en: 'Email draft opened. Press Send in your email app to send it.',
    },
  };
  const setStatus = (element, key) => {
    element.dataset.statusKey = key;
    element.textContent = statusCopy[key][root.dataset.language] || '';
  };

  const selectedLanguage = () => {
    try { return localStorage.getItem('nartech-language') || 'en'; }
    catch { return 'en'; }
  };
  const setLanguage = language => {
    language = language === 'en' ? 'en' : 'tr';
    root.dataset.language = language;
    root.setAttribute('data-language', language);
    root.lang = language;
    const english = language === 'en';
    document.querySelectorAll('.footer-tagline .lang-en').forEach(element => {
      element.textContent = 'The Right Engineering & The Right Products';
    });
    if (root.dataset.titleEn && root.dataset.titleTr) {
      document.title = english ? root.dataset.titleEn : root.dataset.titleTr;
    }
    const menuButton = document.querySelector('[data-nav-toggle]');
    if (menuButton) {
      const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
      const labelLanguage = english ? 'En' : 'Tr';
      const labelAction = isOpen ? 'close' : 'open';
      const labelVal = menuButton.dataset[`${labelAction}Label${labelLanguage}`];
      if (labelVal) menuButton.setAttribute('aria-label', labelVal);
    }
    document.querySelectorAll('[data-set-language]').forEach(button => {
      const isActive = button.dataset.setLanguage === language;
      button.setAttribute('aria-pressed', String(isActive));
      if (isActive) {
        button.classList.add('is-active');
      } else {
        button.classList.remove('is-active');
      }
    });
    document.querySelectorAll('[data-aria-tr][data-aria-en]').forEach(element => {
      element.setAttribute('aria-label', english ? element.dataset.ariaEn : element.dataset.ariaTr);
    });
    document.querySelectorAll('[data-alt-tr][data-alt-en]').forEach(element => {
      element.setAttribute('alt', english ? element.dataset.altEn : element.dataset.altTr);
    });
    document.querySelectorAll('[data-i18n-tr][data-i18n-en]').forEach(element => {
      element.textContent = english ? element.dataset.i18nEn : element.dataset.i18nTr;
    });
    document.querySelectorAll('[data-placeholder-tr][data-placeholder-en]').forEach(element => {
      element.setAttribute('placeholder', english ? element.dataset.placeholderEn : element.dataset.placeholderTr);
    });
    document.querySelectorAll('[data-status-key]').forEach(element => {
      element.textContent = statusCopy[element.dataset.statusKey]?.[language] || '';
    });
    document.dispatchEvent(new CustomEvent('nartech-language-change', { detail: { language } }));
    try { localStorage.setItem('nartech-language', language); } catch { /* Storage may be unavailable for file previews. */ }
  };

  const bindLanguageControls = () => {
    document.querySelectorAll('[data-set-language]').forEach(button => {
      button.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        setLanguage(button.dataset.setLanguage);
      });
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      bindLanguageControls();
      setLanguage(selectedLanguage());
    });
  } else {
    bindLanguageControls();
    setLanguage(selectedLanguage());
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-set-language]');
    if (button) {
      event.preventDefault();
      setLanguage(button.dataset.setLanguage);
    }
  });
  const navToggle = document.querySelector('[data-nav-toggle]');
  const siteNav = document.querySelector('#site-nav');
  const navBackdrop = document.querySelector('[data-nav-close]');
  if (navToggle && siteNav && navBackdrop) {
    const mobileNav = window.matchMedia('(max-width: 1100px)');
    const menuLabel = opened => {
      const language = root.dataset.language === 'en' ? 'En' : 'Tr';
      navToggle.setAttribute('aria-label', navToggle.dataset[`${opened ? 'close' : 'open'}Label${language}`]);
    };
    const closeMenu = returnFocus => {
      root.removeAttribute('data-nav-open');
      document.body.classList.remove('nav-is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      menuLabel(false);
      if (returnFocus) navToggle.focus();
    };
    const openMenu = () => {
      if (!mobileNav.matches) return;
      root.setAttribute('data-nav-open', 'true');
      document.body.classList.add('nav-is-open');
      navToggle.setAttribute('aria-expanded', 'true');
      menuLabel(true);
      siteNav.querySelector('a')?.focus();
    };
    navToggle.addEventListener('click', () => {
      if (root.dataset.navOpen === 'true') closeMenu(true);
      else openMenu();
    });
    navBackdrop.addEventListener('click', () => closeMenu(true));
    siteNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu(false)));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && root.dataset.navOpen === 'true') closeMenu(true);
    });
    mobileNav.addEventListener('change', event => {
      if (!event.matches) closeMenu(false);
    });
  }

  document.querySelectorAll('.catalog-index a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => {
      const target = document.getElementById(link.hash.slice(1));
      if (target?.tagName === 'DETAILS') target.open = true;
    });
  });

  const homeProductExplorer = document.querySelector('[data-home-product-explorer]');
  if (homeProductExplorer) {
    const categoryButtons = [...homeProductExplorer.querySelectorAll('[data-home-category]')];
    const productPanels = [...homeProductExplorer.querySelectorAll('[data-home-product-panel]')];
    categoryButtons.forEach(button => {
      button.addEventListener('click', () => {
        const selectedCategory = button.dataset.homeCategory;
        if (!productPanels.some(panel => panel.dataset.homeProductPanel === selectedCategory)) return;
        categoryButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
        productPanels.forEach(panel => {
          panel.hidden = panel.dataset.homeProductPanel !== selectedCategory;
        });
      });
    });
  }

  const calculatorEmailForm = document.querySelector('#calc-email-form');
  if (calculatorEmailForm) {
    const stepEmail = document.querySelector('#calc-step-email');
    const stepInputs = document.querySelector('#calc-step-inputs');
    const stepResults = document.querySelector('#calc-step-results');
    const resultContent = document.querySelector('#calc-results');
    const status = document.querySelector('#calc-status');
    let recipientEmail = '';
    let calculation = null;

    const showStep = number => {
      stepEmail.hidden = number !== 1;
      stepInputs.hidden = number !== 2;
      stepResults.hidden = number !== 3;
      document.querySelectorAll('[data-step-indicator]').forEach(indicator => {
        if (Number(indicator.dataset.stepIndicator) === number) indicator.setAttribute('aria-current', 'step');
        else indicator.removeAttribute('aria-current');
      });
    };
    const format = value => new Intl.NumberFormat(root.dataset.language === 'en' ? 'en-US' : 'tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value));
    const createResult = (label, value) => {
      const row = document.createElement('div');
      row.className = 'calc-result-row';
      const name = document.createElement('dt');
      name.textContent = label;
      const result = document.createElement('dd');
      result.textContent = value;
      row.append(name, result);
      return row;
    };

    const renderResults = () => {
      if (!calculation) return;
      const labels = root.dataset.language === 'en' ? {
        capacity: 'Tank Capacity',
        fill: 'Max Fill Rate',
        empty: 'Max Empty Rate',
        thermal: 'Thermal Venting Contribution',
        out: 'Total Outbreathing (Pressure Valve Capacity)',
        in: 'Total Inbreathing (Vacuum Valve Capacity)',
      } : {
        capacity: 'Tank Kapasitesi',
        fill: 'Maksimum Dolum Debisi',
        empty: 'Maksimum Boşaltım Debisi',
        thermal: 'Termal Nefesleme Katkısı',
        out: 'Toplam Dış Nefesleme (Basınç Ventili Kapasitesi)',
        in: 'Toplam İç Nefesleme (Vakum Ventili Kapasitesi)',
      };
      resultContent.replaceChildren(
        createResult(labels.capacity, `${format(calculation.tank_capacity_m3)} m³`),
        createResult(labels.fill, `${format(calculation.max_fill_rate_m3h)} m³/h`),
        createResult(labels.empty, `${format(calculation.max_empty_rate_m3h)} m³/h`),
        createResult(labels.thermal, `${format(calculation.thermal_venting_m3h)} m³/h | ${format(calculation.thermal_venting_scfh)} SCFH`),
        createResult(labels.out, `${format(calculation.outbreathing_m3h)} m³/h | ${format(calculation.outbreathing_scfh)} SCFH`),
        createResult(labels.in, `${format(calculation.inbreathing_m3h)} m³/h | ${format(calculation.inbreathing_scfh)} SCFH`),
      );
    };

    calculatorEmailForm.addEventListener('submit', event => {
      event.preventDefault();
    });

    document.querySelector('#calc-input-form').addEventListener('submit', event => {
      event.preventDefault();
      const form = event.currentTarget;
      if (!form.reportValidity()) return;
      const capacity = Number(form.elements.tank_capacity_m3.value);
      const fillRate = Number(form.elements.max_fill_rate_m3h.value);
      const emptyRate = Number(form.elements.max_empty_rate_m3h.value);
      if (![capacity, fillRate, emptyRate].every(Number.isFinite) || capacity <= 0 || fillRate < 0 || emptyRate < 0) return;

      let thermalFactor = capacity <= 1000 ? 0.5 : capacity <= 10000 ? 0.3 : 0.15;
      const flashPointAbove37C = form.elements.product_flash_point_above_37c.value === 'true';
      if (!flashPointAbove37C) thermalFactor *= 1.25;
      const thermalVenting = capacity * thermalFactor * 0.1;
      const totalOutbreathing = fillRate + thermalVenting;
      const totalInbreathing = emptyRate + thermalVenting;
      const conversionFactor = 35.3147;
      calculation = {
        tank_capacity_m3: capacity,
        max_fill_rate_m3h: fillRate,
        max_empty_rate_m3h: emptyRate,
        product_flash_point_above_37c: flashPointAbove37C,
        thermal_venting_m3h: thermalVenting,
        thermal_venting_scfh: thermalVenting * conversionFactor,
        outbreathing_m3h: totalOutbreathing,
        outbreathing_scfh: totalOutbreathing * conversionFactor,
        inbreathing_m3h: totalInbreathing,
        inbreathing_scfh: totalInbreathing * conversionFactor,
      };
      renderResults();
      status.removeAttribute('data-status-key');
      status.textContent = '';
      showStep(3);
      document.querySelector('#calc-send').focus();
    });

    document.querySelector('#calc-back').addEventListener('click', () => {
      status.removeAttribute('data-status-key');
      status.textContent = '';
      showStep(2);
    });

    document.addEventListener('nartech-language-change', renderResults);

    document.querySelector('#calc-send').addEventListener('click', async event => {
      if (!calculation || !recipientEmail) return;
      const button = event.currentTarget;
      button.disabled = true;
      status.removeAttribute('data-status-key');
      status.textContent = '';
      try {
        const response = await fetch('/api/api2000-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipientEmail, calculation, language: root.dataset.language }),
        });
        if (!response.ok) throw new Error('send-failed');
        setStatus(status, 'sent');
      } catch {
        setStatus(status, 'failed');
      } finally {
        button.disabled = false;
      }
    });
  }

  const contactForm = document.querySelector('#contact-form');
  if (contactForm) {
    const params = new URLSearchParams(location.search);
    contactForm.elements.product.value = params.get('product') || '';
    const status = document.querySelector('#contact-status');
    contactForm.addEventListener('submit', event => {
      event.preventDefault();
      if (!contactForm.reportValidity()) return;
      const form = new FormData(contactForm);
      const language = root.dataset.language === 'en' ? 'en' : 'tr';
      const values = language === 'en'
        ? { name: 'Name', phone: 'Phone Number', description: 'Description', product: 'Product', subject: 'NarTech Contact Request' }
        : { name: 'Ad Soyad', phone: 'Telefon No', description: 'Açıklama', product: 'Ürün', subject: 'NarTech İletişim Talebi' };
      const lines = [
        `${values.name}: ${form.get('name')}`,
        `${values.phone}: ${form.get('phone')}`,
        `${values.description}: ${form.get('description')}`,
      ];
      const product = form.get('product');
      if (product) lines.push(`${values.product}: ${product}`);
      const mailto = `mailto:sales@nartech.com.tr?subject=${encodeURIComponent(values.subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
      setStatus(status, 'draftOpened');
      window.location.href = mailto;
    });
  }

  const proofStrip = document.querySelector('.home-proof-strip');
  if (proofStrip) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let revealed = false;
    const revealProof = () => {
      if (revealed) return;
      revealed = true;
      proofStrip.classList.add('is-visible');
      if (reducedMotion) return;
      proofStrip.querySelectorAll('[data-count-up]').forEach(element => {
        const target = Number(element.dataset.countUp);
        const suffix = element.dataset.countSuffix || '';
        const duration = 1500;
        const startedAt = performance.now();
        element.classList.add('is-counting');
        const update = now => {
          const progress = Math.min((now - startedAt) / duration, 1);
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const count = progress < 1 ? Math.min(target, Math.floor(target * easeOut) + 1) : target;
          element.textContent = `${count}${suffix}`;
          if (progress < 1) requestAnimationFrame(update);
          else {
            element.textContent = `${target}${suffix}`;
            element.classList.remove('is-counting');
          }
        };
        requestAnimationFrame(update);
      });
    };

    if (reducedMotion || !('IntersectionObserver' in window)) {
      revealProof();
    } else {
      const checkInView = () => {
        const rect = proofStrip.getBoundingClientRect();
        if (rect.top < window.innerHeight + 100 && rect.bottom > -50) {
          revealProof();
          return true;
        }
        return false;
      };

      if (!checkInView()) {
        setTimeout(checkInView, 80);
      }

      const proofObserver = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          revealProof();
          proofObserver.disconnect();
        }
      }, { threshold: 0, rootMargin: '120px 0px' });
      proofObserver.observe(proofStrip);
    }
  }

  const setupSupplyChain = () => {
    const supplyChainWrapper = document.querySelector('.supply-chain-wrapper');
    if (!supplyChainWrapper) return;

    const bannerText = document.getElementById('banner-text');
    const flowGroups = supplyChainWrapper.querySelectorAll('.flow-group');
    const nodeCards = supplyChainWrapper.querySelectorAll('.node-card');
    const hubCenter = supplyChainWrapper.querySelector('#hub-nartech');

    const nodeInfoMap = {
      consultancy: {
        tr: { title: 'Danışmanlık & Doğru Ürün Seçimi', desc: 'Müşteri operasyonel şartlarına en uygun, sertifikalı ve uzun ömürlü tank/terminal ekipmanlarının mühendislik analizi ile belirlenmesi.' },
        en: { title: 'Consultancy & Optimal Equipment Selection', desc: 'Identifying long-lasting, certified tank and terminal equipment tailored to client operational specifications.' }
      },
      engineering: {
        tr: { title: 'Mühendislik & Şartname Uyumu', desc: 'Projeye özel teknik şartnamelerin hazırlanması, proses/mekanik hesaplamalar ve uluslararası normlara tam uyumun sağlanması.' },
        en: { title: 'Engineering & Specification Compliance', desc: 'Preparing project-specific specifications, mechanical/process calculations, and ensuring total alignment with international standards.' }
      },
      procurement: {
        tr: { title: 'Doğrudan Üreticiden Tedarik', desc: 'Aracısız, doğrudan birinci el küresel üreticilerden en kaliteli tank ve terminal ekipmanlarının rekabetçi koşullarla temini.' },
        en: { title: 'Direct Procurement from Manufacturers', desc: 'Procuring premium certified equipment directly from world-class manufacturers under optimal and competitive conditions.' }
      },
      supervision: {
        tr: { title: 'Saha Süpervizörlüğü & Denetim', desc: 'Montaj, devreye alma ve saha kontrollerinde yerinde teknik gözetim, PVRV set point testleri ve IFR montaj süpervizörlüğü.' },
        en: { title: 'Field Supervision & Inspection', desc: 'On-site technical supervision, PVRV set point inspection, and IFR installation checks during mechanical assembly and commissioning.' }
      },
      hub: {
        tr: { title: 'NarTech Tank Terminal Solutions', desc: 'Depolama tankı ve terminal çözümlerinde doğru mühendislik, kaliteli ürün ve küresel standartları birleştiren güvenilir merkez.' },
        en: { title: 'NarTech Tank Terminal Solutions', desc: 'The trusted engineering hub uniting sound design, premier products, and international standards in storage tank and terminal solutions.' }
      },
      solutions: {
        tr: { title: 'Nihai Mühendislik Çözümleri', desc: 'Petrol & Gaz, Petrokimya, Rafineri, Kimya, Su ve Offshore depolama tesisleri için güvenilir, verimli ve sürdürülebilir anahtar teslim sonuçlar.' },
        en: { title: 'Final Engineering Solutions', desc: 'Reliable, efficient, and sustainable end-to-end engineering outcomes for Oil & Gas, Petrochemical, Refinery, Chemical, and Offshore storage facilities.' }
      }
    };

    const defaultBannerHTML = {
      tr: '<strong>Doğru Mühendislik &amp; Doğru Ürün:</strong> Müşteri gereksinimlerinden nihai çözüme kesintisiz, güvenilir ve sertifikalı süreç.',
      en: '<strong>The Right Engineering &amp; The Right Products:</strong> Seamless, certified, and reliable flow from technical requirements to final solutions.'
    };

    let activeNode = null;

    const renderBanner = () => {
      const lang = root.dataset.language === 'en' ? 'en' : 'tr';
      if (activeNode && nodeInfoMap[activeNode]) {
        const info = nodeInfoMap[activeNode][lang];
        bannerText.innerHTML = `<strong>${info.title}:</strong> ${info.desc}`;
      } else {
        bannerText.innerHTML = defaultBannerHTML[lang];
      }
    };

    const activateNode = nodeId => {
      activeNode = nodeId;
      flowGroups.forEach(flow => {
        if (flow.id === `flow-${nodeId}` || (nodeId === 'hub' && flow.id === 'flow-solutions')) {
          flow.classList.add('is-active');
          flow.classList.remove('is-dimmed');
        } else {
          flow.classList.remove('is-active');
          flow.classList.add('is-dimmed');
        }
      });
      nodeCards.forEach(card => card.classList.toggle('is-active', card.dataset.node === nodeId));
      if (hubCenter) hubCenter.classList.toggle('is-active', nodeId === 'hub');
      renderBanner();
    };

    const resetAll = () => {
      activeNode = null;
      flowGroups.forEach(flow => {
        flow.classList.remove('is-active', 'is-dimmed');
      });
      nodeCards.forEach(card => card.classList.remove('is-active'));
      if (hubCenter) hubCenter.classList.remove('is-active');
      renderBanner();
    };

    nodeCards.forEach(card => {
      const nodeId = card.dataset.node;
      card.addEventListener('mouseenter', () => activateNode(nodeId));
      card.addEventListener('mouseleave', resetAll);
      card.addEventListener('click', e => {
        e.stopPropagation();
        if (activeNode === nodeId) resetAll();
        else activateNode(nodeId);
      });
    });

    if (hubCenter) {
      hubCenter.addEventListener('mouseenter', () => activateNode('hub'));
      hubCenter.addEventListener('mouseleave', resetAll);
      hubCenter.addEventListener('click', e => {
        e.stopPropagation();
        if (activeNode === 'hub') resetAll();
        else activateNode('hub');
      });
    }

    document.addEventListener('click', e => {
      if (!e.target.closest('.supply-chain-wrapper')) resetAll();
    });

    document.addEventListener('nartech-language-change', renderBanner);
    renderBanner();
  };

  setupSupplyChain();

  const homeFlow = document.querySelector('[data-home-flow]');
  if (homeFlow) homeFlow.classList.add('is-visible');

  // Ürünler: kategori gezgini (masaüstü: iki sütun, mobil: kaydırılabilir sekmeler)
  const setupCatalogExplorer = () => {
    const page = document.querySelector('.catalog-page');
    const content = page && page.querySelector('.catalog-content');
    if (!content) return;
    const sources = [...content.children].filter(el => el.matches('details.tree-group, .tree-root-label'));
    if (!sources.length) return;

    const el = (tag, cls, html) => {
      const node = document.createElement(tag);
      if (cls) node.className = cls;
      if (html != null) node.innerHTML = html;
      return node;
    };
    const bi = (tr, en) => `<span class="lang-tr">${tr}</span><span class="lang-en">${en}</span>`;
    const arrow = '<svg class="cx-arrow" viewBox="0 0 16 16" aria-hidden="true"><path d="M5.5 3.5 10 8l-4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    const explorer = el('div', 'cx');
    const rail = el('div', 'cx-rail');
    rail.setAttribute('role', 'tablist');
    rail.setAttribute('aria-orientation', 'vertical');
    const stage = el('div', 'cx-stage');
    const stageCard = el('div', 'cx-stage-card');
    stage.append(stageCard);
    explorer.append(rail, stage);

    const splitTitle = node => {
      const clone = node.cloneNode(true);
      const parts = {};
      clone.querySelectorAll('.lang-tr, .lang-en').forEach(span => {
        const lang = span.classList.contains('lang-en') ? 'en' : 'tr';
        const m = span.textContent.trim().match(/^(\d+)\s*-\s*(.*)$/);
        parts[lang] = m ? m[2] : span.textContent.trim();
        parts.num = m ? m[1].padStart(2, '0') : parts.num;
      });
      return parts;
    };

    const linkCard = (a, n) => {
      const card = el('a', 'cx-link',
        `<span class="cx-idx">${String(n).padStart(2, '0')}</span>` +
        `<span class="cx-body"><span class="cx-title">${a.innerHTML}</span><span class="cx-more">${bi('Ürünü incele', 'View product')}</span></span>` +
        `<span class="cx-go">${arrow}</span>`);
      card.href = a.getAttribute('href');
      return card;
    };

    const items = sources.map((src, index) => {
      const id = src.id || `cat-${index}`;
      const titleNode = src.matches('details') ? src.querySelector(':scope > summary') : src;
      const t = splitTitle(titleNode);
      const children = src.querySelector(':scope > .tree-children');
      const directLinks = children ? [...children.querySelectorAll(':scope > a.tree-link')] : [];
      const branches = children ? [...children.querySelectorAll(':scope > details.tree-branch')] : [];
      const total = children ? children.querySelectorAll('a.tree-link').length : 0;

      const tab = el('button', 'cx-tab', `<span class="cx-num">${t.num || ''}</span><span class="cx-name">${bi(t.tr || '', t.en || t.tr || '')}</span><span class="cx-tab-count">${total || '–'}</span>`);
      tab.type = 'button';
      tab.id = `cx-tab-${id}`;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', `cx-panel-${id}`);
      tab.dataset.target = id;
      rail.append(tab);

      const panel = el('section', 'cx-panel');
      panel.id = `cx-panel-${id}`;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
      const head = el('header', 'cx-head',
        `<span class="cx-kicker">${bi('Kategori', 'Category')} ${t.num || ''}</span>` +
        `<h2>${bi(t.tr || '', t.en || t.tr || '')}</h2>` +
        (total ? `<span class="cx-count">${bi(`${total} ürün`, `${total} ${total === 1 ? 'product' : 'products'}`)}</span>` : ''));
      panel.append(head);

      const copy = children && children.querySelector(':scope > .tree-copy');
      if (copy && copy.textContent.trim()) panel.append(el('div', 'cx-copy', copy.innerHTML));

      let n = 0;
      if (directLinks.length) {
        const grid = el('div', 'cx-grid');
        directLinks.forEach(a => grid.append(linkCard(a, ++n)));
        panel.append(grid);
      }
      branches.forEach(branch => {
        const group = el('div', 'cx-sub');
        group.append(el('h3', 'cx-subtitle', branch.querySelector(':scope > summary').innerHTML));
        const grid = el('div', 'cx-grid');
        branch.querySelectorAll('a.tree-link').forEach(a => grid.append(linkCard(a, ++n)));
        group.append(grid);
        panel.append(group);
      });
      if (!total) {
        panel.append(el('div', 'cx-empty',
          `<p>${bi('Bu kategorideki çözümler projeye özel tasarlanır. İhtiyacınızı iletin, size uygun ürünü birlikte belirleyelim.', 'Solutions in this category are engineered per project. Share your requirements and we will specify the right product together.')}</p>` +
          `<a class="cx-cta" href="contact.html#contact-form">${bi('Teklif İste', 'Request a Quote')}${arrow}</a>`));
      }
      stageCard.append(panel);
      return { id, tab, panel, total };
    });

    const bottomRow = el('div', 'cx-bottom-row');
    const help = el('div', 'cx-help',
      `<div><strong>${bi('Aradığınız modeli göremediniz mi?', 'Can’t find the exact model?')}</strong>` +
      `<span>${bi('Proses koşullarınızı iletin, mühendislerimiz doğru ürünü belirlesin.', 'Share your process conditions and our engineers will specify the right product.')}</span></div>` +
      `<a class="cx-cta" href="contact.html#contact-form">${bi('Teklif İste', 'Request a Quote')}${arrow}</a>`);
    bottomRow.append(help);
    const stdNote = page.querySelector('.product-standards-note');
    if (stdNote) {
      stdNote.classList.add('cx-standards');
      bottomRow.append(stdNote);
    }
    stage.append(bottomRow);

    let active = null;
    const activate = (id, { focus = false } = {}) => {
      const item = items.find(i => i.id === id) || items[0];
      if (active === item) return;
      items.forEach(i => {
        const on = i === item;
        i.tab.classList.toggle('is-active', on);
        i.tab.setAttribute('aria-selected', String(on));
        i.tab.tabIndex = on ? 0 : -1;
        i.panel.classList.toggle('is-active', on);
        i.panel.hidden = !on;
      });
      stage.classList.toggle('is-empty-cat', item.total === 0);
      if (focus) item.tab.focus();
      if (rail.scrollWidth > rail.clientWidth) {
        rail.scrollTo({ left: item.tab.offsetLeft - (rail.clientWidth - item.tab.offsetWidth) / 2, behavior: active ? 'smooth' : 'auto' });
      }
      active = item;
    };

    // Hover niyeti: yalnızca fare sağdaki panele çapraz giderken kısa gecikme uygula; dikey gezintide anında aç.
    let hoverTimer = null;
    let lastX = 0;
    let lastY = 0;
    let dx = 0;
    let dy = 0;
    rail.addEventListener('mousemove', e => {
      dx = e.clientX - lastX;
      dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
    }, { passive: true });
    items.forEach(item => {
      item.tab.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimer);
        if (dx > 5 && dx > Math.abs(dy) * 1.4) {
          hoverTimer = setTimeout(() => {
            if (item.tab.matches(':hover')) activate(item.id);
          }, 90);
        } else {
          activate(item.id);
        }
      });
      item.tab.addEventListener('click', () => {
        clearTimeout(hoverTimer);
        activate(item.id);
        if (window.matchMedia('(max-width: 899px)').matches) {
          const top = stage.getBoundingClientRect().top - rail.getBoundingClientRect().bottom - 12;
          if (top < 0) window.scrollBy({ top, behavior: 'smooth' });
        }
      });
      item.tab.addEventListener('focus', () => activate(item.id));
    });
    rail.addEventListener('mouseleave', () => clearTimeout(hoverTimer));
    rail.addEventListener('keydown', e => {
      const index = items.indexOf(active);
      const map = { ArrowDown: index + 1, ArrowUp: index - 1, Home: 0, End: items.length - 1 };
      if (!(e.key in map)) return;
      e.preventDefault();
      const next = items[(map[e.key] + items.length) % items.length];
      activate(next.id, { focus: true });
    });

    const fromHash = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      if (id && items.some(i => i.id === id)) {
        activate(id);
        explorer.scrollIntoView({ block: 'start' });
        return true;
      }
      return false;
    };
    if (!fromHash()) activate(items[0].id);
    window.addEventListener('hashchange', fromHash);

    content.before(explorer);
    document.body.classList.add('is-catalog-page');
    page.classList.add('has-cx');

    const header = document.querySelector('.site-header');
    const syncTop = () => {
      if (header && getComputedStyle(header).position === 'sticky') {
        explorer.style.setProperty('--cx-sticky-top', `${header.offsetHeight}px`);
      } else {
        explorer.style.setProperty('--cx-sticky-top', '0px');
      }
    };
    syncTop();
    window.addEventListener('resize', syncTop, { passive: true });
  };
  setupCatalogExplorer();
})();
