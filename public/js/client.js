/**
 * client.js - Client Websocket
 * 
 * Ce fichier est responsable de:
 * - Connexion au serveur Websocket
 * - Traitement des événements côté client
 * - Mise à jour de l'interface utilisateur
 * - Gestion du compte à rebours de réinitialisation
 * 
 * Créé le 05/05/2025
 * Dernière modification: 21/05/2025
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
const countdownElement = document.getElementById('countdown');
const countdownContainerElement = document.getElementById('countdown-container');

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
});

socket.on('disconnect', () => {
    console.log('Déconnecté du serveur Websocket');
    if (statusElement) {
        statusElement.textContent = 'Déconnecté';
        statusElement.className = 'disconnected';
    }
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
        userCountElement.textContent = count.toString();
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
    }
});

/**
 * Réception de la liste des utilisateurs
 * 
 * ← Reçoit données de: Serveur Websocket (événement 'userList')
 * → Modifie: DOM (élément #user-list)
 */
socket.on('userList', (users) => {
    console.log('Liste des utilisateurs mise à jour: ', users);
    if (userListElement) {
        // Vider la liste actuelle
        userListElement.innerHTML = '';

        // Vérifier s'il y a des utilisateurs
        if (users.length === 0) {
            const emptyItem = document.createElement('li');
            emptyItem.textContent = 'Aucun utilisateur connecté';
            emptyItem.className = 'emtpy-list';
            userListElement.appendChild(emptyItem);
            return
        }

        // Trier les utilisateurs par ID (ordre de connexion)
        users.sort((a, b) => a.id - b.id);

        // Ajouter chaque utilisateur à la liste
        users.forEach(user => {
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

            // Ajout à la liste
            userListElement.appendChild(listItem);
        });
    }
});

/**
 * Gestion du compte à rebours
 * 
 * ← Reçoit données de: Serveur WebSocket (événements liés au compte à rebours)
 * → Modifie: DOM (éléments liés au compte à rebours)
 */

// Début du compte à rebours
socket.on('countdownStart', (seconds) => {
    console.log(`Compte à rebours démarré: ${seconds} secondes`);

    if (countdownContainerElement) {
        countdownContainerElement.style.display = 'block';
    }
});

// MIse à jour du compte à rebours
socket.on('countdownUpdate', (seconds) => {
    console.log(`Compte à rebours: ${seconds} secondes restantes`);

    if (countdownElement) {
        countdownElement.textContent = seconds.toString();
    }
});

// Annulation du compte à rebours
socket.on('countdownCancel', () => {
    console.log('Compte à rebours annulé');

    if (countdownContainerElement) {
        countdownContainerElement.style.display = 'none';
    }
});

// Réinitialisation du système
socket.on('systemReset', () => {
    console.log('Système réinitialisé');

    if (countdownContainerElement) {
        countdownContainerElement.style.display = 'none';
    }

    // Si l'utilisateur est encore connecté, il recevra un nouvel ID
    // lors de sa prochaine connexion
});