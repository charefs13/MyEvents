const express = require('express');
const session = require('express-session');
const utilisateurRouter = require('./router/UtilisateurRouter');
const prosRouter = require('./router/ProsRouter');
const evenementRouter = require('./router/evenementROuter');
const invitesRouter = require('./router/invitesRouter');
const profilRouter = require('./router/profilRouter');
const profilProsRouter = require('./router/profilProsRouter');
const prestationRouter = require('./router/prestationRouter');
const recherchePrestataireRouter = require('./router/recherchePrestataire');
           
                                 
const app = express();

// Middlewares d'analyse
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
   
// Gestion de session
app.use(session({
    secret: 'Sjkydbyjgg@zme;,geoo23323@:!',
    resave: true,
    saveUninitialized: true,
}));      
   
// Servir les fichiers statiques et routes
app.use(express.static('./public'));
app.use(utilisateurRouter);
app.use(prosRouter)
app.use(evenementRouter)
app.use(invitesRouter)  
app.use(profilRouter)
app.use(profilProsRouter)
app.use(prestationRouter)    
app.use(recherchePrestataireRouter)

app.listen(3000, () => {
    try {   
        console.log("Écoute sur le port 3000");
    } catch (error) {
        console.log("La connection au port 3000 a échoué");
    }
}); 
     