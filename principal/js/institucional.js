(() => {
    const header     = document.querySelector('.site-header');
    const menuToggle = document.querySelector('.menu-toggle');
    const nav        = document.querySelector('.main-nav');
    const year       = document.querySelector('#ano');

    // ── Ano no footer ────────────────────────────────────────────
    if (year) year.textContent = new Date().getFullYear();

    // ── Header scroll ────────────────────────────────────────────
    const updateHeader = () => {
        if (header) header.classList.toggle('scrolled', window.scrollY > 30);
    };
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    // ── Menu Mobile ───────────────────────────────────────────────
    const closeMenu = () => {
        if (!nav) return;
        nav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Abrir menu');
        document.body.style.overflow = '';
    };

    if (menuToggle && nav) {
        // Abrir / fechar pelo botão
        menuToggle.addEventListener('click', () => {
            const open = nav.classList.toggle('open');
            menuToggle.setAttribute('aria-expanded', String(open));
            menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
            document.body.style.overflow = open ? 'hidden' : '';
        });

        // Fechar ao clicar em qualquer link do menu
        nav.querySelectorAll('a').forEach(link =>
            link.addEventListener('click', closeMenu)
        );

        // Fechar ao clicar fora do menu (no overlay)
        document.addEventListener('click', e => {
            if (
                nav.classList.contains('open') &&
                !nav.contains(e.target) &&
                !menuToggle.contains(e.target)
            ) {
                closeMenu();
            }
        });

        // Fechar com tecla Escape
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && nav.classList.contains('open')) {
                closeMenu();
                menuToggle.focus(); // devolve foco para acessibilidade
            }
        });
    }

    // ── Animação Reveal com IntersectionObserver ──────────────────
    const revealItems = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        revealItems.forEach(item => observer.observe(item));
    } else {
        revealItems.forEach(item => item.classList.add('visible'));
    }

    // ── Hero Slideshow (carrossel automático) ─────────────────────
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length > 1) {
        let current = 0;
        const INTERVAL_MS = 5000; // troca a cada 5 segundos

        const goToSlide = (index) => {
            slides[current].classList.remove('active');
            current = (index + slides.length) % slides.length;
            slides[current].classList.add('active');
        };

        let timer = setInterval(() => goToSlide(current + 1), INTERVAL_MS);

        // Pausa o carrossel quando a aba não está visível (economia de CPU)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                clearInterval(timer);
            } else {
                timer = setInterval(() => goToSlide(current + 1), INTERVAL_MS);
            }
        });
    }

    // ── Botão Voltar ao Topo ────────────────────────────────────────
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }, { passive: true });
        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

        // ── Lightbox (clique na foto pra ampliar) ────────────────────────
    // Funciona pra qualquer <img class="zoomable">, em qualquer página —
    // não precisa repetir essa lógica, só somar a classe na imagem.
    const lightbox      = document.getElementById('lightbox');
    const lightboxImg   = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    const zoomables     = document.querySelectorAll('.zoomable');
 
    if (lightbox && lightboxImg && zoomables.length) {
        const openLightbox = (src, alt) => {
            lightboxImg.src = src;
            lightboxImg.alt = alt || '';
            lightbox.classList.add('open');
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.classList.add('lightbox-open');
        };
 
        const closeLightbox = () => {
            lightbox.classList.remove('open');
            lightbox.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('lightbox-open');
        };
 
        zoomables.forEach(img => {
            img.addEventListener('click', () => openLightbox(img.src, img.alt));
        });
 
        // Fecha no botão X
        if (lightboxClose) {
            lightboxClose.addEventListener('click', closeLightbox);
        }
 
        // Fecha clicando fora da foto (no fundo escuro)
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
 
        // Fecha com Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('open')) {
                closeLightbox();
            }
        });
    }
 

    // ── Banner de Cookies & GA4 Consent ─────────────────────────────
    const cookieBanner = document.getElementById('cookie-banner');
    const btnAcceptCookies = document.getElementById('accept-cookies');
    const COOKIE_NAME = 'skinao_cookies_accepted';

    // Se ainda não aceitou, mostra banner após 1s
    if (cookieBanner && !localStorage.getItem(COOKIE_NAME)) {
        setTimeout(() => {
            cookieBanner.classList.add('visible');
            cookieBanner.setAttribute('aria-hidden', 'false');
        }, 1000);
    }

    // Se já aceitou anteriormente, atualiza o consent do GA4 imediatamente
    if (localStorage.getItem(COOKIE_NAME)) {
        if (typeof gtag === 'function') {
            gtag('consent', 'update', {
                'analytics_storage': 'granted',
                'ad_storage': 'granted'
            });
        }
    }

    if (btnAcceptCookies && cookieBanner) {
        btnAcceptCookies.addEventListener('click', () => {
            localStorage.setItem(COOKIE_NAME, 'true');
            cookieBanner.classList.remove('visible');
            cookieBanner.setAttribute('aria-hidden', 'true');
            
            // Atualiza Google Analytics
            if (typeof gtag === 'function') {
                gtag('consent', 'update', {
                    'analytics_storage': 'granted',
                    'ad_storage': 'granted'
                });
            }
        });
    }

    // ── Indicador "Aberto agora / Fechado" (página de contato) ──────
    // Horário: Seg–Sex 08h–18h · Sáb 08h–12h · Dom fechado.
    const storeStatus = document.getElementById('storeStatus');
    if (storeStatus) {
        const dot  = storeStatus.querySelector('.status-dot');
        const text = storeStatus.querySelector('.status-text');

        const pad2 = n => String(n).padStart(2, '0');

        const setStatus = (open, message) => {
            storeStatus.classList.toggle('is-open', open);
            storeStatus.classList.toggle('is-closed', !open);
            if (text) text.textContent = message;
        };

        const updateStoreStatus = () => {
            const now = new Date();
            const day = now.getDay(); // 0 = domingo … 6 = sábado
            const minutesNow = now.getHours() * 60 + now.getMinutes();

            const OPEN = 8 * 60;
            const CLOSE_WEEKDAY = 18 * 60;
            const CLOSE_SATURDAY = 12 * 60;

            if (day >= 1 && day <= 5) {
                // Segunda a sexta
                if (minutesNow < OPEN) {
                    setStatus(false, `Fechado — abrimos hoje às ${pad2(8)}h`);
                } else if (minutesNow < CLOSE_WEEKDAY) {
                    setStatus(true, 'Aberto agora — fecha às 18h');
                } else if (day === 5) {
                    setStatus(false, 'Fechado — abrimos sábado às 08h');
                } else {
                    setStatus(false, 'Fechado — abrimos amanhã às 08h');
                }
            } else if (day === 6) {
                // Sábado
                if (minutesNow < OPEN) {
                    setStatus(false, 'Fechado — abrimos hoje às 08h');
                } else if (minutesNow < CLOSE_SATURDAY) {
                    setStatus(true, 'Aberto agora — fecha ao meio-dia');
                } else {
                    setStatus(false, 'Fechado — abrimos segunda às 08h');
                }
            } else {
                // Domingo
                setStatus(false, 'Fechado — abrimos amanhã às 08h');
            }

            // Marca visualmente o dia atual na lista de horários, se existir
            let todaySelector = null;
            if (day >= 1 && day <= 5) todaySelector = '[data-day="semana"]';
            else if (day === 6) todaySelector = '[data-day="sabado"]';

            document.querySelectorAll('.contact-hours .today-tag').forEach(tag => tag.remove());
            const todayRow = todaySelector ? document.querySelector(todaySelector) : null;
            if (todayRow) {
                const tag = document.createElement('span');
                tag.className = 'today-tag';
                tag.textContent = 'Hoje';
                todayRow.querySelector('span').appendChild(tag);
            }
        };

        updateStoreStatus();
        // Reavalia a cada minuto, caso a pessoa deixe a aba aberta
        setInterval(updateStoreStatus, 60000);
    }
})();