const invitesRouter = require('express').Router()
const authguard = require("../services/authguard")
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendContactEmail, notificationEmail, sendInviteEmail } = require('../services/sendResetEmail.js');
const { scriptInjectionRegex } = require('../services/regex');


invitesRouter.get('/invites', authguard, async (req, res) => {
    try {
        const utilisateur = await prisma.utilisateur.findFirst({
            where: {
                email: req.session.utilisateur.email
            },
            include: {
                evenements: true
            }
        });

        res.render('pages/invites.twig', {
            utilisateur: req.session.utilisateur,
            evenements: utilisateur.evenements // Les événements incluent déjà les invités
        });
    } catch (error) {
        console.log(error)
        res.redirect('/invites');
    }
});



invitesRouter.post('/addInvite', authguard, async (req, res) => {
    try {
        const utilisateur = await prisma.utilisateur.findFirst({
            where: {
                email: req.session.utilisateur.email
            },
            include: {
                evenements: true
            }
        });
        const invite = await prisma.invite.create({
            data: {
                nom: req.body.nom,
                prenom: req.body.prenom,
                email: req.body.email,
                evenementId: parseInt(req.body.evenement)
            }
        })

        res.render('pages/invites.twig', {
            successMessage: ` ✅ L'invité a bien été ajouté`,
            utilisateur: req.session.utilisateur,
            evenements: utilisateur.evenements
        })

    } catch (error) {
        console.log(error)
        res.render('pages/invites.twig', {
            errorMessage: `Une erreur est survenue, l'invité n'a pas été ajouté à l'événement`,
            utilisateur: req.session.utilisateur,
            evenements: utilisateur.evenements

        })
    }
})

invitesRouter.get('/displayInvites', authguard, async (req, res) => {
    const evenementId = parseInt(req.query.evenementId); // Récupère l'ID de l'événement depuis la query string
    try {
        const utilisateur = await prisma.utilisateur.findFirst({
            where: { email: req.session.utilisateur.email },
            include: { evenements: true }
        });

        // Récupérer les invités de l'événement
        const evenement = await prisma.evenement.findFirst({
            where: {
                id: evenementId,
                utilisateurId: req.session.utilisateur.id, // Vérifie que l'événement appartient à l'utilisateur connecté
            },
            include: { invites: true }
        });

        res.render('pages/invites.twig', {
            utilisateur: req.session.utilisateur,
            evenement,
            invites: evenement.invites,
            evenements: utilisateur.evenements, // Liste complète pour permettre de sélectionner un autre événement
        });

    } catch (error) {
        console.log(error);
        res.redirect('/invites')
    }
});
    
invitesRouter.post('/sendEmail/evenement/:evenementId', authguard, async (req, res) => {
    try {
        const utilisateur = await prisma.utilisateur.findFirst({
            where: {
                email: req.session.utilisateur.email
            },
            include: {
                evenements: true
            } 
        });
        const evenementId = parseInt(req.params.evenementId)

        const { invites, all, emailText } = req.body;

        let selectedInvites = [];

        if (all) {
            // Sélectionner tous les invités avec un email valide
            selectedInvites = await prisma.invite.findMany({
                where: {
                    AND: [
                        { email: { not: null } },
                        { evenementId: evenementId }
                    ]
                }
            });


        } else if (invites && invites.length > 0) {
            // Récupérer uniquement les invités sélectionnés
            selectedInvites = await prisma.invite.findMany({
                where: {
                    AND: [
                        { evenementId: evenementId },
                        { id: { in: invites.map(Number) } },
                        { email: { not: null } }
                    ]
                }
            });
        }

        // Vérification si aucun invité n'a été sélectionné
        if (selectedInvites.length === 0) {
            return res.render('pages/invites.twig', {

                errorMessage: "Aucun invité sélectionné. Veuillez réessayer.",
                utilisateur: req.session.utilisateur,
                evenements: utilisateur.evenements
            });
        }

        // Envoi des emails
        for (const invite of selectedInvites) {
            const emailMessage = emailText
                .replace(/prénom|Prénom|prenom|Prenom/gi, invite.prenom)
                .replace(/nom|Nom/gi, invite.nom);

            await sendInviteEmail(invite.email, emailMessage);
        }
        res.render('pages/invites.twig', {
            utilisateur: req.session.utilisateur,

            successMessage: "✅ Les emails ont été envoyés avec succès !",
            invites: await prisma.invite.findMany({ where: { email: { not: null } } }),
            evenements: utilisateur.evenements
        });

    } catch (error) {
        console.error("Erreur lors de l'envoi des emails :", error);
        res.render('pages/invites.twig', {
            errorMessage: "Une erreur est survenue lors de l'envoi des emails.",
            utilisateur: req.session.utilisateur,
            evenements: utilisateur.evenements
        });
    }
});

invitesRouter.get('/selectInvite', authguard, async (req, res) => {
    try {
        const selectedInviteId = parseInt(req.query.selectedInvite);  // Utilisation de req.query pour récupérer les paramètres dans l'URL
        console.log(selectedInviteId);


        const selectedInvite = await prisma.invite.findFirst({
            where: {
                id: selectedInviteId,
            },
        });

        if (!selectedInvite) {
            return res.render('pages/invites.twig', {
                utilisateur: req.session.utilisateur,
                errorMessage: "Aucun invité trouvé avec cet identifiant.",
            });
        }

        const evenement = await prisma.evenement.findFirst({
            where: { id: selectedInvite.evenementId },
        });

        res.render('pages/invites.twig', {
            utilisateur: req.session.utilisateur,

            selectedInvite: selectedInvite,
            evenement: evenement,
        });
    } catch (error) {
        console.error("Erreur :", error);
        res.render('pages/invites.twig', {
            errorMessage: "Une erreur est survenue.",
            utilisateur: req.session.utilisateur,
            evenements: utilisateur.evenements
        });
    }
});

invitesRouter.get('/deleteInvite/:id', authguard, async (req, res) => {
    try {
        const utilisateur = await prisma.utilisateur.findFirst({
            where: {
                email: req.session.utilisateur.email
            },
            include: {
                evenements: true
            }
        });
        const deleteInvite = await prisma.invite.delete({
            where: {
                id: parseInt(req.params.id)
            }
        })
        res.render('pages/invites.twig', {
            utilisateur: req.session.utilisateur,
            successMessage: " ✅ L'invité a été supprimé de votre événenement !",
            utilisateur: req.session.utilisateur,
            evenements: utilisateur.evenements
          
        })

    } catch (error) {
        console.log(error)
        res.render('pages/invites.twig', {
            errorMessage: "Une erreur est survenue lors de la suppression.",
            utilisateur: req.session.utilisateur,
            evenements: utilisateur.evenements
          
        });

    }
})

invitesRouter.post('/updateInvite/:id', authguard, async (req, res) => {
    try {
        const utilisateur = await prisma.utilisateur.findFirst({
            where: {
                email: req.session.utilisateur.email
            },
            include: {
                evenements: true
            }
        });
        const updateInvite = await prisma.invite.update({
            where: {
                id: parseInt(req.params.id)
            },
            data: {
                nom: req.body.nom,
                prenom: req.body.prenom,
                email: req.body.email
            }
        })
        res.render('pages/invites.twig', {
            utilisateur: req.session.utilisateur,
            successMessage: " ✅ Les informations ont été correctement mises à jour !",
            utilisateur: req.session.utilisateur,
            evenements: utilisateur.evenements
        })

    } catch (error) {
        console.log(error)
        res.render('pages/invites.twig', {
            errorMessage: "Une erreur est survenue lors de la modification.",
            utilisateur: req.session.utilisateur,
            evenements: utilisateur.evenements
        });
    }
})


module.exports = invitesRouter

