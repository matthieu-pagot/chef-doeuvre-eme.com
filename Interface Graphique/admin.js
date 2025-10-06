// --- CONFIGURATION DE LA BASE DE DONNÉES SIMULÉE (localStorage) ---
const USER_KEY = 'adminUser';
const PASS_KEY = 'adminPass';
const DEFAULT_USER = 'admin';
const DEFAULT_PASS = 'admin';
const DATA_KEY_PREFIX = 'slideData-';

// Schéma des données initiales pour chaque slide
const initialData = {
    'slide1-content': {
        'meteo-texte': '☀️ 22°C',
        'evenement-texte': 'Journée de l\'innovation demain ! Rendez-vous en salle B101.',
        'ap-pdf-url': '../assets/pdfs/AP_schedule.pdf'
    },
    'slide2-content': {
        'annonces-texte': 'Portes ouvertes le 15 novembre. Venez nombreux !\nInscription pour le voyage à Rome avant fin octobre.',
        'menu-pdf-url': '../assets/pdfs/menu_cantine.pdf',
        'calendrier-pdf-url': '../assets/pdfs/calendrier_scolaire.pdf'
    },
    'slide3-content': {
        'photos-list': 'voyage_rome.jpg, ski_trip.png, expo_art.jpg',
        'offres-texte': 'STAGE: Société Tech Innov recherche un développeur Junior. Candidature avant le 30/11. Contacter Mme. Dubois (B203).'
    }
};

const slides = [
    { label: 'Slide 1 : Écran Principal', targetId: 'slide1-content' },
    { label: 'Slide 2 : Annonces & Menus', targetId: 'slide2-content' },
    { label: 'Slide 3 : Voyages & Offres', targetId: 'slide3-content' }
];

// --- GESTION DES DONNÉES (CHARGEMENT & SAUVEGARDE) ---

function initialiserDonnees() {
    // Initialiser les identifiants Admin
    if (!localStorage.getItem(USER_KEY)) {
        localStorage.setItem(USER_KEY, DEFAULT_USER);
        localStorage.setItem(PASS_KEY, DEFAULT_PASS);
    }
    
    // Initialiser les données des slides si elles n'existent pas
    Object.keys(initialData).forEach(id => {
        const key = DATA_KEY_PREFIX + id;
        if (!localStorage.getItem(key)) {
            localStorage.setItem(key, JSON.stringify(initialData[id]));
        }
    });
}

// Charge les données dans le formulaire sélectionné
function chargerDonnees(targetId) {
    const dataKey = DATA_KEY_PREFIX + targetId;
    const data = JSON.parse(localStorage.getItem(dataKey));
    const form = document.getElementById(`form-${targetId.replace('-content', '')}`);
    
    if (form && data) {
        Object.keys(data).forEach(fieldId => {
            const input = form.querySelector(`#${fieldId}`);
            if (input) {
                input.value = data[fieldId];
            }
        });
    }
}

// Gère la soumission du formulaire et la sauvegarde
function sauvegarderDonnees(e) {
    e.preventDefault();
    
    const form = e.target;
    const formId = form.id;
    const targetId = formId.replace('form-', '') + '-content';
    
    const data = {};
    const formData = new FormData(form);
    
    formData.forEach((value, key) => {
        data[key] = value;
    });

    const dataKey = DATA_KEY_PREFIX + targetId;
    localStorage.setItem(dataKey, JSON.stringify(data));

    alert(`✅ Données de la ${targetId.replace('-content', '')} enregistrées avec succès !`);
}


// --- GESTION DE L'AFFICHAGE DES SLIDES ---

function afficherPageChoixSlides() {
    const contentArea = document.querySelector('.content-area');
    document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
    document.querySelector('.tabs').classList.add('hidden');

    contentArea.innerHTML = '';
    
    const choiceTitle = document.createElement('h2');
    choiceTitle.textContent = 'Veuillez choisir la Slide à modifier :';
    contentArea.appendChild(choiceTitle);

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('slide-choice-container');
    
    slides.forEach(slide => {
        const button = document.createElement('button');
        button.classList.add('slide-choice-button');
        button.textContent = slide.label;
        
        button.addEventListener('click', () => {
            contentArea.innerHTML = '';
            document.querySelector('.tabs').classList.remove('hidden');
            
            // Simuler le clic sur le premier onglet pour lancer le chargement
            document.querySelector(`[data-target="${slide.targetId}"]`).click();

            // Remplacer le contenu de la contentArea par le contenu de la slide
            const slideContent = document.getElementById(slide.targetId);
            contentArea.appendChild(slideContent);
            slideContent.classList.remove('hidden');

            document.querySelector('header h1').textContent = `Édition : ${slide.label}`;
        });
        
        buttonContainer.appendChild(button);
    });

    contentArea.appendChild(buttonContainer);
}

// --- GESTION DE L'AUTHENTIFICATION ET DES ÉVÉNEMENTS ---

document.addEventListener('DOMContentLoaded', () => {
    initialiserDonnees();
    
    const loginForm = document.getElementById('login-form');
    const loginMessage = document.getElementById('login-message');
    const loginPage = document.getElementById('login-page');
    const mainInterface = document.getElementById('main-interface');
    
    // 1. Connexion
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const usernameInput = document.getElementById('username').value;
        const passwordInput = document.getElementById('password').value;

        const userStocke = localStorage.getItem(USER_KEY);
        const passStocke = localStorage.getItem(PASS_KEY);

        if (usernameInput === userStocke && passwordInput === passStocke) {
            loginMessage.textContent = '';
            loginPage.classList.add('hidden');
            mainInterface.classList.remove('hidden');
            
            afficherPageChoixSlides();

        } else {
            loginMessage.textContent = 'Saisie incorrecte. Veuillez vérifier l\'utilisateur et le mot de passe.';
        }
    });

    // 2. Déconnexion
    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', () => {
        mainInterface.classList.add('hidden');
        loginPage.classList.remove('hidden');
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        document.querySelector('header h1').textContent = 'Tableau de Bord - Gestion des Slides';
        loginMessage.textContent = '';
        document.querySelector('.tabs').classList.add('hidden');
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    });

    // 3. Navigation par Onglets
    const tabButtons = document.querySelectorAll('.tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');

            tabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));

            button.classList.add('active');
            document.getElementById(targetId).classList.remove('hidden');

            chargerDonnees(targetId);

            const slideLabel = slides.find(s => s.targetId === targetId).label;
            document.querySelector('header h1').textContent = `Édition : ${slideLabel}`;
        });
    });

    // 4. Sauvegarde des Formulaires
    document.querySelectorAll('.edition-form').forEach(form => {
        form.addEventListener('submit', sauvegarderDonnees);
    });
});