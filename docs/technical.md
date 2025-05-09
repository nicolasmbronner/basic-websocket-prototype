# Documentation Technique - Détails d'implémentation

Cette documentation technique complète le [README.md](../README.md) en fournissant des détails d'implémentation pour les développeurs.

## Détails d'architecture

### Diagramme de séquence détaillé

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Serveur

    Note over C,S: Chargement initial
    C->>S: Demande HTTP GET /
    S->>C: Renvoie index.html
    C->>S: Demande style.css, client.js
    S->>C: Renvoie les fichiers demandés
    
    Note over C,S: Établissement WebSocket
    C->>S: Demande de connexion WebSocket
    S->>C: Accepte la connexion
    Note over S: Attribue ID utilisateur
    Note over S: Incrémente compteur d'utilisateurs
    S->>C: Envoi de l'ID attribué (userId)
    S->>C: Envoi du nombre d'utilisateurs (userCount)
    Note over C: Affiche "Connecté" (vert)
    Note over C: Affiche l'ID utilisateur
    Note over C: Met à jour le compteur d'utilisateurs
    
    Note over C,S: Fermeture de connexion
    C->>S: Fermeture onglet/navigateur
    S->>C: Ferme la connexion WebSocket
    Note over S: Retire utilisateur de la liste
    Note over S: Décrémente compteur d'utilisateurs
    S->>Tous: Diffuse le nombre d'utilisateurs mis à jour
    Note over Tous: Tous les clients mettent à jour leur affichage
```

### Diagramme du système d'IDs

```mermaid
graph TD
    A[Nouvelle connexion] -->|Socket.io 'connect'| B[Serveur]
    B -->|nextUserId++| C[Attribution d'ID unique]
    
    C -->|Création| D[Objet utilisateur]
    D -->|Ajout à| E[Liste d'utilisateurs actifs]
    E -->|Stockage| F[Tableau activeUsers]
    
    B -->|socket.emit| G[Envoi de l'ID au client]
    G -->|userId| H[Client reçoit son ID]
    H -->|Mise à jour DOM| I[Affichage de l'ID]
    
    J[Déconnexion] -->|Socket.io 'disconnect'| K[Recherche utilisateur]
    K -->|Par socketId| L[Suppression de la liste]
```

## Flux de données détaillé

### Côté serveur (server/index.js)

La gestion des IDs utilisateurs est implémentée comme suit:

```javascript
// Variables pour suivre les utilisateurs et le compteur
let connectedUsers = 0;
let nextUserId = 1;
const activeUsers = [];

// Nouvelle connexion
io.on('connection', (socket) => {
  // Attribution d'un ID unique à l'utilisateur
  const userId = nextUserId++;
  
  // Stockage des informations de l'utilisateur
  const userInfo = {
    id: userId,
    socketId: socket.id,
    connectionTime: new Date().toISOString()
  };
  
  // Ajout de l'utilisateur à la liste des utilisateurs actifs
  activeUsers.push(userInfo);
  
  // Envoi des informations à l'utilisateur qui vient de se connecter
  socket.emit('userId', userId);
  
  // Déconnexion
  socket.on('disconnect', () => {
    // Recherche et suppression de l'utilisateur de la liste des actifs
    const userIndex = activeUsers.findIndex(user => user.socketId === socket.id);
    if (userIndex !== -1) {
      activeUsers.splice(userIndex, 1);
    }
  });
});
```

### Côté client (public/js/client.js)

Le client reçoit et affiche son ID comme suit:

```javascript
// Référence à l'élément DOM pour l'ID utilisateur
const userIdElement = document.getElementById('user-id');

// Réception de l'ID utilisateur
socket.on('userId', (id) => {
    if (userIdElement) {
        userIdElement.textContent = id.toString();
    }
});
```

## Notes d'implémentation

### Système d'attribution d'IDs

Le système d'attribution d'IDs est simple mais efficace:

1. Une variable `nextUserId` commence à 1 et s'incrémente à chaque nouvelle connexion
2. L'ID est attribué AVANT l'incrémentation (post-incrémentation)
3. Cette approche garantit que chaque connexion reçoit un identifiant unique
4. Les IDs restent uniques même après des déconnexions/reconnexions

### Stockage des informations utilisateur

Chaque utilisateur est représenté par un objet contenant:

```javascript
{
  id: 1,                           // ID attribué séquentiellement
  socketId: 'abc123',              // ID technique de Socket.io
  connectionTime: '2025-05-05T...' // Horodatage ISO de la connexion
}
```

Ces informations sont stockées dans un tableau `activeUsers` qui:
- Garde une trace de tous les utilisateurs connectés
- Est mis à jour lors des connexions/déconnexions
- Permet de retrouver un utilisateur via son socketId lors d'une déconnexion

## Détails d'implémentation par étape

### Étape 3: Compteur d'utilisateurs

- Suivi du nombre d'utilisateurs connectés avec une variable
- Mise à jour du compteur lors des événements de connexion/déconnexion
- Diffusion des mises à jour à tous les clients connectés
- Affichage du compteur dans l'interface utilisateur

### Étape 4: Système d'IDs

- Attribution d'ID séquentiel (auto-incrémenté) à chaque nouvelle connexion
- Stockage des informations utilisateur dans un tableau
- Envoi de l'ID attribué au client concerné
- Affichage de l'ID dans l'interface utilisateur
- Nettoyage des informations utilisateur lors de la déconnexion

### Prochaines implémentations

#### Listing d'utilisateurs

Pour la prochaine étape, nous allons implémenter un listing complet des utilisateurs connectés:

- Envoyer la liste complète des utilisateurs connectés à tous les clients
- Mettre à jour cette liste à chaque connexion/déconnexion
- Afficher cette liste dans l'interface utilisateur
- Inclure les IDs et heures de connexion dans l'affichage