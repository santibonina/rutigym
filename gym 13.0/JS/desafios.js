const CHALLENGE_SESSION_KEY = 'rutigym.session.v1';
const CHALLENGE_USERS_KEY = 'rutigym.users.v1';
const CHALLENGE_STORAGE_PREFIX = 'rutigym.challenges.v1.';
const DAILY_CHALLENGES = [
    { name: 'Caminata consciente', description: 'Sumá 20 minutos de caminata a tu día.', target: 20, unit: 'minutos', activity: 'minutos de caminata' },
    { name: 'Pausa activa', description: 'Movete durante 15 minutos, a tu manera.', target: 15, unit: 'minutos', activity: 'minutos de actividad' },
    { name: 'Un poco más de movimiento', description: 'Completá una caminata de 25 minutos.', target: 25, unit: 'minutos', activity: 'minutos de caminata' },
    { name: 'Activá el cuerpo', description: 'Hacé 10 minutos de movilidad o estiramientos suaves.', target: 10, unit: 'minutos', activity: 'minutos de movilidad' },
    { name: 'Día en movimiento', description: 'Acumulá 20 minutos de actividad que disfrutes.', target: 20, unit: 'minutos', activity: 'minutos de actividad' }
];
const EXERCISE_CHALLENGES = [
    { id: 'push-ups-20', name: '20 flexiones de brazos', description: 'Acumulá 20 flexiones durante 7 días. Podés hacerlas apoyando las rodillas o dividirlas en series.', target: 20, unit: 'repeticiones', badge: 'Fuerza en brazos' },
    { id: 'plank-10', name: '10 minutos de plancha', description: 'Acumulá 10 minutos de plancha durante 7 días, en intervalos cortos y con la variante que te resulte cómoda.', target: 10, unit: 'minutos', badge: 'Centro fuerte' },
    { id: 'squats-30', name: '30 sentadillas', description: 'Sumá 30 sentadillas durante 7 días, con un rango de movimiento cómodo.', target: 30, unit: 'repeticiones', badge: 'Piernas en marcha' },
    { id: 'lunges-20', name: '20 estocadas', description: 'Acumulá 20 estocadas durante 7 días. Hacelas sin peso y con apoyo si lo necesitás.', target: 20, unit: 'repeticiones', badge: 'Paso firme' },
    { id: 'jumping-jacks-50', name: '50 saltos de tijera', description: 'Completá 50 saltos de tijera durante 7 días; podés reemplazarlos por pasos laterales sin salto.', target: 50, unit: 'repeticiones', badge: 'Energía en movimiento' },
    { id: 'wall-sit-3', name: '3 minutos de sentadilla isométrica', description: 'Acumulá 3 minutos de sentadilla contra la pared durante 7 días, descansando entre intervalos.', target: 3, unit: 'minutos', badge: 'Resistencia constante' }
];
const LEVEL_CHALLENGES = {
    principiante: { label: 'Principiante', target: 2 },
    intermedio: { label: 'Intermedio', target: 4 },
    avanzado: { label: 'Avanzado', target: 5 }
};

let challengeData = { challenges: [], achievements: [] };
let currentChallengeUser = null;
let challengeFeedbackTimers = new WeakMap();

function challengeLocalDate(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function challengeDateFromString(value) {
    return new Date(`${value}T00:00:00`);
}

function addChallengeDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function challengeDateLabel(value) {
    return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
        .format(challengeDateFromString(value));
}

function challengeStorageKey(email) {
    return `${CHALLENGE_STORAGE_PREFIX}${encodeURIComponent(email)}`;
}

function validateChallengeRecord(challenge) {
    return challenge &&
        typeof challenge.id === 'string' &&
        typeof challenge.name === 'string' &&
        typeof challenge.description === 'string' &&
        typeof challenge.type === 'string' &&
        typeof challenge.target === 'number' &&
        Number.isFinite(challenge.target) &&
        challenge.target > 0 &&
        typeof challenge.progress === 'number' &&
        Number.isFinite(challenge.progress) &&
        challenge.progress >= 0 &&
        typeof challenge.unit === 'string' &&
        typeof challenge.startDate === 'string' &&
        typeof challenge.endDate === 'string' &&
        typeof challenge.status === 'string';
}

function readChallengeData(email) {
    const stored = localStorage.getItem(challengeStorageKey(email));
    if (!stored) {
        return { challenges: [], achievements: [] };
    }

    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== 'object' ||
        !Array.isArray(parsed.challenges) || !Array.isArray(parsed.achievements) ||
        !parsed.challenges.every(validateChallengeRecord) ||
        !parsed.achievements.every(item =>
            item && typeof item.challengeId === 'string' &&
            typeof item.challengeName === 'string' &&
            typeof item.completedAt === 'string' &&
            typeof item.type === 'string'
        )) {
        throw new Error('No se pudieron leer tus desafíos guardados. Tus datos no se modificaron.');
    }
    return parsed;
}

function getChallengeUser() {
    const email = localStorage.getItem(CHALLENGE_SESSION_KEY);
    if (!email) {
        return null;
    }

    const storedUsers = localStorage.getItem(CHALLENGE_USERS_KEY);
    if (!storedUsers) {
        throw new Error('No se encontró la cuenta de esta sesión. Cerrá sesión e iniciá de nuevo.');
    }

    const users = JSON.parse(storedUsers);
    if (!Array.isArray(users)) {
        throw new Error('No se pudieron leer las cuentas guardadas en este navegador.');
    }
    const user = users.find(account => account && account.email === email && typeof account.username === 'string');
    if (!user) {
        throw new Error('No se encontró la cuenta de esta sesión. Cerrá sesión e iniciá de nuevo.');
    }
    return user;
}

function persistChallengeData(nextData, feedbackElement, successText) {
    try {
        localStorage.setItem(challengeStorageKey(currentChallengeUser.email), JSON.stringify(nextData));
    } catch (error) {
        setChallengeFeedback(
            feedbackElement,
            error instanceof Error ? `No se pudo guardar el cambio: ${error.message}` : 'No se pudo guardar el cambio en este navegador.',
            true
        );
        return false;
    }

    challengeData = nextData;
    renderChallenges();
    if (feedbackElement) {
        setChallengeFeedback(feedbackElement, successText, false);
    }
    return true;
}

function setChallengeFeedback(element, message, isError) {
    if (!element) {
        return;
    }
    const previousTimer = challengeFeedbackTimers.get(element);
    if (previousTimer) {
        window.clearTimeout(previousTimer);
    }
    element.textContent = message;
    element.classList.toggle('is-error', isError);
    if (message && !isError) {
        challengeFeedbackTimers.set(element, window.setTimeout(() => {
            element.textContent = '';
        }, 4000));
    }
}

function showChallengeError(message) {
    const error = document.getElementById('challenge-error');
    error.textContent = message;
    error.hidden = false;
}

function ensureStandardChallenges() {
    const today = challengeLocalDate();
    const monday = new Date();
    monday.setHours(0, 0, 0, 0);
    const dayOfWeek = (monday.getDay() + 6) % 7;
    monday.setDate(monday.getDate() - dayOfWeek);
    const weekStart = challengeLocalDate(monday);
    const [year, month, day] = today.split('-').map(Number);
    const dayNumber = Math.floor(Date.UTC(year, month - 1, day) / 86400000);
    const daily = DAILY_CHALLENGES[((dayNumber % DAILY_CHALLENGES.length) + DAILY_CHALLENGES.length) % DAILY_CHALLENGES.length];
    const defaults = [
        {
            id: `daily:${today}`,
            type: 'daily',
            name: daily.name,
            description: daily.description,
            target: daily.target,
            unit: daily.unit,
            activity: daily.activity,
            badge: 'Un día en movimiento',
            startDate: today,
            endDate: today,
            createdAt: today
        },
        {
            id: `weekly:${weekStart}`,
            type: 'weekly',
            name: 'Tres entrenamientos en siete días',
            description: 'Registrá tres sesiones de entrenamiento antes de que termine la semana.',
            target: 3,
            unit: 'entrenamientos',
            activity: 'entrenamiento',
            badge: 'Constancia semanal',
            startDate: weekStart,
            endDate: challengeLocalDate(addChallengeDays(monday, 6)),
            createdAt: today
        }
    ];

    let changed = false;
    defaults.forEach(definition => {
        if (!challengeData.challenges.some(challenge => challenge.id === definition.id)) {
            challengeData.challenges.push({ ...definition, progress: 0, status: 'active' });
            changed = true;
        }
    });
    if (changed) {
        try {
            localStorage.setItem(challengeStorageKey(currentChallengeUser.email), JSON.stringify(challengeData));
        } catch (error) {
            throw new Error(`No se pudieron preparar los desafíos: ${error.message}`);
        }
    }
}

function getChallengeStatus(challenge) {
    if (challenge.status === 'removed') {
        return 'removed';
    }
    if (challenge.status === 'completed') {
        return 'completed';
    }
    if (challenge.progress >= challenge.target) {
        return 'completed';
    }
    const today = challengeLocalDate();
    if (challenge.endDate < today) {
        return 'expired';
    }
    return 'active';
}

function updateChallengeStatuses(data) {
    let changed = false;
    data.challenges.forEach(challenge => {
        const status = getChallengeStatus(challenge);
        if (challenge.status !== status) {
            challenge.status = status;
            changed = true;
        }
        if (status === 'completed' && !data.achievements.some(item => item.challengeId === challenge.id)) {
            data.achievements.push({
                challengeId: challenge.id,
                challengeName: challenge.name,
                completedAt: new Date().toISOString(),
                type: challenge.type
            });
            changed = true;
        }
    });
    return changed;
}

function makeChallengeNode(tag, className, text) {
    const node = document.createElement(tag);
    if (className) {
        node.className = className;
    }
    if (text !== undefined) {
        node.textContent = text;
    }
    return node;
}

function formatChallengeAmount(value) {
    return new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 }).format(value);
}

function challengeTypeLabel(type, challenge) {
    if (type === 'daily') {
        return 'Desafío del día';
    }
    if (type === 'weekly') {
        return 'Desafío semanal';
    }
    if (type === 'exercise') {
        return 'Reto de ejercicio';
    }
    if (type === 'level') {
        return `Nivel ${challenge.levelLabel}`;
    }
    return 'Desafío personalizado';
}

function challengeStatusLabel(status) {
    if (status === 'completed') {
        return 'Completado';
    }
    if (status === 'expired') {
        return 'Finalizado';
    }
    if (status === 'removed') {
        return 'Guardado';
    }
    return 'En curso';
}

function createChallengeCard(challenge) {
    const status = getChallengeStatus(challenge);
    const percentage = Math.min(100, Math.round((challenge.progress / challenge.target) * 100));
    const card = makeChallengeNode('article', `challenge-card challenge-card--${challenge.type}`);
    card.dataset.challengeId = challenge.id;

    const header = makeChallengeNode('div', 'challenge-card-header');
    const label = makeChallengeNode('span', 'challenge-type-label', challengeTypeLabel(challenge.type, challenge));
    const statusLabel = makeChallengeNode('span', `challenge-status challenge-status--${status}`, challengeStatusLabel(status));
    header.append(label, statusLabel);

    const title = makeChallengeNode('h3', '', challenge.name);
    const description = makeChallengeNode('p', 'challenge-card-description', challenge.description);
    const deadline = makeChallengeNode('p', 'challenge-deadline', `Hasta ${challengeDateLabel(challenge.endDate)}`);

    const progressHeading = makeChallengeNode('div', 'challenge-progress-heading');
    progressHeading.append(
        makeChallengeNode('span', '', 'Tu avance'),
        makeChallengeNode('strong', '', `${formatChallengeAmount(challenge.progress)} / ${formatChallengeAmount(challenge.target)} ${challenge.unit}`)
    );
    const progress = document.createElement('progress');
    progress.className = 'challenge-progress-bar';
    progress.max = challenge.target;
    progress.value = Math.min(challenge.progress, challenge.target);
    progress.setAttribute('aria-label', `Progreso del desafío ${challenge.name}`);

    const progressPercent = makeChallengeNode('span', 'challenge-progress-percent', `${percentage}%`);
    const action = makeChallengeNode('form', 'challenge-progress-form');
    const incrementLabel = document.createElement('label');
    incrementLabel.className = 'visually-hidden';
    incrementLabel.htmlFor = `add-${encodeURIComponent(challenge.id)}`;
    incrementLabel.textContent = `Cantidad de ${challenge.unit} para sumar a ${challenge.name}`;
    const increment = document.createElement('input');
    increment.id = `add-${encodeURIComponent(challenge.id)}`;
    increment.type = 'number';
    increment.min = challenge.unit === 'kilómetros' ? '0.1' : '1';
    increment.step = challenge.unit === 'kilómetros' ? '0.1' : '1';
    increment.value = '1';
    increment.required = true;
    increment.dataset.increment = challenge.id;
    const addButton = makeChallengeNode('button', 'challenge-add-button', 'Sumar avance');
    addButton.type = 'submit';
    addButton.disabled = status !== 'active';
    action.append(incrementLabel, increment, addButton);

    const award = makeChallengeNode('p', 'challenge-award', status === 'completed'
        ? 'Insignia desbloqueada'
        : status === 'expired'
            ? 'Podés intentarlo en el próximo período'
            : `Al completarlo desbloqueás: ${challenge.badge}`);

    card.append(header, title, description, deadline, progressHeading, progress, progressPercent, action, award);
    if (status === 'active') {
        const removeButton = makeChallengeNode('button', 'challenge-remove-button', 'Eliminar');
        removeButton.type = 'button';
        removeButton.dataset.removeChallenge = challenge.id;
        removeButton.setAttribute('aria-label', `Eliminar ${challenge.name} y guardarlo para después`);
        card.appendChild(removeButton);
    }
    return card;
}

function renderChallengeList() {
    const list = document.getElementById('challenge-list');
    const empty = document.getElementById('challenge-empty');
    const today = challengeLocalDate();
    const visible = challengeData.challenges
        .filter(challenge => {
            const status = getChallengeStatus(challenge);
            if (status === 'removed' || status === 'expired') {
                return false;
            }
            return challenge.type === 'daily' ? challenge.startDate === today :
                challenge.type === 'weekly' ? challenge.startDate <= today && challenge.endDate >= today :
                    true;
        })
        .sort((a, b) => {
            const order = { daily: 0, weekly: 1, exercise: 2, level: 3, custom: 4 };
            return order[a.type] - order[b.type] || b.createdAt.localeCompare(a.createdAt);
        });
    list.replaceChildren(...visible.map(createChallengeCard));
    empty.hidden = visible.length > 0;
}

function renderSavedChallenges() {
    const section = document.getElementById('saved-challenges-section');
    const list = document.getElementById('saved-challenges-list');
    const saved = challengeData.challenges
        .filter(challenge => getChallengeStatus(challenge) === 'removed')
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    section.hidden = saved.length === 0;
    list.replaceChildren(...saved.map(challenge => {
        const card = makeChallengeNode('article', 'exercise-challenge-option saved-challenge-option');
        const title = makeChallengeNode('h3', '', challenge.name);
        const description = makeChallengeNode('p', '', `${challenge.description} Meta: ${formatChallengeAmount(challenge.target)} ${challenge.unit}.`);
        const addButton = makeChallengeNode('button', 'challenge-button', 'Agregar');
        addButton.type = 'button';
        addButton.dataset.restoreChallenge = challenge.id;
        card.append(title, description, addButton);
        return card;
    }));
}

function renderExerciseChallengeOptions() {
    const list = document.getElementById('exercise-challenge-list');
    list.replaceChildren(...EXERCISE_CHALLENGES.map(definition => {
        const card = makeChallengeNode('article', 'exercise-challenge-option');
        const title = makeChallengeNode('h3', '', definition.name);
        const description = makeChallengeNode('p', '', definition.description);
        const action = makeChallengeNode('button', 'challenge-button', 'Empezar reto');
        action.type = 'button';
        action.dataset.presetId = definition.id;
        const existingChallenge = challengeData.challenges.find(challenge =>
            challenge.presetId === definition.id && ['active', 'removed'].includes(getChallengeStatus(challenge))
        );
        action.disabled = Boolean(existingChallenge);
        if (existingChallenge) {
            const isSaved = getChallengeStatus(existingChallenge) === 'removed';
            action.textContent = isSaved ? 'Guardado abajo' : 'Reto en curso';
        }
        card.append(title, description, action);
        return card;
    }));
}

function renderAchievements() {
    const list = document.getElementById('achievement-list');
    const empty = document.getElementById('achievement-empty');
    const count = document.getElementById('achievement-count');
    const achievements = [...challengeData.achievements]
        .sort((a, b) => b.completedAt.localeCompare(a.completedAt));
    list.replaceChildren();
    empty.hidden = achievements.length > 0;
    count.textContent = `${achievements.length} ${achievements.length === 1 ? 'logro' : 'logros'}`;

    achievements.forEach((achievement, index) => {
        const card = makeChallengeNode('article', 'achievement-card');
        const seal = makeChallengeNode('span', 'achievement-seal', String(index + 1).padStart(2, '0'));
        seal.setAttribute('aria-hidden', 'true');
        const text = document.createElement('div');
        text.append(
            makeChallengeNode('strong', '', achievement.challengeName),
            makeChallengeNode('span', '', `Completado el ${new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(achievement.completedAt))}`)
        );
        const ribbon = makeChallengeNode('span', 'achievement-ribbon', 'META CUMPLIDA');
        card.append(seal, text, ribbon);
        list.appendChild(card);
    });
}

function renderChallenges() {
    const changed = updateChallengeStatuses(challengeData);
    if (changed) {
        try {
            localStorage.setItem(challengeStorageKey(currentChallengeUser.email), JSON.stringify(challengeData));
        } catch (error) {
            showChallengeError(`No se pudieron actualizar los logros: ${error.message}`);
        }
    }
    renderChallengeList();
    renderSavedChallenges();
    renderExerciseChallengeOptions();
    renderAchievements();
}

function addChallenge(definition) {
    const start = challengeLocalDate();
    const challenge = {
        ...definition,
        id: `${definition.type}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
        startDate: start,
        endDate: challengeLocalDate(addChallengeDays(challengeDateFromString(start), definition.durationDays - 1)),
        createdAt: start,
        progress: 0,
        status: 'active'
    };
    const nextData = { ...challengeData, challenges: [...challengeData.challenges, challenge] };
    return nextData;
}

function initializeChallengePage() {
    const access = document.getElementById('challenge-access');
    const dashboard = document.getElementById('challenge-dashboard');
    let user;
    try {
        user = getChallengeUser();
    } catch (error) {
        access.hidden = true;
        dashboard.hidden = true;
        showChallengeError(error instanceof Error ? error.message : 'No se pudo verificar tu sesión.');
        return;
    }

    if (!user) {
        access.hidden = false;
        dashboard.hidden = true;
        return;
    }

    try {
        challengeData = readChallengeData(user.email);
        currentChallengeUser = user;
        ensureStandardChallenges();
    } catch (error) {
        access.hidden = true;
        dashboard.hidden = true;
        showChallengeError(error instanceof Error ? error.message : 'No se pudieron cargar tus desafíos.');
        return;
    }

    access.hidden = true;
    dashboard.hidden = false;
    document.getElementById('challenge-username').textContent = user.username;
    document.getElementById('challenge-today').textContent = new Intl.DateTimeFormat('es-AR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    }).format(new Date());
    renderChallenges();
}

document.addEventListener('DOMContentLoaded', function () {
    initializeChallengePage();

    document.getElementById('challenge-list').addEventListener('submit', function (event) {
        const form = event.target.closest('.challenge-progress-form');
        if (!form) {
            return;
        }
        event.preventDefault();
        if (!form.reportValidity()) {
            return;
        }

        const input = form.querySelector('[data-increment]');
        const id = input.dataset.increment;
        const amount = Number(input.value);
        const targetChallenge = challengeData.challenges.find(challenge => challenge.id === id);
        if (!targetChallenge || getChallengeStatus(targetChallenge) !== 'active' || !Number.isFinite(amount) || amount <= 0) {
            return;
        }
        const nextData = {
            ...challengeData,
            challenges: challengeData.challenges.map(challenge =>
                challenge.id === id
                    ? { ...challenge, progress: Math.min(challenge.target, challenge.progress + amount) }
                    : challenge
            )
        };
        persistChallengeData(nextData, null, '');
    });

    document.getElementById('challenge-list').addEventListener('click', function (event) {
        const button = event.target.closest('[data-remove-challenge]');
        if (!button) {
            return;
        }
        const id = button.dataset.removeChallenge;
        const challenge = challengeData.challenges.find(item => item.id === id);
        if (!challenge || getChallengeStatus(challenge) !== 'active') {
            return;
        }

        const nextData = {
            ...challengeData,
            challenges: challengeData.challenges.map(item =>
                item.id === id ? { ...item, status: 'removed' } : item
            )
        };
        persistChallengeData(nextData, null, '');
    });

    document.getElementById('saved-challenges-list').addEventListener('click', function (event) {
        const button = event.target.closest('[data-restore-challenge]');
        if (!button) {
            return;
        }
        const id = button.dataset.restoreChallenge;
        const challenge = challengeData.challenges.find(item => item.id === id);
        if (!challenge || getChallengeStatus(challenge) !== 'removed') {
            return;
        }

        const durationDays = challenge.type === 'daily'
            ? 1
            : challenge.type === 'weekly'
                ? 7
                : Math.max(1, Math.round(
                    (challengeDateFromString(challenge.endDate) - challengeDateFromString(challenge.startDate)) / 86400000
                ) + 1);
        const startDate = challengeLocalDate();
        const nextData = {
            ...challengeData,
            challenges: challengeData.challenges.map(item =>
                item.id === id
                    ? {
                        ...item,
                        startDate,
                        endDate: challengeLocalDate(addChallengeDays(challengeDateFromString(startDate), durationDays - 1)),
                        createdAt: startDate,
                        progress: 0,
                        status: 'active'
                    }
                    : item
            )
        };
        persistChallengeData(nextData, null, '');
    });

    document.getElementById('exercise-challenge-list').addEventListener('click', function (event) {
        const button = event.target.closest('[data-preset-id]');
        if (!button) {
            return;
        }
        const definition = EXERCISE_CHALLENGES.find(challenge => challenge.id === button.dataset.presetId);
        if (!definition || challengeData.challenges.some(challenge =>
            challenge.presetId === definition.id && getChallengeStatus(challenge) === 'active'
        )) {
            return;
        }

        const nextData = addChallenge({
            type: 'exercise',
            presetId: definition.id,
            name: definition.name,
            description: definition.description,
            target: definition.target,
            unit: definition.unit,
            activity: definition.unit,
            badge: definition.badge,
            durationDays: 7
        });
        persistChallengeData(nextData, document.getElementById('exercise-feedback'), `¡Reto "${definition.name}" iniciado!`);
    });

    document.getElementById('level-form').addEventListener('submit', function (event) {
        event.preventDefault();
        const level = document.getElementById('challenge-level').value;
        const config = LEVEL_CHALLENGES[level];
        if (!config) {
            return;
        }
        const existing = challengeData.challenges.find(challenge =>
            challenge.type === 'level' && challenge.level === level && getChallengeStatus(challenge) === 'active'
        );
        const feedback = document.getElementById('level-feedback');
        if (existing) {
            setChallengeFeedback(feedback, `Ya tenés activo el reto ${config.label.toLocaleLowerCase('es')}.`, false);
            return;
        }

        const nextData = addChallenge({
            type: 'level',
            name: `Reto ${config.label.toLocaleLowerCase('es')}: ${config.target} entrenamientos`,
            description: `Sumá ${config.target} sesiones de entrenamiento en una semana, a tu propio ritmo.`,
            target: config.target,
            unit: 'entrenamientos',
            activity: 'entrenamiento',
            badge: `Constancia ${config.label.toLocaleLowerCase('es')}`,
            level,
            levelLabel: config.label,
            durationDays: 7
        });
        persistChallengeData(nextData, feedback, `¡Reto ${config.label.toLocaleLowerCase('es')} iniciado!`);
    });

    document.getElementById('custom-form').addEventListener('submit', function (event) {
        event.preventDefault();
        const form = event.currentTarget;
        const feedback = document.getElementById('custom-feedback');
        if (!form.reportValidity()) {
            return;
        }
        const name = form.elements.name.value.trim();
        const target = Number(form.elements.target.value);
        const durationDays = Number(form.elements.duration.value);
        const unit = form.elements.unit.value;
        if (!name || !Number.isInteger(target) || target < 1 || target > 10000 ||
            !Number.isInteger(durationDays) || durationDays < 1 || durationDays > 90) {
            setChallengeFeedback(feedback, 'Revisá el nombre, la meta y la duración elegidos.', true);
            return;
        }

        const nextData = addChallenge({
            type: 'custom',
            name,
            description: `Completá ${target} ${unit} en ${durationDays} ${durationDays === 1 ? 'día' : 'días'}.`,
            target,
            unit,
            activity: unit,
            badge: 'Meta personal',
            durationDays
        });
        if (persistChallengeData(nextData, feedback, '¡Tu desafío personalizado está listo!')) {
            form.reset();
            form.elements.duration.value = '7';
            form.elements.unit.value = 'entrenamientos';
        }
    });

    document.querySelector('.menu-usuario').addEventListener('click', function (event) {
        if (!event.target.closest('[data-logout]')) {
            return;
        }
        currentChallengeUser = null;
        document.getElementById('challenge-dashboard').hidden = true;
        document.getElementById('challenge-access').hidden = false;
    });

    window.addEventListener('storage', function (event) {
        if (event.key === CHALLENGE_SESSION_KEY) {
            window.location.reload();
        }
    });
});
