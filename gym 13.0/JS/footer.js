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
    const store = isMusclePage
        ? "../../PAGES/tienda.html"
        : isPage
            ? "tienda.html"
            : "PAGES/tienda.html";
    const progress = isMusclePage
        ? "../../PAGES/seguimiento.html"
        : isPage
            ? "seguimiento.html"
            : "PAGES/seguimiento.html";
    const challenges = isMusclePage
        ? "../../PAGES/desafios.html"
        : isPage
            ? "desafios.html"
            : "PAGES/desafios.html";
    const account = isMusclePage
        ? "../../PAGES/"
        : isPage
            ? ""
            : "PAGES/";

    const sidebar = document.querySelector(".sidebar");
    if (sidebar && !sidebar.querySelector('a[href$="seguimiento.html"]')) {
        const heading = document.createElement("h3");
        heading.textContent = "Tu progreso";
        const link = document.createElement("a");
        link.href = progress;
        link.textContent = "Seguimiento personal";
        if (path.endsWith("/PAGES/seguimiento.html")) {
            link.setAttribute("aria-current", "page");
        }
        sidebar.append(heading, link);
    }
    if (sidebar && !sidebar.querySelector('a[href$="desafios.html"]')) {
        const link = document.createElement("a");
        link.href = challenges;
        link.textContent = "Desafíos fitness";
        if (path.endsWith("/PAGES/desafios.html")) {
            link.setAttribute("aria-current", "page");
        }
        sidebar.append(link);
    }

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
                    <a href="${store}">Tienda</a>
                    <a href="${progress}">Seguimiento personal</a>
                    <a href="${challenges}">Desafíos fitness</a>
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

    if (!document.querySelector('link[data-fitness-assistant-styles]')) {
        const styles = document.createElement("link");
        styles.rel = "stylesheet";
        styles.href = `${root}CSS/asistente-fitness.css`;
        styles.dataset.fitnessAssistantStyles = "";
        document.head.appendChild(styles);
    }

    if (!document.getElementById("fitness-assistant")) {
        const assistant = document.createElement("div");
        assistant.id = "fitness-assistant";
        assistant.className = "fitness-assistant";
        assistant.innerHTML = `
            <section class="fitness-assistant__panel" id="fitness-assistant-panel" role="dialog" aria-labelledby="fitness-assistant-title" aria-modal="false" hidden>
                <header class="fitness-assistant__header">
                    <div>
                        <p>ASISTENTE RUTIGYM</p>
                        <h2 id="fitness-assistant-title">¿En qué te puedo ayudar?</h2>
                    </div>
                    <button class="fitness-assistant__close" type="button" aria-label="Cerrar asistente">×</button>
                </header>
                <div class="fitness-assistant__tabs" role="tablist" aria-label="Opciones del asistente">
                    <button type="button" id="assistant-tab-chat" role="tab" aria-selected="true" aria-controls="assistant-view-chat">Chat fitness</button>
                    <button type="button" id="assistant-tab-plan" role="tab" aria-selected="false" aria-controls="assistant-view-plan">Plan guiado</button>
                </div>
                <div class="fitness-assistant__content">
                    <section id="assistant-view-chat" role="tabpanel" aria-labelledby="assistant-tab-chat">
                        <div class="fitness-assistant__conversation" id="assistant-conversation" role="log" aria-label="Conversación con el asistente" aria-live="polite" aria-relevant="additions text">
                            <article class="fitness-assistant__message fitness-assistant__message--assistant">
                                <span class="fitness-assistant__message-author">RutiGym AI</span>
                                <p>¡Hola! Soy tu asistente fitness. Preguntame sobre tus objetivos, ejercicios, rutinas o cómo usar la página, y voy a orientarte según lo que me cuentes.</p>
                            </article>
                        </div>
                        <div class="fitness-assistant__suggestions" aria-label="Ideas para empezar">
                            <button type="button" data-assistant-question="Quiero ganar masa muscular, ¿por dónde empiezo?">Quiero ganar masa muscular</button>
                            <button type="button" data-assistant-question="¿Cómo mejoro mi resistencia?">Mejorar resistencia</button>
                            <button type="button" data-assistant-question="¿Qué son las series y repeticiones?">Series y repeticiones</button>
                            <button type="button" data-assistant-question="¿Cómo guardo mi progreso?">Ayuda con la página</button>
                        </div>
                        <form id="assistant-question-form" class="fitness-assistant__composer">
                            <label class="fitness-assistant__question-label" for="assistant-question">Tu mensaje
                                <textarea id="assistant-question" name="question" rows="2" maxlength="500" placeholder="Ej.: quiero ganar masa muscular y entreno en casa..." required></textarea>
                            </label>
                            <button class="fitness-assistant__primary" type="submit">Enviar</button>
                        </form>
                    </section>
                    <section id="assistant-view-plan" role="tabpanel" aria-labelledby="assistant-tab-plan" hidden>
                        <p class="fitness-assistant__intro">Contame qué buscás y cuánto tiempo tenés. Te preparo una orientación para empezar.</p>
                        <form id="assistant-plan-form">
                            <label for="assistant-goal">¿Cuál es tu objetivo?
                                <select id="assistant-goal" name="goal" required>
                                    <option value="muscle">Ganar masa muscular</option>
                                    <option value="endurance">Mejorar la resistencia</option>
                                    <option value="active">Mantenerme activo</option>
                                </select>
                            </label>
                            <label for="assistant-experience">Experiencia
                                <select id="assistant-experience" name="experience" required>
                                    <option value="beginner">Principiante</option>
                                    <option value="intermediate">Intermedio</option>
                                    <option value="advanced">Avanzado</option>
                                </select>
                            </label>
                            <label for="assistant-time">Tiempo disponible por entrenamiento
                                <select id="assistant-time" name="time" required>
                                    <option value="20">20 minutos</option>
                                    <option value="30" selected>30 minutos</option>
                                    <option value="45">45 minutos</option>
                                    <option value="60">60 minutos</option>
                                </select>
                            </label>
                            <label for="assistant-equipment">¿Con qué equipamiento contás?
                                <select id="assistant-equipment" name="equipment" required>
                                    <option value="bodyweight">En casa, sin equipamiento</option>
                                    <option value="home">En casa, con bandas o mancuernas</option>
                                    <option value="gym">Gimnasio con máquinas y pesas</option>
                                </select>
                            </label>
                            <button class="fitness-assistant__primary" type="submit">Ver recomendación</button>
                        </form>
                    </section>
                </div>
                <p class="fitness-assistant__disclaimer">Guía interactiva con respuestas locales; no consulta una IA externa ni reemplaza a un profesional. Si algo te causa dolor, detenete.</p>
            </section>
            <button class="fitness-assistant__launcher" type="button" aria-label="Abrir asistente fitness" aria-expanded="false" aria-controls="fitness-assistant-panel">
                <svg class="fitness-assistant__launcher-icon" viewBox="0 0 48 48" aria-hidden="true">
                    <path class="assistant-chat-bubble" d="M11 9.5h23a7 7 0 0 1 7 7v10a7 7 0 0 1-7 7H23l-9 6v-6.7a7 7 0 0 1-7-6.3v-10a7 7 0 0 1 4-6.4Z"></path>
                    <path class="assistant-dumbbell" d="M15 23.5h18M18 19v9m-4-7v5m20-7v9m4-7v5"></path>
                    <path class="assistant-spark" d="m36 5 1.4 3.6L41 10l-3.6 1.4L36 15l-1.4-3.6L31 10l3.6-1.4L36 5Z"></path>
                </svg>
                <span>Asistente</span>
            </button>
        `;
        document.body.appendChild(assistant);

        const panel = assistant.querySelector("#fitness-assistant-panel");
        const launcher = assistant.querySelector(".fitness-assistant__launcher");
        const closeButton = assistant.querySelector(".fitness-assistant__close");
        const chatTab = assistant.querySelector("#assistant-tab-chat");
        const planTab = assistant.querySelector("#assistant-tab-plan");
        const chatView = assistant.querySelector("#assistant-view-chat");
        const planView = assistant.querySelector("#assistant-view-plan");

        const setAssistantTab = (tab) => {
            const showChat = tab === "chat";
            chatTab.setAttribute("aria-selected", String(showChat));
            planTab.setAttribute("aria-selected", String(!showChat));
            chatView.hidden = !showChat;
            planView.hidden = showChat;
        };

        const closeAssistant = () => {
            panel.hidden = true;
            launcher.setAttribute("aria-expanded", "false");
        };

        launcher.addEventListener("click", () => {
            panel.hidden = !panel.hidden;
            launcher.setAttribute("aria-expanded", String(!panel.hidden));
            if (!panel.hidden) {
                closeButton.focus();
            }
        });
        closeButton.addEventListener("click", () => {
            closeAssistant();
            launcher.focus();
        });
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && !panel.hidden) {
                closeAssistant();
                launcher.focus();
            }
        });
        document.addEventListener("click", (event) => {
            if (!panel.hidden && !assistant.contains(event.target)) {
                closeAssistant();
            }
        });
        chatTab.addEventListener("click", () => setAssistantTab("chat"));
        planTab.addEventListener("click", () => setAssistantTab("plan"));
        [chatTab, planTab].forEach((tab, index, tabs) => {
            tab.addEventListener("keydown", (event) => {
                if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                    event.preventDefault();
                    tabs[(index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length].focus();
                }
            });
        });

        const equipmentSuggestions = {
            bodyweight: "En casa sin equipamiento: probá variantes cómodas de sentadillas, flexiones inclinadas, puentes de glúteos y ejercicios de movilidad.",
            home: "Con bandas o mancuernas: podés sumar remos con banda, press con mancuernas, sentadillas y bisagras de cadera con cargas livianas.",
            gym: "En el gimnasio: elegí movimientos básicos en máquinas o con peso libre y priorizá aprender la técnica antes de aumentar la carga."
        };
        const goals = {
            muscle: "Para ganar masa muscular, organizá la semana para trabajar los principales grupos musculares y aumentá el esfuerzo de forma gradual.",
            endurance: "Para mejorar la resistencia, combiná actividad continua a ritmo cómodo con intervalos moderados, dejando tiempo para recuperarte.",
            active: "Para mantenerte activo, priorizá una rutina que puedas sostener: movimiento general, caminatas y ejercicios de fuerza a tu ritmo."
        };
        const goalLabels = {
            muscle: "ganar masa muscular",
            endurance: "mejorar la resistencia",
            active: "mantenerme activo"
        };
        const experience = {
            beginner: "Como principiante, empezá con 2 o 3 sesiones semanales, pocas series y movimientos que puedas controlar. La regularidad importa más que entrenar al máximo.",
            intermediate: "Con experiencia intermedia, podés probar 3 o 4 sesiones semanales, repartiendo los grupos musculares y ajustando el volumen según tu recuperación.",
            advanced: "Con experiencia avanzada, distribuí 4 o 5 sesiones según tu planificación y mantené días de recuperación; más volumen no siempre significa mejores resultados."
        };
        const conversation = assistant.querySelector("#assistant-conversation");
        const appendConversationMessage = (text, speaker, extraContent) => {
            const message = document.createElement("article");
            const isAssistant = speaker === "assistant";
            message.className = `fitness-assistant__message fitness-assistant__message--${speaker}`;
            const author = document.createElement("span");
            author.className = "fitness-assistant__message-author";
            author.textContent = isAssistant ? "RutiGym AI" : "Vos";
            message.appendChild(author);
            text.split(/\n{2,}/).filter(Boolean).forEach((paragraphText) => {
                const paragraph = document.createElement("p");
                paragraph.textContent = paragraphText;
                message.appendChild(paragraph);
            });
            if (extraContent) {
                message.appendChild(extraContent);
            }
            conversation.appendChild(message);
            conversation.scrollTop = conversation.scrollHeight;
        };

        const planForm = assistant.querySelector("#assistant-plan-form");
        planForm.addEventListener("submit", (event) => {
            event.preventDefault();
            if (!planForm.reportValidity()) {
                return;
            }
            const goal = planForm.elements.goal.value;
            const level = planForm.elements.experience.value;
            const minutes = Number(planForm.elements.time.value);
            const equipment = planForm.elements.equipment.value;
            const duration = minutes <= 20
                ? "En ese tiempo, hacé 3 o 4 movimientos y dejá unos minutos para entrar en calor."
                : minutes <= 30
                    ? "En ese tiempo, podés hacer 4 o 5 movimientos y reservar unos minutos para entrar en calor."
                    : "Usá parte del tiempo para entrar en calor, entrenar sin apuro y terminar con una vuelta a la calma.";
            const prompt = `Quiero ${goalLabels[goal]}. Tengo nivel ${level === "beginner" ? "principiante" : level === "intermediate" ? "intermedio" : "avanzado"}, ${minutes} minutos por sesión y ${equipment === "gym" ? "entreno en un gimnasio" : equipment === "home" ? "tengo bandas o mancuernas en casa" : "entreno en casa sin equipamiento"}. ¿Qué me recomendás?`;
            const links = document.createElement("p");
            links.className = "fitness-assistant__links";
            links.append("Para seguir, mirá ");
            const routineLink = document.createElement("a");
            routineLink.href = `${routines}rutinas-3dias.html`;
            routineLink.textContent = "rutinas de 3 días";
            const muscleLink = document.createElement("a");
            muscleLink.href = `${muscles}pecho.html`;
            muscleLink.textContent = "guías de ejercicios";
            links.append(routineLink, " y ", muscleLink, ".");
            appendConversationMessage(prompt, "user");
            appendConversationMessage(
                `${goals[goal]}\n\n${experience[level]}\n\n${duration} Elegí movimientos adecuados para ${equipment === "gym" ? "las máquinas y pesas del gimnasio" : equipment === "home" ? "tus bandas o mancuernas" : "tu peso corporal"}.\n\n${equipmentSuggestions[equipment]}`,
                "assistant",
                links
            );
            setAssistantTab("chat");
        });

        const answerQuestion = (question) => {
            const normalized = question.trim().toLocaleLowerCase("es");
            if (!normalized) {
                return "Escribí una pregunta para que pueda ayudarte.";
            }
            if (/(dolor|duele|molestia|lesi[oó]n|me lastim|mareo|desmayo|enfermedad|embarazo|medicaci[oó]n|operaci[oó]n)/i.test(normalized)) {
                return "Si tenés dolor, una lesión, mareos o una condición de salud, no puedo evaluarlo por chat. Frená la actividad y consultá a un profesional de salud antes de continuar.";
            }
            if (/(progreso|seguimiento|peso|medida|marca personal|gr[aá]fico)/i.test(normalized) &&
                /(p[aá]gina|web|guardar|registr|c[oó]mo|d[oó]nde|secci[oó]n)/i.test(normalized)) {
                return "En Seguimiento personal, desde el menú, podés registrar peso, medidas y marcas por fecha, y ver tu evolución en gráficos. Los datos se guardan localmente en este navegador.";
            }
            if (/(desaf[ií]o|insignia|reto)/i.test(normalized) &&
                /(p[aá]gina|web|eliminar|guardar|agregar|insignia|c[oó]mo|d[oó]nde)/i.test(normalized)) {
                if (/(eliminar|guardar|agregar|volver)/i.test(normalized)) {
                    return "En Desafíos fitness, tocá Eliminar en un reto activo para guardarlo abajo. Cuando quieras retomarlo, elegí Agregar; vuelve a tus desafíos con el progreso reiniciado.";
                }
                return "En Desafíos fitness podés elegir retos, sumar avances y desbloquear insignias. El progreso se guarda por cuenta en este navegador.";
            }
            if (/(tienda|comprar|carrito|pedido|pago)/i.test(normalized) &&
                /(p[aá]gina|web|c[oó]mo|d[oó]nde|pedido|pago|comprar)/i.test(normalized)) {
                return "La Tienda muestra accesorios y suplementos con un carrito demostrativo. No procesa pagos ni pedidos reales.";
            }
            if (/(cuenta|registro|contrase[nñ]a|iniciar sesi[oó]n|cerrar sesi[oó]n)/i.test(normalized) &&
                /(p[aá]gina|web|c[oó]mo|d[oó]nde|cuenta|contrase[nñ]a)/i.test(normalized)) {
                return "Desde el menú de usuario podés iniciar sesión o crear una cuenta. La sesión y los datos se guardan en este navegador, no se sincronizan entre dispositivos.";
            }
            if (/(masa muscular|hipertrof|ganar m[uú]sculo|ganar volumen|crecer muscular|aumentar m[uú]sculo)/i.test(normalized)) {
                const levelTip = /(principiante|reci[eé]n empiezo|nuevo|empezando)/i.test(normalized)
                    ? "Si estás empezando, con 2 o 3 sesiones semanales y movimientos simples alcanza para crear el hábito y aprender la técnica."
                    : /(avanzad|experiencia|entreno hace|intermedio)/i.test(normalized)
                        ? "Ajustá la cantidad de sesiones y series a tu experiencia y recuperación; aumentar el volumen gradualmente suele ser más sostenible."
                        : "Podés comenzar con 2 o 3 sesiones semanales y ajustar la frecuencia a tu experiencia y recuperación.";
                const equipmentTip = /(casa|sin equipamiento|sin m[aá]quinas|peso corporal)/i.test(normalized)
                    ? "En casa, usá variantes de sentadillas, flexiones inclinadas, remos con banda si tenés y puentes de glúteos; elegí opciones que puedas controlar."
                    : /(gimnasio|m[aá]quinas|pesas)/i.test(normalized)
                        ? "En el gimnasio, combiná ejercicios que trabajen piernas, empujes y tracciones usando máquinas o pesas con una técnica estable."
                        : "Elegí ejercicios para los principales grupos musculares y variantes que puedas realizar con buena técnica.";
                return `¡Buen objetivo! Para ganar masa muscular, entrená cada grupo muscular con regularidad y aumentá poco a poco las repeticiones o la carga cuando el ejercicio ya te resulte controlado.\n\n${levelTip}\n\nComo referencia general, podés probar 2–4 series de 6–12 repeticiones por ejercicio, sin que ese rango sea una regla obligatoria. Descansá entre series y priorizá una técnica prolija.\n\n${equipmentTip}\n\nAcompañalo con comidas suficientes, fuentes variadas de proteína y buen descanso. No hace falta entrenar al fallo en cada serie ni usar suplementos para empezar. Si querés, contame tu experiencia, el tiempo que tenés y dónde entrenás, y lo adapto mejor.`;
            }
            if (/(resistencia|aguante|condici[oó]n f[ií]sica|cansarme menos|fondo aer[oó]bico)/i.test(normalized)) {
                const equipmentTip = /(casa|sin equipamiento)/i.test(normalized)
                    ? "Podés caminar a paso vivo, bailar, subir escalones con cuidado o hacer circuitos suaves en casa."
                    : /(gimnasio|cinta|bicicleta|m[aá]quinas)/i.test(normalized)
                        ? "En el gimnasio, podés elegir bicicleta, cinta, remo o elíptico a un ritmo que puedas sostener."
                        : "Elegí una actividad que disfrutes, como caminar, andar en bicicleta, bailar o nadar.";
                return `Para mejorar la resistencia, empezá con sesiones a un ritmo en el que todavía puedas hablar, y aumentá el tiempo de a poco semana a semana.\n\n${equipmentTip} Cuando eso se sienta cómodo, podés alternar tramos algo más rápidos con tramos suaves, sin necesidad de ir al máximo. Dejá días de recuperación y frená si aparece dolor, mareo o falta de aire inusual.`;
            }
            if (/(mantenerme activo|mantener actividad|empezar a moverme|ser m[aá]s activo|actividad f[ií]sica)/i.test(normalized)) {
                return "Para mantenerte activo, empezá con algo fácil de repetir: caminatas, pausas para moverte o dos sesiones cortas de fuerza por semana. Elegí una actividad que disfrutes y aumentá el tiempo gradualmente; la constancia importa más que una rutina perfecta.";
            }
            if (/(bajar de peso|perder peso|adelgazar|quemar grasa)/i.test(normalized)) {
                return "Puedo darte pautas generales: combiná movimiento que puedas sostener, algo de entrenamiento de fuerza y descanso. Evitá dietas extremas o intentar compensar la comida con ejercicio. Para un objetivo de peso y un plan de alimentación personalizados, consultá a un profesional de nutrición.";
            }
            if (/(fuerza|levantar m[aá]s|ser m[aá]s fuerte)/i.test(normalized)) {
                return "Para desarrollar fuerza, practicá los movimientos con buena técnica y una carga que puedas controlar. Progresá poco a poco, descansá entre series y evitá probar máximos sin preparación o supervisión. Si me contás qué ejercicio querés mejorar y tu experiencia, te doy una orientación más concreta.";
            }
            if (/(frecuencia|cu[aá]ntos d[ií]as|cu[aá]ntas veces|d[ií]as entrenar)/i.test(normalized)) {
                return "La frecuencia depende de tu objetivo, experiencia y recuperación. Como punto de partida general, 2 o 3 días de entrenamiento por semana pueden ayudar a crear constancia; distribuí el esfuerzo y dejá tiempo de descanso. Si recién empezás, no hace falta entrenar todos los días.";
            }
            if (/(rutina|entrenamiento|ejercicio|m[uú]sculo)/i.test(normalized) &&
                /(p[aá]gina|web|d[oó]nde|encontr|ver las|secci[oó]n)/i.test(normalized)) {
                return "Podés explorar rutinas de 2 a 5 días desde el menú y consultar las guías de ejercicios de pecho, espalda, piernas y brazos.";
            }
            if (/(progreso|seguimiento|peso|medida|marca personal|gr[aá]fico)/i.test(normalized)) {
                return "Para seguir tu progreso físico, registrá medidas o marcas en varias fechas y compará la tendencia, no solo un dato aislado. En la página Seguimiento personal también podés guardar peso, medidas y marcas por ejercicio.";
            }
            if (/(desaf[ií]o|insignia|reto)/i.test(normalized)) {
                if (/(eliminar|guardar|agregar|volver)/i.test(normalized)) {
                    return "En Desafíos fitness, tocá Eliminar en un reto activo para guardarlo abajo. Cuando quieras retomarlo, elegí Agregar; vuelve a tus desafíos con el progreso reiniciado.";
                }
                return "En Desafíos fitness podés iniciar retos, sumar avances, guardar los que querés hacer después y desbloquear insignias.";
            }
            if (/(rutina|entrenamiento|ejercicio|m[uú]sculo)/i.test(normalized)) {
                return "Contame cuál es tu objetivo, cuántos días o minutos tenés y si entrenás en casa o en un gimnasio. Con eso puedo orientarte sobre una rutina o ejercicios adecuados para empezar.";
            }
            if (/(serie|repetici[oó]n|reps|sets)/i.test(normalized)) {
                return "Una repetición es una ejecución completa del ejercicio; una serie es un grupo de repeticiones seguidas. Por ejemplo, 3 series de 8 repeticiones son 24 repeticiones repartidas en tres tandas, con descansos.";
            }
            if (/(descanso|recuperaci[oó]n)/i.test(normalized)) {
                return "El descanso entre series ayuda a recuperar el esfuerzo. Tomate el tiempo necesario para mantener una técnica controlada y dejá días de recuperación según cómo te sientas.";
            }
            if (/(calentamiento|entrada en calor|calentar)/i.test(normalized)) {
                return "Antes de entrenar, podés hacer unos minutos de movimiento suave y movilidad relacionada con los ejercicios que vas a realizar. Empezá con cargas cómodas.";
            }
            if (/(prote[ií]na|suplemento|creatina|alimentaci[oó]n)/i.test(normalized)) {
                return "La alimentación y los suplementos dependen de cada persona. No necesitás un suplemento para empezar a entrenar; para recomendaciones nutricionales personalizadas consultá con un profesional de nutrición.";
            }
            return "Puedo ayudarte con objetivos como ganar masa muscular o mejorar la resistencia, ejercicios, rutinas y funciones de la página. Contame un poco más de lo que querés lograr.";
        };

        const questionForm = assistant.querySelector("#assistant-question-form");
        const questionInput = assistant.querySelector("#assistant-question");
        const submitQuestion = (question) => {
            const trimmedQuestion = question.trim();
            if (!trimmedQuestion) {
                return;
            }
            appendConversationMessage(trimmedQuestion, "user");
            appendConversationMessage(answerQuestion(trimmedQuestion), "assistant");
            questionInput.value = "";
        };
        questionForm.addEventListener("submit", (event) => {
            event.preventDefault();
            if (!questionForm.reportValidity()) {
                return;
            }
            submitQuestion(questionInput.value);
        });
        assistant.querySelectorAll("[data-assistant-question]").forEach((button) => {
            button.addEventListener("click", () => {
                setAssistantTab("chat");
                questionInput.value = button.dataset.assistantQuestion;
                submitQuestion(questionInput.value);
            });
        });
    }
});
