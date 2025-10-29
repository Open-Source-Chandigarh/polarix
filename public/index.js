/*=============== SHOW MENU ===============*/
const navMenu = document.getElementById('nav-menu'),
      navToggle = document.getElementById('nav-toggle'),
      navClose = document.getElementById('nav-close');




if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.add('show-menu');
    });
}

if (navClose) {
    navClose.addEventListener('click', () => {
        navMenu.classList.remove('show-menu');
    });
}

const navLink = document.querySelectorAll('.nav__link');
function linkAction() {
    navMenu.classList.remove('show-menu');
}
navLink.forEach(n => n.addEventListener('click', linkAction));

/*=============== CHANGE BACKGROUND HEADER ===============*/
function scrollHeader() {
    const header = document.getElementById('header');
    if (this.scrollY >= 50) {
        header.classList.add('scroll-header');
        header.style.backgroundColor = 'hsl(0, 0%, 10%)'; // Smooth black transition
    } else {
        header.classList.remove('scroll-header');
        header.style.backgroundColor = 'transparent';
    }
}
window.addEventListener('scroll', scrollHeader);

/*=============== SHOW SCROLL UP ===============*/
function scrollUp() {
    const scrollUp = document.getElementById('scroll-up');
    if (this.scrollY >= 200) scrollUp.classList.add('show-scroll');
    else scrollUp.classList.remove('show-scroll');
}
window.addEventListener('scroll', scrollUp);

/*=============== SCROLL SECTIONS ACTIVE LINK ===============*/
const sections = document.querySelectorAll('section[id]');
function scrollActive() {
    const scrollY = window.pageYOffset;
    sections.forEach(current => {
        const sectionHeight = current.offsetHeight,
              sectionTop = current.offsetTop - 50,
              sectionId = current.getAttribute('id');
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelector('.nav__menu a[href*=' + sectionId + ']').classList.add('active-link');
        } else {
            document.querySelector('.nav__menu a[href*=' + sectionId + ']').classList.remove('active-link');
        }
    });
}
window.addEventListener('scroll', scrollActive);

/*=============== SCROLL REVEAL ANIMATION ===============*/
const sr = ScrollReveal({
    distance: '60px',
    duration: 2500,
    delay: 400,
});
sr.reveal(`.home__header, .section__title`, { delay: 600 });
sr.reveal(`.home__footer`, { delay: 700 });
sr.reveal(`.home__img`, { delay: 900, origin: 'top' });
sr.reveal(`.sponsor__img, .products__card, .footer__logo, .footer__content, .footer__copy`, { origin: 'top', interval: 100 });
sr.reveal(`.specs__data, .discount__animate`, { origin: 'left', interval: 100 });
sr.reveal(`.specs__img, .discount__img`, { origin: 'right' });
sr.reveal(`.case__img`, { origin: 'top' });
sr.reveal(`.case__data`);
// NEW: Testimonials animation
sr.reveal(`.testimonials__card`, { origin: 'bottom', interval: 100 });

/*=============== NEW FEATURES ===============*/

sr.reveal(`.home__logo`, {
    origin: 'left',
    distance: '100px',
    duration: 2000,
    delay: 200,
    opacity: 0,
});
/*=============== TESTIMONIAL SCROLL ANIMATION ===============*/
ScrollReveal().reveal('.testimonial__text', { origin: 'left', distance: '50px', delay: 200 });
ScrollReveal().reveal('.rating__card', { origin: 'right', distance: '50px', interval: 200, delay: 400 });



// 1. Interactive Plan Selection
const planCards = document.querySelectorAll('.products__card');
planCards.forEach(card => {
    card.addEventListener('click', () => {
        planCards.forEach(c => c.classList.remove('selected-plan'));
        card.classList.add('selected-plan');
    });
});

// 2. Feature Description Popup
const featureData = document.querySelectorAll('.specs__data');
featureData.forEach(feature => {
    feature.addEventListener('click', () => {
        const title = feature.querySelector('.specs__title').textContent;
        const subtitle = feature.querySelector('.specs__subtitle').textContent;
        const popup = document.createElement('div');
        popup.classList.add('feature-popup');
        popup.innerHTML = `<h3>${title}</h3><p>${subtitle}</p>`;
        document.body.appendChild(popup);
        setTimeout(() => popup.remove(), 2000); // Auto-close after 2s
    });
});

// 3. Smooth Scroll for Buttons
const buttons = document.querySelectorAll('.button');
buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const target = button.closest('section').nextElementSibling || document.querySelector('#home');
        target.scrollIntoView({ behavior: 'smooth' });
    });
});

// Add CSS for new features (inline here, but ideally move to styles.css)
const style = document.createElement('style');
style.innerHTML = `
    .selected-plan { border: 2px solid hsl(180, 50%, 50%); transform: scale(1.1); }
    .feature-popup { 
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
        background: hsl(0, 0%, 15%); color: hsl(180, 50%, 85%); padding: 1rem; 
        border-radius: .5rem; z-index: 1000; box-shadow: 0 0 10px rgba(0, 0, 0, 0.5); 
    }
`;
document.head.appendChild(style);
/* ... (Your existing JavaScript remains unchanged until the end) ... */

/*=============== LOGIN/SIGNUP TOGGLE ===============*/
document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.login__tab');
    const forms = document.querySelectorAll('.login__form');
    const links = document.querySelectorAll('.login__link');

    function switchForm(targetId) {
        forms.forEach(form => form.classList.remove('active'));
        tabs.forEach(tab => tab.classList.remove('active'));

        const targetForm = document.getElementById(`${targetId}-form`);
        const targetTab = document.querySelector(`.login__tab[data-target="${targetId}"]`);
        
        if (targetForm && targetTab) {
            targetForm.classList.add('active');
            targetTab.classList.add('active');
        }
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            switchForm(tab.getAttribute('data-target'));
        });
    });

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchForm(link.getAttribute('data-target'));
        });
    });

    // Form submission (for demo purposes, logs to console)
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log(`${form.id} submitted`);
        });
    });

    // ScrollReveal for login form
    const sr = ScrollReveal({
        distance: '60px',
        duration: 2500,
        delay: 400,
    });
    sr.reveal(`.login__form-container`, { origin: 'bottom', delay: 600 });
});