/**
 * index.js - Point d'entrée du serveur
 * 
 * Ce fichier est responsable de:
 * - Configuration du serveur Express
 * - Intégration de Socket.io pour WebSocket
 * - Gestion des connexions WebSocket et compteur d'utilisateurs
 * - Attribution d'IDs  uniques  aux utilisateurs
 * - Gestion et diffusion de la liste des utilisateurs connectés
 * - Système de réinitialisation automatique après inactivité
 * 
 * Créé le: 05/05/2025
 * Dernière modification: 21/05/2025
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

// initialisation d'Express et du serveur HTTP
const app = express();
const server = createServer(app);

/**
 * Initialisation de Socket.io
 * 
 * ← Reçoit données de: Serveur HTTP Express
 * → Envoie données vers: Clients WebSocket
 */
const io = new Server(server);

// Configuration des fichiers statiques
app.use(express.static("public"));

// Variable pour suivre les utilisateurs et le compteur
let connectedUsers = 0;
let nextUserId = 1;
const activeUsers = [];

// Variables pour le système de compte à rebours
let countdownTimer = null;
const COUNTDOWN_DURATION = 20; // durée en secondes
let countdownRemaining = 0;

/**
 * Fonction utilitaire pour diffuser la liste des utilisateurs à tous les clients
 * 
 * → Envoie données vers: Clients WebSocket
 */
function broadcastUserList() {
    // Création d'une version simplifiée de la liste des socketIds
    // (qui sont des informations techniques internes)
    const userList = activeUsers.map(user => ({
        id: user.id,
        connectionTime: user.connectionTime
    }));

    // Envoi de la liste à tous les clients
    io.emit('userList', userList);
}

/**
 * Fonction pour démarrer le compte à rebours de réinitialisation
 * Se déclenche quand le dernier utilisateur se déconnecte
 */
function startCountdown() {
    // Initialisation du temps restant
    countdownRemaining = COUNTDOWN_DURATION;

    // Envoyer une mise à jour chaque seconde (uniquement logs serveur)
    countdownTimer = setInterval(() => { // Exécute callback de façon répétée à intervalles réguliers
        countdownRemaining--;
        console.log(`Compte à rebours: ${countdownRemaining} secondes restantes`);

        // Si le compte à rebours est terminé
        if (countdownRemaining <= 0) {
            resetSystem();
        }
    }, 1000);

    console.log(`Compte à rebours démarré: ${COUNTDOWN_DURATION} secondes`);
}

/**
 * Fonction pour annuler le compte à rebours
 * Se déclenche quand un utilisateur se connecte pendant le compte à rebours
 */
function cancelCountdown() {
    if (countdownTimer) {
        clearInterval(countdownTimer); // Arrête le compte à rebours défini plus haut
        countdownTimer = null;
        countdownRemaining = 0;

        console.log('Compte à rebours annulé');
    }
}

/**
 * Fonction pour réinitialiser le système après le compte à rebours
 * Remet à zéro les compteurs et la liste d'utilisateurs
 */
function resetSystem() {
    // Arrêter le compte à rebours
    if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
    }

    // Réinitialiser les compteurs
    nextUserId = 1;

    console.log('Système réinitialisé');
}


/**
 * Gestion des connexions WebSocket
 * 
 * ← Reçoit données de: Clients WebSocket (navigateur)
 */
io.on('connection', (socket) => {
    console.log('Nouvelle connexion WebSocket établie');

    // Si un compte à rebours est en cours, l'annuler
    if (countdownTimer) {
        cancelCountdown();
    }

    // Attribution d'un ID unique à l'utilisateur
    const userID = nextUserId++;
    const connectionTime = new Date().toISOString();

    // Stockage des informations de l'utilisateur
    const userInfo = {
        id: userID,
        socketId: socket.id,
        connectionTime: connectionTime
    };

    // Ajout de l'utilisateur à la liste des utilisateurs actifs
    activeUsers.push(userInfo);

    // Incrémentation du compteur d'utilisateurs
    connectedUsers++;
    console.log(`Utilisateur #${userID} connecté | Total: ${connectedUsers} utilisateur(s)`);

    // Envoi des informations à l'utilisateur qui vient de se connecter
    socket.emit('userId', userID);
    
    // Envoi du compteur à tous les clients (y compris le nouveau)
    io.emit('userCount', connectedUsers);

    // Diffusion de la liste mise à jour des utilisateurs
    broadcastUserList();

    // Déconnexion
    socket.on('disconnect', () => {
        console.log('Client déconnecté');

        // Recherche de l'utilisateur dans le tableau par son socketId
        // findIndex parcourt le tableau et retourne l'index de l'élément qui correspond
        // à la condition (ici, avoir le même socketId que le socket actuel)
        // Si aucun élément ne correspond, findIndex retourne -1
        const userIndex = activeUsers.findIndex(user => user.socketId === socket.id);

        // Si l'utilisateur est trouvé dans le tableau (index différent de -1)
        if (userIndex !== -1) {
            // Suppression de l'utilisateur du tableau activeUsers
            // splice modifie le tableau original en supprimant des éléments
            // Le premier argument (userIndex) est la position de départ
            // Le second argument (1) est le nombre d'éléments à supprimer
            activeUsers.splice(userIndex, 1);
        }

        // Décrémentation du compteur d'utilisateurs
        connectedUsers--;
        console.log(`Total: ${connectedUsers} utilisateur(s) connecté(s)`);

        // Envoi du compteur mis à jour à tous les clients restants
        io.emit('userCount', connectedUsers);

        // Diffusion de la liste mise à jour des utilisateurs
        broadcastUserList();

        // Si c'était le dernier utilisateur, démarrer le compte à rebours
        if (connectedUsers === 0) {
            startCountdown();
        }
    });
});

// Route principale
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: 'public' });
});

// Démarrage du serveur
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});