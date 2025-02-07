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
            successMessage: "Les informations ont été correctement mises à jour !"
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

// Suppression du profil professionnel
profilProsRouter.get('/deleteEntreprise', authguard, async (req, res) => {
    try {
        await prisma.entreprise.delete({
            where: { utilisateurId: req.session.utilisateur.id }
        });

        req.session.destroy();
        res.redirect("/");
    } catch (error) {
        console.log(error);
        res.redirect('/profilPros');
    }
});

module.exports = profilProsRouter;
