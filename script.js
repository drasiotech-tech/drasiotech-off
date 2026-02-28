/**
 * DRASIOTECH — script.js optimisé
 *
 * Changements principaux :
 * 1. Vérifications null sur TOUS les éléments DOM avant usage
 *    (évite les TypeError en cas de HTML partiel / A/B test)
 * 2. aria-expanded mis à jour sur le hamburger pour les lecteurs d'écran
 * 3. aria-label du hamburger mis à jour selon l'état ouvert/fermé
 * 4. Fermeture du menu au clic en dehors (UX mobile)
 * 5. Le script est chargé avec defer dans le HTML :
 *    DOMContentLoaded n'est plus nécessaire pour les sélecteurs
 */

/* ─── Barre de notification ──────────────────────────── */
const notifBar   = document.getElementById('notifBar');
const notifClose = document.getElementById('notifClose');

if (notifClose && notifBar) {
    notifClose.addEventListener('click', () => {
        notifBar.classList.add('hidden');
        // ACCESSIBILITÉ : déplacer le focus sur l'élément suivant
        // pour ne pas laisser l'utilisateur clavier "dans le vide"
        const navbar = document.querySelector('.navbar');
        if (navbar) navbar.focus();
    });
}

/* ─── Menu mobile ────────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('navMenu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        const isOpen = navMenu.classList.toggle('active');

        // FIX ACCESSIBILITÉ : mettre à jour aria-expanded et aria-label
        // pour informer les lecteurs d'écran de l'état du menu
        hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        hamburger.setAttribute(
            'aria-label',
            isOpen ? 'Fermer le menu de navigation' : 'Ouvrir le menu de navigation'
        );
    });

    // Fermer le menu au clic sur un lien
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // FIX UX : fermer le menu en cliquant en dehors (mobile)
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            closeMenu();
        }
    });

    // FIX ACCESSIBILITÉ : fermer le menu avec la touche Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            closeMenu();
            hamburger.focus(); // remettre le focus sur le bouton
        }
    });
}

function closeMenu() {
    if (!navMenu || !hamburger) return;
    navMenu.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Ouvrir le menu de navigation');
}

/* ─── Smooth scrolling ───────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        // Éviter de casser les liens # vides
        if (href === '#') return;

        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // ACCESSIBILITÉ : déplacer le focus sur la cible
            // pour que les lecteurs d'écran annoncent la nouvelle section
            target.setAttribute('tabindex', '-1');
            target.focus({ preventScroll: true });
        }
    });
});

/* ─── Formulaire de contact ──────────────────────────── */
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    // FIX : la vérification null évitait déjà une TypeError,
    // on ajoute aussi une validation légère côté client
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);

        // Validation simple (HTML5 required gère le reste)
        const email = data.email?.trim();
        if (email && !isValidEmail(email)) {
            // ACCESSIBILITÉ : aria-live sur un message d'erreur serait idéal
            // Pour l'instant, on alerte simplement
            alert('Veuillez saisir une adresse email valide.');
            return;
        }

        // Simulation d'envoi — remplacer par votre backend (fetch/axios)
        console.log('Données du formulaire :', data);

        // ACCESSIBILITÉ : un vrai message de confirmation dans le DOM
        // serait préférable à un alert() (non annoncé par tous les lecteurs d'écran)
        alert('Merci pour votre message ! Nous vous recontacterons rapidement.');
        contactForm.reset();
    });
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ─── Effet scroll sur la navbar ─────────────────────── */
const navbar = document.querySelector('.navbar');

if (navbar) {
    // PERF : passive:true indique au navigateur que l'événement
    // n'appellera pas preventDefault() → pas de blocage du scroll
    window.addEventListener('scroll', () => {
        navbar.style.boxShadow = window.scrollY > 50
            ? '0 6px 12px rgba(0, 0, 0, 0.15)'
            : '0 4px 6px rgba(0, 0, 0, 0.1)';
    }, { passive: true });
}

/* ─── Animation au scroll (IntersectionObserver) ─────── */
// PERF : IntersectionObserver est natif et ne bloque pas le thread principal
// ACCESSIBILITÉ : on respecte prefers-reduced-motion avant d'animer

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                // Désenregistrer après animation pour libérer les ressources
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.portfolio-item, .service-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}
// Si prefers-reduced-motion, les éléments restent visibles sans animation
