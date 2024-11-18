// Verkrijg het display element
const display = document.getElementById("display");

// Verkrijg alle lijstitems
const items = document.querySelectorAll("ol li");

// De getallen uit je lijst (zonder eenheden)
const values = [400, 106, 39, 11, 9, 6, 1, 0.8, 0.3, 0.07, 0];

// Functie om het lineaire getal tussen twee waarden te berekenen
function interpolate(value1, value2, scrollRatio) {
    return value1 + (value2 - value1) * scrollRatio;
}

// Functie om de getallen te converteren naar de juiste eenheden
function formatValue(value) {
    if (value >= 1) {
        // Voor waarden groter dan 1 km, toon in KM
        return Math.round(value) + " KM";
    } else if (value >= 0.001) {
        // Voor waarden tussen 1 m en 1 km, toon in meters
        return Math.round(value * 1000) + " M";
    } else {
        // Voor waarden kleiner dan 0.001 km, toon in meters
        return Math.round(value * 1000) + " M";
    }
}

// Functie om het display bij te werken
function updateDisplay() {
    const scrollPosition = window.scrollY + window.innerHeight / 2; // Middel van het scherm
    let startValue, endValue;
    let startTop, endTop;

    // Controleer of de scrollpositie boven of onder het bereik van de lineaal ligt
    if (scrollPosition <= items[0].offsetTop) {
        // Als de scrollpositie boven 400 km ligt
        display.textContent = formatValue(values[0]);
        return;
    } else if (scrollPosition >= items[items.length - 1].offsetTop) {
        // Als de scrollpositie onder 0 ligt
        display.textContent = formatValue(values[values.length - 1]);
        return;
    }

    // Zoek de twee getallen waarvan de scrollpositie tussenin ligt
    for (let i = 0; i < items.length - 1; i++) {
        startTop = items[i].offsetTop + items[i].offsetHeight / 2;
        endTop = items[i + 1].offsetTop + items[i + 1].offsetHeight / 2;

        if (scrollPosition >= startTop && scrollPosition < endTop) {
            startValue = values[i];
            endValue = values[i + 1];
            const scrollRatio = (scrollPosition - startTop) / (endTop - startTop);

            // Bereken het lineaire getal tussen startValue en endValue
            const interpolatedValue = interpolate(startValue, endValue, scrollRatio);

            // Werk het display bij met de geformatteerde waarde
            display.textContent = formatValue(interpolatedValue);
            break;
        }
    }
}

// Update de display bij elke scrollbeweging
window.addEventListener("scroll", updateDisplay);

// Zorg ervoor dat de display onmiddellijk wordt bijgewerkt bij het laden van de pagina
updateDisplay();
