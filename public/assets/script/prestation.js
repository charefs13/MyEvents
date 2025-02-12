const hide = document.querySelector('.hide');
const add = document.querySelector('.add');
const close = document.querySelector('.close');
const createPrestationBtn = document.querySelector('.createPrestationBtn');

// Afficher le formulaire de création de prestation
add.addEventListener('click', () => {
    hide.style.display = 'flex'; // Afficher le formulaire de création de prestation
    add.style.display = 'none'; // Cacher le bouton "Ajouter une prestation"
});

// Fermer le formulaire de création de prestation sans soumettre
close.addEventListener('click', () => {
    hide.style.display = 'none'; // Cacher le formulaire de création
    add.style.display = 'block'; // Réafficher le bouton "Ajouter une prestation"
});  

// Afficher le formulaire de modification de prestation lorsque le bouton "Modifier" est cliqué
const updateBtns = document.querySelectorAll('.btn.update');
updateBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const prestationId = e.target.getAttribute('data-prestation-id'); // Récupérer l'ID de la prestation
        const form = document.getElementById(`form${prestationId}`); // Récupérer le formulaire de modification correspondant

        // Cacher les détails de la prestation
        const prestationContainer = e.target.closest('.prestationContainer'); // Trouver le conteneur de la prestation
        prestationContainer.querySelector('.flexPrestation').style.display = 'none'; // Cacher la section des détails

        // Afficher le formulaire de modification
        form.style.display = 'block'; // Afficher le formulaire de modification
    });
}); 

// Fermer le formulaire de modification de prestation sans soumettre
const closeUpdateBtns = document.querySelectorAll('.updateForm .close');
closeUpdateBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const form = e.target.closest('.updateForm'); // Récupérer le formulaire de modification
        const prestationContainer = form.closest('.prestationContainer'); // Trouver le conteneur de la prestation

        // Cacher le formulaire de modification
        form.style.display = 'none'; // Cacher le formulaire

        // Réafficher les détails de la prestation
        prestationContainer.querySelector('.flexPrestation').style.display = 'flex'; // Réafficher les détails
    });
});
 
 