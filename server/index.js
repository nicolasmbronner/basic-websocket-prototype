/**
 * index.js - Point d'entrée du serveur
 * 
 * Ce fichier est responsable de:
 * - Configuration du serveur Express
 * - Intégration de Socket.io pour WebSocket
 * - Gestion des connexions WebSocket et compteur d'utilisateurs
 * - Attribution d'IDs  uniques  aux utilisateurs
 * 
 * Créé le: 05/05/2025
 * Dernière modification: 09/05/2025
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

/**
 * Gestion des connexions WebSocket
 * 
 * ← Reçoit données de: Clients WebSocket (navigateur)
 */
io.on('connection', (socket) => {
    console.log('Nouvelle connexion WebSocket établie');

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
    })
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