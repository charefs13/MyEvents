const profilProsRouter = require('express').Router();
const authguard = require("../services/authguard");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Affichage du profil professionnel
profilProsRouter.get('/profilPros', authguard, async (req, res) => {
    res.render('pages/profilPros.twig', {
        utilisateur: req.session.utilisateur,
        entreprise: req.session.entreprise

    });
});

// Mise à jour du profil professionnel
profilProsRouter.post('/updateEntreprise', authguard, async (req, res) => {
    try {
        const { raisonSociale, siret, type, adresse, cp, ville } = req.body;

        const updateEntreprise = await prisma.entreprise.update({
            where: { utilisateurId: req.session.utilisateur.id },
            data: {
                raisonSociale,
                siret,
                type,
                adresse,
                cp: parseInt(cp),
                ville
            }
        });

        res.render('pages/profilPros.twig', {
            utilisateur: req.session.utilisateur,
            entreprise: updateEntreprise,
            successMessage: " ✅ Les informations ont été correctement mises à jour !"
        });

    } catch (error) {
        console.log(error);
        res.render('pages/profilPros.twig', {
            utilisateur: req.session.utilisateur,
            errorMessage: "Une erreur est survenue lors de la modification."
        });
    }
});

// Page de confirmation de suppression
profilProsRouter.get('/confirmDeleteEntreprise', authguard, (req, res) => {
    res.render('pages/confirmDelete.twig', {
        utilisateur: req.session.utilisateur
    });
});

// Suppression de l'etreprise et de l'utilisateur rattaché
profilProsRouter.post('/deleteEntreprise/:userId', authguard, async (req, res) => {
    try {
        const utilisateur = await prisma.utilisateur.findFirst({
            where: {
                id: parseInt(req.params.userId)
            }
        })

        if (utilisateur.isEntreprise) {
            await prisma.entreprise.delete({
                where: {
                    utilisateurId: parseInt(req.params.userId)
                }
            });
        }
        // Supprimer l'utilisateur
        await prisma.utilisateur.delete({
            where: {
                id: parseInt(req.params.userId)
            }
        });

        req.session.destroy()
        res.redirect("/")
    } catch (error) {
        console.log(error)
        res.render('pages/deleteEntreprise.twig', {
            utilisateur: req.session.utilisateur
        }
        )
    }
})



module.exports = profilProsRouter;
