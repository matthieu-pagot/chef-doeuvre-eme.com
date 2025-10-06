// --- UTILISATEURS AUTORISÉS (Configuration multi-utilisateur) ---
const AUTH_USERS = {
    'admin': 'admin',
    'CPE': 'EME-CPE',
    'Secrétaire': 'EME-Secrétaire',
    'Professeur': 'EME-Professeur'
};

// --- CONFIGURATION DE LA BASE DE DONNÉES SIMULÉE (localStorage) ---
const DATA_KEY_PREFIX = 'slideData-';

// Schéma des données initiales pour chaque slide (si localStorage est vide)
const initialData = {
    'slide1-content': {
        'meteo-texte': '☀️ 22°C',
        'evenement-texte': 'Journée de l\'innovation demain ! Rendez-vous en salle B101.',
        'ap-pdf-url': '../assets/pdfs/AP_schedule.pdf' // Note: Ce chemin suppose une arborescence avec un dossier "assets" à la racine du projet.
    },
    'slide2-content': {
        'annonces-texte': 'Portes ouvertes le 15 novembre.\nInscription pour le voyage à Rome avant fin octobre.',
        'menu-pdf-url': '../assets/pdfs/menu_cantine.pdf',
        'calendrier-pdf-url': '../assets/pdfs/calendrier_scolaire.pdf'
    },
    'slide3-content': {
        'photos-list': 'voyage_rome.jpg, ski_trip.png, expo_art.jpg',
        'offres-texte': 'STAGE: Société Tech Innov recherche un développeur Junior. Candidature avant le 30/11. Contacter Mme X.\nAlternance : L\'entreprise XYZ recrute en CIEL.'
    }
};

const slides = [
    { label: 'Slide 1 (Principal)', targetId: 'slide1-content', buttonId: 'choice-slide1' },
    { label: 'Slide 2 (Annonces)', targetId: 'slide2-content', buttonId: 'choice-slide2' },
    { label: 'Slide 3 (Images/Offres)', targetId: 'slide3-content', buttonId: 'choice-slide3' }
];

// --- FONCTIONS DE BASE ---

function chargerDonnees(slideId) {
    const dataKey = DATA_KEY_PREFIX + slideId;
    let data = JSON.parse(localStorage.getItem(dataKey));

    if (!data) {
        // Initialisation si aucune donnée n'existe
        data = initialData[slideId];
        localStorage.setItem(dataKey, JSON.stringify(data));
    }

    const form = document.getElementById(`form-${slideId.replace('-content', '')}`);
    if (form) {
        for (const key in data) {
            const input = form.elements[key];
            if (input) {
                input.value = data[key];
            }
        }
    }
}

function sauvegarderDonnees(event) {
    event.preventDefault();
    
    const form = event.target;
    const slideId = form.parentElement.id;
    const dataKey = DATA_KEY_PREFIX + slideId;
    const formData = new FormData(form);
    const dataToSave = {};

    formData.forEach((value, key) => {
        dataToSave[key] = value;
    });

    localStorage.setItem(dataKey, JSON.stringify(dataToSave));
    alert('✅ Données de la slide enregistrées avec succès !');
}

function afficherPageChoixSlides() {
    document.getElementById('slide-choice-container-wrapper').classList.remove('hidden');
    document.getElementById('edition-forms-container').classList.add('hidden');
    document.querySelector('.tabs').classList.add('hidden');
    
    // Réinitialiser le titre
    const user = localStorage.getItem('currentUser');
    document.getElementById('header-title').textContent = `Bonjour ${user} - Choisissez votre slide`;
}

function afficherInterfaceEdition(slideId) {
    const slide = slides.find(s => s.targetId === slideId);

    // 1. Masquer les choix et afficher les formulaires
    document.getElementById('slide-choice-container-wrapper').classList.add('hidden');
    document.getElementById('edition-forms-container').classList.remove('hidden');
    document.querySelector('.tabs').classList.remove('hidden');

    // 2. Gérer l'affichage des onglets
    document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));

    document.getElementById(slideId).classList.remove('hidden');
    document.querySelector(`.tab-button[data-target="${slideId}"]`).classList.add('active');
    
    // 3. Charger les données et mettre à jour le titre
    chargerDonnees(slideId);
    document.getElementById('header-title').textContent = `Édition : ${slide.label}`;
}


// --- GESTION DES ÉVÉNEMENTS ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Connexion
    document.getElementById('login-form').addEventListener('submit', (event) => {
        event.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const loginMessage = document.getElementById('login-message');

        if (AUTH_USERS[username] && AUTH_USERS[username] === password) {
            localStorage.setItem('currentUser', username);
            document.getElementById('login-page').classList.add('hidden');
            document.getElementById('main-interface').classList.remove('hidden');
            document.getElementById('logout-button').classList.remove('hidden');
            loginMessage.textContent = '';
            
            afficherPageChoixSlides();

        } else {
            loginMessage.textContent = 'Nom d\'utilisateur ou mot de passe incorrect.';
        }
    });

    // 2. Déconnexion
    document.getElementById('logout-button').addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        document.getElementById('main-interface').classList.add('hidden');
        document.getElementById('login-page').classList.remove('hidden');
        document.getElementById('logout-button').classList.add('hidden');
        
        // Nettoyage et affichage de la page de connexion
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    });

    // 3. Choix de la Slide via les grandes cases
    document.querySelectorAll('.slide-choice-button').forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target-id');
            afficherInterfaceEdition(targetId);
        });
    });

    // 4. Navigation par Onglets
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            afficherInterfaceEdition(targetId);
        });
    });

    // 5. Sauvegarde des Formulaires
    document.querySelectorAll('.edition-form').forEach(form => {
        form.addEventListener('submit', sauvegarderDonnees);
    });
    
    // 6. Vérification du statut de connexion au chargement
    if (localStorage.getItem('currentUser')) {
        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('main-interface').classList.remove('hidden');
        document.getElementById('logout-button').classList.remove('hidden');
        afficherPageChoixSlides();
    }
});