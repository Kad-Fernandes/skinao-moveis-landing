/* ==========================================================================
   1. SLIDESHOW AUTOMÁTICO (Hero)
   ========================================================================== */
// Troca a foto sozinha a cada 8s em qualquer ".slider-container" da página.
// Só o HERO usa essa classe — os ambientes usam o efeito leque (bloco 3).
function iniciarTodosOsSliders() {
    const sliders = document.querySelectorAll('.slider-container');

    sliders.forEach(container => {
        const slides = container.querySelectorAll('.slide');
        if (slides.length <= 1) return; // Só 1 foto, não precisa girar

        let slideAtual = 0;

        setInterval(() => {
            slides[slideAtual].classList.remove('active');
            slideAtual = (slideAtual + 1) % slides.length;
            slides[slideAtual].classList.add('active');
        }, 8000);
    });
}


/* ==========================================================================
   2. FORMULÁRIO DE ORÇAMENTO
   ========================================================================== */
// 2.1 Máscara de telefone + envio da solicitação via WhatsApp
function configurarFormularioOrcamento() {
    const form = document.getElementById('formOrcamento');
    const inputTelefone = document.getElementById('telefone');

    if (!form || !inputTelefone) return;

    // Máscara para celular: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
    inputTelefone.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.substring(0, 11);

        if (value.length > 6) {
            e.target.value = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7)}`;
        } else if (value.length > 2) {
            e.target.value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
        } else if (value.length > 0) {
            e.target.value = `(${value}`;
        } else {
            e.target.value = '';
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nome = document.getElementById('nome').value;
        const telefone = inputTelefone.value;
        const selectInteresse = document.getElementById('interesse');
        const interesse = selectInteresse.options[selectInteresse.selectedIndex].text;
        const mensagem = document.getElementById('mensagem').value;

        let texto = `Olá! Gostaria de um orçamento.\n\n`;
        texto += `*Nome:* ${nome}\n`;
        texto += `*Contato:* ${telefone}\n`;
        texto += `*Ambiente de interesse:* ${interesse}\n`;
        if (mensagem.trim() !== '') {
            texto += `*Mensagem:* ${mensagem}\n`;
        }

        const textoCodificado = encodeURIComponent(texto);
        const numeroWhats = '556732682280';
        const urlWhats = `https://api.whatsapp.com/send?phone=${numeroWhats}&text=${textoCodificado}`;

        window.open(urlWhats, '_blank');
    });
}


/* ==========================================================================
   3. EFEITO LEQUE NOS AMBIENTES
   ========================================================================== */
// 3.1 Clique nas fotos (desktop: clica na foto de trás para trazê-la à
//     frente / mobile: o clique alterna direto, já que o clip-path some)
// 3.1 Clique nas fotos (desktop: clica na foto "next" que está espiando
//     atrás pra trazê-la à frente / mobile: qualquer clique já avança)
function configurarPeekingAmbientes() {
    const cards = document.querySelectorAll('.ambiente-premium');

    cards.forEach(card => {
        const slides = card.querySelectorAll('.premium-imagem .slide');
        if (slides.length < 2) return;

        let indiceAtual = 0;
        aplicarPapeis(slides, indiceAtual);

        slides.forEach((slide) => {
            slide.addEventListener('click', function (e) {
                e.stopPropagation();

                const isMobile = window.innerWidth <= 768;
                if (!isMobile && !slide.classList.contains('next')) return;

                indiceAtual = (indiceAtual + 1) % slides.length;
                aplicarPapeis(slides, indiceAtual);
            });
        });
    });
}

// 3.2 Marca qual foto é ".active" (a vez) e qual é ".next" (a seguinte)
function aplicarPapeis(slides, indiceAtual) {
    const indiceProximo = (indiceAtual + 1) % slides.length;

    slides.forEach((slide, indice) => {
        slide.classList.remove('active', 'next');
        if (indice === indiceAtual) {
            slide.classList.add('active');
        } else if (indice === indiceProximo) {
            slide.classList.add('next');
        }
    });
}

/* ==========================================================================
   4. AJUSTES NO FOOTER (HTML)
   ========================================================================== */
// Atualiza o ano do footer automaticamente para o ano em vigor.
const spanAno = document.getElementById('ano');
if (spanAno) {
    spanAno.textContent = new Date().getFullYear();
}

/* ==========================================================================
   5. INICIALIZAÇÃO GERAL
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    iniciarTodosOsSliders();
    configurarFormularioOrcamento();
    configurarPeekingAmbientes();
    configurarPeekingMobile();
});
