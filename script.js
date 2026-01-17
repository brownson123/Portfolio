// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Simple Console signature (Dev touch)
console.log(
    "%c Hello! Looking for the code? Check out the repo on my GitHub.",
    "color: #64ffda; font-size: 12px; font-weight: bold; background: #0a192f; padding: 5px;"
);


// Modal elements
const modal = document.getElementById('project-modal');
const modalClose = document.getElementById('modal-close');
const modalPrev = document.getElementById('modal-prev');
const modalNext = document.getElementById('modal-next');

// Modal content elements
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
const screenshotContainer = document.querySelector('.screenshot-container');

// State
let currentProjectId = null;
let currentScreenshotIndex = 0;
let currentScreenshots = [];

// Open modal with project details
function openProjectModal(projectId) {
    const project = projectsData[projectId];
    if (!project) {
        console.error('Project not found:', projectId);
        return;
    }

    currentProjectId = projectId;
    currentScreenshots = project.screenshots || [];
    currentScreenshotIndex = 0;

    // Populate modal content
    modalProjectId.textContent = projectId;
    modalTitle.textContent = project.title;
    modalDescription.textContent = project.fullDescription;

    // Populate credits (hide if not present)
    if (project.credits) {
        modalCredits.textContent = project.credits;
        modalCredits.parentElement.style.display = 'block';
    } else {
        modalCredits.parentElement.style.display = 'none';
    }

    // Store video link for later use
    modalScreenshot.dataset.videoLink = project.videoLink || '';

    // Populate features
    modalFeatures.innerHTML = '';
    project.features.forEach(feature => {
        const li = document.createElement('li');
        li.textContent = feature;
        modalFeatures.appendChild(li);
    });

    // Populate tech stack
    modalTech.innerHTML = '';
    project.techStack.forEach(tech => {
        const span = document.createElement('span');
        span.textContent = tech;
        modalTech.appendChild(span);
    });

    // Populate installation guide
    modalInstallation.textContent = project.installation;

    // Initialize gallery
    initializeGallery();

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Update counter
    updateScreenshotCounter();
}

// Initialize gallery
function initializeGallery() {
    const screenshotGallery = document.querySelector('.screenshot-gallery');
    const modalBody = document.querySelector('.modal-body');

    if (currentScreenshots.length === 0) {
        // Hide the entire gallery section when no screenshots
        screenshotGallery.style.display = 'none';
        modalBody.classList.add('no-gallery');
        return;
    }

    // Show the gallery section
    screenshotGallery.style.display = 'block';
    modalBody.classList.remove('no-gallery');

    // Create dots
    galleryDots.innerHTML = '';
    currentScreenshots.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.className = 'dot' + (index === 0 ? ' active' : '');
        dot.addEventListener('click', () => goToScreenshot(index));
        galleryDots.appendChild(dot);
    });

    // Update first screenshot
    updateScreenshot();
}

// Update screenshot display
function updateScreenshot() {
    if (currentScreenshots.length === 0) return;

    const screenshot = currentScreenshots[currentScreenshotIndex];
    modalScreenshot.src = screenshot.src;
    modalScreenshot.alt = screenshot.alt;
    modalCaption.textContent = screenshot.caption || '';

    // Check if this is a video item
    if (screenshot.isVideo) {
        modalScreenshot.classList.add('video-thumbnail');
        modalScreenshot.style.cursor = 'pointer';
    } else {
        modalScreenshot.classList.remove('video-thumbnail');
        modalScreenshot.style.cursor = '';
    }

    // Update dots
    const dots = galleryDots.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentScreenshotIndex);
    });

    updateScreenshotCounter();
}

// Update counter
function updateScreenshotCounter() {
    const total = currentScreenshots.length;
    const current = currentScreenshotIndex + 1;
    screenshotCounter.textContent = total > 0 ? `${current} / ${total}` : '0 / 0';

    // Hide navigation if only 1 or 0 screenshots
    modalPrev.style.display = total > 1 ? 'flex' : 'none';
    modalNext.style.display = total > 1 ? 'flex' : 'none';
}

// Navigate screenshots
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

// Close modal
function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    currentProjectId = null;
    currentScreenshotIndex = 0;
    currentScreenshots = [];
}

// Event listeners for project cards
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

// Handle video thumbnail click
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


// Handle clicks on all GitHub links - close modal if open, then redirect to contact section with alert
document.addEventListener('DOMContentLoaded', () => {
    const githubLinks = document.querySelectorAll('.github-link');

    githubLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // Close modal if it's currently open
            if (modal.classList.contains('active')) {
                closeModal();
            }

            // Scroll to contact section
            const contactSection = document.querySelector('#contact');
            if (contactSection) {
                contactSection.scrollIntoView({
                    behavior: 'smooth'
                });
                // Show alert after scroll animation
                setTimeout(() => {
                    alert("Let's get in touch so I can give you access to my code");
                }, 500);
            }
        });
    });
});
