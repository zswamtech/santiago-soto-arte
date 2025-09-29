// 💳 Pasarela de Pagos - Santiago Soto Arte
// Sistema completo de pagos integrado con Stripe y carrito de compras

class PaymentGateway {
    constructor() {
        this.stripe = null; // Se inicializará cuando se cargue Stripe
        this.cart = {
            items: [],
            total: 0,
            discount: 0,
            finalTotal: 0
        };

        this.paymentMethods = {
            stripe: true,
            paypal: false, // Futuro
            mercadopago: false // Para LATAM
        };

        this.init();
    }

    async init() {
        await this.loadStripe();
        this.setupEventListeners();
        this.loadSavedCart();
    }

    // 🔄 Cargar Stripe SDK
    async loadStripe() {
        try {
            // Clave pública de prueba de Stripe (funcional para testing)
            const stripePublicKey = 'pk_test_51OStPQFsXWOUKXs9S7ZnEuwcYJ1JDY6cF8M8VDc9vFDGJWBLfbZq9xA8YPtJeVdY8M7Z9mQnC4X8G7Y5vXdP8R100L0K0kBcF';

            if (window.Stripe) {
                this.stripe = Stripe(stripePublicKey);
                console.log('✅ Stripe cargado correctamente');
            } else {
                console.warn('⚠️ Stripe SDK no está cargado');
            }
        } catch (error) {
            console.error('❌ Error cargando Stripe:', error);
        }
    }

    // 🛒 Gestión del Carrito
    addToCart(item) {
        // Verificar si el item ya existe (para encargos personalizados)
        const existingItem = this.cart.items.find(cartItem =>
            cartItem.type === item.type && cartItem.id === item.id
        );

        if (existingItem && item.type !== 'custom_artwork') {
            // Solo productos pueden tener cantidad múltiple
            existingItem.quantity += item.quantity || 1;
        } else {
            // Nuevo item o encargo personalizado
            this.cart.items.push({
                id: item.id || Date.now(),
                type: item.type, // 'custom_artwork', 'product', 'digital'
                name: item.name,
                description: item.description,
                price: item.price,
                quantity: item.quantity || 1,
                customData: item.customData || null, // Para encargos personalizados
                image: item.image || null
            });
        }

        this.updateCart();
        this.showCartNotification(`✅ ${item.name} añadido al carrito`);

        // 🎮 Puntos por usar carrito
        if (typeof artPatronSystem !== 'undefined') {
            artPatronSystem.addPoints('cart_add');
        }
    }

    removeFromCart(itemId) {
        this.cart.items = this.cart.items.filter(item => item.id !== itemId);
        this.updateCart();
        this.showCartNotification('🗑️ Item eliminado del carrito');
    }

    updateQuantity(itemId, newQuantity) {
        const item = this.cart.items.find(item => item.id === itemId);
        if (item && newQuantity > 0) {
            item.quantity = newQuantity;
            this.updateCart();
        }
    }

    clearCart() {
        this.cart.items = [];
        this.updateCart();
    }

    // 💰 Calcular totales
    updateCart() {
        this.cart.total = this.cart.items.reduce((sum, item) =>
            sum + (item.price * item.quantity), 0
        );

        // Aplicar descuento del Art Patron System
        this.cart.discount = this.getPatronDiscount();
        this.cart.finalTotal = Math.max(0, this.cart.total - this.cart.discount);

        this.updateCartDisplay();
        this.saveCart();
    }

    getPatronDiscount() {
        if (typeof artPatronSystem !== 'undefined') {
            const discountPercentage = artPatronSystem.getPatronDiscount();
            return Math.round(this.cart.total * (discountPercentage / 100));
        }
        return 0;
    }

    // 🎨 Interfaz del carrito
    updateCartDisplay() {
        this.updateCartIcon();
        this.updateCartSidebar();
    }

    updateCartIcon() {
        const cartIcon = document.querySelector('.cart-icon-count');
        const itemCount = this.cart.items.reduce((sum, item) => sum + item.quantity, 0);

        if (cartIcon) {
            cartIcon.textContent = itemCount;
            cartIcon.style.display = itemCount > 0 ? 'block' : 'none';
        }
    }

    updateCartSidebar() {
        const cartSidebar = document.getElementById('cart-sidebar');
        if (!cartSidebar) return;

        const cartContent = cartSidebar.querySelector('.cart-content');

        if (this.cart.items.length === 0) {
            cartContent.innerHTML = `
                <div class="empty-cart">
                    <div class="empty-cart-icon">🛒</div>
                    <h3>Tu carrito está vacío</h3>
                    <p>¡Explora nuestras opciones y encuentra algo especial!</p>
                    <button onclick="paymentGateway.closeCart()" class="btn-secondary">
                        Seguir Explorando
                    </button>
                </div>
            `;
            return;
        }

        let cartHTML = '<div class="cart-items">';

        this.cart.items.forEach(item => {
            cartHTML += `
                <div class="cart-item" data-item-id="${item.id}">
                    <div class="cart-item-image">
                        ${item.image ?
                            `<img src="${item.image}" alt="${item.name}">` :
                            '<div class="placeholder-image">🎨</div>'
                        }
                    </div>
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p class="cart-item-description">${item.description}</p>
                        <div class="cart-item-price">$${item.price}</div>
                        ${item.type !== 'custom_artwork' ? `
                            <div class="quantity-controls">
                                <button onclick="paymentGateway.updateQuantity(${item.id}, ${item.quantity - 1})"
                                        ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                                <span class="quantity">${item.quantity}</span>
                                <button onclick="paymentGateway.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                            </div>
                        ` : `
                            <div class="custom-artwork-note">🎨 Encargo personalizado</div>
                        `}
                    </div>
                    <div class="cart-item-actions">
                        <div class="cart-item-subtotal">$${item.price * item.quantity}</div>
                        <button onclick="paymentGateway.removeFromCart(${item.id})" class="remove-item">🗑️</button>
                    </div>
                </div>
            `;
        });

        cartHTML += '</div>';

        // Resumen del carrito
        cartHTML += `
            <div class="cart-summary">
                <div class="cart-subtotal">
                    <span>Subtotal:</span>
                    <span>$${this.cart.total}</span>
                </div>
                ${this.cart.discount > 0 ? `
                    <div class="cart-discount">
                        <span>🎮 Descuento Art Patron:</span>
                        <span>-$${this.cart.discount}</span>
                    </div>
                ` : ''}
                <div class="cart-total">
                    <span>Total:</span>
                    <span>$${this.cart.finalTotal}</span>
                </div>
                <div class="cart-actions">
                    <button onclick="paymentGateway.openCheckout()" class="btn-primary checkout-btn">
                        💳 Proceder al Pago
                    </button>
                    <button onclick="paymentGateway.clearCart()" class="btn-secondary clear-cart-btn">
                        🗑️ Vaciar Carrito
                    </button>
                </div>
            </div>
        `;

        cartContent.innerHTML = cartHTML;
    }

    // 🏪 Checkout Process
    openCheckout() {
        if (this.cart.items.length === 0) {
            alert('Tu carrito está vacío');
            return;
        }

        const checkoutModal = document.getElementById('checkout-modal');
        if (checkoutModal) {
            checkoutModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            this.initializeCheckoutForm();
        }
    }

    closeCheckout() {
        const checkoutModal = document.getElementById('checkout-modal');
        if (checkoutModal) {
            checkoutModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    initializeCheckoutForm() {
        const checkoutContent = document.querySelector('.checkout-content');
        if (!checkoutContent) return;

        checkoutContent.innerHTML = this.generateCheckoutHTML();
        this.setupCheckoutValidation();
    }

    generateCheckoutHTML() {
        return `
            <div class="checkout-header">
                <h2>💳 Finalizar Compra</h2>
                <button onclick="paymentGateway.closeCheckout()" class="close-checkout">×</button>
            </div>

            <div class="checkout-body">
                <div class="checkout-sections">
                    <!-- Resumen del pedido -->
                    <div class="checkout-section order-summary">
                        <h3>📦 Resumen del Pedido</h3>
                        <div class="order-items">
                            ${this.cart.items.map(item => `
                                <div class="order-item">
                                    <span class="item-name">${item.name} ${item.quantity > 1 ? `(x${item.quantity})` : ''}</span>
                                    <span class="item-price">$${item.price * item.quantity}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="order-totals">
                            <div class="order-subtotal">
                                <span>Subtotal:</span>
                                <span>$${this.cart.total}</span>
                            </div>
                            ${this.cart.discount > 0 ? `
                                <div class="order-discount">
                                    <span>🎮 Descuento Art Patron:</span>
                                    <span>-$${this.cart.discount}</span>
                                </div>
                            ` : ''}
                            <div class="order-total">
                                <span><strong>Total:</strong></span>
                                <span><strong>$${this.cart.finalTotal}</strong></span>
                            </div>
                        </div>
                    </div>

                    <!-- Información del cliente -->
                    <div class="checkout-section customer-info">
                        <h3>📝 Información de Contacto</h3>
                        <form id="checkout-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="firstName">Nombre *</label>
                                    <input type="text" id="firstName" name="firstName" required>
                                </div>
                                <div class="form-group">
                                    <label for="lastName">Apellido *</label>
                                    <input type="text" id="lastName" name="lastName" required>
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="email">Email *</label>
                                <input type="email" id="email" name="email" required>
                            </div>

                            <div class="form-group">
                                <label for="phone">Teléfono</label>
                                <input type="tel" id="phone" name="phone">
                            </div>

                            <!-- Dirección de envío (solo si hay productos físicos) -->
                            ${this.hasPhysicalProducts() ? `
                                <h4>📍 Dirección de Envío</h4>
                                <div class="form-group">
                                    <label for="address">Dirección *</label>
                                    <input type="text" id="address" name="address" required>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="city">Ciudad *</label>
                                        <input type="text" id="city" name="city" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="zipCode">Código Postal *</label>
                                        <input type="text" id="zipCode" name="zipCode" required>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="country">País *</label>
                                    <select id="country" name="country" required>
                                        <option value="">Seleccionar país...</option>
                                        <option value="ES">España</option>
                                        <option value="CO">Colombia</option>
                                        <option value="MX">México</option>
                                        <option value="US">Estados Unidos</option>
                                        <option value="AR">Argentina</option>
                                        <!-- Más países según necesidad -->
                                    </select>
                                </div>
                            ` : ''}
                        </form>
                    </div>

                    <!-- Método de pago -->
                    <div class="checkout-section payment-method">
                        <h3>💳 Método de Pago</h3>
                        <div class="payment-options">
                            <div class="payment-option">
                                <input type="radio" id="stripe-card" name="payment-method" value="stripe" checked>
                                <label for="stripe-card">
                                    <span class="payment-icon">💳</span>
                                    Tarjeta de Crédito/Débito
                                    <small>Procesado por Stripe - Seguro y confiable</small>
                                </label>
                            </div>
                            <!-- Futuras opciones de pago -->
                            <div class="payment-option disabled">
                                <input type="radio" id="paypal" name="payment-method" value="paypal" disabled>
                                <label for="paypal">
                                    <span class="payment-icon">🅿️</span>
                                    PayPal
                                    <small>Próximamente disponible</small>
                                </label>
                            </div>
                        </div>

                        <!-- Elemento para Stripe -->
                        <div id="stripe-card-element" class="stripe-element">
                            <!-- Stripe Elements se montará aquí -->
                        </div>
                        <div id="stripe-card-errors" role="alert" class="stripe-errors"></div>
                    </div>
                </div>

                <div class="checkout-footer">
                    <div class="security-badges">
                        <div class="security-badge">🔒 SSL Seguro</div>
                        <div class="security-badge">✅ Stripe Verified</div>
                        <div class="security-badge">🛡️ Datos Protegidos</div>
                    </div>

                    <button id="submit-payment" class="btn-primary payment-submit-btn" disabled>
                        🔄 Procesando pago...
                    </button>
                </div>
            </div>
        `;
    }

    hasPhysicalProducts() {
        return this.cart.items.some(item =>
            item.type === 'product' ||
            item.type === 'custom_artwork'
        );
    }

    setupCheckoutValidation() {
        const form = document.getElementById('checkout-form');
        const submitButton = document.getElementById('submit-payment');

        if (!form || !submitButton) return;

        // Configurar Stripe Elements
        this.setupStripeElements();

        // Validación en tiempo real
        const requiredFields = form.querySelectorAll('input[required], select[required]');

        const validateForm = () => {
            let allValid = true;

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    allValid = false;
                }
            });

            // Habilitar botón solo si todo está válido
            if (allValid && this.stripeCardValid) {
                submitButton.disabled = false;
                submitButton.textContent = `💳 Pagar $${this.cart.finalTotal}`;
            } else {
                submitButton.disabled = true;
                submitButton.textContent = '💳 Completar información';
            }
        };

        requiredFields.forEach(field => {
            field.addEventListener('input', validateForm);
            field.addEventListener('change', validateForm);
        });

        // Submit del formulario
        submitButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.processPayment();
        });
    }

    setupStripeElements() {
        if (!this.stripe) {
            console.warn('Stripe no está disponible');
            return;
        }

        const elements = this.stripe.elements();

        // Crear elemento de tarjeta
        this.cardElement = elements.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#333',
                    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                    '::placeholder': {
                        color: '#999'
                    }
                },
                invalid: {
                    color: '#e74c3c'
                }
            }
        });

        // Montar el elemento
        const cardContainer = document.getElementById('stripe-card-element');
        if (cardContainer) {
            this.cardElement.mount('#stripe-card-element');
        }

        // Manejar errores
        this.stripeCardValid = false;
        this.cardElement.on('change', ({error}) => {
            const displayError = document.getElementById('stripe-card-errors');
            if (error) {
                displayError.textContent = error.message;
                this.stripeCardValid = false;
            } else {
                displayError.textContent = '';
                this.stripeCardValid = true;
            }

            // Trigger form validation
            const form = document.getElementById('checkout-form');
            if (form) {
                form.dispatchEvent(new Event('input'));
            }
        });
    }

    async processPayment() {
        const submitButton = document.getElementById('submit-payment');
        const form = document.getElementById('checkout-form');

        if (!form || !submitButton) return;

        // Deshabilitar botón y mostrar loading
        submitButton.disabled = true;
        submitButton.innerHTML = '🔄 Procesando pago...';

        try {
            // Recopilar datos del formulario
            const formData = new FormData(form);
            const customerData = Object.fromEntries(formData);

            // Simular procesamiento (en producción, esto iría al backend)
            const paymentResult = await this.simulatePayment(customerData);

            if (paymentResult.success) {
                this.handlePaymentSuccess(paymentResult);
            } else {
                this.handlePaymentError(paymentResult.error);
            }

        } catch (error) {
            console.error('Error procesando pago:', error);
            this.handlePaymentError('Error inesperado procesando el pago');
        }
    }

    // Simulación de pago (reemplazar con integración real)
    async simulatePayment(customerData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simular éxito del pago
                resolve({
                    success: true,
                    paymentId: 'payment_' + Date.now(),
                    transactionId: 'txn_' + Math.random().toString(36).substring(2, 11),
                    amount: this.cart.finalTotal,
                    customer: customerData
                });
            }, 2000);
        });
    }

    handlePaymentSuccess(paymentResult) {
        // 🎮 Puntos por compra exitosa
        if (typeof artPatronSystem !== 'undefined') {
            const pointsEarned = Math.floor(this.cart.finalTotal / 10); // 1 punto por cada $10
            artPatronSystem.addPoints('purchase', pointsEarned);
        }

        // Mostrar pantalla de éxito
        this.showPaymentSuccess(paymentResult);

        // Limpiar carrito
        this.clearCart();

        // Cerrar checkout después de un momento
        setTimeout(() => {
            this.closeCheckout();
        }, 5000);
    }

    handlePaymentError(errorMessage) {
        const submitButton = document.getElementById('submit-payment');

        alert(`❌ Error en el pago: ${errorMessage}`);

        // Rehabilitar botón
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = `💳 Pagar $${this.cart.finalTotal}`;
        }
    }

    showPaymentSuccess(paymentResult) {
        const checkoutContent = document.querySelector('.checkout-content');
        if (!checkoutContent) return;

        checkoutContent.innerHTML = `
            <div class="payment-success">
                <div class="success-animation">✅</div>
                <h2>🎉 ¡Pago Exitoso!</h2>
                <p>Gracias por tu compra. Tu pedido ha sido procesado correctamente.</p>

                <div class="payment-details">
                    <h3>Detalles de la transacción:</h3>
                    <div class="detail-row">
                        <span>ID de Pago:</span>
                        <span>${paymentResult.paymentId}</span>
                    </div>
                    <div class="detail-row">
                        <span>Monto:</span>
                        <span>$${paymentResult.amount}</span>
                    </div>
                    <div class="detail-row">
                        <span>Estado:</span>
                        <span class="status-paid">Pagado</span>
                    </div>
                </div>

                <div class="next-steps-payment">
                    <h3>📧 Próximos pasos:</h3>
                    <ul>
                        <li>Recibirás un email de confirmación</li>
                        <li>Santiago se contactará contigo en 24-48 horas</li>
                        <li>Para encargos: coordinaremos fotos de referencia</li>
                        <li>Te mantendremos informado del progreso</li>
                    </ul>
                </div>

                <div class="success-actions">
                    <button onclick="paymentGateway.closeCheckout()" class="btn-primary">
                        ✨ Continuar
                    </button>
                </div>
            </div>
        `;
    }

    // 🔔 Notificaciones del carrito
    showCartNotification(message) {
        // Crear o actualizar notificación
        let notification = document.getElementById('cart-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'cart-notification';
            notification.className = 'cart-notification';
            document.body.appendChild(notification);
        }

        notification.textContent = message;
        notification.classList.add('show');

        // Ocultar después de 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // 🎯 Funciones de utilidad
    openCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        if (cartSidebar) {
            cartSidebar.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    }

    closeCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        if (cartSidebar) {
            cartSidebar.classList.remove('open');
            document.body.style.overflow = 'auto';
        }
    }

    toggleCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        if (cartSidebar) {
            cartSidebar.classList.toggle('open');
            document.body.style.overflow = cartSidebar.classList.contains('open') ? 'hidden' : 'auto';
        }
    }

    // 💾 Persistencia del carrito
    saveCart() {
        try {
            localStorage.setItem('santiago_soto_cart', JSON.stringify(this.cart));
        } catch (error) {
            console.warn('No se pudo guardar el carrito en localStorage:', error);
        }
    }

    loadSavedCart() {
        try {
            const savedCart = localStorage.getItem('santiago_soto_cart');
            if (savedCart) {
                this.cart = JSON.parse(savedCart);
                this.updateCart();
            }
        } catch (error) {
            console.warn('No se pudo cargar el carrito guardado:', error);
        }
    }

    setupEventListeners() {
        // Escuchar clicks en botones de añadir al carrito
        document.addEventListener('click', (e) => {
            if (e.target.matches('.add-to-cart-btn') || e.target.closest('.add-to-cart-btn')) {
                const button = e.target.matches('.add-to-cart-btn') ? e.target : e.target.closest('.add-to-cart-btn');
                const itemData = JSON.parse(button.dataset.item || '{}');
                this.addToCart(itemData);
            }
        });

        // Cerrar carrito al hacer click fuera
        document.addEventListener('click', (e) => {
            const cartSidebar = document.getElementById('cart-sidebar');
            const cartButton = document.querySelector('.cart-button');

            if (cartSidebar && cartSidebar.classList.contains('open') &&
                !cartSidebar.contains(e.target) &&
                !cartButton?.contains(e.target)) {
                this.closeCart();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeCart();
                this.closeCheckout();
            }
        });
    }
}

// 🚀 Inicialización
let paymentGateway;
document.addEventListener('DOMContentLoaded', function() {
    paymentGateway = new PaymentGateway();
    console.log('💳 Sistema de pagos inicializado');
});

// 🌍 API pública para integrar con otros componentes
window.PaymentGatewayAPI = {
    addToCart: (item) => paymentGateway?.addToCart(item),
    openCart: () => paymentGateway?.openCart(),
    openCheckout: () => paymentGateway?.openCheckout(),
    getCart: () => paymentGateway?.cart || { items: [], total: 0 }
};