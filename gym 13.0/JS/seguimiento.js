const PROGRESS_SESSION_KEY = 'rutigym.session.v1';
const PROGRESS_USERS_KEY = 'rutigym.users.v1';
const PROGRESS_STORAGE_PREFIX = 'rutigym.progress.v1.';
const PROGRESS_METRICS = [
    { key: 'weight', label: 'Peso', unit: 'kg' },
    { key: 'waist', label: 'Cintura', unit: 'cm' },
    { key: 'chest', label: 'Pecho', unit: 'cm' },
    { key: 'hips', label: 'Cadera', unit: 'cm' },
    { key: 'arm', label: 'Brazo', unit: 'cm' },
    { key: 'thigh', label: 'Muslo', unit: 'cm' }
];

let progressData = { measurements: [], performances: [] };
let activeProgressUser = null;

function localDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function isValidProgressDate(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(value) &&
        !Number.isNaN(new Date(`${value}T00:00:00`).getTime()) &&
        localDateString(new Date(`${value}T00:00:00`)) === value &&
        value <= localDateString();
}

function formatProgressDate(value, options = { day: 'numeric', month: 'short', year: 'numeric' }) {
    return new Intl.DateTimeFormat('es-AR', options).format(new Date(`${value}T00:00:00`));
}

function progressStorageKey(email) {
    return `${PROGRESS_STORAGE_PREFIX}${encodeURIComponent(email)}`;
}

function getSignedInProgressUser() {
    const email = localStorage.getItem(PROGRESS_SESSION_KEY);
    if (!email) {
        return null;
    }

    const rawUsers = localStorage.getItem(PROGRESS_USERS_KEY);
    if (!rawUsers) {
        throw new Error('No se encontró la cuenta asociada a esta sesión. Cerrá sesión e iniciá de nuevo.');
    }

    const users = JSON.parse(rawUsers);
    if (!Array.isArray(users)) {
        throw new Error('No se pudieron leer las cuentas guardadas en este navegador.');
    }

    const user = users.find(account => account && account.email === email && typeof account.username === 'string');
    if (!user) {
        throw new Error('No se encontró la cuenta asociada a esta sesión. Cerrá sesión e iniciá de nuevo.');
    }

    return user;
}

function readProgressData(email) {
    const saved = localStorage.getItem(progressStorageKey(email));
    if (!saved) {
        return { measurements: [], performances: [] };
    }

    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== 'object' ||
        !Array.isArray(parsed.measurements) || !Array.isArray(parsed.performances)) {
        throw new Error('No se pudo leer tu seguimiento guardado. Tus datos no se modificaron.');
    }

    const validMeasurements = parsed.measurements.every(entry =>
        entry && typeof entry.date === 'string' && isValidProgressDate(entry.date) &&
        PROGRESS_METRICS.every(metric =>
            entry[metric.key] === null ||
            (typeof entry[metric.key] === 'number' && Number.isFinite(entry[metric.key]) && entry[metric.key] > 0)
        )
    );
    const validPerformances = parsed.performances.every(entry =>
        entry && typeof entry.id === 'string' &&
        typeof entry.exercise === 'string' && entry.exercise.trim().length > 0 &&
        typeof entry.date === 'string' && isValidProgressDate(entry.date) &&
        typeof entry.weight === 'number' && Number.isFinite(entry.weight) && entry.weight >= 0 &&
        Number.isInteger(entry.reps) && entry.reps > 0
    );

    if (!validMeasurements || !validPerformances) {
        throw new Error('Hay datos de seguimiento con un formato inválido. No se modificó tu historial.');
    }

    return parsed;
}

function saveProgressData(nextData, messageElement, successMessage = 'Registro guardado.') {
    try {
        localStorage.setItem(progressStorageKey(activeProgressUser.email), JSON.stringify(nextData));
    } catch (error) {
        setProgressMessage(
            messageElement,
            error instanceof Error ? `No se pudo guardar el registro: ${error.message}` : 'No se pudo guardar el registro en este navegador.',
            true
        );
        return false;
    }

    progressData = nextData;
    renderProgress();
    setProgressMessage(messageElement, successMessage, false);
    return true;
}

function setProgressMessage(element, message, isError) {
    element.textContent = message;
    element.classList.toggle('is-error', isError);
}

function showProgressError(message) {
    const error = document.getElementById('progress-error');
    error.textContent = message;
    error.hidden = false;
}

function numberText(value) {
    return new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 }).format(value);
}

function metricText(value, unit) {
    return value === null || value === undefined ? '—' : `${numberText(value)} ${unit}`;
}

function makeProgressElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) {
        element.className = className;
    }
    if (text !== undefined) {
        element.textContent = text;
    }
    return element;
}

function renderComparison(measurements) {
    const container = document.getElementById('progress-comparison');
    const dateRange = document.getElementById('progress-date-range');
    container.replaceChildren();

    if (measurements.length === 0) {
        dateRange.textContent = 'Todavía no hay registros';
        container.appendChild(makeProgressElement('p', 'progress-empty', 'Guardá tus primeras medidas para empezar a comparar tu evolución.'));
        return;
    }

    const first = measurements[0];
    const latest = measurements[measurements.length - 1];
    dateRange.textContent = `${formatProgressDate(first.date)} — ${formatProgressDate(latest.date)}`;

    PROGRESS_METRICS.forEach(metric => {
        const firstEntry = measurements.find(entry => entry[metric.key] !== null);
        const latestEntry = [...measurements].reverse().find(entry => entry[metric.key] !== null);
        const firstValue = firstEntry ? firstEntry[metric.key] : null;
        const latestValue = latestEntry ? latestEntry[metric.key] : null;
        const card = makeProgressElement('div', 'progress-comparison-card');
        card.appendChild(makeProgressElement('span', '', metric.label));
        card.appendChild(makeProgressElement('strong', '', metricText(latestValue, metric.unit)));
        let comparison = firstValue === null
            ? 'Todavía no hay un primer registro'
            : `Inicio (${formatProgressDate(firstEntry.date, { day: 'numeric', month: 'short' })}): ${metricText(firstValue, metric.unit)}`;
        if (firstValue !== null && latestValue !== null) {
            const difference = latestValue - firstValue;
            const sign = difference > 0 ? '+' : '';
            comparison = `${comparison} · Actual (${formatProgressDate(latestEntry.date, { day: 'numeric', month: 'short' })}): ${metricText(latestValue, metric.unit)} · Cambio: ${sign}${numberText(difference)} ${metric.unit}`;
        }
        card.appendChild(makeProgressElement('small', '', comparison));
        container.appendChild(card);
    });
}

function renderMeasurementHistory(measurements) {
    const body = document.getElementById('measurement-history');
    const empty = document.getElementById('measurement-empty');
    const count = document.getElementById('measurement-count');
    const sorted = [...measurements].sort((a, b) => b.date.localeCompare(a.date));
    body.replaceChildren();
    count.textContent = `${sorted.length} ${sorted.length === 1 ? 'registro' : 'registros'}`;
    empty.hidden = sorted.length > 0;

    sorted.forEach(entry => {
        const row = document.createElement('tr');
        row.appendChild(makeProgressElement('th', '', formatProgressDate(entry.date)));
        row.lastChild.scope = 'row';
        PROGRESS_METRICS.forEach(metric => {
            row.appendChild(makeProgressElement('td', '', metricText(entry[metric.key], metric.unit)));
        });
        const actionCell = document.createElement('td');
        const deleteButton = makeProgressElement('button', 'progress-table-action', 'Eliminar');
        deleteButton.type = 'button';
        deleteButton.dataset.deleteMeasurement = entry.date;
        deleteButton.setAttribute('aria-label', `Eliminar registro del ${formatProgressDate(entry.date)}`);
        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);
        body.appendChild(row);
    });
}

function createSvgElement(name, attributes = {}) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', name);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
    return element;
}

function renderProgressChart(measurements) {
    const container = document.getElementById('progress-chart');
    const note = document.getElementById('progress-chart-note');
    const selectedKey = document.getElementById('chart-metric').value;
    const metric = PROGRESS_METRICS.find(item => item.key === selectedKey);
    const values = measurements
        .filter(entry => entry[selectedKey] !== null)
        .map(entry => ({ date: entry.date, value: entry[selectedKey] }))
        .sort((a, b) => a.date.localeCompare(b.date));
    container.replaceChildren();

    if (values.length === 0) {
        container.appendChild(makeProgressElement('p', 'progress-empty', `Todavía no hay registros de ${metric.label.toLocaleLowerCase('es')}.`));
        note.textContent = '';
        return;
    }

    const width = 720;
    const height = 250;
    const margin = { top: 18, right: 18, bottom: 38, left: 55 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    const rawMin = Math.min(...values.map(point => point.value));
    const rawMax = Math.max(...values.map(point => point.value));
    const padding = rawMax === rawMin ? Math.max(rawMax * 0.08, 1) : (rawMax - rawMin) * 0.16;
    const min = Math.max(0, rawMin - padding);
    const max = rawMax + padding;
    const x = index => values.length === 1
        ? margin.left + plotWidth / 2
        : margin.left + (index / (values.length - 1)) * plotWidth;
    const y = value => margin.top + ((max - value) / (max - min)) * plotHeight;
    const svg = createSvgElement('svg', {
        viewBox: `0 0 ${width} ${height}`,
        role: 'img',
        'aria-label': `Gráfico de evolución de ${metric.label.toLocaleLowerCase('es')} en ${metric.unit}`
    });
    const definitions = createSvgElement('defs');
    const gradient = createSvgElement('linearGradient', {
        id: 'progress-chart-fill',
        x1: '0',
        x2: '0',
        y1: '0',
        y2: '1'
    });
    gradient.append(
        createSvgElement('stop', { offset: '0%', 'stop-color': '#c8f169', 'stop-opacity': '0.22' }),
        createSvgElement('stop', { offset: '100%', 'stop-color': '#c8f169', 'stop-opacity': '0' })
    );
    definitions.appendChild(gradient);
    svg.appendChild(definitions);

    for (let index = 0; index < 4; index += 1) {
        const ratio = index / 3;
        const gridY = margin.top + ratio * plotHeight;
        const labelValue = max - ratio * (max - min);
        svg.appendChild(createSvgElement('line', {
            x1: margin.left,
            y1: gridY,
            x2: width - margin.right,
            y2: gridY,
            class: 'chart-grid'
        }));
        const yLabel = createSvgElement('text', {
            x: margin.left - 9,
            y: gridY + 4,
            'text-anchor': 'end',
            class: 'chart-axis-label'
        });
        yLabel.textContent = numberText(labelValue);
        svg.appendChild(yLabel);
    }

    const points = values.map((point, index) => ({ ...point, x: x(index), y: y(point.value) }));
    const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${margin.top + plotHeight} L ${points[0].x} ${margin.top + plotHeight} Z`;
    svg.appendChild(createSvgElement('path', { d: areaPath, class: 'chart-area' }));
    svg.appendChild(createSvgElement('path', { d: linePath, class: 'chart-line' }));

    const labelIndices = new Set([0, values.length - 1]);
    if (values.length > 4) {
        labelIndices.add(Math.floor((values.length - 1) / 2));
    }
    points.forEach((point, index) => {
        const circle = createSvgElement('circle', {
            cx: point.x,
            cy: point.y,
            r: values.length === 1 ? 6 : 4.5,
            class: 'chart-point'
        });
        const tooltip = createSvgElement('title');
        tooltip.textContent = `${formatProgressDate(point.date)}: ${numberText(point.value)} ${metric.unit}`;
        circle.appendChild(tooltip);
        svg.appendChild(circle);

        if (labelIndices.has(index)) {
            const dateLabel = createSvgElement('text', {
                x: point.x,
                y: height - 10,
                'text-anchor': index === 0 ? 'start' : index === values.length - 1 ? 'end' : 'middle',
                class: 'chart-axis-label'
            });
            dateLabel.textContent = formatProgressDate(point.date, { day: 'numeric', month: 'short' });
            svg.appendChild(dateLabel);
        }
    });

    container.appendChild(svg);
    note.textContent = `${values.length} ${values.length === 1 ? 'registro' : 'registros'} de ${metric.label.toLocaleLowerCase('es')}`;
}

function getPersonalBests(performances) {
    const bestByExercise = new Map();
    performances.forEach(record => {
        const key = record.exercise.trim().toLocaleLowerCase('es');
        const current = bestByExercise.get(key);
        if (!current || record.weight > current.weight ||
            (record.weight === current.weight && record.reps > current.reps)) {
            bestByExercise.set(key, record);
        }
    });
    return bestByExercise;
}

function renderPerformanceHistory(performances) {
    const bestContainer = document.getElementById('personal-bests');
    const historyContainer = document.getElementById('record-history');
    const empty = document.getElementById('records-empty');
    bestContainer.replaceChildren();
    historyContainer.replaceChildren();
    empty.hidden = performances.length > 0;

    if (performances.length === 0) {
        return;
    }

    const personalBests = getPersonalBests(performances);
    const bestIds = new Set(Array.from(personalBests.values(), record => record.id));
    Array.from(personalBests.values())
        .sort((a, b) => b.weight - a.weight || a.exercise.localeCompare(b.exercise, 'es'))
        .forEach(record => {
            const card = makeProgressElement('article', 'progress-best-card');
            card.appendChild(makeProgressElement('span', '', record.exercise));
            card.appendChild(makeProgressElement('strong', '', `${numberText(record.weight)} kg`));
            card.appendChild(makeProgressElement('small', '', `${record.reps} repeticiones · ${formatProgressDate(record.date)}`));
            bestContainer.appendChild(card);
        });

    [...performances]
        .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
        .forEach(record => {
            const row = makeProgressElement('div', 'progress-record-row');
            row.appendChild(makeProgressElement('strong', '', record.exercise));
            row.appendChild(makeProgressElement('span', bestIds.has(record.id) ? 'is-record' : '', `${numberText(record.weight)} kg`));
            row.appendChild(makeProgressElement('span', '', `${record.reps} repeticiones · ${formatProgressDate(record.date)}`));
            const deleteButton = makeProgressElement('button', 'progress-record-delete', 'Eliminar');
            deleteButton.type = 'button';
            deleteButton.dataset.deletePerformance = record.id;
            deleteButton.setAttribute('aria-label', `Eliminar marca de ${record.exercise} del ${formatProgressDate(record.date)}`);
            row.appendChild(deleteButton);
            historyContainer.appendChild(row);
        });
}

function renderProgress() {
    const measurements = [...progressData.measurements].sort((a, b) => a.date.localeCompare(b.date));
    renderComparison(measurements);
    renderMeasurementHistory(measurements);
    renderProgressChart(measurements);
    renderPerformanceHistory(progressData.performances);
}

function readMeasurementForm(form) {
    const date = form.elements.date.value;
    if (!isValidProgressDate(date)) {
        throw new Error('Elegí una fecha válida que no sea futura.');
    }

    const entry = { date };
    let hasValue = false;
    PROGRESS_METRICS.forEach(metric => {
        const input = form.elements[metric.key];
        const rawValue = input.value.trim();
        if (!rawValue) {
            entry[metric.key] = null;
            return;
        }

        const value = Number(rawValue);
        if (!Number.isFinite(value) || value < Number(input.min) || value > Number(input.max)) {
            throw new Error(`Revisá el valor de ${metric.label.toLocaleLowerCase('es')}.`);
        }
        entry[metric.key] = value;
        hasValue = true;
    });

    if (!hasValue) {
        throw new Error('Ingresá al menos un dato de peso o medidas.');
    }

    return entry;
}

function initializeProgress() {
    const access = document.getElementById('progress-access');
    const dashboard = document.getElementById('progress-dashboard');
    const welcome = document.getElementById('progress-welcome');
    const startLink = document.getElementById('progress-start-link');
    let user;

    try {
        user = getSignedInProgressUser();
    } catch (error) {
        access.hidden = true;
        dashboard.hidden = true;
        showProgressError(error instanceof Error ? error.message : 'No se pudo verificar tu sesión.');
        return;
    }

    if (!user) {
        access.hidden = false;
        dashboard.hidden = true;
        return;
    }

    try {
        progressData = readProgressData(user.email);
    } catch (error) {
        access.hidden = true;
        dashboard.hidden = true;
        showProgressError(error instanceof Error ? error.message : 'No se pudo cargar tu seguimiento.');
        return;
    }

    activeProgressUser = user;
    access.hidden = true;
    dashboard.hidden = false;
    welcome.textContent = `Sesión activa: ${user.username}`;
    welcome.hidden = false;
    startLink.hidden = false;
    renderProgress();
}

document.addEventListener('DOMContentLoaded', function () {
    const today = localDateString();
    document.getElementById('measurement-date').value = today;
    document.getElementById('measurement-date').max = today;
    document.getElementById('record-date').value = today;
    document.getElementById('record-date').max = today;
    initializeProgress();

    document.getElementById('measurement-form').addEventListener('submit', function (event) {
        event.preventDefault();
        const form = event.currentTarget;
        const message = document.getElementById('measurement-message');
        if (!form.reportValidity()) {
            return;
        }

        try {
            const entry = readMeasurementForm(form);
            const nextData = {
                ...progressData,
                measurements: [
                    ...progressData.measurements.filter(item => item.date !== entry.date),
                    entry
                ]
            };
            if (saveProgressData(nextData, message)) {
                form.reset();
                form.elements.date.value = today;
            }
        } catch (error) {
            setProgressMessage(message, error instanceof Error ? error.message : 'No se pudo guardar el registro.', true);
        }
    });

    document.getElementById('measurement-history').addEventListener('click', function (event) {
        const button = event.target.closest('[data-delete-measurement]');
        if (!button) {
            return;
        }

        const date = button.dataset.deleteMeasurement;
        const nextData = {
            ...progressData,
            measurements: progressData.measurements.filter(entry => entry.date !== date)
        };
        saveProgressData(nextData, document.getElementById('measurement-message'), 'Registro eliminado.');
    });

    document.getElementById('chart-metric').addEventListener('change', renderProgress);

    document.getElementById('record-form').addEventListener('submit', function (event) {
        event.preventDefault();
        const form = event.currentTarget;
        const message = document.getElementById('record-message');
        if (!form.reportValidity()) {
            return;
        }

        const date = form.elements.date.value;
        const exercise = form.elements.exercise.value.trim();
        const weight = Number(form.elements.weight.value);
        const reps = Number(form.elements.reps.value);
        if (!isValidProgressDate(date)) {
            setProgressMessage(message, 'Elegí una fecha válida que no sea futura.', true);
            return;
        }
        if (!exercise) {
            setProgressMessage(message, 'Ingresá el nombre del ejercicio.', true);
            return;
        }

        const nextData = {
            ...progressData,
            performances: [
                ...progressData.performances,
                {
                    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                    exercise,
                    date,
                    weight,
                    reps
                }
            ]
        };
        if (saveProgressData(nextData, message)) {
            form.reset();
            form.elements.date.value = today;
        }
    });

    document.getElementById('record-history').addEventListener('click', function (event) {
        const button = event.target.closest('[data-delete-performance]');
        if (!button) {
            return;
        }

        const id = button.dataset.deletePerformance;
        const nextData = {
            ...progressData,
            performances: progressData.performances.filter(record => record.id !== id)
        };
        saveProgressData(nextData, document.getElementById('record-message'), 'Marca eliminada.');
    });

    document.querySelector('.menu-usuario').addEventListener('click', function (event) {
        if (!event.target.closest('[data-logout]')) {
            return;
        }
        activeProgressUser = null;
        document.getElementById('progress-dashboard').hidden = true;
        document.getElementById('progress-access').hidden = false;
        document.getElementById('progress-welcome').hidden = true;
        document.getElementById('progress-start-link').hidden = true;
    });

    window.addEventListener('storage', function (event) {
        if (event.key === PROGRESS_SESSION_KEY) {
            window.location.reload();
        }
    });
});
