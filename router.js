const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.tab-content');

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        const target = link.getAttribute('data-target');
        
        // Hide all sections and show the target
        sections.forEach(s => s.style.display = 'none');
        document.getElementById(target).style.display = 'block';
        
        // Update active button styling
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });
});
