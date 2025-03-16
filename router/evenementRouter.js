const evenementRouter = require('express').Router()
const authguard = require("../services/authguard")
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendContactEmail, notificationEmail } = require('../services/sendResetEmail.js');
const { scriptInjectionRegex } = require('../services/regex');



//affichage de ma page événement pour ajouter ou modifier des evenements
evenementRouter.get('/evenement', authguard, async (req, res) => {
    const utilisateur = await prisma.utilisateur.findFirst({
        where: {
            email: req.session.utilisateur.email
        },
        include: { evenements: true }

    })
    res.render('pages/evenement.twig',
        {
            utilisateur: req.session.utilisateur,
            evenements: utilisateur.evenements,
            errorMessage: req.session.errorMessage,
            successMessage: req.session.successMessage
        })
})

evenementRouter.post('/createEvent', authguard, async (req, res) => {
    try {
        const { typeEvenement, title, description, startDate, endDate, startTime, endTime } = req.body;
        
        const evenement = await prisma.evenement.create({
            data: {
                type: typeEvenement,
                titre: title,
                description: description,
                dateDebut: new Date(`${startDate}T${startTime}`),
                dateFin: new Date(`${endDate}T${endTime}`),
                utilisateurId: req.session.utilisateur.id
            }
        });

        const tache = await prisma.tache.create({
            data: {
                titre: title,
                description: description,
                debut: new Date(`${startDate}T${startTime}`),
                fin: new Date(`${endDate}T${endTime}`),
                utilisateurId: req.session.utilisateur.id,
                evenementId: evenement.id
            }
        });

        const utilisateur = await prisma.utilisateur.findFirst({
            where: {
                email: req.session.utilisateur.email
            },
            include: { evenements: true }
        });

        // Formatage des dates en français
        const eventStart = new Date(`${startDate}T${startTime}`);
        const eventEnd = new Date(`${endDate}T${endTime}`);

        const formattedStartDate = eventStart.toLocaleDateString('fr-FR', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        const formattedEndDate = eventEnd.toLocaleDateString('fr-FR', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        const formattedStartTime = eventStart.toLocaleTimeString('fr-FR', {
            hour: '2-digit', minute: '2-digit'
        });
        const formattedEndTime = eventEnd.toLocaleTimeString('fr-FR', {
            hour: '2-digit', minute: '2-digit'
        });

        const objet = "Votre événement est en ligne sur MyEvents ! 🎉";

        const message = `Bonjour,

Votre événement ${evenement.titre} a bien été ajouté sur MyEvents ! 🎊

📅 Date : Du ${formattedStartDate} à ${formattedStartTime} au ${formattedEndDate} à ${formattedEndTime}

✅ Cet événement a été ajouté à votre planning sur MyEvents.

Vous pouvez à tout moment le modifier ou l’annuler depuis votre espace personnel.

Bonne organisation ! 🚀 

L’équipe MyEvents  
📧 auto.myevents@gmail.com | 🌐 www.myevents.com`;

        notificationEmail(utilisateur.email, message, objet);

        const successMessage = "✅ Nouvel événement créer avec succès. Il a été ajouté à votre Planning";

        req.session.successMessage = successMessage;
        res.redirect('/evenement');

    } catch (error) {
        console.log(error);

        const errorMessage = "Une erreur s'est produite. Veuillez réessayer plus tard.";

        req.session.errorMessage = errorMessage;
        res.redirect('/evenement');
    }
});



//Modification d'un evenement

evenementRouter.post('/updateEvent/:id', authguard, async (req, res) => {
    try {
        
        const utilisateur = await prisma.utilisateur.findFirst({
            where: {
                email: req.session.utilisateur.email
            },
            include: { evenements: true }

        })
        const { typeEvenement, title, description, lieu, startDate, endDate, startTime, endTime } = req.body

        const evenement = await prisma.evenement.findFirst({
            where: {
                id: parseInt(req.params.id)
            }
        })

        if (evenement) {
            let startDateTime = evenement.dateDebut;
            let endDateTime = evenement.dateFin;

        }
        // Si l'utilisateur a modifié la date de début
        if (startDate) {
            startDateTime = new Date(startDate);
        }

        // Si l'utilisateur a modifié la date de fin
        if (endDate) {
            endDateTime = new Date(endDate);
        }

        // Si l'utilisateur a modifié l'heure de début
        if (startTime) {
            startDateTime = new Date(`${startDateTime.toISOString().split('T')[0]}T${startTime}`);
        }

        // Si l'utilisateur a modifié l'heure de fin
        if (endTime) {
            endDateTime = new Date(`${endDateTime.toISOString().split('T')[0]}T${endTime}`);
        }
        const updatedEvent = await prisma.evenement.update({

            where: {
                id: parseInt(req.params.id)
            },
            data: {
                type: typeEvenement,
                titre: title,
                description: description,
                lieu: lieu,
                dateDebut: startDateTime,
                dateFin: endDateTime,
                utilisateurId: req.session.utilisateur.id
            }
        })
        const updateTask = await prisma.tache.updateMany({
            where: {
                evenementId: parseInt(req.params.id)
            },
            data: {
                titre: title,
                description: description,
                debut: startDateTime,
                fin: endDateTime
            }
        })

        const objet = "Votre événement a été mis à jour ✅";

        const message = `Bonjour ${utilisateur.nom} ${utilisateur.prenom},

Les modifications apportées à votre événement "${title}" ont bien été enregistrées ! 📝

Vous pouvez consulter les détails et continuer à organiser votre événement sur MyEvents.

Besoin d’aide ? Nous sommes là pour vous !

L’équipe MyEvents  
📧 auto.myevents@gmail.com | 🌐 www.myevents.com`;

        notificationEmail(utilisateur.email, message, objet);


        const successMessage = " ✅ Votre événement a été modifié avec succès. Votre Planning a été mis à jour"

        req.session.successMessage = successMessage
        res.redirect('/evenement')
    } catch (error) {
        console.log(error)

        const errorMessage = "Une erreur s'est produite. Veuillez réessayer plus tard."

        req.session.errorMessage = errorMessage
        res.redirect('/evenement')
    }
})


//Suppression d'un événement
evenementRouter.get('/deleteEvent/:id', async (req, res) => {
    try {
        const utilisateur = await prisma.utilisateur.findFirst({
            where: {
                email: req.session.utilisateur.email
            },
            include: { evenements: true }

        })
        const deleteEvent = await prisma.evenement.delete({
            where: {
                id: parseInt(req.params.id)
            }
        })
        const successMessage = " ✅ L'événement a bien été supprimé. Votre Planning a été mis à jour. "

        req.session.successMessage = successMessage
        res.redirect('/evenement')

        const objet = "Votre événement a été supprimé";

        const message = `Bonjour ${utilisateur.nom} ${utilisateur.prenom},

Votre événement "${deleteEvent.titre}" a été supprimé avec succès. 🗑️

Si cette action n’a pas été initiée par vous, contactez-nous immédiatement.

À bientôt sur MyEvents !

L’équipe MyEvents    
📧 auto.myevents@gmail.com | 🌐 www.myevents.com`;

        notificationEmail(utilisateur.email, message, objet);


    } catch (error) {
        console.log(error)

        const errorMessage = "Une erreur s'est produite. Veuillez réessayer plus tard."

        req.session.errorMessage = errorMessage
        res.redirect('/evenement')
    }
})

module.exports = evenementRouter 