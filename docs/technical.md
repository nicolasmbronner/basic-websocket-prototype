# Documentation Technique - Projet WebSocket

## Architecture du projet

Ce projet utilise une architecture client-serveur avec communication bidirectionnelle en temps réel via WebSocket.

### Structure des fichiers

```
websocket-demo/
├── node_modules/
├── public/
│   ├── css/
│   │   └── style.css       # Styles CSS pour l'interface utilisateur
│   ├── js/
│   │   └── client.js       # Client WebSocket et logique frontend
│   └── index.html          # Page HTML principale
├── server/
│   └── index.js            # Serveur Express et gestionnaire WebSocket
├── docs/
│   └── technical.md        # Cette documentation
├── .gitignore              # Fichiers ignorés par Git
└── package.json            # Configuration du projet
```

## Diagrammes

### Diagramme d'architecture

```mermaid
graph TD
    A[Client Navigateur] <-->|WebSocket| B[Serveur Socket.io]
    B -->|Intégré à| C[Serveur Express]
    C -->|Sert| D[Fichiers Statiques]
    D -->|Chargés par| A
    
    classDef browser fill:#f9f,stroke:#333,stroke-width:2px;
    classDef server fill:#bbf,stroke:#333,stroke-width:2px;
    classDef files fill:#bfb,stroke:#333,stroke-width:2px;
    
    class A browser;
    class B,C server;
    class D files;
```

### Diagramme de séquence pour la connexion WebSocket

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
    Note over S: Log "Nouvelle connexion WebSocket établie"
    Note over C: Affiche "Connecté" (vert)
    
    Note over C,S: Fermeture de connexion
    C->>S: Fermeture onglet/navigateur
    S->>C: Ferme la connexion WebSocket
    Note over S: Log "Client déconnecté"
```

## Étapes implémentées

### 1. Structure initiale

- [x] Configuration du serveur Express
- [x] Structure des dossiers et fichiers de base
- [x] Page HTML minimale

**Détails techniques:**
- Utilisation des ES modules (type: "module" dans package.json)
- Configuration des fichiers statiques avec `app.use(express.static("public"))`
- Utilisation de la méthode `res.sendFile('index.html', { root: 'public' })` pour servir l'index

### 2. WebSocket basique

- [x] Intégration de Socket.io au serveur Express
- [x] Configuration du client WebSocket
- [x] Gestion des événements de connexion/déconnexion
- [x] Indicateur visuel de l'état de connexion

**Détails techniques:**
- Socket.io est intégré au serveur HTTP créé avec Express
- Le client Socket.io est automatiquement servi via `/socket.io/socket.io.js`
- Les événements `connect` et `disconnect` sont utilisés pour suivre l'état de la connexion

## Prochaines étapes

- [ ] Compteur d'utilisateurs - Suivi et affichage du nombre d'utilisateurs connectés
- [ ] Système d'IDs - Attribution d'IDs auto-incrémentés aux utilisateurs
- [ ] Listing d'utilisateurs - Affichage de la liste des utilisateurs connectés
- [ ] Compte à rebours - Implémentation du système de réinitialisation après déconnexion
- [ ] Amélioration UI - Soigner l'interface utilisateur
- [ ] Documentation finale - Finaliser la documentation complète