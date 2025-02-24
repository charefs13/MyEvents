const devisRouter = require('express').Router()
const authguard = require("../services/authguard")
const { PrismaClient } = require('@prisma/client');
const PDFDocument = require("pdfkit");
const prisma = new PrismaClient();
const path = require('path');


devisRouter.get('/devis/:id', authguard, async (req, res) => {
    try {
        const devisId = parseInt(req.params.id);

        const devis = await prisma.devis.findUnique({
            where: { id: devisId },
            include: { prestations: { include: { prestation: true } }, entreprise: true, evenement: true, utilisateur: true }
        });

        const doc = new PDFDocument();
        res.setHeader("Content-Disposition", `attachment; filename=devis_${devis.id}.pdf`);
        res.setHeader("Content-Type", "application/pdf");
        doc.pipe(res);

        doc.image(path.join(__dirname, '../public/assets/images/Titre-MyEvents.png'), { align: 'center', width: 100 });
        doc.moveDown(4);

        doc.fontSize(12).text("Coordonnées de l'entreprise :", { underline: true });
        doc.fontSize(10).text(`Raison Sociale : ${devis.entreprise.raisonSociale}`);
        doc.text(`Adresse : ${devis.entreprise.adresse}, ${devis.entreprise.cp} ${devis.entreprise.ville}`);
        doc.moveDown();

        doc.fontSize(12).text("Coordonnées du client :", { underline: true, align: "right" });
        doc.fontSize(10).text(`Nom : ${devis.clientNom} ${devis.clientPrenom}`, { align: "right" });
        doc.text(`Email : ${devis.clientMail}`, { align: "right" });
        doc.moveDown();

        doc.text(`Devis N°${devis.id}`, { align: "left" });
        doc.moveDown(2);

        const dateDebutFormatted = new Date(devis.evenement.dateDebut).toLocaleDateString('fr-FR', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        const dateFinFormatted = new Date(devis.evenement.dateFin).toLocaleDateString('fr-FR', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        doc.fontSize(10).text(`Événement : ${devis.typeEvenement} du ${dateDebutFormatted} au ${dateFinFormatted}`);
        doc.moveDown(2);

        doc.fontSize(12).text("Prestations sélectionnées :", { underline: true, align: 'center' });
        devis.prestations.forEach(({ prestation }) => {
            doc.fontSize(12).text(`${prestation.nom}:`, { align: "left" });
            doc.fontSize(10).text(`  Description : ${prestation.description}`);
            doc.fontSize(10).text(`  Prix : ${prestation.prix.toFixed(2)}€ TTC`, { align: "right" });
            doc.moveDown();
        });

        let totalHT = devis.prestations.reduce((sum, p) => sum + p.prestation.prix, 0);
        const tva = totalHT * 0.2;
        const totalTTC = totalHT + tva;
        doc.moveDown();
        doc.fontSize(10).text(`Total HT: ${totalHT.toFixed(2)} €`, { align: "right" });
        doc.text(`TVA (20%): ${tva.toFixed(2)} €`, { align: "right" });
        doc.fontSize(14).text(`Total TTC: ${totalTTC.toFixed(2)} €`, { align: "right", underline: true });

        const formattedDate = new Date(devis.createdAt).toLocaleDateString('fr-FR');
        doc.fontSize(10).text(`Fait à ${entreprise.ville}, le ${formattedDate}`, { align: "left" });

        doc.moveDown();

        doc.fontSize(7).text(`Ce devis est valable 30 jours.`);
        doc.end();
    } catch (error) {
        console.error(error);
        res.status(500).send("Erreur lors de la génération du devis.");
    }
});


devisRouter.get('/validate/:id', authguard, async (req, res) => {
    try {
        const devis = await prisma.devis.update({
            where: {
                id: parseInt(req.params.id)
            },
            data: {
                isValidate: true
            }
        })
        console.log(devis + 'est modifier')
        res.redirect('/dashboardPros')
    } catch (error) {
        console.log(error)
        res.redirect('/dashboardPros')

    }
})

devisRouter.get('/confirmDeclineDevis/:id', authguard, async (req, res) => {
    try {
        const devis = await prisma.devis.findFirst({
            where: {
                id: parseInt(req.params.id)
            }

        })
        const utilisateur = await prisma.utilisateur.findFirst({
            where: {
                id: req.session.utilisateur.id
            },
            include: {
                entreprise: true
            }
        })
        res.render('pages/confirmDeclineDevis.twig', {
            devis: devis,
            utilisateur: req.session.utilisateur,
            entreprise: utilisateur.entreprise
        })
    } catch (error) {
        console.log(error)
        res.redirect('/dashboardPros')
    }
})

devisRouter.post('/decline/:id', authguard, async (req, res) => {
    try {
        const devis = await prisma.devis.update({
            where: {
                id: parseInt(req.params.id)
            },
            data: {
                isDecline: true,
                declineMsg: req.body.declineMsg
            }
        })
        res.redirect('/dashboardPros')

    } catch (error) {
        console.log(error)
        res.render("pages/confirmDeclineDevis.twig", {
            errorMessage: "Une erreur est survenue. Veuillez réessayer plus tard"
        })

    }
})

devisRouter.get('/deleteDevis/:id', authguard, async (req, res) => {
    try {
        const deletedDevis = await prisma.devis.delete({
            where: {
                id: parseInt(req.params.id)
            }
        })

         // Récupération de l'utilisateur avec ses événements, ses devis et son entreprise
         const utilisateur = await prisma.utilisateur.findFirst({
            where: { email: req.session.utilisateur.email },
            include: { entreprise: true, devis: true, evenements: true }
        });

        // Récupération des événements associés à l'utilisateur
        const events = await prisma.evenement.findMany({
            where: {
                utilisateurId: req.session.utilisateur.id
            },
            include: {
                devis: true // Inclure les devis associés à chaque événement
            }
        });
        res.render('pages/utilisateurDashboard.twig', {
            successMessage: "Devis Supprimé.",
            utilisateur: utilisateur,
            evenements: events, // Passage des événements
            devis: events.flatMap(event => event.devis) // Extraction des devis de chaque événement
        });
    } catch (error) {
        console.log(error)
        res.render('pages/utilisateurDashboard.twig', {
            errorMessage: "Une erreur est survenue. Veuillez réessayer plus tard.",
            utilisateur: utilisateur,
            evenements: events, // Passage des événements
            devis: events.flatMap(event => event.devis) // Extraction des devis de chaque événement
        })
    }

})
module.exports = devisRouter;
