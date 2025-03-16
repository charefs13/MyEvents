const planningRouter = require('express').Router();
const bcrypt = require('bcrypt');
const authguard = require("../services/authguard.js");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); // Assure-toi de créer une instance de PrismaClient

const { sendContactEmail, notificationEmail } = require('../services/sendResetEmail.js');
const { scriptInjectionRegex } = require('../services/regex');

// Route pour afficher la page avec le calendrier
planningRouter.get('/planning', authguard, async (req, res) => {
    try {
        // Récupérer les tâches de l'utilisateur
        const taches = await prisma.tache.findMany({
            where: {
                utilisateurId: req.session.utilisateur.id
            }
        });

        // Récupérer les informations de l'utilisateur
        const utilisateur = await prisma.utilisateur.findFirst({
            where: {
                id: req.session.utilisateur.id
            },
            include: {
                evenements: true // Si besoin d'afficher les événements ailleurs dans la page
            }
        });

        // Rendre la page planning.twig avec les données
        res.render('pages/planning.twig', {
            taches: taches,
            evenements: utilisateur.evenements,
            utilisateur: utilisateur
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des tâches:', error);
        res.render('pages/planning.twig', { taches: [], evenements: [], utilisateur: null });
    }
});


// Route API pour récupérer les tâches (FullCalendar)
planningRouter.get('/api/tasks', authguard, async (req, res) => {
    try {
        const taches = await prisma.tache.findMany({
            where: {
                utilisateurId: req.session.utilisateur.id
            }
        });

        // Formatage des tâches pour FullCalendar
        const formattedTasks = taches.map(task => ({
            id: task.id,
            title: task.titre,
            start: task.debut.toISOString(),
            end: task.fin.toISOString(),
            description: task.description
        }));
        res.json(formattedTasks);
      
    } catch (error) {
        console.error("Erreur lors de la récupération des tâches :", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

planningRouter.post('/tasks/delete/:id', authguard, async (req, res) => {
    try {
        // Supprimer la tâche dans la base de données
        const deleteTask = await prisma.tache.delete({
            where: {
                id: parseInt(req.params.id)
            }
        });

        // Réponse JSON indiquant que la tâche a été supprimée
        res.json({ message: 'Tâche supprimée avec succès', taskId: deleteTask.id });
    } catch (error) {
        console.log(error);
        // Réponse d'erreur en cas de problème
        res.status(500).json({ error: 'Erreur lors de la suppression de la tâche' });
    }
});
 
  

// // Route pour ajouter une tâche (rendez-vous) dans le calendrier
// planningRouter.post('/planning/createTask', async (req, res) => {
//     const { titre, description, debut, fin } = req.body;

//     try {
//         // Enregistrer la tâche dans la base de données
//         const newTask = await prisma.tache.create({
//             data: {
//                 titre: titre,
//                 description: description,
//                 debut: debut,
//                 fin: fin,
//                 utilisateurId: req.session.utilisateur.id
//             },
//         });

//         // Renvoie l'événement ajouté en réponse
//         res.json(newTask);
//     } catch (error) {
//         console.error('Erreur lors de l\'ajout de la tâche:', error);
//         res.status(500).send('Erreur serveur');
//     }
// });

module.exports = planningRouter;
