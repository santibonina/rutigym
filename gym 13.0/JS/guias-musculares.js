const muscleExerciseDetails = new Map([
    ['press de banca con barra', { type: 'Multiarticular', equipment: 'Barra', image: 'press-banca-con-barra.webp' }],
    ['press de pecho inclinado', {
        type: 'Multiarticular',
        equipment: 'Banco inclinado',
        image: 'press-banca-con-barra.webp',
        imageReference: 'Press de banca plano'
    }],
    ['aperturas con mancuernas', { type: 'Aislamiento', equipment: 'Mancuernas', image: 'aperturas-mancuernas.webp' }],
    ['flexiones (push-ups)', { type: 'Peso corporal', equipment: 'Sin equipo', image: 'flexiones.webp' }],
    ['press en máquina smith', {
        type: 'Multiarticular',
        equipment: 'Máquina Smith',
        image: 'press-banca-con-barra.webp',
        imageReference: 'Press de banca: movimiento similar'
    }],
    ['aperturas en polea', {
        type: 'Aislamiento',
        equipment: 'Poleas',
        image: 'aperturas-mancuernas.webp',
        imageReference: 'Aperturas con mancuernas'
    }],
    ['remo con barra', { type: 'Multiarticular', equipment: 'Barra', image: 'remo-barra.webp' }],
    ['dominadas (pull-ups)', {
        type: 'Peso corporal',
        equipment: 'Barra fija',
        image: 'jalon-lat.webp',
        imageReference: 'Jalón al pecho: referencia para dorsales'
    }],
    ['jalones laterales (lat pulldown)', { type: 'Multiarticular', equipment: 'Polea', image: 'jalon-lat.webp' }],
    ['remo en máquina', { type: 'Multiarticular', equipment: 'Máquina', image: 'remo-maquina.webp' }],
    ['remo con mancuerna unilateral', {
        type: 'Multiarticular',
        equipment: 'Mancuerna',
        image: 'remo-inclinado.webp',
        imageReference: 'Remo inclinado: referencia para espalda'
    }],
    ['extensiones de espalda (back extensions)', {
        type: 'Aislamiento',
        equipment: 'Banco de extensión',
        image: 'remo-inclinado.webp',
        imageReference: 'Musculatura de espalda'
    }],
    ['sentadillas (squat)', { type: 'Multiarticular', equipment: 'Barra', image: 'sentadilla.webp' }],
    ['prensa de piernas', { type: 'Multiarticular', equipment: 'Máquina', image: 'prensa-piernas.webp' }],
    ['peso muerto (deadlift)', {
        type: 'Multiarticular',
        equipment: 'Barra',
        image: 'flexion-isquiotibiales.webp',
        imageReference: 'Isquiotibiales: músculo de la cadena posterior'
    }],
    ['extensiones de cuádriceps', { type: 'Aislamiento', equipment: 'Máquina', image: 'extension-de-cuadriceps.webp' }],
    ['flexiones de isquiotibiales (leg curl)', { type: 'Aislamiento', equipment: 'Máquina', image: 'flexion-isquiotibiales.webp' }],
    ['estocadas (lunges)', {
        type: 'Multiarticular',
        equipment: 'Peso corporal o mancuernas',
        image: 'santadilla-bulgara.webp',
        imageReference: 'Sentadilla búlgara: variante unilateral'
    }],
    ['curl de bíceps con mancuernas', { type: 'Aislamiento', equipment: 'Mancuernas', image: 'curl-biceps.webp' }],
    ['fondos en barras paralelas (triceps dips)', { type: 'Multiarticular', equipment: 'Barras paralelas', image: 'fondos-barra.webp' }],
    ['extensión de tríceps con mancuerna', {
        type: 'Aislamiento',
        equipment: 'Mancuerna',
        image: 'press-frances.webp',
        imageReference: 'Press francés: referencia para tríceps'
    }],
    ['curl martillo con mancuernas', { type: 'Aislamiento', equipment: 'Mancuernas', image: 'curl-martillo.webp' }],
    ['curl de bíceps en banco inclinado', {
        type: 'Aislamiento',
        equipment: 'Mancuernas y banco',
        image: 'curl-biceps.webp',
        imageReference: 'Curl con mancuernas: referencia para bíceps'
    }],
    ['poleas cruzadas para tríceps', {
        type: 'Aislamiento',
        equipment: 'Polea',
        image: 'extension-triceps.webp',
        imageReference: 'Extensión de tríceps en polea'
    }]
].map(([name, details]) => [
    name.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
    details
]));

function normalizeExerciseName(name) {
    return name.trim().toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function getExerciseDetails(title) {
    return muscleExerciseDetails.get(normalizeExerciseName(title)) || {
        type: 'Ejercicio',
        equipment: 'Ver descripción'
    };
}

function createExerciseBadge(label, variant) {
    const badge = document.createElement('span');
    badge.className = `exercise-badge exercise-badge--${variant}`;
    badge.textContent = label;
    return badge;
}

function createExerciseVisual(title, details) {
    const visual = document.createElement('div');
    visual.className = 'exercise-visual';
    visual.setAttribute('aria-label', `Ilustración de ${title}`);

    if (details.image) {
        const image = document.createElement('img');
        image.className = 'exercise-visual__image';
        image.src = `../../IMG/tecnicas/${details.image}`;
        image.alt = details.imageReference
            ? `${details.imageReference}; imagen de referencia para ${title.toLocaleLowerCase('es')}`
            : `Técnica de ${title.toLocaleLowerCase('es')}`;
        image.loading = 'lazy';
        image.width = 490;
        image.height = 450;
        image.addEventListener('error', function () {
            visual.classList.add('exercise-visual--placeholder');
            image.remove();
        }, { once: true });
        visual.appendChild(image);
        if (details.imageReference) {
            const caption = document.createElement('span');
            caption.className = 'exercise-visual__reference';
            caption.textContent = `Referencia: ${details.imageReference}`;
            visual.appendChild(caption);
        }
        return visual;
    }

    visual.classList.add('exercise-visual--placeholder');
    const mark = document.createElement('span');
    mark.className = 'exercise-visual__mark';
    mark.textContent = 'RG';
    mark.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span');
    label.className = 'exercise-visual__label';
    label.textContent = 'Guía de movimiento';
    visual.append(mark, label);
    return visual;
}

function createExerciseFact(paragraph) {
    const sourceLabel = paragraph.querySelector('strong');
    if (!sourceLabel) {
        paragraph.classList.add('exercise-description');
        return paragraph;
    }

    const label = sourceLabel.textContent.replace(/:\s*$/, '');
    const content = paragraph.textContent.slice(sourceLabel.textContent.length).trim();
    const fact = document.createElement('div');
    fact.className = `exercise-fact exercise-fact--${normalizeExerciseName(label).replace(/\s+/g, '-')}`;

    const factLabel = document.createElement('span');
    factLabel.className = 'exercise-fact__label';
    factLabel.textContent = label;
    const factContent = document.createElement('p');
    factContent.className = 'exercise-fact__content';
    factContent.textContent = content;
    fact.append(factLabel, factContent);
    return fact;
}

function enhanceExerciseCard(card, index) {
    const title = card.querySelector('h3');
    if (!title || card.dataset.enhanced === 'true') {
        return;
    }

    const details = getExerciseDetails(title.textContent);
    const originalParagraphs = Array.from(card.querySelectorAll(':scope > p'));
    const muscleInfo = originalParagraphs.find(paragraph => paragraph.classList.contains('musculo-info'));
    const descriptionParagraphs = originalParagraphs.filter(paragraph => paragraph !== muscleInfo);

    card.dataset.enhanced = 'true';
    card.classList.add('ejercicio-card--visual');
    card.setAttribute('aria-labelledby', `exercise-title-${index}`);
    title.id = `exercise-title-${index}`;

    const visual = createExerciseVisual(title.textContent.trim(), details);
    const content = document.createElement('div');
    content.className = 'exercise-card__content';

    const header = document.createElement('div');
    header.className = 'exercise-card__header';
    const number = document.createElement('span');
    number.className = 'exercise-card__number';
    number.textContent = `EJERCICIO ${String(index).padStart(2, '0')}`;
    const badges = document.createElement('div');
    badges.className = 'exercise-card__badges';
    badges.append(
        createExerciseBadge(details.type, 'type'),
        createExerciseBadge(details.equipment, 'equipment')
    );
    header.append(number, badges);

    const facts = document.createElement('div');
    facts.className = 'exercise-card__facts';
    descriptionParagraphs.forEach(paragraph => facts.appendChild(createExerciseFact(paragraph)));
    card.replaceChildren(visual, content);
    content.append(header, title);
    if (muscleInfo) {
        muscleInfo.classList.add('exercise-card__muscle');
        content.appendChild(muscleInfo);
    }
    content.appendChild(facts);
}

document.addEventListener('DOMContentLoaded', function () {
    const exerciseCards = document.querySelectorAll('.ejercicio-card');
    exerciseCards.forEach((card, index) => {
        card.setAttribute('role', 'article');
        enhanceExerciseCard(card, index + 1);
    });

    const exerciseGrid = document.querySelector('.hero + div');
    if (exerciseGrid && exerciseGrid.querySelector('.ejercicio-card')) {
        exerciseGrid.classList.add('exercise-grid');
        exerciseGrid.setAttribute('role', 'region');
        exerciseGrid.setAttribute('aria-label', 'Ejercicios recomendados');
    }

    const muscleHeading = document.querySelector('.hero h2');
    if (muscleHeading) {
        muscleHeading.id = 'muscle-guide-title';
        document.querySelector('.hero').setAttribute('aria-labelledby', 'muscle-guide-title');
    }
});
