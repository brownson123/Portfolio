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