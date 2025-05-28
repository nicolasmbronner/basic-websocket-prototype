/**
 * client.js - Client Websocket
 * 
 * Ce fichier est responsable de:
 * - Connexion au serveur Websocket
 * - Traitement des événements côté client
 * - Mise à jour de l'interface utilisateur
 * - Amélioration UX pour une expérience moderne
 * 
 * Créé le 05/05/2025
 * Dernière modification: 28/05/2025
 */

/**
 * Connexion au serveur Websocket
 * 
 * ← Reçoit données de: Serveur Express
 * → Envoie données vers: Serveur Socket.io
 */
// @ts-ignore
const socket = io();

// Référence aux éléments DOM
const statusElement = document.getElementById('status');
const userCountElement = document.getElementById('user-count');
const userIdElement = document.getElementById('user-id');
const userListElement = document.getElementById('user-list');

/**
 * Fonction utilitaire pour animer les changements de nombre
 */
function animateNumber(element, newValue) {
    if (!element) return;
    
    const currentValue = parseInt(element.textContent) || 0;
    const difference = newValue - currentValue;
    const duration = 500;
    const steps = 20;
    const stepValue = difference / steps;
    const stepDuration = duration / steps;
    
    let currentStep = 0;
    const animation = setInterval(() => {
        currentStep++;
        const intermediateValue = Math.round(currentValue + (stepValue * currentStep));
        element.textContent = intermediateValue.toString();
        
        if (currentStep >= steps) {
            clearInterval(animation);
            element.textContent = newValue.toString();
        }
    }, stepDuration);
}

/**
 * Fonction pour afficher une notification temporaire
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    `;
    
    // Couleurs selon le type
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#2563eb',
        warning: '#f59e0b'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // Suppression automatique après 3 secondes
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

/**
 * Gestion des événements webSocket
 * 
 * ← Reçoivent données de: Serveur Socket.io
 * → Modifient: DOM (UI)
 */
socket.on('connect', () => {
    console.log('Connecté au serveur Websocket');
    if (statusElement) {
        statusElement.textContent = 'Connecté';
        statusElement.className = 'connected';
    }
    showNotification('Connexion établie!', 'success');
});

socket.on('disconnect', () => {
    console.log('Déconnecté du serveur Websocket');
    if (statusElement) {
        statusElement.textContent = 'Déconnecté';
        statusElement.className = 'disconnected';
    }
    showNotification('Connexion perdue', 'error');
});

/**
 * Réception de la mise à jour du compteur d'utilisateurs
 * 
 * ← Reçoit données de: Serveur WebSocket (événement 'userCount')
 * → Modifie: DOM (élément #user-count))
 */

socket.on('userCount', (count) => {
    console.log(`Mise à jour du compteur: ${count} utilisateur(s) connecté(s)`);
    if (userCountElement) {
        animateNumber(userCountElement, count);
    }
});

/**
 * Réception de l'ID d'utilisateur
 * 
 * ← Reçoit données de: Serveur WebSocket (événement 'userId')
 * → Modifie: DOM (élément #user-id)
 */
socket.on('userId', (id) => {
    console.log(`ID utilisateur reçu: ${id}`);
    if (userIdElement) {
        userIdElement.textContent = id.toString();

        // Effet de highlight pour attirer l'attention
        userIdElement.style.animation = 'none';
        setTimeout(() => {
            userIdElement.style.animation = 'pulse 1s ease-in-out 3';
        }, 10);
    }

    showNotification(`Vous êtes l'utilisateur #${id}`, 'info');
});

/**
 * Réception de la liste des utilisateurs
 * 
 * ← Reçoit données de: Serveur Websocket (événement 'userList')
 * → Modifie: DOM (élément #user-list)
 */
socket.on('userList', (users) => {
    console.log('Liste des utilisateurs mise à jour:', users);
    if (userListElement) {
        // Animation de sortie pour l'ancienne liste
        userListElement.style.opacity = '0.5';
        userListElement.style.transform = 'scale(0.98)';
        
        setTimeout(() => {
            // Vider la liste actuelle
            userListElement.innerHTML = '';
            
            // Vérifier s'il y a des utilisateurs
            if (users.length === 0) {
                const emptyItem = document.createElement('li');
                emptyItem.textContent = 'Aucun utilisateur connecté';
                emptyItem.className = 'empty-list';
                userListElement.appendChild(emptyItem);
            } else {
                // Trier les utilisateurs par ID (ordre de connexion)
                users.sort((a, b) => a.id - b.id);
                
                // Ajouter chaque utilisateur à la liste avec animation décalée
                users.forEach((user, index) => {
                    setTimeout(() => {
                        // Création de l'élément de liste
                        const listItem = document.createElement('li');
                        
                        // Formatage de l'heure de connexion
                        const connectionDate = new Date(user.connectionTime);
                        const formattedTime = connectionDate.toLocaleTimeString();
                        
                        // Construction du contenu de l'élément
                        listItem.innerHTML = `
                            <span class="user-id-badge">#${user.id}</span>
                            <span class="connection-time">Connecté à ${formattedTime}</span>
                        `;
                        
                        // Ajout d'une classe si c'est l'utilisateur actuel
                        const myUserId = userIdElement ? userIdElement.textContent : null;
                        if (myUserId && user.id.toString() === myUserId) {
                            listItem.className = 'current-user';
                        }
                        
                        // Animation d'entrée pour chaque élément
                        listItem.style.opacity = '0';
                        listItem.style.transform = 'translateY(20px)';
                        
                        // Ajout à la liste
                        userListElement.appendChild(listItem);
                        
                        // Déclenchement de l'animation d'entrée
                        setTimeout(() => {
                            listItem.style.transition = 'all 0.3s ease-out';
                            listItem.style.opacity = '1';
                            listItem.style.transform = 'translateY(0)';
                        }, 10);
                    }, index * 100); // Décalage de 100ms entre chaque élément
                });
            }
            
            // Animation d'entrée pour la liste complète
            setTimeout(() => {
                userListElement.style.transition = 'all 0.3s ease-out';
                userListElement.style.opacity = '1';
                userListElement.style.transform = 'scale(1)';
            }, users.length * 100 + 100);
            
        }, 150);
    }
});

/**
 * Gestion des erreurs de connexion
 */
socket.on('connect_error', (error) => {
    console.error('Erreur de connexion:', error);
    showNotification('Erreur de connexion au serveur', 'error');
});

socket.on('reconnect', (attemptNumber) => {
    console.log(`Reconnexion réussie après ${attemptNumber} tentative(s)`);
    showNotification('Reconnexion réussie!', 'success');
});

/**
 * Ajout des styles pour les animations (injectés dynamiquement)
 */
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
            box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
        }
    }
`;
document.head.appendChild(animationStyles);