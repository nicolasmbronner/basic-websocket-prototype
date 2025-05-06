/**
 * client.js - Client Websocket
 * 
 * Ce fichier est responsable de:
 * - Connexion au serveur Websocket
 * - Traitement des événements côté client
 * - Mise à jour de l'interface utilisateur
 * 
 * Créé le 05/05/2025
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

/**
 * Gestion de l'événement de connexion
 * 
 * ← Reçoit données de: Serveur Socket.io
 * → Modifie: DOM (UI)
 */
socket.on('connect', () => {
    console.log('Connecté au serveur Websocket');
    if (statusElement) {
        statusElement.textContent = 'Connecté';
        statusElement.className = 'connected';
    }
});

/**
 * Gestion de l'événement de connexion
 * 
 * ← Reçoit données de: Serveur Socket.io
 * → Modifie: DOM (UI)
 */
socket.on('disconnect', () => {
    console.log('Déconnecté du serveur Websocket');
    if (statusElement) {
        statusElement.textContent = 'Déconnecté';
        statusElement.className = 'disconnected';
    }
})