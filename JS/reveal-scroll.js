(() => {
    // Respeta la preferencia del usuario de reducir las animaciones.
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionPreference.matches) {
        return;
    }

    document.addEventListener("DOMContentLoaded", () => {
        // Elementos que aparecen suavemente al entrar en la zona visible.
        const revealTargets = document.querySelectorAll([
            ".hero",
            ".explora-section",
            ".explora-link",
            ".sobre-nosotros",
            ".sobre-nosotros-intro",
            ".sobre-nosotros-content",
            ".sobre-nosotros-values > div",
            ".muscle-overview",
            ".muscle-overview-heading",
            ".muscle-link-list > a",
            ".week-preview",
            ".week-preview-heading",
            ".week-day",
            ".gimnasios-header",
            ".gimnasios-explorer",
            ".ejercicio-card",
            ".ejercicio-item",
            ".rutina-header",
            ".dia-card",
            ".centrado",
            "main > *",
            "#site-footer",
            ".site-footer__brand",
            ".site-footer__nav > div",
            ".site-footer__bottom",
        ].join(","));

        if (!revealTargets.length || motionPreference.matches) {
            return;
        }

        // Añade clases y demoras escalonadas para animar los elementos.
        revealTargets.forEach((element, index) => {
            element.dataset.scrollReveal = "";
            element.style.setProperty("--reveal-delay", `${(index % 5) * 65}ms`);
        });

        document.documentElement.classList.add("has-scroll-reveal");

        const revealVisibleElements = () => {
            revealTargets.forEach((element) => {
                const bounds = element.getBoundingClientRect();
                if (bounds.top < window.innerHeight - 40 && bounds.bottom > 40) {
                    element.classList.add("is-visible");
                }
            });
        };

        // Usa IntersectionObserver cuando está disponible y conserva un respaldo por eventos.
        if ("IntersectionObserver" in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: "0px 0px -40px 0px",
                threshold: 0,
            });

            revealTargets.forEach((element) => observer.observe(element));
        }

        window.addEventListener("scroll", revealVisibleElements, { passive: true });
        document.addEventListener("scroll", revealVisibleElements, { passive: true, capture: true });
        window.addEventListener("resize", revealVisibleElements);
        revealVisibleElements();
    }, { once: true });
})();
