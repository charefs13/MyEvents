const express = require('express');
const session = require('express-session');
const utilisateurRouter = require('./router/UtilisateurRouter');
const prosRouter = require('./router/ProsRouter');
const evenementRouter = require('./router/evenementROuter');
const invitesRouter = require('./router/invitesRouter');

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
app.listen(3000, () => {
    try {   
        console.log("Écoute sur le port 3000");
    } catch (error) {
        console.log("La connection au port 3000 a échoué");
    }
}); 
     