// 🎨 Galería de Obras Reales - Santiago Soto Arte
// Aquí se agregan las obras reales de Santiago cuando estén disponibles

const realArtworks = [
    // Ejemplo de estructura para cuando tengas las obras reales:
    // {
    //     id: 1,
    //     title: "Max, mi primer retrato",
    //     animal: "Golden Retriever",
    //     technique: "Óleo sobre lienzo",
    //     size: "40x30 cm",
    //     year: 2024,
    //     status: "disponible", // disponible, vendida, exhibición
    //     story: "Mi primera obra con óleo. Max es el perro de mi vecino y siempre me saludaba cuando salía a pintar al aire libre. Quise capturar su mirada tan noble y su pelaje dorado bajo la luz del atardecer.",
    //     image: "assets/images/gallery-real/max-golden-retriever-2024.jpg",
    //     price: "$150" // Opcional
    // },
    // {
    //     id: 2,
    //     title: "Luna en Reposo",
    //     animal: "Gata Persa",
    //     technique: "Óleo sobre canvas",
    //     size: "35x25 cm",
    //     year: 2024,
    //     status: "vendida",
    //     story: "Luna es la gata de mi tía. Me encantó cómo la luz se reflejaba en su pelaje blanco mientras dormía cerca de la ventana. Fue un reto técnico pintar todas las texturas de su pelaje.",
    //     image: "assets/images/gallery-real/luna-gata-persa-2024.jpg",
    //     soldDate: "2024-08-15"
    // }

    // 📝 Placeholder temporal con mensaje inspirador
    {
        id: 'placeholder',
        title: "Próximas Obras Maestras",
        message: "Aquí aparecerán las increíbles obras reales de Santiago. ¡Cada pincelada cuenta una historia única!",
        status: "coming-soon",
        encouragement: "Santiago, tus obras reales pronto llenarán esta galería. ¡Sigue pintando con pasión! 🎨✨"
    }
];

// 🔄 Función para renderizar la galería real
function renderRealGallery() {
    const realGalleryContainer = document.getElementById('real-gallery-grid');
    if (!realGalleryContainer) return;

    // Si solo tenemos placeholder, mostrar mensaje inspirador
    if (realArtworks.length === 1 && realArtworks[0].id === 'placeholder') {
        realGalleryContainer.innerHTML = `
            <div class="coming-soon-message">
                <div class="coming-soon-content">
                    <h3>🎨 ${realArtworks[0].title}</h3>
                    <p>${realArtworks[0].message}</p>
                    <div class="encouragement">
                        <p><em>${realArtworks[0].encouragement}</em></p>
                    </div>
                    <div class="upload-guide">
                        <h4>📸 ¿Cómo subir tus obras?</h4>
                        <ol>
                            <li>Toma fotos de buena calidad de tus pinturas</li>
                            <li>Guárdalas en <code>assets/images/gallery-real/</code></li>
                            <li>Agrega la información en <code>real-artworks.js</code></li>
                            <li>¡Tu galería personal cobrará vida!</li>
                        </ol>
                    </div>
                </div>
            </div>
        `;
        return;
    }

    // Renderizar obras reales
    realGalleryContainer.innerHTML = realArtworks
        .filter(artwork => artwork.id !== 'placeholder')
        .map(artwork => {
            const statusBadge = artwork.status === 'vendida' ?
                '<span class="status-badge sold">Vendida</span>' :
                artwork.status === 'disponible' ?
                '<span class="status-badge available">Disponible</span>' :
                '<span class="status-badge exhibition">En Exhibición</span>';

            return `
                <div class="real-artwork-card" data-id="${artwork.id}">
                    <div class="real-artwork-image" style="background-image: url('${artwork.image}')">
                        ${statusBadge}
                    </div>
                    <div class="real-artwork-info">
                        <h3>${artwork.title}</h3>
                        <p class="artwork-details">
                            <strong>${artwork.animal}</strong><br>
                            ${artwork.technique} • ${artwork.size} • ${artwork.year}
                        </p>
                        <p class="artwork-story">${artwork.story}</p>
                        ${artwork.price ? `<p class="artwork-price">${artwork.price}</p>` : ''}
                        ${artwork.soldDate ? `<p class="sold-date">Vendida el ${artwork.soldDate}</p>` : ''}
                    </div>
                </div>
            `;
        }).join('');
}

// 📊 Estadísticas de obras reales
function getRealArtworkStats() {
    const real = realArtworks.filter(art => art.id !== 'placeholder');
    return {
        total: real.length,
        available: real.filter(art => art.status === 'disponible').length,
        sold: real.filter(art => art.status === 'vendida').length,
        exhibition: real.filter(art => art.status === 'exhibición').length
    };
}

// 🎯 Función para actualizar estadísticas en el dashboard
function updateArtworkStats() {
    const stats = getRealArtworkStats();
    const statsContainer = document.getElementById('artwork-stats');

    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="stat-item">
                <span class="stat-number">${stats.total}</span>
                <span class="stat-label">Obras Creadas</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${stats.sold}</span>
                <span class="stat-label">Vendidas</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${stats.available}</span>
                <span class="stat-label">Disponibles</span>
            </div>
        `;
    }
}

// 🔍 Filtro para galería real
function filterRealArtworks(status = 'all') {
    const cards = document.querySelectorAll('.real-artwork-card');

    cards.forEach(card => {
        const cardStatus = card.querySelector('.status-badge').textContent.toLowerCase();

        if (status === 'all') {
            card.style.display = 'block';
        } else if (status === 'disponible' && cardStatus.includes('disponible')) {
            card.style.display = 'block';
        } else if (status === 'vendida' && cardStatus.includes('vendida')) {
            card.style.display = 'block';
        } else if (status === 'exhibición' && cardStatus.includes('exhibición')) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// 🚀 Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Renderizar galería real si existe el contenedor
    if (document.getElementById('real-gallery-grid')) {
        renderRealGallery();
        updateArtworkStats();
    }

    // Event listeners para filtros de galería real
    const realFilterButtons = document.querySelectorAll('.real-filter-btn');
    realFilterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            realFilterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const filter = this.getAttribute('data-filter');
            filterRealArtworks(filter);
        });
    });
});