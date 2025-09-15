// Smooth scrolling function
function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({
        behavior: 'smooth'
    });
}

// Gallery functionality
const artworks = [
    {
        id: 1,
        title: "Sueños Digitales",
        category: "digital",
        description: "Una exploración de mundos fantásticos",
        image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=300&fit=crop"
    },
    {
        id: 2,
        title: "Colores del Alma",
        category: "abstracto",
        description: "Expresión pura de emociones",
        image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop"
    },
    {
        id: 3,
        title: "Naturaleza Urbana",
        category: "tradicional",
        description: "Fusión entre lo natural y lo artificial",
        image: "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400&h=300&fit=crop"
    },
    {
        id: 4,
        title: "Reflexiones",
        category: "digital",
        description: "Autoexploración a través del arte",
        image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop"
    },
    {
        id: 5,
        title: "Energia Cósmica",
        category: "abstracto",
        description: "Fuerzas invisibles del universo",
        image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=300&fit=crop"
    },
    {
        id: 6,
        title: "Retrato de la Juventud",
        category: "tradicional",
        description: "La perspectiva única de los 14 años",
        image: "https://images.unsplash.com/photo-1592754862816-1a21a4ea2281?w=400&h=300&fit=crop"
    }
];

// Render gallery
function renderGallery(filter = 'all') {
    const galleryGrid = document.getElementById('galleryGrid');
    const filteredArtworks = filter === 'all' ? artworks : artworks.filter(art => art.category === filter);

    galleryGrid.innerHTML = filteredArtworks.map(artwork => `
        <div class="artwork-card" data-category="${artwork.category}">
            <div class="artwork-image" style="background-image: url('${artwork.image}')"></div>
            <div class="artwork-info">
                <h3>${artwork.title}</h3>
                <p>${artwork.description}</p>
            </div>
        </div>
    `).join('');
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