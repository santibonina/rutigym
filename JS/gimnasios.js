// Referencias a los controles de búsqueda, el mapa y la lista de resultados.
// La clave debe configurarse para habilitar fichas, horarios y reseñas de Places.
const GOOGLE_MAPS_API_KEY = "";
const searchForm = document.querySelector("#gym-search-form");
const searchInput = document.querySelector("#gym-query");
const mapFrame = document.querySelector(".map-panel iframe");
const searchStatus = document.querySelector("#search-status");
const placeResults = document.querySelector("#place-results");
let mapsApiPromise;

// Carga la biblioteca de Google Maps una sola vez cuando se necesita.
function loadGoogleMapsApi() {
    if (window.google?.maps?.importLibrary) {
        return Promise.resolve();
    }

    if (!mapsApiPromise) {
        mapsApiPromise = new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}&v=weekly&loading=async`;
            script.async = true;
            script.onload = resolve;
            script.onerror = () => reject(new Error("No se pudo cargar Google Maps."));
            document.head.append(script);
        });
    }

    return mapsApiPromise;
}

// Crea elementos de texto usando textContent para insertar contenido de forma segura.
function appendText(parent, tagName, className, text) {
    const element = document.createElement(tagName);
    element.className = className;
    element.textContent = text;
    parent.append(element);
    return element;
}

// Construye una ficha de gimnasio con los datos disponibles de Google Places.
function renderGym(place) {
    const item = document.createElement("li");
    item.className = "gym-place";

    const selectButton = document.createElement("button");
    selectButton.className = "gym-place-select";
    selectButton.type = "button";
    selectButton.addEventListener("click", () => {
        const mapQuery = [place.displayName, place.formattedAddress].filter(Boolean).join(" ");
        mapFrame.src = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
        mapFrame.title = `Mapa de ${place.displayName}`;
    });

    appendText(selectButton, "span", "gym-place-name", place.displayName || "Gimnasio");

    if (place.rating != null) {
        const ratingText = `${place.rating.toFixed(1)} de 5${place.userRatingCount ? ` · ${place.userRatingCount} reseñas` : ""}`;
        const rating = appendText(selectButton, "span", "gym-place-rating", "");
        const stars = document.createElement("strong");
        stars.textContent = `★ ${ratingText}`;
        rating.append(stars);
    }

    if (place.formattedAddress) {
        appendText(selectButton, "span", "gym-place-address", place.formattedAddress);
    }

    const openingHours = place.currentOpeningHours || place.regularOpeningHours;
    if (openingHours?.openNow != null) {
        appendText(selectButton, "span", "gym-place-status", openingHours.openNow ? "Abierto ahora" : "Cerrado ahora");
    }

    item.append(selectButton);

    if (openingHours?.weekdayDescriptions?.length) {
        const hours = document.createElement("details");
        const summary = document.createElement("summary");
        summary.textContent = "Ver horarios";
        hours.append(summary);

        const hoursList = document.createElement("ul");
        openingHours.weekdayDescriptions.forEach((day) => {
            appendText(hoursList, "li", "", day);
        });
        hours.append(hoursList);
        item.append(hours);
    }

    (place.reviews || []).slice(0, 2).forEach((review) => {
        const reviewText = typeof review.text === "string" ? review.text : review.text?.text;
        if (!reviewText) {
            return;
        }

        const quote = appendText(item, "blockquote", "gym-place-review", reviewText);
        if (review.authorAttribution?.displayName) {
            const attribution = document.createElement("div");
            attribution.className = "gym-place-review-author";

            if (review.authorAttribution.photoURI) {
                const photo = document.createElement("img");
                photo.src = review.authorAttribution.photoURI;
                photo.alt = "";
                photo.loading = "lazy";
                attribution.append(photo);
            }

            const author = review.authorAttribution.uri
                ? document.createElement("a")
                : document.createElement("span");
            author.textContent = review.authorAttribution.displayName;
            if (review.authorAttribution.uri) {
                author.href = review.authorAttribution.uri;
                author.target = "_blank";
                author.rel = "noopener noreferrer";
            }
            attribution.append(author);
            quote.append(attribution);
        }
    });

    placeResults.append(item);
}

// Actualiza el mapa y, si hay una clave válida, busca y muestra gimnasios cercanos.
async function searchGyms(query) {
    const search = query.trim();
    if (!search) {
        searchInput.focus();
        return;
    }

    searchInput.value = search;
    mapFrame.src = `https://maps.google.com/maps?q=${encodeURIComponent(search)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
    mapFrame.title = `Mapa de gimnasios en ${search}`;
    placeResults.replaceChildren();

    if (!GOOGLE_MAPS_API_KEY) {
        searchStatus.textContent = "Para mostrar fichas, horarios y reseñas reales acá, falta configurar una clave de Google Maps Platform con Places API (New) habilitada.";
        return;
    }

    searchStatus.textContent = "Buscando gimnasios...";

    try {
        await loadGoogleMapsApi();
        const { Place } = await google.maps.importLibrary("places");
        const { places = [] } = await Place.searchByText({
            textQuery: search,
            fields: [
                "displayName",
                "formattedAddress",
                "location",
                "rating",
                "userRatingCount",
                "currentOpeningHours",
                "regularOpeningHours",
                "businessStatus",
                "reviews",
            ],
            includedType: "gym",
            useStrictTypeFiltering: true,
            maxResultCount: 20,
            language: "es",
            region: "AR",
        });

        if (!places.length) {
            searchStatus.textContent = "No encontramos gimnasios para esa búsqueda. Probá con otra zona o nombre.";
            return;
        }

        places.forEach(renderGym);
        searchStatus.textContent = `${places.length} gimnasios encontrados. Seleccioná uno para ubicarlo en el mapa.`;
    } catch (error) {
        searchStatus.textContent = "No se pudieron cargar los resultados. Revisá la clave, Places API (New), la facturación y las restricciones del proyecto.";
        console.error(error);
    }
}

// Procesa búsquedas escritas y accesos directos a zonas populares.
searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    void searchGyms(searchInput.value);
});

document.querySelectorAll(".gym-result-select").forEach((button) => {
    button.addEventListener("click", () => {
        void searchGyms(button.dataset.query);
    });
});