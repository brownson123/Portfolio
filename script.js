// ============================================
// MOBILE NAVIGATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navOverlay = document.querySelector('.nav-overlay');
    const navClose = document.querySelector('.nav-close');
    const navLinksMobile = document.querySelectorAll('.nav-links-mobile a');

    // Open mobile menu
    hamburger.addEventListener('click', () => {
        navOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    // Close mobile menu
    navClose.addEventListener('click', () => {
        navOverlay.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Close menu when clicking a link
    navLinksMobile.forEach(link => {
        link.addEventListener('click', () => {
            navOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navOverlay.classList.contains('active')) {
            navOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Close menu when clicking outside (on overlay background)
    navOverlay.addEventListener('click', (e) => {
        if (e.target === navOverlay) {
            navOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});

// ============================================
// SMOOTH SCROLLING
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ============================================
// CONSOLE SIGNATURE
// ============================================
console.log(
    "%c Hello! Looking for the code? Check out the repo on my GitHub.",
    "color: #64ffda; font-size: 12px; font-weight: bold; background: #0a192f; padding: 5px;"
);

// ============================================
// PROJECT MODAL
// ============================================
const modal = document.getElementById('project-modal');
const modalClose = document.getElementById('modal-close');
const modalPrev = document.getElementById('modal-prev');
const modalNext = document.getElementById('modal-next');

const modalTitle = document.getElementById('modal-title');
const modalProjectId = document.getElementById('modal-project-id');
const modalScreenshot = document.getElementById('modal-screenshot');
const modalCaption = document.getElementById('modal-caption');
const modalDescription = document.getElementById('modal-description');
const modalCredits = document.getElementById('modal-credits');
const modalFeatures = document.getElementById('modal-features');
const modalTech = document.getElementById('modal-tech');
const modalInstallation = document.getElementById('modal-installation');
const modalGithub = document.getElementById('modal-github');
const screenshotCounter = document.getElementById('screenshot-counter');
const galleryDots = document.getElementById('gallery-dots');

let currentProjectId = null;
let currentScreenshotIndex = 0;
let currentScreenshots = [];

function openProjectModal(projectId) {
    const project = projectsData[projectId];
    if (!project) {
        console.error('Project not found:', projectId);
        return;
    }

    currentProjectId = projectId;
    currentScreenshots = project.screenshots || [];
    currentScreenshotIndex = 0;

    modalProjectId.textContent = projectId;
    modalTitle.textContent = project.title;
    modalDescription.textContent = project.fullDescription;

    if (project.credits) {
        modalCredits.textContent = project.credits;
        modalCredits.parentElement.style.display = 'block';
    } else {
        modalCredits.parentElement.style.display = 'none';
    }

    modalScreenshot.dataset.videoLink = project.videoLink || '';

    modalFeatures.innerHTML = '';
    project.features.forEach(feature => {
        const li = document.createElement('li');
        li.textContent = feature;
        modalFeatures.appendChild(li);
    });

    if (window.innerWidth <= 600) {
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
    }

    modalTech.innerHTML = '';
    project.techStack.forEach(tech => {
        const span = document.createElement('span');
        span.textContent = tech;
        modalTech.appendChild(span);
    });

    modalInstallation.textContent = project.installation;

    initializeGallery();

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    updateScreenshotCounter();
}

function initializeGallery() {
    const screenshotGallery = document.querySelector('.screenshot-gallery');
    const modalBody = document.querySelector('.modal-body');

    if (currentScreenshots.length === 0) {
        screenshotGallery.style.display = 'none';
        modalBody.classList.add('no-gallery');
        return;
    }

    screenshotGallery.style.display = 'block';
    modalBody.classList.remove('no-gallery');

    galleryDots.innerHTML = '';
    currentScreenshots.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.className = 'dot' + (index === 0 ? ' active' : '');
        dot.addEventListener('click', () => goToScreenshot(index));
        dot.setAttribute('role', 'button');
        dot.setAttribute('aria-label', `View screenshot ${index + 1}`);
        galleryDots.appendChild(dot);
    });

    updateScreenshot();
}

function updateScreenshot() {
    if (currentScreenshots.length === 0) return;

    const screenshot = currentScreenshots[currentScreenshotIndex];
    modalScreenshot.src = screenshot.src;
    modalScreenshot.alt = screenshot.alt;
    modalCaption.textContent = screenshot.caption || '';

    if (screenshot.isVideo) {
        modalScreenshot.classList.add('video-thumbnail');
        modalScreenshot.style.cursor = 'pointer';
    } else {
        modalScreenshot.classList.remove('video-thumbnail');
        modalScreenshot.style.cursor = '';
    }

    const dots = galleryDots.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentScreenshotIndex);
    });

    updateScreenshotCounter();
}

function updateScreenshotCounter() {
    const total = currentScreenshots.length;
    const current = currentScreenshotIndex + 1;
    screenshotCounter.textContent = total > 0 ? `${current} / ${total}` : '0 / 0';

    modalPrev.style.display = total > 1 ? 'flex' : 'none';
    modalNext.style.display = total > 1 ? 'flex' : 'none';
}

function goToScreenshot(index) {
    if (currentScreenshots.length === 0) return;
    currentScreenshotIndex = index;
    updateScreenshot();
}

function nextScreenshot() {
    if (currentScreenshots.length <= 1) return;
    currentScreenshotIndex = (currentScreenshotIndex + 1) % currentScreenshots.length;
    updateScreenshot();
}

function prevScreenshot() {
    if (currentScreenshots.length <= 1) return;
    currentScreenshotIndex = (currentScreenshotIndex - 1 + currentScreenshots.length) % currentScreenshots.length;
    updateScreenshot();
}

function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    currentProjectId = null;
    currentScreenshotIndex = 0;
    currentScreenshots = [];
    if (window.innerWidth <= 600) {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
    }
}

// Project cards click handler
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => {
        const projectId = card.getAttribute('data-project-id');
        if (projectId) {
            openProjectModal(projectId);
        }
    });
    card.style.cursor = 'pointer';
});

// Modal controls
modalClose.addEventListener('click', closeModal);
modalNext.addEventListener('click', nextScreenshot);
modalPrev.addEventListener('click', prevScreenshot);

// Video thumbnail click
modalScreenshot.addEventListener('click', () => {
    const videoLink = modalScreenshot.dataset.videoLink;
    if (videoLink) {
        window.open(videoLink, '_blank');
    }
});

// Close on backdrop click
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;

    switch (e.key) {
        case 'Escape':
            closeModal();
            break;
        case 'ArrowRight':
            nextScreenshot();
            break;
        case 'ArrowLeft':
            prevScreenshot();
            break;
    }
});

// GitHub links handler
document.querySelectorAll('.github-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();

        if (modal.classList.contains('active')) {
            closeModal();
        }

        const contactSection = document.querySelector('#contact');
        if (contactSection) {
            contactSection.scrollIntoView({
                behavior: 'smooth'
            });
            setTimeout(() => {
                alert("Let's get in touch so I can give you access to my code");
            }, 500);
        }
    });
});

