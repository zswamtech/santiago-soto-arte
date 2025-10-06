// Smooth scrolling function
function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({
        behavior: 'smooth'
    });
}

// Gallery functionality - Santiago's Art Collection (IDs alineados con modal detallado)
const artworks = [
    {
        id: 'max-golden',
        title: "Max, el Golden Retriever",
        category: "tradicional",
        description: "Óleo sobre lienzo - Retrato de mi perro favorito del barrio",
        image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop"
    },
    {
        id: 'luna-gata',
        title: "Luna, la Gata Misteriosa",
        category: "digital",
        description: "Arte digital - Capturando la elegancia felina",
        image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop"
    },
    {
        id: 'buddy-parque',
        title: "Buddy en el Parque",
        category: "tradicional",
        description: "Acrílico - La alegría pura de un perro jugando",
        image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop"
    },
    {
        id: 'reflexiones-caninas',
        title: "Reflexiones Caninas",
        category: "digital",
        description: "Composición digital - La mirada profunda de un Border Collie",
        image: "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&h=300&fit=crop"
    },
    {
        id: 'trio-gatitos',
        title: "Trio de Gatitos",
        category: "abstracto",
        description: "Técnica mixta - Interpretación colorida de tres hermanos felinos",
        image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=300&fit=crop"
    },
    {
        id: 'charlie-bulldog',
        title: "Charlie, el Bulldog Francés",
        category: "tradicional",
        description: "Óleo sobre canvas - Mi primera obra vendida",
        image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=300&fit=crop"
    },
    {
        id: 'mundo-felino',
        title: "Mundo Felino Digital",
        category: "digital",
        description: "Ilustración digital - Universo fantástico de gatos voladores",
        image: "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400&h=300&fit=crop"
    },
    {
        id: 'rex-pastor',
        title: "Rex, el Pastor Alemán",
        category: "tradicional",
        description: "Carboncillo y pastel - Retrato de un perro guardián noble",
        image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop"
    },
    {
        id: 'colores-amistad',
        title: "Colores de la Amistad",
        category: "abstracto",
        description: "Acrílico abstracto - La conexión entre humanos y mascotas",
        image: "https://images.unsplash.com/photo-1592754862816-1a21a4ea2281?w=400&h=300&fit=crop"
    }
];

// Render gallery
function renderGallery(filter = 'all') {
    const galleryGrid = document.getElementById('galleryGrid');
    if (!galleryGrid) return;
    const filteredArtworks = filter === 'all' ? artworks : artworks.filter(art => art.category === filter);

    galleryGrid.innerHTML = filteredArtworks.map(artwork => `
        <div class="artwork-card" data-category="${artwork.category}" data-artwork-id="${artwork.id}">
            <div class="artwork-image" style="background-image: url('${artwork.image}')"></div>
            <div class="artwork-info">
                <h3>${artwork.title}</h3>
                <p>${artwork.description}</p>
            </div>
        </div>
    `).join('');

    // Si el modal ya está inicializado, re-enlazar listeners
    if (typeof attachArtworkCardListeners === 'function') {
        attachArtworkCardListeners();
    }
}

// Filter functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initial gallery render
    renderGallery();

    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');

            // Filter gallery
            const filter = this.getAttribute('data-filter');
            renderGallery(filter);
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Contact button functionality
    document.querySelector('.contact-btn').addEventListener('click', function() {
        alert('¡Gracias por tu interés! Próximamente habilitaremos el formulario de contacto.');
    });

    // Add click animation to artwork cards
    document.addEventListener('click', function(e) {
        if (e.target.closest('.artwork-card')) {
            const card = e.target.closest('.artwork-card');
            card.style.transform = 'scale(0.98)';
            setTimeout(() => {
                card.style.transform = 'translateY(-10px)';
            }, 100);
        }
    });
});

// ==========================================
// SISTEMA DE MODAL PARA GALERÍA DETALLADA
// ==========================================

// Base de datos extendida de obras con información completa
const artworksDetailedData = {
    'max-golden': {
        title: 'Max, el Golden Retriever',
        subtitle: 'Óleo sobre lienzo',
        category: 'tradicional',
        image: 'assets/images/max-golden.jpg',
        badge: 'Obra de Práctica',
        story: `Max es un Golden Retriever del barrio que siempre me recibe con alegría cuando paso por su casa. Esta obra fue uno de mis primeros intentos serios de capturar la textura del pelaje con óleo. Me tomó aproximadamente 3 semanas completarla, dedicando las tardes después de clases. Lo más difícil fue lograr el brillo en sus ojos, esa mirada que transmite tanta felicidad y lealtad.`,
        technique: 'Óleo sobre lienzo',
        dimensions: '40cm × 50cm',
        duration: '3 semanas',
        year: '2024',
        status: 'Colección personal',
        inspiration: 'El amor incondicional de las mascotas',
        tags: ['Perros', 'Realismo', 'Óleo', 'Retrato']
    },
    'luna-gata': {
        title: 'Luna, la Gata Misteriosa',
        subtitle: 'Arte digital',
        category: 'digital',
        image: 'assets/images/luna-cat.jpg',
        badge: 'Arte Digital',
        story: `Luna es la gata de una vecina, conocida por su elegancia y personalidad independiente. Esta fue mi primera exploración seria en arte digital, usando una tableta gráfica. Quería experimentar con técnicas diferentes al óleo y descubrir nuevas formas de expresión. Me fascinó la libertad de poder corregir y experimentar sin desperdiciar materiales.`,
        technique: 'Ilustración digital',
        dimensions: 'Digital - 3000px × 4000px',
        duration: '1 semana',
        year: '2024',
        status: 'Disponible como print',
        inspiration: 'La elegancia felina',
        tags: ['Gatos', 'Digital', 'Ilustración', 'Experimental']
    },
    'buddy-parque': {
        title: 'Buddy en el Parque',
        subtitle: 'Acrílico sobre lienzo',
        category: 'tradicional',
        image: 'assets/images/buddy-park.jpg',
        badge: 'Acrílico',
        story: `Buddy es un perro que conocí en el parque durante mis caminatas de observación. Su energía pura y alegría de vivir me inspiraron a capturar ese momento de felicidad absoluta. Usé acrílico porque quería colores más vibrantes y un secado más rápido que el óleo. Esta obra representa la libertad y la alegría simple de correr en un día soleado.`,
        technique: 'Acrílico sobre lienzo',
        dimensions: '35cm × 45cm',
        duration: '2 semanas',
        year: '2024',
        status: 'Vendida',
        inspiration: 'La alegría pura',
        tags: ['Perros', 'Acrílico', 'Movimiento', 'Naturaleza']
    },
    'reflexiones-caninas': {
        title: 'Reflexiones Caninas',
        subtitle: 'Composición digital',
        category: 'digital',
        image: 'assets/images/border-collie.jpg',
        badge: 'Digital',
        story: `Este Border Collie me impactó por su mirada profunda e inteligente. Quise capturar no solo su apariencia física, sino esa conexión casi humana en sus ojos. Experimenté con capas digitales para lograr profundidad y textura similar al óleo tradicional. Es un estudio sobre la inteligencia y sensibilidad de los perros pastores.`,
        technique: 'Arte digital con capas',
        dimensions: 'Digital - 2500px × 3500px',
        duration: '10 días',
        year: '2024',
        status: 'Disponible',
        inspiration: 'Inteligencia animal',
        tags: ['Perros', 'Digital', 'Retrato', 'Border Collie']
    },
    'trio-gatitos': {
        title: 'Trio de Gatitos',
        subtitle: 'Técnica mixta',
        category: 'tradicional',
        image: 'assets/images/three-kittens.jpg',
        badge: 'Técnica Mixta',
        story: `Tres hermanos gatitos que fotografié en una visita familiar. Decidí experimentar mezclando acuarela con lápices de colores para lograr una textura única. Cada gatito tiene su propia personalidad y quise resaltarla con colores diferentes pero armoniosos. Fue un desafío técnico pero muy divertido de realizar.`,
        technique: 'Acuarela y lápices de colores',
        dimensions: '30cm × 40cm',
        duration: '2 semanas',
        year: '2024',
        status: 'Colección personal',
        inspiration: 'La ternura felina',
        tags: ['Gatos', 'Técnica mixta', 'Color', 'Ternura']
    },
    'charlie-bulldog': {
        title: 'Charlie, el Bulldog Francés',
        subtitle: 'Óleo sobre canvas - Primera obra vendida',
        category: 'tradicional',
        image: 'assets/images/french-bulldog.jpg',
        badge: '⭐ Primera Venta',
        story: `Charlie es especial para mí porque fue mi primera obra vendida. El dueño me contactó después de ver mis trabajos en redes sociales. Trabajé con especial dedicación, queriendo dar lo mejor de mí. Las arrugas características del bulldog fueron un desafío fascinante de texturizar. Esta venta me dio la confianza de que puedo vivir de mi arte.`,
        technique: 'Óleo sobre canvas',
        dimensions: '45cm × 55cm',
        duration: '4 semanas',
        year: '2024',
        status: 'Vendida - ⭐ Primera obra vendida',
        inspiration: 'Confianza en mi arte',
        tags: ['Perros', 'Óleo', 'Retrato', 'Hito personal']
    },
    'mundo-felino': {
        title: 'Mundo Felino Digital',
        subtitle: 'Ilustración digital fantástica',
        category: 'digital',
        image: 'assets/images/flying-cats.jpg',
        badge: 'Fantasía',
        story: `Un experimento de dejar volar la imaginación. Quise crear algo más allá del realismo, un universo donde los gatos vuelan libremente. Es mi forma de expresar que el arte no tiene límites. Usé colores vibrantes y composición dinámica para crear movimiento y energía. Representa la libertad creativa.`,
        technique: 'Ilustración digital completa',
        dimensions: 'Digital - 4000px × 5000px',
        duration: '2 semanas',
        year: '2024',
        status: 'Disponible como print',
        inspiration: 'Imaginación sin límites',
        tags: ['Gatos', 'Digital', 'Fantasía', 'Experimental']
    },
    'rex-pastor': {
        title: 'Rex, el Pastor Alemán',
        subtitle: 'Carboncillo y pastel',
        category: 'tradicional',
        image: 'assets/images/german-shepherd.jpg',
        badge: 'Carboncillo',
        story: `Rex es un perro guardián de una finca que visité. Su porte noble y mirada vigilante me inspiraron a trabajar con carboncillo. Quería capturar la fuerza y elegancia del pastor alemán en tonos dramáticos. Los pasteles añadieron toques sutiles de color para dar vida sin perder el drama del blanco y negro.`,
        technique: 'Carboncillo con toques de pastel',
        dimensions: '40cm × 50cm',
        duration: '1.5 semanas',
        year: '2024',
        status: 'Disponible',
        inspiration: 'Nobleza y lealtad',
        tags: ['Perros', 'Carboncillo', 'Dramático', 'Retrato']
    },
    'colores-amistad': {
        title: 'Colores de la Amistad',
        subtitle: 'Acrílico abstracto',
        category: 'abstracto',
        image: 'assets/images/abstract-pets.jpg',
        badge: 'Abstracto',
        story: `Una exploración abstracta de la conexión entre humanos y mascotas. No quise representar una mascota específica, sino el sentimiento de amor y compañía. Usé colores cálidos que se mezclan y complementan, como lo hacen las mascotas con nuestras vidas. Es mi obra más experimental y personal.`,
        technique: 'Acrílico abstracto con espátula',
        dimensions: '50cm × 60cm',
        duration: '1 semana',
        year: '2024',
        status: 'Colección personal',
        inspiration: 'El vínculo humano-animal',
        tags: ['Abstracto', 'Acrílico', 'Experimental', 'Emocional']
    }
};

let currentArtworkId = null;
let artworkIds = Object.keys(artworksDetailedData);
let lastFocusedCard = null; // Para restaurar foco al cerrar

// Construir hash legible para cada obra
function buildArtworkHash(id) {
    return `#obra-${id}`;
}

function ensureModalStructure() {
    if (!document.getElementById('artwork-modal')) {
        const modalHTML = `
            <div id="artwork-modal" class="artwork-modal" aria-hidden="true" role="dialog">
                <div class="modal-artwork-content">
                    <button class="modal-close-btn" aria-label="Cerrar" onclick="closeArtworkModal()">×</button>
                    <button class="modal-back-btn" type="button" aria-label="Volver a la galería" onclick="closeArtworkModal('back-btn')">← Volver</button>
                    <div class="modal-artwork-grid">
                        <div class="modal-artwork-image-section">
                            <div class="artwork-badge" id="modal-badge"></div>
                            <img id="modal-artwork-image" class="modal-artwork-image" src="" alt="">
                            <div class="artwork-navigation">
                                <button class="nav-artwork-btn" id="prev-artwork" onclick="navigateArtwork('prev')">← Anterior</button>
                                <button class="nav-artwork-btn" id="next-artwork" onclick="navigateArtwork('next')">Siguiente →</button>
                            </div>
                        </div>
                        <div class="modal-artwork-info-section">
                            <h2 class="artwork-title-main" id="modal-title" tabindex="-1"></h2>
                            <p class="artwork-subtitle" id="modal-subtitle"></p>
                            <div class="artwork-story">
                                <h3>📖 Historia de la Obra</h3>
                                <p id="modal-story"></p>
                            </div>
                            <div class="artwork-details-grid">
                                <div class="detail-item"><div class="detail-label">🎨 Técnica</div><div class="detail-value" id="modal-technique"></div></div>
                                <div class="detail-item"><div class="detail-label">📏 Dimensiones</div><div class="detail-value" id="modal-dimensions"></div></div>
                                <div class="detail-item"><div class="detail-label">⏱️ Duración</div><div class="detail-value" id="modal-duration"></div></div>
                                <div class="detail-item"><div class="detail-label">📅 Año</div><div class="detail-value" id="modal-year"></div></div>
                                <div class="detail-item"><div class="detail-label">✨ Estado</div><div class="detail-value" id="modal-status"></div></div>
                                <div class="detail-item"><div class="detail-label">💡 Inspiración</div><div class="detail-value" id="modal-inspiration"></div></div>
                            </div>
                            <div class="artwork-tags" id="modal-tags"></div>
                        </div>
                    </div>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
}

function attachArtworkCardListeners() {
    document.querySelectorAll('.artwork-card[data-artwork-id]').forEach(card => {
        if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0'); // accesible
        card.addEventListener('click', () => {
            const id = card.getAttribute('data-artwork-id');
            if (artworksDetailedData[id]) {
                lastFocusedCard = card;
                openArtworkModal(id);
            }
        });
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const id = card.getAttribute('data-artwork-id');
                if (artworksDetailedData[id]) {
                    lastFocusedCard = card;
                    openArtworkModal(id);
                }
            }
        });
    });
}

function initArtworkModal() {
    ensureModalStructure();
    attachArtworkCardListeners();

    const modal = document.getElementById('artwork-modal');
    if (modal) {
        modal.addEventListener('click', e => { if (e.target === modal) closeArtworkModal('overlay'); });
    }
    document.addEventListener('keydown', e => {
        if (!currentArtworkId) return; // Solo cuando el modal está activo
        if (e.key === 'Escape') closeArtworkModal('esc');
        if (e.key === 'ArrowRight') navigateArtwork('next');
        if (e.key === 'ArrowLeft') navigateArtwork('prev');
    });

    // Apertura directa vía hash (#obra-id)
    if (location.hash.startsWith('#obra-')) {
        const id = location.hash.replace('#obra-','');
        if (artworksDetailedData[id]) openArtworkModal(id);
    }

    // Navegación del historial
    window.addEventListener('popstate', () => {
        if (location.hash.startsWith('#obra-')) {
            const id = location.hash.replace('#obra-','');
            if (artworksDetailedData[id]) {
                openArtworkModal(id);
            }
        } else if (currentArtworkId) {
            closeArtworkModal('popstate');
        }
    });
    console.log('✅ Modal de galería listo con navegación mejorada');
}

function openArtworkModal(artworkId) {
    const artwork = artworksDetailedData[artworkId];
    if (!artwork) return;
    currentArtworkId = artworkId;
    document.getElementById('modal-badge').textContent = artwork.badge;
    document.getElementById('modal-artwork-image').src = artwork.image;
    document.getElementById('modal-artwork-image').alt = artwork.title;
    document.getElementById('modal-title').textContent = artwork.title;
    document.getElementById('modal-subtitle').textContent = artwork.subtitle;
    document.getElementById('modal-story').textContent = artwork.story;
    document.getElementById('modal-technique').textContent = artwork.technique;
    document.getElementById('modal-dimensions').textContent = artwork.dimensions;
    document.getElementById('modal-duration').textContent = artwork.duration;
    document.getElementById('modal-year').textContent = artwork.year;
    document.getElementById('modal-status').textContent = artwork.status;
    document.getElementById('modal-inspiration').textContent = artwork.inspiration;
    const tagsContainer = document.getElementById('modal-tags');
    tagsContainer.innerHTML = artwork.tags.map(t => `<span class="artwork-tag">${t}</span>`).join('');
    updateNavigationButtons();
    document.getElementById('artwork-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
    const newHash = buildArtworkHash(artworkId);
    if (location.hash !== newHash) {
        history.pushState({ artworkId }, '', newHash);
    }
    const titleEl = document.getElementById('modal-title');
    if (titleEl) titleEl.focus({ preventScroll: true });
}

function closeArtworkModal(trigger = 'close') {
    const modal = document.getElementById('artwork-modal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    currentArtworkId = null;
    if (trigger !== 'popstate' && location.hash.startsWith('#obra-')) {
        // Volver a la sección galería si existe
        if (document.getElementById('galeria')) {
            history.pushState({}, '', '#galeria');
        } else {
            history.pushState({}, '', '#');
        }
    }
    if (lastFocusedCard) {
        setTimeout(() => lastFocusedCard.focus({ preventScroll: false }), 40);
    }
}

function navigateArtwork(direction) {
    const idx = artworkIds.indexOf(currentArtworkId);
    if (idx === -1) return;
    const newIndex = direction === 'prev' ? idx - 1 : idx + 1;
    if (newIndex >= 0 && newIndex < artworkIds.length) {
        openArtworkModal(artworkIds[newIndex]);
    }
}

function updateNavigationButtons() {
    const idx = artworkIds.indexOf(currentArtworkId);
    const prevBtn = document.getElementById('prev-artwork');
    const nextBtn = document.getElementById('next-artwork');
    if (prevBtn) prevBtn.disabled = idx <= 0;
    if (nextBtn) nextBtn.disabled = idx >= artworkIds.length - 1;
}

// Inicializar modal tras primera renderización de la galería
document.addEventListener('DOMContentLoaded', () => {
    initArtworkModal();
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe sections for scroll animations
document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'all 0.6s ease';
        observer.observe(section);
    });
});

// 🔄 Función para cambiar entre galerías
function switchGallery(galleryType, clickedButton) {
    // Actualizar tabs
    const tabs = document.querySelectorAll('.gallery-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    if (clickedButton) {
        clickedButton.classList.add('active');
    }

    // Actualizar contenido
    const galleries = document.querySelectorAll('.gallery-content');
    galleries.forEach(gallery => gallery.classList.remove('active'));

    if (galleryType === 'practice') {
        document.getElementById('practice-gallery').classList.add('active');
    } else if (galleryType === 'real') {
        document.getElementById('real-gallery').classList.add('active');
        // Asegurarse de que la galería real esté renderizada
        setTimeout(() => {
            if (typeof renderRealGallery === 'function') {
                renderRealGallery();
            }
        }, 100);
    }
}

// ==========================================
// 🍔 HAMBURGER MENU - MOBILE NAVIGATION
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('nav-menu');
    const menuOverlay = document.getElementById('menu-overlay');
    const navLinks = document.querySelectorAll('.nav-link');
    const body = document.body;

    // Función para abrir el menú
    function openMenu() {
        hamburgerBtn.classList.add('active');
        navMenu.classList.add('active');
        menuOverlay.classList.add('active');
        body.classList.add('menu-open');
        hamburgerBtn.setAttribute('aria-expanded', 'true');
        hamburgerBtn.setAttribute('aria-label', 'Cerrar menú');
    }

    // Función para cerrar el menú
    function closeMenu() {
        hamburgerBtn.classList.remove('active');
        navMenu.classList.remove('active');
        menuOverlay.classList.remove('active');
        body.classList.remove('menu-open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        hamburgerBtn.setAttribute('aria-label', 'Abrir menú');
    }

    // Toggle menú al hacer clic en el botón hamburger
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', function() {
            if (navMenu.classList.contains('active')) {
                closeMenu();
            } else {
                openMenu();
            }
        });
    }

    // Cerrar menú al hacer clic en el overlay
    if (menuOverlay) {
        menuOverlay.addEventListener('click', closeMenu);
    }

    // Cerrar menú al hacer clic en un link de navegación
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            closeMenu();
            // Permitir que la navegación suave continúe
        });
    });

    // Cerrar menú con tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            closeMenu();
        }
    });

    // Cerrar menú al cambiar orientación del dispositivo
    window.addEventListener('orientationchange', function() {
        if (navMenu.classList.contains('active')) {
            closeMenu();
        }
    });

    // Cerrar menú al redimensionar a desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
            closeMenu();
        }
    });
});