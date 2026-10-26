// Inserta un pie de página común y adapta los enlaces según la carpeta de la página actual.
document.addEventListener("DOMContentLoaded", () => {
    const footer = document.querySelector("#site-footer");
    if (!footer) {
        return;
    }

    // Calcula rutas relativas para páginas principales, internas y de grupos musculares.
    const path = window.location.pathname;
    const isMusclePage = path.includes("/PAGES/musculos/");
    const isPage = path.includes("/PAGES/");
    const root = isMusclePage
        ? "../../"
        : isPage
            ? "../"
            : "";

    const home = `${root}index.html`;
    const muscles = isMusclePage
        ? "../../PAGES/musculos/"
        : isPage
            ? "musculos/"
            : "PAGES/musculos/";
    const routines = isMusclePage
        ? "../../PAGES/"
        : isPage
            ? ""
            : "PAGES/";
    const gym = isMusclePage
        ? "../../PAGES/gimnasio.html"
        : isPage
            ? "gimnasio.html"
            : "PAGES/gimnasio.html";
    const account = isMusclePage
        ? "../../PAGES/"
        : isPage
            ? ""
            : "PAGES/";

    // Genera el mismo pie de navegación en todas las páginas.
    footer.className = "site-footer";
    footer.innerHTML = `
        <div class="site-footer__main">
            <div class="site-footer__brand">
                <a class="site-footer__logo" href="${home}">RUTIGYM</a>
                <p>Entrená a tu ritmo. Encontrá rutinas, aprendé sobre cada grupo muscular y explorá gimnasios cerca tuyo.</p>
                <div class="site-footer__apps" aria-label="Accesos rápidos">
                    <a class="site-footer__app" href="${routines}rutinas-3dias.html" aria-label="Explorar rutinas">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2"></rect><path d="M8 3v4m8-4v4M4 10h16m-11 4h2m3 0h2m-7 3h2"></path></svg>
                    </a>
                    <a class="site-footer__app" href="${muscles}pecho.html" aria-label="Explorar músculos">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 8v8m-3-6v4m16-4v4m-3-6v8M7 12h10M4 10H2v4h2m16-4h2v4h-2"></path></svg>
                    </a>
                    <a class="site-footer__app" href="${gym}" aria-label="Buscar gimnasios">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"></path><circle cx="12" cy="10" r="2.3"></circle></svg>
                    </a>
                </div>
            </div>

            <nav class="site-footer__nav" aria-label="Navegación del pie de página">
                <div>
                    <h2>Grupos musculares</h2>
                    <a href="${muscles}pecho.html">Pecho</a>
                    <a href="${muscles}espalda.html">Espalda</a>
                    <a href="${muscles}piernas.html">Piernas</a>
                    <a href="${muscles}brazos.html">Brazos</a>
                </div>
                <div>
                    <h2>Rutinas</h2>
                    <a href="${routines}rutinas-2dias.html">Rutina de 2 días</a>
                    <a href="${routines}rutinas-3dias.html">Rutina de 3 días</a>
                    <a href="${routines}rutinas-4dias.html">Rutina de 4 días</a>
                    <a href="${routines}rutinas-5dias.html">Rutina de 5 días</a>
                </div>
                <div>
                    <h2>Explorar</h2>
                    <a href="${home}">Inicio</a>
                    <a href="${gym}">Ver gimnasios</a>
                    <a href="${account}iniciosesion.html">Iniciar sesión</a>
                    <a href="${account}registro.html">Registrarse</a>
                </div>
            </nav>
        </div>
        <div class="site-footer__bottom">
            <p>© 2026 RutiGym. Todos los derechos reservados.</p>
            <a href="${home}">Volver al inicio ↑</a>
        </div>
    `;
});
