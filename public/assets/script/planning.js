document.addEventListener("DOMContentLoaded", function () {
    // Sélection de l'élément où sera affiché le calendrier
    var calendarEl = document.getElementById('calandarContainer');
    
    // Initialisation de FullCalendar
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth', // Vue par défaut : affichage mensuel
        selectable: true, // Permet de sélectionner des plages de dates
        editable: true, // Permet de déplacer les événements
        eventColor: '#ffd90051', // Couleur par défaut des événements
        
        // Chargement des événements depuis l'API
        events: '/api/events',

        // Gestion de la sélection pour ajouter une nouvelle tâche
        select: function (info) {
            let taskTitle = prompt("Entrez un titre pour votre tâche :");
            if (taskTitle) {
                let newTask = {
                    title: taskTitle,
                    start: info.startStr,
                    end: info.endStr,
                };
                
                // Envoi des données au serveur pour enregistrement
                fetch('/api/tasks', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newTask)
                })
                .then(response => response.json())
                .then(data => {
                    newTask.id = data.id; // Récupération de l'ID de la tâche créée
                    calendar.addEvent(newTask); // Ajout de la tâche dans le calendrier
                })
                .catch(error => console.error("Erreur lors de l'ajout de la tâche", error));
            }
            calendar.unselect(); // Désélectionne la plage après la saisie
        },

        // Gestion du déplacement des événements pour mise à jour des dates
        eventDrop: function (info) {
            let updatedTask = {
                id: info.event.id,
                start: info.event.startStr,
                end: info.event.endStr
            };
            
            // Envoi de la mise à jour au serveur
            fetch(`/api/tasks/${updatedTask.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedTask)
            })
            .catch(error => console.error("Erreur lors de la mise à jour de la tâche", error));
        },

        // Gestion du clic sur un événement pour suppression
        eventClick: function (info) {
            if (confirm("Voulez-vous supprimer cette tâche ?")) {
                let taskId = info.event.id;
                
                // Suppression en base de données
                fetch(`/api/tasks/${taskId}`, {
                    method: 'DELETE'
                })
                .then(() => {
                    info.event.remove(); // Suppression de l'événement du calendrier
                })
                .catch(error => console.error("Erreur lors de la suppression de la tâche", error));
            }
        }
    }); 

    // Rendu du calendrier dans la page
    calendar.render();
});
