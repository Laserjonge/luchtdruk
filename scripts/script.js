// Verkrijg het display-element
const display = document.getElementById("display");

// Verkrijg alle lijstitems
const items = document.querySelectorAll("ol li");

// De waarden van de markers (zonder eenheden)
const values = [400, 106, 39, 11, 9, 6, 1, 0.8, 0.3, 0.07, 0];

// Functie om de waarde op basis van scrollpositie te berekenen
function updateDisplay() {
    const scrollY = window.scrollY + window.innerHeight / 2; // Midden van het scherm
    let displayValue = 400; // Standaardwaarde is 400 KM

    // Loop door alle markers
    for (let i = 0; i < items.length - 1; i++) {
        const startTop = items[i].offsetTop;
        const endTop = items[i + 1].offsetTop;

        if (scrollY >= startTop && scrollY < endTop) {
            const ratio = (scrollY - startTop) / (endTop - startTop);
            displayValue = values[i] + (values[i + 1] - values[i]) * ratio;
            break;
        }
    }

    // Check of we boven of onder de markers zitten
    if (scrollY < items[0].offsetTop) {
        displayValue = values[0]; // Eerste waarde (400 KM)
    } else if (scrollY >= items[items.length - 1].offsetTop) {
        displayValue = 0; // Laatste waarde is altijd 0
    }

    // Werk het display bij
    display.textContent = formatValue(displayValue);
}

// Functie om een waarde te formatteren
function formatValue(value) {
    if (value >= 1) {
        return Math.round(value) + " KM";
    } else if (value >= 0.001) {
        return Math.round(value * 1000) + " M";
    } else {
        return "0"; // Altijd 0 voor waarden onder 1 meter
    }
}

// Eventlistener om het display bij elke scroll te updaten
window.addEventListener("scroll", updateDisplay);

// Scroll de pagina direct naar de onderkant bij het laden
window.onload = () => {
    window.scrollTo(0, document.body.scrollHeight);
    updateDisplay(); // Zorg ervoor dat het display direct goed wordt bijgewerkt
};

// Initialiseer bij het laden van de pagina
updateDisplay();
