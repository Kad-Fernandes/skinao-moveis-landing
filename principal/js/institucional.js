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
})();