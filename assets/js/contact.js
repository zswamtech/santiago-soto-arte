// 📞 Sistema de Contacto - Santiago Soto Arte
// Funcionalidades para conectar con clientes y colaboradores

// 📝 Modales de contacto según tipo de solicitud
const contactModals = {
    encargo: {
        title: "🎨 Solicitar Encargo Personalizado",
        content: `
            <div class="modal-form">
                <h3>Cuéntame sobre tu mascota</h3>
                <p>Cada retrato es único y especial. Comparte los detalles de tu compañero fiel:</p>

                <form class="contact-form" onsubmit="submitContactForm(event, 'encargo')">
                    <div class="form-group">
                        <label>Tu nombre:</label>
                        <input type="text" name="name" required placeholder="¿Cómo te llamas?">
                    </div>

                    <div class="form-group">
                        <label>Email de contacto:</label>
                        <input type="email" name="email" required placeholder="tu-email@ejemplo.com">
                    </div>

                    <div class="form-group">
                        <label>Nombre de tu mascota:</label>
                        <input type="text" name="petName" required placeholder="El nombre de tu compañero">
                    </div>

                    <div class="form-group">
                        <label>Tipo de mascota:</label>
                        <select name="petType" required>
                            <option value="">Selecciona...</option>
                            <option value="perro">Perro</option>
                            <option value="gato">Gato</option>
                            <option value="conejo">Conejo</option>
                            <option value="ave">Ave</option>
                            <option value="reptil">Reptil</option>
                            <option value="otro">Otro</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Tamaño de obra preferido:</label>
                        <select name="size">
                            <option value="pequeño">Pequeño (20x30 cm)</option>
                            <option value="mediano" selected>Mediano (30x40 cm)</option>
                            <option value="grande">Grande (40x60 cm)</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Cuéntame su historia:</label>
                        <textarea name="story" rows="4" placeholder="¿Qué hace especial a tu mascota? Sus gestos favoritos, personalidad, momentos únicos..."></textarea>
                    </div>

                    <div class="form-group">
                        <label>¿Tienes fotos de referencia?</label>
                        <p class="form-note">Puedes adjuntarlas por email después de enviar esta solicitud</p>
                        <input type="checkbox" name="hasPhotos" id="hasPhotos">
                        <label for="hasPhotos">Sí, tengo fotos para compartir</label>
                    </div>

                    <button type="submit" class="submit-btn">Enviar Solicitud 🎨</button>
                </form>

                <div class="pricing-info">
                    <h4>💰 Información de Precios</h4>
                    <ul>
                        <li>Pequeño (20x30 cm): $100 - $150</li>
                        <li>Mediano (30x40 cm): $150 - $250</li>
                        <li>Grande (40x60 cm): $250 - $400</li>
                    </ul>
                    <p><em>Los precios pueden variar según la complejidad del retrato</em></p>
                </div>
            </div>
        `
    },

    productos: {
        title: "💝 Productos Únicos con tu Arte",
        content: `
            <div class="modal-products">
                <h3>Lleva tu arte más allá del lienzo</h3>
                <p>¡Tu mascota puede acompañarte en muchas formas!</p>

                <div class="products-grid">
                    <div class="product-card">
                        <div class="product-icon">☕</div>
                        <h4>Vasos Personalizados</h4>
                        <p>Tu mascota en una taza especial para cada mañana</p>
                        <span class="price">$25 - $35</span>
                    </div>

                    <div class="product-card">
                        <div class="product-icon">👕</div>
                        <h4>Camisetas Artísticas</h4>
                        <p>Ropa única con el retrato de tu compañero</p>
                        <span class="price">$30 - $45</span>
                    </div>

                    <div class="product-card">
                        <div class="product-icon">📦</div>
                        <h4>Kit Memorial</h4>
                        <p>Un conjunto especial para honrar a tu mascota</p>
                        <span class="price">$80 - $120</span>
                    </div>

                    <div class="product-card">
                        <div class="product-icon">🖼️</div>
                        <h4>Prints de Alta Calidad</h4>
                        <p>Reproducciones profesionales de tu retrato</p>
                        <span class="price">$20 - $40</span>
                    </div>
                </div>

                <form class="contact-form" onsubmit="submitContactForm(event, 'productos')">
                    <h4>Solicita tu producto personalizado</h4>

                    <div class="form-group">
                        <label>Tu nombre:</label>
                        <input type="text" name="name" required>
                    </div>

                    <div class="form-group">
                        <label>Email:</label>
                        <input type="email" name="email" required>
                    </div>

                    <div class="form-group">
                        <label>Producto de interés:</label>
                        <select name="product" required>
                            <option value="">Selecciona un producto...</option>
                            <option value="vaso">Vaso Personalizado</option>
                            <option value="camiseta">Camiseta Artística</option>
                            <option value="kit">Kit Memorial</option>
                            <option value="print">Print de Alta Calidad</option>
                            <option value="otro">Otro (especificar)</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Mensaje adicional:</label>
                        <textarea name="message" rows="3" placeholder="Cuéntanos más detalles sobre lo que buscas..."></textarea>
                    </div>

                    <button type="submit" class="submit-btn">Solicitar Producto 💝</button>
                </form>
            </div>
        `
    },

    colaboracion: {
        title: "🤝 Colaboremos Juntos",
        content: `
            <div class="modal-collaboration">
                <h3>¡Me encanta trabajar en equipo!</h3>
                <p>Siempre estoy abierto a nuevas ideas y colaboraciones</p>

                <div class="collaboration-types">
                    <div class="collab-type">
                        <h4>🎨 Proyectos Artísticos</h4>
                        <p>Colaboraciones con otros artistas, murales, exposiciones</p>
                    </div>

                    <div class="collab-type">
                        <h4>📚 Educativo</h4>
                        <p>Talleres, clases, contenido educativo sobre arte</p>
                    </div>

                    <div class="collab-type">
                        <h4>🌟 Social</h4>
                        <p>Causas benéficas, refugios de animales, proyectos comunitarios</p>
                    </div>

                    <div class="collab-type">
                        <h4>💻 Digital</h4>
                        <p>NFTs, arte digital, plataformas online</p>
                    </div>
                </div>

                <form class="contact-form" onsubmit="submitContactForm(event, 'colaboracion')">
                    <div class="form-group">
                        <label>Tu nombre o organización:</label>
                        <input type="text" name="name" required>
                    </div>

                    <div class="form-group">
                        <label>Email de contacto:</label>
                        <input type="email" name="email" required>
                    </div>

                    <div class="form-group">
                        <label>Tipo de colaboración:</label>
                        <select name="collaborationType" required>
                            <option value="">Selecciona...</option>
                            <option value="artistico">Proyecto Artístico</option>
                            <option value="educativo">Proyecto Educativo</option>
                            <option value="social">Causa Social</option>
                            <option value="digital">Proyecto Digital</option>
                            <option value="otro">Otro</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Describe tu idea:</label>
                        <textarea name="idea" rows="5" required placeholder="¡Cuéntame tu idea! ¿Qué tienes en mente? ¿Cómo podríamos trabajar juntos?"></textarea>
                    </div>

                    <div class="form-group">
                        <label>Cronograma estimado:</label>
                        <select name="timeline">
                            <option value="urgente">Urgente (1-2 semanas)</option>
                            <option value="corto">Corto plazo (1 mes)</option>
                            <option value="mediano" selected>Mediano plazo (2-3 meses)</option>
                            <option value="largo">Largo plazo (6+ meses)</option>
                            <option value="flexible">Flexible</option>
                        </select>
                    </div>

                    <button type="submit" class="submit-btn">Proponer Colaboración 🤝</button>
                </form>
            </div>
        `
    }
};

// 🔄 Funciones para manejar el modal
function openContactModal(type) {
    const modal = document.getElementById('contactModal');
    const contentArea = document.getElementById('modal-content-area');

    if (contactModals[type]) {
        contentArea.innerHTML = `
            <h2>${contactModals[type].title}</h2>
            ${contactModals[type].content}
        `;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevenir scroll
    }
}

function closeContactModal() {
    const modal = document.getElementById('contactModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restaurar scroll
}

// 📤 Envío de formularios
function submitContactForm(event, type) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    // Simular envío (en la vida real, esto iría a un backend)
    console.log('Formulario enviado:', type, data);

    // Mostrar mensaje de éxito
    showSuccessMessage(type, data);

    // Cerrar modal después de un momento
    setTimeout(() => {
        closeContactModal();
    }, 2000);
}

// ✅ Mensajes de éxito personalizados
function showSuccessMessage(type, data) {
    const contentArea = document.getElementById('modal-content-area');

    let successMessage = '';

    switch(type) {
        case 'encargo':
            successMessage = `
                <div class="success-message">
                    <div class="success-icon">🎨✨</div>
                    <h3>¡Solicitud recibida!</h3>
                    <p>Hola <strong>${data.name}</strong>, ¡me emociona mucho crear el retrato de <strong>${data.petName}</strong>!</p>
                    <p>Te contactaré pronto para coordinar los detalles y las fotos de referencia.</p>
                    <div class="next-steps">
                        <h4>Próximos pasos:</h4>
                        <ol>
                            <li>Revisaré tu solicitud en 24-48 horas</li>
                            <li>Te enviaré un email para coordinar las fotos</li>
                            <li>Comenzaré el boceto inicial</li>
                            <li>¡Tu obra estará lista en 2-3 semanas!</li>
                        </ol>
                    </div>
                </div>
            `;
            break;

        case 'productos':
            successMessage = `
                <div class="success-message">
                    <div class="success-icon">💝✨</div>
                    <h3>¡Genial elección!</h3>
                    <p>Hola <strong>${data.name}</strong>, el producto <strong>${data.product}</strong> será increíble!</p>
                    <p>Te contactaré para coordinar los detalles de producción y envío.</p>
                </div>
            `;
            break;

        case 'colaboracion':
            successMessage = `
                <div class="success-message">
                    <div class="success-icon">🤝✨</div>
                    <h3>¡Qué emocionante!</h3>
                    <p><strong>${data.name}</strong>, tu idea de colaboración suena fantástica.</p>
                    <p>Revisaré tu propuesta y te contactaré para explorar juntos esta oportunidad.</p>
                </div>
            `;
            break;
    }

    contentArea.innerHTML = successMessage;
}

// 🎯 Event listeners globales
document.addEventListener('DOMContentLoaded', function() {
    // Cerrar modal al hacer click fuera de él
    const modal = document.getElementById('contactModal');
    if (modal) {
        window.onclick = function(event) {
            if (event.target === modal) {
                closeContactModal();
            }
        };
    }

    // Cerrar modal con tecla Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeContactModal();
        }
    });
});