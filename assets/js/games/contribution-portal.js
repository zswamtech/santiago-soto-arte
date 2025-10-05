/**
 * 🎨 Contribution Portal - Sistema de aporte de pares creativos
 * Permite a usuarios contribuir con nuevos pares educativos para el juego de memoria
 */

(function(window) {
    'use strict';

    const ContributionPortal = {
        isOpen: false,
        currentSubmission: null,
        previewUrls: { card1: null, card2: null },

        // Configuración de recompensas
        rewards: {
            easy: { points: 200, tier: 'Aprendiz' },
            medium: { points: 350, tier: 'Maestro' },
            hard: { points: 500, tier: 'Virtuoso' }
        },

        // Categorías válidas
        categories: {
            colorTheory: { name: 'Teoría del Color', icon: '🎨', emoji: '🌈' },
            techniques: { name: 'Técnicas de Pintura', icon: '🖌️', emoji: '✨' },
            artHistory: { name: 'Historia del Arte', icon: '🏛️', emoji: '📚' },
            composition: { name: 'Composición', icon: '📐', emoji: '🖼️' },
            materials: { name: 'Materiales', icon: '🎯', emoji: '🧰' }
        },

        /**
         * Abre el portal de contribución
         */
        open() {
            const portal = document.getElementById('contribution-portal');
            if (!portal) {
                console.error('[ContributionPortal] Portal element not found');
                return;
            }

            portal.style.display = 'block';
            this.isOpen = true;
            this.resetForm();
            this.attachEventListeners();

            // Analytics
            if (window.GameCore?.eventBus) {
                window.GameCore.eventBus.emit('contribution.portal.opened', {
                    timestamp: Date.now()
                });
            }
        },

        /**
         * Cierra el portal
         */
        close() {
            const portal = document.getElementById('contribution-portal');
            if (portal) {
                portal.style.display = 'none';
                this.isOpen = false;
                this.cleanupPreviews();
            }
        },

        /**
         * Resetea el formulario
         */
        resetForm() {
            this.currentSubmission = {
                pairName: '',
                category: 'colorTheory',
                difficulty: 'easy',
                card1: { file: null, preview: null },
                card2: { file: null, preview: null },
                educationalValue: '',
                keyLearning: '',
                submittedAt: null
            };

            // Limpiar inputs
            const inputs = document.querySelectorAll('#contribution-portal input[type="text"], #contribution-portal textarea');
            inputs.forEach(input => input.value = '');

            // Limpiar previews
            this.cleanupPreviews();
        },

        /**
         * Adjunta event listeners
         */
        attachEventListeners() {
            // Prevenir duplicados
            if (this._listenersAttached) return;
            this._listenersAttached = true;

            // File inputs para cartas
            const card1Input = document.getElementById('card1-file');
            const card2Input = document.getElementById('card2-file');

            if (card1Input) {
                card1Input.addEventListener('change', (e) => this.handleFileUpload(e, 'card1'));
            }

            if (card2Input) {
                card2Input.addEventListener('change', (e) => this.handleFileUpload(e, 'card2'));
            }

            // Preview en tiempo real de dificultad
            const difficultySelect = document.getElementById('contribution-difficulty');
            if (difficultySelect) {
                difficultySelect.addEventListener('change', (e) => this.updateRewardPreview(e.target.value));
            }

            // Submit button
            const submitBtn = document.getElementById('submit-contribution');
            if (submitBtn) {
                submitBtn.addEventListener('click', () => this.submitContribution());
            }

            // Close button
            const closeBtn = document.getElementById('close-contribution-portal');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.close());
            }
        },

        /**
         * Maneja la carga de archivos de imagen
         */
        handleFileUpload(event, cardKey) {
            const file = event.target.files[0];
            if (!file) return;

            // Validar tipo de archivo
            const validTypes = ['image/svg+xml', 'image/png', 'image/jpeg'];
            if (!validTypes.includes(file.type)) {
                alert('❌ Solo se aceptan archivos SVG, PNG o JPG');
                event.target.value = '';
                return;
            }

            // Validar tamaño (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('❌ El archivo debe pesar menos de 2MB');
                event.target.value = '';
                return;
            }

            // Crear preview
            const reader = new FileReader();
            reader.onload = (e) => {
                const previewContainer = document.getElementById(`${cardKey}-preview`);
                if (previewContainer) {
                    previewContainer.innerHTML = `
                        <img src="${e.target.result}" alt="Preview ${cardKey}" class="card-image-preview">
                        <span class="preview-check">✓</span>
                    `;
                }

                // Guardar en submission
                this.currentSubmission[cardKey] = {
                    file: file,
                    preview: e.target.result
                };

                this.previewUrls[cardKey] = e.target.result;
            };

            reader.readAsDataURL(file);
        },

        /**
         * Actualiza preview de recompensa
         */
        updateRewardPreview(difficulty) {
            const reward = this.rewards[difficulty];
            const rewardEl = document.querySelector('.contribution-reward');

            if (rewardEl && reward) {
                rewardEl.innerHTML = `
                    Al ser aprobado, recibirás <strong>${reward.points} puntos</strong>
                    y el badge de <strong>Creador ${reward.tier}</strong> 🏆
                `;
            }
        },

        /**
         * Valida el submission antes de enviar
         */
        validateSubmission() {
            const pairName = document.getElementById('contribution-pair-name')?.value.trim();
            const category = document.getElementById('contribution-category')?.value;
            const difficulty = document.getElementById('contribution-difficulty')?.value;
            const educationalValue = document.getElementById('contribution-educational')?.value.trim();
            const keyLearning = document.getElementById('contribution-learning')?.value.trim();

            const errors = [];

            if (!pairName || pairName.length < 3) {
                errors.push('El nombre del par debe tener al menos 3 caracteres');
            }

            if (!this.currentSubmission.card1?.file) {
                errors.push('Debes subir la imagen de la Carta 1');
            }

            if (!this.currentSubmission.card2?.file) {
                errors.push('Debes subir la imagen de la Carta 2');
            }

            if (!educationalValue || educationalValue.length < 20) {
                errors.push('Explica el valor educativo (mínimo 20 caracteres)');
            }

            if (!keyLearning || keyLearning.length < 15) {
                errors.push('Describe el concepto clave (mínimo 15 caracteres)');
            }

            return { valid: errors.length === 0, errors, data: {
                pairName, category, difficulty, educationalValue, keyLearning
            }};
        },

        /**
         * Envía la contribución
         */
        async submitContribution() {
            const validation = this.validateSubmission();

            if (!validation.valid) {
                alert('❌ Errores en el formulario:\n\n' + validation.errors.join('\n'));
                return;
            }

            // Preparar submission completo
            const submission = {
                ...this.currentSubmission,
                ...validation.data,
                submittedAt: new Date().toISOString(),
                status: 'pending',
                userId: this.getUserId(),
                userName: this.getUserName(),
                petName: this.getUserPetName(),
                petType: this.getUserPetType()
            };

            // Guardar en localStorage (en producción iría a backend)
            this.saveContribution(submission);

            // Otorgar puntos de participación inmediatos
            const participationPoints = 50;
            this.awardPoints(participationPoints, 'Por enviar contribución');

            // Mostrar confirmación
            this.showSuccessMessage(submission);

            // Analytics
            if (window.GameCore?.eventBus) {
                window.GameCore.eventBus.emit('contribution.submitted', {
                    category: submission.category,
                    difficulty: submission.difficulty,
                    timestamp: Date.now()
                });
            }

            // Cerrar portal
            setTimeout(() => this.close(), 3000);
        },

        /**
         * Guarda contribución en localStorage
         */
        saveContribution(submission) {
            const contributions = JSON.parse(localStorage.getItem('user_contributions') || '[]');
            contributions.push(submission);
            localStorage.setItem('user_contributions', JSON.stringify(contributions));

            console.log('[ContributionPortal] Contribution saved:', submission.pairName);
        },

        /**
         * Obtiene ID del usuario
         */
        getUserId() {
            // Intentar obtener de GameCore
            if (window.GameCore?.storage?.loadProfile) {
                const profile = window.GameCore.storage.loadProfile();
                return profile?.id || this.generateUserId();
            }

            return this.generateUserId();
        },

        /**
         * Genera ID único para usuario anónimo
         */
        generateUserId() {
            let userId = localStorage.getItem('contribution_user_id');
            if (!userId) {
                userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
                localStorage.setItem('contribution_user_id', userId);
            }
            return userId;
        },

        /**
         * Obtiene nombre del usuario
         */
        getUserName() {
            if (window.GameCore?.storage?.loadProfile) {
                const profile = window.GameCore.storage.loadProfile();
                if (profile?.name) return profile.name;
            }

            const stored = localStorage.getItem('contribution_user_name');
            if (stored) return stored;

            // Generar nombre anónimo
            const adjectives = ['Valiente', 'Creativo', 'Talentoso', 'Dedicado', 'Apasionado'];
            const nouns = ['Artista', 'Pintor', 'Creador', 'Maestro'];
            const name = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;

            localStorage.setItem('contribution_user_name', name);
            return name;
        },

        /**
         * Obtiene nombre de la mascota del usuario
         */
        getUserPetName() {
            const stored = localStorage.getItem('contribution_pet_name');
            if (stored) return stored;

            // Nombres de mascotas por defecto
            const petNames = ['Luna', 'Max', 'Bella', 'Rocky', 'Coco', 'Buddy', 'Milo', 'Simba'];
            const name = petNames[Math.floor(Math.random() * petNames.length)];

            localStorage.setItem('contribution_pet_name', name);
            return name;
        },

        /**
         * Obtiene tipo de mascota del usuario
         */
        getUserPetType() {
            const stored = localStorage.getItem('contribution_pet_type');
            if (stored) return stored;

            // Tipo de mascota por defecto
            const types = ['dog', 'cat', 'bird', 'rabbit'];
            const type = types[Math.floor(Math.random() * types.length)];

            localStorage.setItem('contribution_pet_type', type);
            return type;
        },

        /**
         * Otorga puntos al usuario
         */
        awardPoints(points, reason) {
            if (window.GameCore?.XP?.addXP) {
                window.GameCore.XP.addXP(points, reason);
            } else if (window.artPatronSystem) {
                window.artPatronSystem.addPoints(points, reason);
            }

            console.log(`[ContributionPortal] Awarded ${points} points: ${reason}`);
        },

        /**
         * Muestra mensaje de éxito
         */
        showSuccessMessage(submission) {
            const reward = this.rewards[submission.difficulty];
            const portal = document.getElementById('contribution-portal');

            if (portal) {
                portal.innerHTML = `
                    <div class="contribution-success">
                        <div class="success-icon">✨</div>
                        <h3>¡Contribución Enviada!</h3>
                        <p>Tu par creativo "<strong>${submission.pairName}</strong>" está en revisión.</p>

                        <div class="success-rewards">
                            <div class="reward-item">
                                <span class="reward-icon">🎯</span>
                                <span>+50 puntos por participación</span>
                            </div>
                            <div class="reward-item pending">
                                <span class="reward-icon">⏳</span>
                                <span>+${reward.points} pts al ser aprobado</span>
                            </div>
                            <div class="reward-item pending">
                                <span class="reward-icon">🏆</span>
                                <span>Badge "Creador ${reward.tier}"</span>
                            </div>
                        </div>

                        <p class="success-note">
                            Santiago revisará tu aporte personalmente.
                            Las contribuciones aprobadas se integran al juego en 24-48h.
                        </p>
                    </div>
                `;
            }
        },

        /**
         * Limpia previews de imágenes
         */
        cleanupPreviews() {
            ['card1', 'card2'].forEach(key => {
                if (this.previewUrls[key]) {
                    URL.revokeObjectURL(this.previewUrls[key]);
                    this.previewUrls[key] = null;
                }

                const preview = document.getElementById(`${key}-preview`);
                if (preview) {
                    preview.innerHTML = '<span class="preview-placeholder">📷 Subir imagen</span>';
                }
            });
        },

        /**
         * Obtiene estadísticas de contribuciones
         */
        getStats() {
            const contributions = JSON.parse(localStorage.getItem('user_contributions') || '[]');

            return {
                total: contributions.length,
                pending: contributions.filter(c => c.status === 'pending').length,
                approved: contributions.filter(c => c.status === 'approved').length,
                rejected: contributions.filter(c => c.status === 'rejected').length
            };
        }
    };

    // Función global para abrir el portal
    window.showContributionPortal = function() {
        ContributionPortal.open();
    };

    // Exponer para debugging
    window.ContributionPortal = ContributionPortal;

    console.log('[ContributionPortal] Module loaded ✓');

})(window);
