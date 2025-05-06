/**
 * index.js - Point d'entrée du serveur
 * 
 * Ce fichier est responsable de:
 * - Configuration du serveur Express
 * - Intégration de Socket.io pour WebSocket
 * - Gestion des connexions WebSocket de base
 * 
 * Créé le: 05/05/2025
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

/**
 * Gestion des connexions WebSocket
 * 
 * ← Reçoit données de: Clients WebSocket (navigateur)
 */
io.on('connection', (socket) => {
    console.log('Nouvelle connexion WebSocket établie');

    socket.on('disconnect', () => {
        console.log('Client déconnecté');
    })
});

// Route principale
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: 'public' });
});

// Démarrage du serveur
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});