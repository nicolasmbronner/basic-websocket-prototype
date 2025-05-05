/**
 * index.js - Point d'entrée du serveur
 * 
 * Ce fichier est responsable de:
 * - Configuration du serveur Express de base
 * - Servir la page HTML principale
 * 
 * Créé le: 05/05/2025
 */

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Récupération du chemin du fichier actuel (nécessaire en ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// initialisation d'Express
const app = express();

// Configuration des fichiers statiques
app.use(express.static(join(__dirname, '../public')));

// Route principale
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, '../public/index.html'));
});

// Démarrage du serveur
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});