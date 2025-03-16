require('dotenv').config(); // Charger les variables d'environnement

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const utilisateurRouter = require('./router/UtilisateurRouter');
const prosRouter = require('./router/ProsRouter');
const evenementRouter = require('./router/evenementRouter');
const invitesRouter = require('./router/invitesRouter');
const profilRouter = require('./router/profilRouter');
const profilProsRouter = require('./router/profilProsRouter');
const prestationRouter = require('./router/prestationRouter');
const recherchePrestataireRouter = require('./router/recherchePrestataire');
const devisRouter = require('./router/devisRouter');
const planningRouter = require('./router/planningRouter');
const app = express();
const PORT = process.env.PORT
const SESSION_SECRET = process.env.SESSION_SECRET || 'fallback_secret'; // Sécurité renforcée avec dotenv

// Middlewares d'analyse
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Gestion de session sécurisée    
app.use(session({
    secret: SESSION_SECRET, // Stocké dans .env pour plus de sécurité
    resave: true, 
    saveUninitialized: true, 
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Activer en HTTPS
        httpOnly: true, // Empêche l'accès aux cookies via JavaScript (XSS)
        sameSite: 'strict', // Protège contre les attaques CSRF
        maxAge: 1000 * 60 * 60 * 24, // Expire après 1 jour
    },
}));
app.use(cors());
                     
// Servir les fichiers statiques
app.use(express.static('./public'));

// Routes
app.use(utilisateurRouter);
app.use(prosRouter); 
app.use(evenementRouter);
app.use(invitesRouter);
app.use(profilRouter);
app.use(profilProsRouter);
app.use(prestationRouter);
app.use(recherchePrestataireRouter);
app.use(devisRouter);
app.use(planningRouter);

// Démarrage du serveur avec gestion des erreurs
app.listen(PORT, () => {
    console.log(`✅ Écoute sur le port ${PORT}`);
}).on('error', (err) => {
    console.error(`❌ Erreur lors du démarrage du serveur : ${err.message}`);
});
