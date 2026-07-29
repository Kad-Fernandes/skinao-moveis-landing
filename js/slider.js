/* ==========================================================================
   0. CONECTIVIDADE (SUPABASE)
   ========================================================================== */
const SUPABASE_URL = 'https://shvivhfpfhcrurtfeowd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNodml2aGZwZmhjcnVydGZlb3dkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzNTQxMTcsImV4cCI6MjEwMDkzMDExN30.vAB1FDSrFHb-hDNBpGp1RNmslOR23QAt-ToAU0p-SAQ';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Pega os dados digitados pelo cliente
        const nome = document.getElementById('nome').value;
        const telefone = document.getElementById('telefone').value;
        const interesse = document.getElementById('interesse').value;
        const mensagem = document.getElementById('mensagem').value;

        try {
            // 1. Salva o lead no Supabase
            const { error } = await supabaseClient
                .from('solicitacoes')
                .insert([
                    { 
                        nome: nome, 
                        telefone: telefone, 
                        interesse: interesse, 
                        mensagem: mensagem 
                    }
                ]);

            if (error) {
                console.error('Erro ao salvar no banco:', error);
            } else {
                console.log('Lead salvo com sucesso no Supabase!');
            }
        } catch (err) {
            console.error('Erro de conexão:', err);
        }

        // 2. Monta a mensagem e redireciona pro WhatsApp normalmente
        const textoWhatsapp = `Olá! Meu nome é *${nome}*.\n` +
                            `Interesse: *${interesse}*\n` +
                            `Mensagem: ${mensagem}`;

        const url = `https://wa.me/556732682280?text=${encodeURIComponent(textoWhatsapp)}`;
        window.open(url, '_blank');
    });
}


/* ==========================================================================
   3. EFEITO LEQUE NOS AMBIENTES (COM ROTAÇÃO AUTOMÁTICA)
   ========================================================================== */
function configurarPeekingAmbientes() {
    const cards = document.querySelectorAll('.ambiente-premium');

    cards.forEach(card => {
        const slides = card.querySelectorAll('.premium-imagem .slide');
        if (slides.length < 2) return;

        let indiceAtual = 0;
        let timerCard = null;

        aplicarPapeis(slides, indiceAtual);

        // 3.1 Função para avançar o slide e reiniciar o temporizador
        function proximoSlide() {
            indiceAtual = (indiceAtual + 1) % slides.length;
            aplicarPapeis(slides, indiceAtual);
        }

        function iniciarTimer() {
            // Limpa qualquer timer ativo para evitar múltiplos loops rodando ao mesmo tempo
            if (timerCard) clearInterval(timerCard);
            // Troca a foto do card a cada 6 segundos (6000ms)
            timerCard = setInterval(proximoSlide, 6000);
        }

        // 3.2 Inicia a rotação automática
        iniciarTimer();

        // 3.3 Clique manual no leque
        slides.forEach((slide) => {
            slide.addEventListener('click', function (e) {
                e.stopPropagation();

                const isMobile = window.innerWidth <= 768;
                if (!isMobile && !slide.classList.contains('next')) return;

                // Avança o slide e reinicia o tempo de 6s para não trocar logo em seguida
                proximoSlide();
                iniciarTimer();
            });
        });
    });
}

// 3.4 Marca qual foto é ".active" (a vez) e qual é ".next" (a seguinte)
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
});
