// 💰 Calculadora de Precios Inteligente - Santiago Soto Arte
// Sistema que considera múltiples factores para pricing justo y competitivo

class PricingCalculator {
    constructor() {
        this.basePrices = {
            // Precios base por tamaño (en USD)
            small: 120,   // 20x30 cm
            medium: 200,  // 30x40 cm
            large: 350,   // 40x60 cm
            xlarge: 600   // 60x80 cm o más
        };

        this.multipliers = {
            // Factores de complejidad
            complexity: {
                simple: 1.0,      // Perfil simple, fondo plano
                moderate: 1.3,    // Pose frontal, fondo básico
                complex: 1.7,     // Múltiples mascotas, fondos detallados
                masterpiece: 2.2  // Escenas elaboradas, técnica avanzada
            },

            // Técnica utilizada
            technique: {
                pencil: 0.7,      // Lápiz/carboncillo
                acrylic: 1.0,     // Acrílico (base)
                oil: 1.4,         // Óleo (especialidad de Santiago)
                mixed: 1.6        // Técnica mixta
            },

            // Urgencia del encargo
            urgency: {
                normal: 1.0,      // 3-4 semanas
                priority: 1.3,    // 2 semanas
                rush: 1.7,        // 1 semana
                express: 2.5      // 3-5 días
            },

            // Tipo de animal (complejidad de pelaje/textura)
            animalType: {
                cat: 1.0,         // Gatos (experiencia de Santiago)
                dog_short: 1.1,   // Perros de pelo corto
                dog_long: 1.4,    // Golden, Collie, etc.
                bird: 1.3,        // Plumas detalladas
                exotic: 1.6,      // Reptiles, animales exóticos
                multiple: 1.8     // Múltiples mascotas
            },

            // Experiencia del artista (crece con el tiempo)
            experience: {
                beginner: 0.8,    // Primeros encargos
                developing: 1.0,  // Actual nivel de Santiago
                skilled: 1.3,     // Objetivo 6 meses
                expert: 1.7       // Objetivo 2 años
            }
        };

        this.addOns = {
            // Servicios adicionales
            background: {
                none: 0,
                simple: 25,       // Color sólido o gradiente
                detailed: 75,     // Paisaje, interior detallado
                custom: 150       // Fondo completamente personalizado
            },

            extras: {
                rush_delivery: 100,
                gift_wrapping: 15,
                digital_copy: 30,
                progress_photos: 20,
                video_timelapse: 45,
                certificate: 10
            }
        };

        this.init();
    }

    init() {
        this.createCalculatorInterface();
        this.setupEventListeners();
    }

    // 🎨 Calcular precio principal
    calculatePrice(params) {
        const basePrice = this.basePrices[params.size];

        let multiplier = 1;
        multiplier *= this.multipliers.complexity[params.complexity];
        multiplier *= this.multipliers.technique[params.technique];
        multiplier *= this.multipliers.urgency[params.urgency];
        multiplier *= this.multipliers.animalType[params.animalType];
        multiplier *= this.multipliers.experience[params.experience];

        const corePrice = Math.round(basePrice * multiplier);

        // Agregar servicios adicionales
        const backgroundCost = this.addOns.background[params.background] || 0;
        const extrasCost = (params.extras || []).reduce((total, extra) => {
            return total + (this.addOns.extras[extra] || 0);
        }, 0);

        const subtotal = corePrice + backgroundCost + extrasCost;

        // 🎮 Aplicar descuento de Art Patron System
        const patronDiscount = this.getPatronDiscount();
        const discountAmount = Math.round(subtotal * (patronDiscount / 100));
        const totalPrice = subtotal - discountAmount;

        return {
            basePrice,
            multiplier: multiplier.toFixed(2),
            corePrice,
            backgroundCost,
            extrasCost,
            subtotal,
            patronDiscount,
            discountAmount,
            totalPrice,
            breakdown: this.generateBreakdown(params, basePrice, multiplier, backgroundCost, extrasCost, patronDiscount, discountAmount)
        };
    }

    // 📊 Generar desglose detallado
    generateBreakdown(params, basePrice, multiplier, backgroundCost, extrasCost, patronDiscount, discountAmount) {
        return {
            base: `Precio base (${params.size}): $${basePrice}`,
            factors: [
                `Complejidad (${params.complexity}): x${this.multipliers.complexity[params.complexity]}`,
                `Técnica (${params.technique}): x${this.multipliers.technique[params.technique]}`,
                `Urgencia (${params.urgency}): x${this.multipliers.urgency[params.urgency]}`,
                `Tipo animal (${params.animalType}): x${this.multipliers.animalType[params.animalType]}`,
                `Nivel artista: x${this.multipliers.experience[params.experience]}`
            ],
            addons: backgroundCost > 0 ? `Fondo: +$${backgroundCost}` : null,
            extras: extrasCost > 0 ? `Extras: +$${extrasCost}` : null,
            patron: patronDiscount > 0 ? `Descuento Art Patron (${patronDiscount}%): -$${discountAmount}` : null
        };
    }

    // 🎮 Obtener descuento del Art Patron System
    getPatronDiscount() {
        if (typeof artPatronSystem !== 'undefined') {
            return artPatronSystem.getPatronDiscount();
        }
        return 0;
    }

    // 🎯 Crear interfaz de calculadora
    createCalculatorInterface() {
        const calculatorHTML = `
            <div class="pricing-calculator">
                <h3>💰 Calculadora de Precios</h3>
                <p class="calculator-subtitle">Obtén una estimación personalizada para tu encargo</p>

                <form id="pricing-form" class="pricing-form">
                    <!-- Tamaño -->
                    <div class="form-group">
                        <label>📏 Tamaño de la obra:</label>
                        <select name="size" required>
                            <option value="small">Pequeño (20x30 cm) - Base $120</option>
                            <option value="medium" selected>Mediano (30x40 cm) - Base $200</option>
                            <option value="large">Grande (40x60 cm) - Base $350</option>
                            <option value="xlarge">Extra Grande (60x80+ cm) - Base $600</option>
                        </select>
                    </div>

                    <!-- Complejidad -->
                    <div class="form-group">
                        <label>🎨 Complejidad de la obra:</label>
                        <select name="complexity" required>
                            <option value="simple">Simple - Perfil, fondo plano</option>
                            <option value="moderate" selected>Moderada - Pose frontal, fondo básico</option>
                            <option value="complex">Compleja - Múltiples mascotas, fondos detallados</option>
                            <option value="masterpiece">Obra maestra - Escena elaborada</option>
                        </select>
                    </div>

                    <!-- Técnica -->
                    <div class="form-group">
                        <label>🖌️ Técnica preferida:</label>
                        <select name="technique" required>
                            <option value="pencil">Lápiz/Carboncillo (-30%)</option>
                            <option value="acrylic">Acrílico</option>
                            <option value="oil" selected>Óleo (+40%) - Especialidad</option>
                            <option value="mixed">Técnica mixta (+60%)</option>
                        </select>
                    </div>

                    <!-- Tipo de animal -->
                    <div class="form-group">
                        <label>🐾 Tipo de mascota:</label>
                        <select name="animalType" required>
                            <option value="cat" selected>Gato</option>
                            <option value="dog_short">Perro pelo corto</option>
                            <option value="dog_long">Perro pelo largo</option>
                            <option value="bird">Ave</option>
                            <option value="exotic">Exótico (reptil, etc.)</option>
                            <option value="multiple">Múltiples mascotas</option>
                        </select>
                    </div>

                    <!-- Urgencia -->
                    <div class="form-group">
                        <label>⏰ Tiempo de entrega:</label>
                        <select name="urgency" required>
                            <option value="normal" selected>Normal (3-4 semanas)</option>
                            <option value="priority">Prioritario (2 semanas) +30%</option>
                            <option value="rush">Urgente (1 semana) +70%</option>
                            <option value="express">Express (3-5 días) +150%</option>
                        </select>
                    </div>

                    <!-- Fondo -->
                    <div class="form-group">
                        <label>🖼️ Fondo personalizado:</label>
                        <select name="background">
                            <option value="none" selected>Sin fondo especial</option>
                            <option value="simple">Fondo simple (+$25)</option>
                            <option value="detailed">Fondo detallado (+$75)</option>
                            <option value="custom">Completamente personalizado (+$150)</option>
                        </select>
                    </div>

                    <!-- Extras -->
                    <div class="form-group">
                        <label>✨ Servicios adicionales:</label>
                        <div class="checkbox-group">
                            <label><input type="checkbox" name="extras" value="digital_copy"> Copia digital HD (+$30)</label>
                            <label><input type="checkbox" name="extras" value="progress_photos"> Fotos del progreso (+$20)</label>
                            <label><input type="checkbox" name="extras" value="video_timelapse"> Video timelapse (+$45)</label>
                            <label><input type="checkbox" name="extras" value="gift_wrapping"> Envoltorio regalo (+$15)</label>
                            <label><input type="checkbox" name="extras" value="certificate"> Certificado de autenticidad (+$10)</label>
                        </div>
                    </div>

                    <button type="button" onclick="pricingCalculator.calculate()" class="calculate-btn">
                        💰 Calcular Precio
                    </button>
                </form>

                <div id="pricing-result" class="pricing-result" style="display: none;">
                    <!-- Los resultados aparecerán aquí -->
                </div>

                <div class="pricing-note">
                    <p><strong>📝 Nota:</strong> Esta es una estimación. El precio final se confirma después de revisar las fotos de referencia y discutir detalles específicos.</p>
                </div>
            </div>
        `;

        return calculatorHTML;
    }

    // 🔄 Función principal de cálculo
    calculate() {
        const form = document.getElementById('pricing-form');
        const formData = new FormData(form);

        const params = {
            size: formData.get('size'),
            complexity: formData.get('complexity'),
            technique: formData.get('technique'),
            animalType: formData.get('animalType'),
            urgency: formData.get('urgency'),
            background: formData.get('background'),
            experience: 'developing', // Nivel actual de Santiago
            extras: formData.getAll('extras')
        };

        const result = this.calculatePrice(params);
        this.displayResult(result, params);

        // 🎮 Registrar uso de calculadora en Art Patron System
        if (typeof artPatronSystem !== 'undefined') {
            artPatronSystem.addPoints('calculator_use');
            artPatronSystem.playerData.stats.calculatorUses++;
        }
    }

    // 📱 Mostrar resultado
    displayResult(result, params) {
        const resultDiv = document.getElementById('pricing-result');

        resultDiv.innerHTML = `
            <div class="price-summary">
                <div class="final-price">
                    <h3>💰 Precio Total: $${result.totalPrice}</h3>
                    ${result.patronDiscount > 0 ?
                        `<p class="patron-savings">🎮 ¡Ahorras $${result.discountAmount} con Art Patron!</p>
                         <p class="price-before">Precio sin descuento: <span style="text-decoration: line-through">$${result.subtotal}</span></p>` :
                        `<p class="price-range">Rango estimado: $${Math.round(result.totalPrice * 0.9)} - $${Math.round(result.totalPrice * 1.1)}</p>`
                    }
                </div>

                <div class="price-breakdown">
                    <h4>📊 Desglose detallado:</h4>
                    <ul>
                        <li>${result.breakdown.base}</li>
                        ${result.breakdown.factors.map(factor => `<li>${factor}</li>`).join('')}
                        <li><strong>Subtotal: $${result.subtotal}</strong></li>
                        ${result.breakdown.addons ? `<li>${result.breakdown.addons}</li>` : ''}
                        ${result.breakdown.extras ? `<li>${result.breakdown.extras}</li>` : ''}
                        ${result.breakdown.patron ? `<li class="patron-discount"><strong>🎮 ${result.breakdown.patron}</strong></li>` : ''}
                    </ul>
                </div>

                ${result.patronDiscount === 0 ? `
                    <div class="patron-cta">
                        <h4>🎮 ¡Obtén descuentos jugando!</h4>
                        <p>Juega nuestros juegos y gana puntos para desbloquear descuentos de hasta 20%</p>
                        <button onclick="scrollToSection('juegos')" class="patron-cta-btn">Ir a Juegos</button>
                    </div>
                ` : ''}

                <div class="next-steps">
                    <h4>🚀 Próximos pasos:</h4>
                    <ol>
                        <li>Comparte fotos de referencia de tu mascota</li>
                        <li>Discutimos detalles específicos</li>
                        <li>Confirmo precio final y tiempo de entrega</li>
                        <li>¡Santiago comienza tu obra maestra!</li>
                    </ol>
                </div>

                <div class="action-buttons">
                    <button onclick="openContactModal('encargo')" class="btn-primary">
                        🎨 Solicitar Este Encargo
                    </button>
                    <button onclick="pricingCalculator.shareEstimate(${result.totalPrice})" class="btn-secondary">
                        📤 Compartir Estimación
                    </button>
                </div>
            </div>
        `;

        resultDiv.style.display = 'block';
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // 📤 Compartir estimación
    shareEstimate(price) {
        const text = `🎨 Estimación de retrato personalizado de Santiago Soto: $${price}. ¡Un artista joven con gran talento! https://santiago-soto-arte.vercel.app`;

        if (navigator.share) {
            navigator.share({
                title: 'Estimación de Retrato - Santiago Soto Arte',
                text: text,
                url: 'https://santiago-soto-arte.vercel.app'
            });
        } else {
            navigator.clipboard.writeText(text).then(() => {
                alert('📋 ¡Estimación copiada al portapapeles!');
            });
        }
    }

    setupEventListeners() {
        // Listeners para cambios en tiempo real si los necesitamos
    }
}

// 🚀 Inicializar calculadora
let pricingCalculator;
document.addEventListener('DOMContentLoaded', function() {
    pricingCalculator = new PricingCalculator();

    // Cargar calculadora en el contenedor
    const container = document.getElementById('calculator-container');
    if (container) {
        container.innerHTML = pricingCalculator.createCalculatorInterface();
    }
});