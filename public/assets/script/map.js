document.addEventListener("DOMContentLoaded", async function () {
    // Si aucune entreprise n'est définie, la carte ne se charge pas
    if (typeof entreprises === "undefined" || entreprises.length === 0) {
        console.log("Aucune entreprise trouvée.");
        return;
    } 

    // Utilisation de la ville de la première entreprise pour centrer la carte
    let centreVille = entreprises[0].ville || 'Paris'; // Si la ville est vide ou non définie, centrer sur Paris
    
    // Effectuer la géocodification pour obtenir les coordonnées de la ville
    let response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(centreVille)}`);
    let data = await response.json();

    // Récupérer les coordonnées de la ville (si disponibles)
    let lat = 46.603354; // Latitude par défaut (centre de la France)
    let lon = 1.888334; // Longitude par défaut (centre de la France)

    if (data.length > 0) {
        lat = parseFloat(data[0].lat);
        lon = parseFloat(data[0].lon);
    }

    // Création de la carte Leaflet, centrée sur la ville obtenue
    var map = L.map('map').setView([lat, lon], 12); // Centré sur la ville

    // Ajouter le fond de carte OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors' // Attribution des données cartographiques
    }).addTo(map);

    // Boucle sur toutes les entreprises récupérées depuis Twig
    for (let entreprise of entreprises) {
        try {
            // Effectue une requête à l'API Nominatim pour obtenir les coordonnées de l'adresse de l'entreprise
            let response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(entreprise.adresse + ", " + entreprise.cp + " " + entreprise.ville)}`);
            
            // Convertit la réponse en JSON
            let data = await response.json();
            
            // Vérifie si des données valides ont été retournées
            if (data.length > 0) {
                // Récupère la latitude et la longitude de l'entreprise
                let lat = parseFloat(data[0].lat);
                let lon = parseFloat(data[0].lon);

                // Contenu de la popup avec les informations de l'entreprise
                let popupContent = `<b>${entreprise.raisonSociale}</b><br>${entreprise.type}<br>${entreprise.adresse}, ${entreprise.cp} ${entreprise.ville}<br><br><b><a href="/entreprise/${entreprise.id}/prestations">Prestations</a></b><br>`;
                
                // // Ajoute chaque prestation dans la popup
                // entreprise.prestations.forEach(p => {
                //     popupContent += `<i>${p.nom}</i> - ${p.prix}€<br>`;
                // });

                // Ajoute un marqueur sur la carte aux coordonnées récupérées
                L.marker([lat, lon])
                    .addTo(map) // Ajoute le marqueur à la carte
                    .bindPopup(popupContent); // Associe la popup au marqueur
            }
        } catch (error) {
            // Affiche une erreur si la requête échoue
            console.error("Erreur de géocodage pour " + entreprise.raisonSociale, error);
        }
    }
});
