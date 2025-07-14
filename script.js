document.addEventListener('DOMContentLoaded', function () {
    // Funcionalidad del menú hamburguesa
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('asideOptions');

    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener('click', function () {
            hamburgerBtn.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Cerrar menú al hacer clic en un enlace
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburgerBtn.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Cerrar menú al hacer clic fuera de él
        document.addEventListener('click', function (e) {
            if (!hamburgerBtn.contains(e.target) && !navMenu.contains(e.target)) {
                if (navMenu.classList.contains('active')) {
                    hamburgerBtn.classList.remove('active');
                    navMenu.classList.remove('active');
                }
            }
        });
    }

    // Funcionalidad del mapa (solo en la página locate)
    const searchForm = document.getElementById('search-form');
    const locationInput = document.getElementById('location-input');
    const googleMap = document.getElementById('google-map');
    const locationCircle = document.getElementById('location-circle');

    const baseMapStyle = '&style=feature:all|element:labels.text.fill|color:0xffffff&style=feature:all|element:labels.text.stroke|color:0x000000&style=feature:administrative|element:geometry.fill|color:0x000000&style=feature:landscape|element:all|color:0x08304b&style=feature:road.highway|element:geometry.fill|color:0x000000&style=feature:road.arterial|element:geometry.fill|color:0x000000&style=feature:road.local|element:geometry|color:0x000000&style=feature:water|element:all|color:0x021019';

    if (searchForm && locationInput && googleMap) {
        searchForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const location = locationInput.value.trim();

            if (location === '') {
                alert('Por favor, ingresa una ubicación válida.');
                return;
            }

            const encodedLocation = encodeURIComponent(location);

            const newMapSrc = `https://maps.google.com/maps?q=${encodedLocation}&output=embed&t=roadmap&z=16${baseMapStyle}`;

            googleMap.src = newMapSrc;

            if (locationCircle) {
                locationCircle.style.opacity = '0';
                setTimeout(() => {
                    locationCircle.style.opacity = '0.8';
                    locationCircle.style.animation = 'pulse-circle 2s infinite';
                }, 1000);
            }

        });

        locationInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                searchForm.dispatchEvent(new Event('submit'));
            }
        });
    }
});
