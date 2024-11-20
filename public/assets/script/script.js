const hide = document.querySelector('.hide');
const add = document.querySelector('.add');
const close = document.querySelector('.close');
const createEventBtn = document.querySelector('.createEventBtn');
const updateBtns = document.querySelectorAll('.btn.update'); // Les boutons "Modifier"
const updateForms = document.querySelectorAll('.updateForm'); // Formulaires de modification
const closeUpdateBtns = document.querySelectorAll('.updateForm .close'); // Boutons "Fermer" dans les formulaires de modification
const saveUpdateBtns = document.querySelectorAll('.updateForm .saveUpdate'); // Boutons "Modifier" dans les formulaires de modification

// Afficher le formulaire de création d'événement
add.addEventListener('click', () => {
    hide.style.display = 'flex'; // Afficher le formulaire de création d'événement
    add.style.display = 'none'; // Cacher le bouton "Ajouter un événement"
});

// Fermer le formulaire de création d'événement sans soumettre
close.addEventListener('click', () => {
    hide.style.display = 'none'; // Cacher le formulaire de création d'événement
    add.style.display = 'block'; // Réafficher le bouton "Ajouter un événement"
});

// Logique pour soumettre un formulaire de création
createEventBtn.addEventListener('submit', () => {
    hide.style.display = 'none'; // Cacher le formulaire après soumission
    add.style.display = 'block'; // Réafficher le bouton "Ajouter un événement"
});

// Afficher le formulaire de modification lorsque le bouton "Modifier" est cliqué
updateBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const eventId = e.target.getAttribute('data-event-id'); // Récupérer l'ID de l'événement
        const form = document.getElementById(`form${eventId}`); // Récupérer le formulaire de modification correspondant

        // Cacher les détails de l'événement
        const evenementContainer = e.target.closest('.evenementContainer'); // Trouver le conteneur de l'événement
        evenementContainer.querySelector('.flexEvenement').style.display = 'none'; // Cacher la section des détails

        // Afficher le formulaire de modification
        form.style.display = 'block'; // Afficher le formulaire de modification
    });
}); 

// Fermer le formulaire de modification sans soumettre
closeUpdateBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const form = e.target.closest('.updateForm'); // Récupérer le formulaire de modification
        const evenementContainer = form.closest('.evenementContainer'); // Trouver le conteneur de l'événement

        // Cacher le formulaire de modification
        form.style.display = 'none'; // Cacher le formulaire

        // Réafficher les détails de l'événement
        evenementContainer.querySelector('.flexEvenement').style.display = 'flex'; // Réafficher les détails
    });
});

// Soumettre le formulaire de modification lorsque l'utilisateur clique sur "Modifier l'événement"
saveUpdateBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const form = e.target.closest('.updateForm'); // Récupérer le formulaire de modification

        // Soumettre le formulaire (envoie des données au serveur)
        form.submit(); // Soumettre le formulaire automatiquement

        // Cacher le formulaire après la soumission
        form.style.display = 'none'; // Cacher le formulaire

        // Réafficher les détails de l'événement
        const evenementContainer = form.closest('.evenementContainer'); // Trouver le conteneur de l'événement
        evenementContainer.querySelector('.flexEvenement').style.display = 'flex'; // Réafficher les détails
    });
});