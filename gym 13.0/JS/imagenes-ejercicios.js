// Relaciona los nombres de los ejercicios con sus archivos de imagen y textos alternativos.
const exerciseImages = new Map([
    ["Aperturas con Mancuernas", ["aperturas-mancuernas.webp", "Aperturas con mancuernas"]],
    ["Curl de Bíceps", ["curl-biceps.webp", "Curl de bíceps"]],
    ["Curl Martillo", ["curl-martillo.webp", "Curl martillo"]],
    ["Curl Predicador", ["flexiones.webp", "Curl predicador"]],
    ["Remo con Barra", ["remo-barra.webp", "Remo con barra"]],
    ["Jalón Lat", ["jalon-lat.webp", "Jalón al pecho"]],
    ["Extensión de Tríceps", ["extension-triceps.webp", "Extensión de tríceps"]],
    ["Fondos en Barras", ["fondos-barra.webp", "Fondos en barras"]],
    ["Flexiones", ["curl-predicador.webp", "Flexiones"]],
    ["Sentadilla", ["sentadilla.webp", "Sentadilla"]],
    ["Prensa de Piernas", ["prensa-piernas.webp", "Prensa de piernas"]],
    ["Press de Hombros", ["press-hombros.webp", "Press de hombros"]],
    ["Elevaciones Laterales", ["press-frances.webp", "Elevaciones laterales"]],
    ["Remo Inclinado", ["remo-inclinado.webp", "Remo inclinado"]],
    ["Remo Máquina", ["remo-maquina.webp", "Remo en máquina"]],
    ["Encogimientos de Hombros", ["encogimientos-hombros.webp", "Encogimientos de hombros"]],
    ["Extensión de Cuádriceps", ["extension-de-cuadriceps.webp", "Extensión de cuádriceps"]],
    ["Sentadilla Búlgara", ["santadilla-bulgara.webp", "Sentadilla búlgara"]],
    ["Flexión de Isquiotibiales", ["flexion-isquiotibiales.webp", "Flexión de isquiotibiales"]],
    ["Press Francés", ["elevaciones-lat.webp", "Press francés"]],
]);

// Agrega una imagen a cada ejercicio que tenga una correspondencia y aún no tenga imagen.
document.querySelectorAll(".ejercicio-item").forEach((exercise) => {
    const existingImage = exercise.querySelector(".ejercicio-imagen");
    if (existingImage) {
        exercise.classList.add("ejercicio-item--con-imagen");
        return;
    }

    const title = exercise.querySelector("h3")?.textContent.trim();
    const imageDetails = exerciseImages.get(title);
    if (!imageDetails) {
        return;
    }

    // Agrupa los datos del ejercicio para mantenerlos separados de su imagen.
    let details = exercise.querySelector(".ejercicio-item__details");
    if (!details) {
        details = document.createElement("div");
        details.className = "ejercicio-item__details";
        while (exercise.firstChild) {
            details.append(exercise.firstChild);
        }
        exercise.append(details);
    }

    const [fileName, altText] = imageDetails;
    const image = document.createElement("img");
    image.className = "ejercicio-imagen";
    image.src = `../IMG/tecnicas/${fileName}`;
    image.alt = altText;
    image.loading = "lazy";
    image.width = 490;
    image.height = 450;
    exercise.classList.add("ejercicio-item--con-imagen");
    exercise.append(image);
});
