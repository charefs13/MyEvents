const recherchePrestataireRouter = require('express').Router()
const authguard = require("../services/authguard")
const { PrismaClient } = require('@prisma/client');
const PDFDocument = require("pdfkit");
const prisma = new PrismaClient();
const moment = require("moment"); // Pour gérer la date facilement

// Route de recherche des prestataires
recherchePrestataireRouter.get('/recherchePrestataire', authguard, async (req, res) => {
    try {
        // Recherche des entreprises correspondant aux critères (ville et type d'entreprise)
        const entreprises = await prisma.entreprise.findMany({
            where: {
                ville: req.query.ville,
                type: req.query.type
            },
            include: {
                prestations: true // Inclure les prestations de chaque entreprise
            }
        });

        // Récupération des informations de l'utilisateur connecté
        const utilisateur = await prisma.utilisateur.findFirst({
            where: {
                id: req.session.utilisateur.id
            },
            include: {
                evenements: true // Inclure les événements liés à l'utilisateur
            }
        });

        // Stockage des données en session
        req.session.entreprises = entreprises;
        req.session.utilisateur = utilisateur;

        // Affichage de la page de recherche avec les données
        res.render('pages/recherchePrestataire.twig', {
            utilisateur: req.session.utilisateur,
            entreprises: entreprises,
            evenements: req.session.utilisateur.evenements
        });
    } catch (error) {
        console.log(error);
        res.render('pages/utilisateurDashboard.twig', {
            utilisateur: req.session.utilisateur,
            entreprises: entreprises,
            evenements: req.session.utilisateur.evenements
        });
    }
});

// Route pour afficher les prestations d'une entreprise sélectionnée
recherchePrestataireRouter.get('/entreprise/:id/prestations', authguard, async (req, res) => {
    try {
        // Recherche de l'entreprise et de ses prestations
        const entreprise = await prisma.entreprise.findFirst({
            where: {
                id: parseInt(req.params.id)
            },
            include: { prestations: true }
        });
        console.log(entreprise.id)
        // Récupération des informations de l'utilisateur
        const utilisateur = await prisma.utilisateur.findFirst({
            where: {
                id: req.session.utilisateur.id
            },
            include: {
                evenements: true
            }
        });

        req.session.entreprise = entreprise;
        req.session.utilisateur = utilisateur;

        // Affichage de la page de devis avec les prestations de l'entreprise
        res.render('pages/devis.twig', {
            utilisateur: req.session.utilisateur,
            evenements: utilisateur.evenements,
            entreprise: entreprise,
            prestations: entreprise.prestations,
        });
    } catch (error) {
        console.log(error);
        res.render('pages/utilisateurDashboard.twig', {
            errorMessage: "Une erreur est survenue. Votre demande n'a pas abouti"
        });
    }
});

// Route pour générer un devis en PDF
recherchePrestataireRouter.get('/devis/pdf', authguard, async (req, res) => {
    try {
        const utilisateurId = req.session.utilisateur.id;

        const prestationIds = req.query.prestations.split(",").map(id => parseInt(id));
        if (prestationIds.length === 0) {
            prestationIds = [];
            return res.status(400).send("Aucune prestation sélectionnée.");
        }

        // Récupération des données
        const event = await prisma.evenement.findUnique({ where: { id: parseInt(req.query.evenement) } });
        const entreprise = await prisma.entreprise.findUnique({ where: { id: parseInt(req.query.entreprise) } });
        const utilisateur = await prisma.utilisateur.findUnique({ where: { id: utilisateurId } });
        if (!utilisateur) return res.status(404).send("Utilisateur non trouvé.");

        const selectedPrestations = await prisma.prestation.findMany({ where: { id: { in: prestationIds } } });
        if (selectedPrestations.length === 0) return res.status(404).send("Aucune prestation trouvée.");


        // Calcul du total en additionnant tous les prix des prestations sélectionnées
        const total = selectedPrestations.reduce((acc, prestation) => acc + prestation.prix, 0);


        // Création du devis en base de données
        const devis = await prisma.devis.create({
            data: {
                utilisateurId,
                clientNom: utilisateur.nom,
                clientPrenom: utilisateur.prenom,
                clientMail: utilisateur.email,
                clientGenre: utilisateur.genre,
                evenementId: parseInt(req.query.evenement),
                typeEvenement: event.type,
                dateDebut: event.dateDebut,
                dateFin: event.dateFin,
                entrepriseId: parseInt(req.query.entreprise),
                raisonSociale: entreprise.raisonSociale,
                typeEntreprise: entreprise.type,
                prestations: {
                    create: selectedPrestations.map(prestation => ({
                        prestationId: prestation.id,
                        prix: prestation.prix
                    }))
                },
                total: total,
                isValidate: false,
                isDecline: false,
                payed: false
            },
            include: { prestations: true }
        });

        // Génération du PDF
        const doc = new PDFDocument();
        res.setHeader("Content-Disposition", `attachment; filename=devis_${devis.id}.pdf`);
        res.setHeader("Content-Type", "application/pdf");
        doc.pipe(res);


        // En-tête du devis avec l'image
        doc.image(__dirname + '/../public/assets/images/Titre-MyEvents.png', { align: 'center', width: 100 });
        doc.moveDown();
        doc.moveDown();
        doc.moveDown();
        doc.moveDown();

        // Coordonnées de l'entreprise
        doc.fontSize(12).text("Coordonnées de l'entreprise :", { underline: true });
        doc.fontSize(10).text(`Raison Sociale : ${entreprise.raisonSociale}`);
        doc.text(`Adresse : ${entreprise.adresse},`);
        doc.text(`${entreprise.cp} ${entreprise.ville}`);
        doc.moveDown();

        // Coordonnées du client
        doc.fontSize(12).text("Coordonnées du client :", { underline: true, align: "right" });
        doc.fontSize(10).text(`Nom : ${utilisateur.nom} ${utilisateur.prenom}`, { align: "right" });
        doc.text(`Adresse : ${utilisateur.adresse},`, { align: "right" });
        doc.text(`${utilisateur.cp} ${utilisateur.ville}`, { align: "right" });
        doc.text(`Email : ${utilisateur.email}`, { align: "right" });
        doc.moveDown();

        doc.text(`Devis N°${devis.id}`, { align: "left" });
        doc.moveDown();
        doc.moveDown();

        // Formatage des dates pour qu'elles soient lisibles
        const dateDebutFormatted = new Date(event.dateDebut).toLocaleDateString('fr-FR', {
            weekday: 'long', // Jour de la semaine
            year: 'numeric', // Année complète
            month: 'long',   // Mois complet
            day: 'numeric'   // Jour du mois
        });

        const dateFinFormatted = new Date(event.dateFin).toLocaleDateString('fr-FR', {
            weekday: 'long', // Jour de la semaine
            year: 'numeric', // Année complète
            month: 'long',   // Mois complet
            day: 'numeric'   // Jour du mois
        });

        // Ajout du texte avec la date formatée
        doc.fontSize(10).text(`Événement : ${event.type} du ${dateDebutFormatted} au ${dateFinFormatted}`);
        doc.moveDown();
        doc.moveDown();


        // Liste des prestations sélectionnées
        doc.fontSize(12).text("Prestations sélectionnées :", { underline: true, align: 'center' });
        selectedPrestations.forEach(prestation => {
            doc.fontSize(12).text(`${prestation.nom}:`, { align: "left" });
            doc.fontSize(12).text(`  Description : ${prestation.description}`);
            doc.fontSize(12).text(`  Prix : ${prestation.prix.toFixed(2)}€ TTC`, { align: "right" });
            doc.moveDown();
        });


        // Total HT, TVA et Total TTC
        let totalTTC = selectedPrestations.reduce((sum, p) => sum + p.prix, 0);
        doc.moveDown();
        doc.fontSize(14).text(`Total TTC: ${totalTTC.toFixed(2)} €`, { align: "right", underline: true });
        doc.moveDown();

        // Date du devis
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString('fr-FR'); // Utilisation du format français
        doc.fontSize(10).text(`Fait à ${entreprise.ville}, le ${formattedDate}`, { align: "left" });
        doc.moveDown();


        doc.fontSize(7).text(`Ce devis est valable 30 jours à compter de la date de création.`);
        doc.fontSize(7).text(`Devis réalisé par MyEvents pour le compte de ${entreprise.raisonSociale}. Pour toute information complémentaire, veuillez contacter ${entreprise.raisonSociale}.`);
        doc.fontSize(7).text(`Sous réserve de validation par ${entreprise.raisonSociale}. Une fois validé, vous pourrez procéder au paiement.`);
        doc.moveDown();
        doc.end();
    } catch (error) {
        console.log(error)
    }
});



module.exports = recherchePrestataireRouter;
