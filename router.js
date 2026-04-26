document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.tab-content');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const target = link.getAttribute('data-target');
            
            // Hide all sections
            sections.forEach(s => s.style.display = 'none');
            
            // Show target section
            const targetSection = document.getElementById(target);
            if (targetSection) {
                targetSection.style.display = 'block';
            }
            
            // Update active button
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
});