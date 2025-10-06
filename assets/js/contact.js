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

                <!-- Pestañas de categorías -->
                <div class="product-categories">
                    <button class="category-tab active" onclick="switchProductCategory(event, 'papeleria')">📓 Papelería</button>
                    <button class="category-tab" onclick="switchProductCategory(event, 'ropa')">👕 Ropa & Textiles</button>
                    <button class="category-tab" onclick="switchProductCategory(event, 'hogar')">🏠 Hogar & Deco</button>
                    <button class="category-tab" onclick="switchProductCategory(event, 'especiales')">✨ Especiales</button>
                </div>

                <!-- Categoría: Papelería -->
                <div class="product-category-content active" data-category="papeleria">
                    <h4 class="category-title">📓 Papelería Personalizada</h4>
                    <div class="products-grid">
                        <div class="product-card">
                            <div class="product-icon">📓</div>
                            <h4>Cuaderno Argollado A4</h4>
                            <p>Cuaderno tamaño carta con arte de tu mascota y argollado profesional</p>
                            <span class="price">$18 - $28</span>
                            <button class="add-to-cart-btn" data-item='{"id":"notebook_a4","type":"product","name":"Cuaderno Argollado A4","description":"Cuaderno tamaño carta argollado con arte personalizado","price":23,"image":null}'>
                                🛒 Añadir al Carrito
                            </button>
                        </div>

                        <div class="product-card">
                            <div class="product-icon">📔</div>
                            <h4>Cuaderno Argollado A5</h4>
                            <p>Libreta mediana perfecta para llevar a todas partes</p>
                            <span class="price">$15 - $22</span>
                            <button class="add-to-cart-btn" data-item='{"id":"notebook_a5","type":"product","name":"Cuaderno Argollado A5","description":"Libreta mediana argollada personalizada","price":18,"image":null}'>
                                🛒 Añadir al Carrito
                            </button>
                        </div>

                        <div class="product-card">
                            <div class="product-icon">🗒️</div>
                            <h4>Libreta Pocket</h4>
                            <p>Pequeña y práctica, ideal para bolsillo o cartera</p>
                            <span class="price">$12 - $18</span>
                            <button class="add-to-cart-btn" data-item='{"id":"notebook_pocket","type":"product","name":"Libreta Pocket","description":"Libreta pequeña argollada para bolsillo","price":15,"image":null}'>
                                🛒 Añadir al Carrito
                            </button>
                        </div>

                        <div class="product-card">
                            <div class="product-icon">📒</div>
                            <h4>Set de 3 Libretas</h4>
                            <p>Combo de tamaños variados con diseño coordinado</p>
                            <span class="price">$40 - $55</span>
                            <button class="add-to-cart-btn" data-item='{"id":"notebook_set","type":"product","name":"Set de 3 Libretas","description":"Combo de 3 libretas argolladas de diferentes tamaños","price":48,"image":null}'>
                                🛒 Añadir al Carrito
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Categoría: Ropa & Textiles -->
                <div class="product-category-content" data-category="ropa">
                    <h4 class="category-title">👕 Ropa & Textiles Personalizados</h4>
                    <div class="products-grid">
                        <div class="product-card">
                            <div class="product-icon">👕</div>
                            <h4>Camiseta Básica</h4>
                            <p>Camiseta 100% algodón con el arte de tu mascota</p>
                            <span class="price">$25 - $35</span>
                            <button class="add-to-cart-btn" data-item='{"id":"tshirt_basic","type":"product","name":"Camiseta Básica Personalizada","description":"Camiseta 100% algodón con arte de mascota","price":30,"image":null}'>
                                🛒 Añadir al Carrito
                            </button>
                        </div>

                        <div class="product-card">
                            <div class="product-icon">🎽</div>
                            <h4>Camisa Polo</h4>
                            <p>Polo elegante con bordado o estampado discreto</p>
                            <span class="price">$35 - $50</span>
                            <button class="add-to-cart-btn" data-item='{"id":"polo_shirt","type":"product","name":"Camisa Polo Personalizada","description":"Polo con arte bordado o estampado","price":42,"image":null}'>
                                🛒 Añadir al Carrito
                            </button>
                        </div>

                        <div class="product-card">
                            <div class="product-icon">🧥</div>
                            <h4>Sudadera / Hoodie</h4>
                            <p>Sudadera con capucha, perfecta para el frío</p>
                            <span class="price">$45 - $65</span>
                            <button class="add-to-cart-btn" data-item='{"id":"hoodie","type":"product","name":"Sudadera Personalizada","description":"Hoodie con arte de mascota","price":55,"image":null}'>
                                🛒 Añadir al Carrito
                            </button>
                        </div>

                        <div class="product-card">
                            <div class="product-icon">👔</div>
                            <h4>Camisa de Vestir</h4>
                            <p>Camisa formal con detalle artístico sutil</p>
                            <span class="price">$40 - $60</span>
                            <button class="add-to-cart-btn" data-item='{"id":"dress_shirt","type":"product","name":"Camisa de Vestir Personalizada","description":"Camisa formal con detalle artístico","price":50,"image":null}'>
                                🛒 Añadir al Carrito
                            </button>
                        </div>

                        <div class="product-card">
                            <div class="product-icon">🧢</div>
                            <h4>Gorra Personalizada</h4>
                            <p>Gorra bordada con el retrato de tu mascota</p>
                            <span class="price">$22 - $32</span>
                            <button class="add-to-cart-btn" data-item='{"id":"cap","type":"product","name":"Gorra Personalizada","description":"Gorra bordada con arte de mascota","price":27,"image":null}'>
                                🛒 Añadir al Carrito
                            </button>
                        </div>

                        <div class="product-card">
                            <div class="product-icon">🎒</div>
                            <h4>Mochila / Tote Bag</h4>
                            <p>Bolsa de tela resistente con diseño único</p>
                            <span class="price">$28 - $42</span>
                            <button class="add-to-cart-btn" data-item='{"id":"tote_bag","type":"product","name":"Mochila/Tote Personalizado","description":"Bolsa de tela con arte personalizado","price":35,"image":null}'>
                                🛒 Añadir al Carrito
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Categoría: Hogar & Decoración -->
                <div class="product-category-content" data-category="hogar">
                    <h4 class="category-title">🏠 Hogar & Decoración</h4>
                    <div class="products-grid">
                        <div class="product-card">
                            <div class="product-icon">☕</div>
                            <h4>Taza Personalizada</h4>
                            <p>Taza de cerámica con el arte de tu mascota</p>
                            <span class="price">$18 - $28</span>
                            <button class="add-to-cart-btn" data-item='{"id":"mug","type":"product","name":"Taza Personalizada","description":"Taza de cerámica con arte de mascota","price":23,"image":null}'>
                                🛒 Añadir al Carrito
                            </button>
                        </div>

                        <div class="product-card">
                            <div class="product-icon">🍽️</div>
                            <h4>Set de Tazas (2 uds)</h4>
                            <p>Pareja de tazas con diseño coordinado</p>
                            <span class="price">$32 - $48</span>
                            <button class="add-to-cart-btn" data-item='{"id":"mug_set","type":"product","name":"Set de 2 Tazas","description":"Par de tazas personalizadas","price":40,"image":null}'>
                                🛒 Añadir al Carrito
                            </button>
                        </div>

                        <div class="product-card">
                            <div class="product-icon">🖼️</div>
                            <h4>Print Enmarcado</h4>
                            <p>Reproducción de alta calidad lista para colgar</p>
                            <span class="price">$35 - $55</span>
                            <button class="add-to-cart-btn" data-item='{"id":"framed_print","type":"product","name":"Print Enmarcado","description":"Reproducción profesional enmarcada","price":45,"image":null}'>
                                🛒 Añadir al Carrito
                            </button>
                        </div>

                        <div class="product-card">
                            <div class="product-icon">🖼️</div>
                            <h4>Print Simple</h4>
                            <p>Reproducción profesional sin marco</p>
                            <span class="price">$15 - $30</span>
                            <button class="add-to-cart-btn" data-item='{"id":"print","type":"product","name":"Print de Alta Calidad","description":"Reproducción profesional sin marco","price":22,"image":null}'>
                                🛒 Añadir al Carrito
                            </button>
                        </div>

                        <div class="product-card">
                            <div class="product-icon">🛏️</div>
                            <h4>Funda de Almohada</h4>
                            <p>Funda decorativa con el arte de tu mascota</p>
                            <span class="price">$22 - $35</span>
                            <button class="add-to-cart-btn" data-item='{"id":"pillow_case","type":"product","name":"Funda de Almohada","description":"Funda decorativa personalizada","price":28,"image":null}'>
                                🛒 Añadir al Carrito
                            </button>
                        </div>

                        <div class="product-card">
                            <div class="product-icon">🪴</div>
                            <h4>Mousepad / Posavasos</h4>
                            <p>Accesorios funcionales para tu espacio</p>
                            <span class="price">$12 - $20</span>
                            <button class="add-to-cart-btn" data-item='{"id":"mousepad","type":"product","name":"Mousepad/Posavasos","description":"Accesorio funcional personalizado","price":16,"image":null}'>
                                🛒 Añadir al Carrito
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Categoría: Especiales -->
                <div class="product-category-content" data-category="especiales">
                    <h4 class="category-title">✨ Kits Especiales</h4>
                    <div class="products-grid">
                        <div class="product-card featured">
                            <div class="product-icon">📦</div>
                            <h4>Kit Memorial Premium</h4>
                            <p>Cuaderno A5, taza, print enmarcado y camiseta para honrar a tu mascota</p>
                            <span class="price">$110 - $150</span>
                            <span class="badge-save">Ahorra $25</span>
                            <button class="add-to-cart-btn" data-item='{"id":"memorial_premium","type":"product","name":"Kit Memorial Premium","description":"Conjunto completo para honrar a tu mascota","price":130,"image":null}'>
                                🛒 Añadir al Carrito
                            </button>
                        </div>

                        <div class="product-card featured">
                            <div class="product-icon">🎁</div>
                            <h4>Kit Estudiante</h4>
                            <p>Set de 3 cuadernos argollados + tote bag personalizado</p>
                            <span class="price">$60 - $80</span>
                            <span class="badge-save">Ahorra $15</span>
                            <button class="add-to-cart-btn" data-item='{"id":"student_kit","type":"product","name":"Kit Estudiante","description":"Set de papelería para estudiantes","price":70,"image":null}'>
                                🛒 Añadir al Carrito
                            </button>
                        </div>

                        <div class="product-card featured">
                            <div class="product-icon">💼</div>
                            <h4>Kit Oficina</h4>
                            <p>Cuaderno A4, taza premium, mousepad y polo personalizado</p>
                            <span class="price">$85 - $115</span>
                            <span class="badge-save">Ahorra $20</span>
                            <button class="add-to-cart-btn" data-item='{"id":"office_kit","type":"product","name":"Kit Oficina","description":"Conjunto profesional personalizado","price":100,"image":null}'>
                                🛒 Añadir al Carrito
                            </button>
                        </div>

                        <div class="product-card featured">
                            <div class="product-icon">❤️</div>
                            <h4>Kit Pareja</h4>
                            <p>2 tazas, 2 camisetas y cuaderno compartido</p>
                            <span class="price">$75 - $100</span>
                            <span class="badge-save">Ahorra $18</span>
                            <button class="add-to-cart-btn" data-item='{"id":"couple_kit","type":"product","name":"Kit Pareja","description":"Conjunto para parejas amantes de mascotas","price":88,"image":null}'>
                                🛒 Añadir al Carrito
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Formulario de solicitud -->
                <form class="contact-form" onsubmit="submitContactForm(event, 'productos')">
                    <h4>📝 Solicita tu producto personalizado</h4>
                    <p class="form-intro">¿No encontraste lo que buscabas? Cuéntanos tu idea</p>

                    <div class="form-group">
                        <label>Tu nombre:</label>
                        <input type="text" name="name" required placeholder="Nombre completo">
                    </div>

                    <div class="form-group">
                        <label>Email:</label>
                        <input type="email" name="email" required placeholder="tu-email@ejemplo.com">
                    </div>

                    <div class="form-group">
                        <label>Teléfono (opcional):</label>
                        <input type="tel" name="phone" placeholder="+57 300 123 4567">
                    </div>

                    <div class="form-group">
                        <label>Producto de interés:</label>
                        <select name="product" required>
                            <option value="">Selecciona un producto...</option>
                            <optgroup label="📓 Papelería">
                                <option value="cuaderno_a4">Cuaderno Argollado A4</option>
                                <option value="cuaderno_a5">Cuaderno Argollado A5</option>
                                <option value="libreta_pocket">Libreta Pocket</option>
                                <option value="set_libretas">Set de 3 Libretas</option>
                            </optgroup>
                            <optgroup label="👕 Ropa & Textiles">
                                <option value="camiseta">Camiseta Básica</option>
                                <option value="polo">Camisa Polo</option>
                                <option value="hoodie">Sudadera / Hoodie</option>
                                <option value="camisa_vestir">Camisa de Vestir</option>
                                <option value="gorra">Gorra</option>
                                <option value="tote">Mochila / Tote Bag</option>
                            </optgroup>
                            <optgroup label="🏠 Hogar & Deco">
                                <option value="taza">Taza Personalizada</option>
                                <option value="set_tazas">Set de Tazas</option>
                                <option value="print_enmarcado">Print Enmarcado</option>
                                <option value="print">Print Simple</option>
                                <option value="almohada">Funda de Almohada</option>
                                <option value="mousepad">Mousepad / Posavasos</option>
                            </optgroup>
                            <optgroup label="✨ Kits Especiales">
                                <option value="kit_memorial">Kit Memorial Premium</option>
                                <option value="kit_estudiante">Kit Estudiante</option>
                                <option value="kit_oficina">Kit Oficina</option>
                                <option value="kit_pareja">Kit Pareja</option>
                            </optgroup>
                            <option value="otro">🎨 Otro (especificar en mensaje)</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Cantidad estimada:</label>
                        <input type="number" name="quantity" min="1" value="1" placeholder="1">
                        <p class="form-note">Para pedidos mayoristas (10+ unidades) ofrecemos descuentos especiales</p>
                    </div>

                    <div class="form-group">
                        <label>Mensaje adicional:</label>
                        <textarea name="message" rows="4" placeholder="Cuéntanos más detalles: colores preferidos, tamaños, ideas especiales, fecha de entrega deseada..."></textarea>
                    </div>

                    <div class="form-group checkbox-group">
                        <input type="checkbox" name="hasPhoto" id="hasPhoto">
                        <label for="hasPhoto">Ya tengo la foto/arte de mi mascota lista para enviar</label>
                    </div>

                    <button type="submit" class="submit-btn">Enviar Solicitud 💝</button>
                    <p class="form-note">Te responderemos en 24-48 horas con cotización y opciones de personalización</p>
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

    // 🎮 Puntos por usar formulario de contacto
    if (typeof artPatronSystem !== 'undefined') {
        artPatronSystem.addPoints('contact_form');
    }

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

// 🔄 Cambiar categoría de productos
function switchProductCategory(event, categoryName) {
    // Prevenir comportamiento por defecto si es necesario
    if (event) {
        event.preventDefault();
    }

    // Actualizar tabs activos
    const tabs = document.querySelectorAll('.category-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');

    // Actualizar contenido visible
    const contents = document.querySelectorAll('.product-category-content');
    contents.forEach(content => {
        if (content.dataset.category === categoryName) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
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