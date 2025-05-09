/**
 * client.js - Client Websocket
 * 
 * Ce fichier est responsable de:
 * - Connexion au serveur Websocket
 * - Traitement des événements côté client
 * - Mise à jour de l'interface utilisateur
 * 
 * Créé le 05/05/2025
 * Dernière modification: 09/05/2025
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