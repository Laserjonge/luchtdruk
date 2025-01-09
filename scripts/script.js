// Verkrijg de elementen
const display = document.getElementById("display");
const pressureDisplay = document.getElementById("pressure-display");
const ballPressureDisplay = document.getElementById("ball-pressure-display");

// Verkrijg alle lijstitems
const items = document.querySelectorAll("ol li");

// De waarden van de markers (zonder eenheden)
const values = [400, 106, 39, 11, 9, 6, 1, 0.8, 0.3, 0.07, 0];

// Variabelen voor animatie en interactie
const firstPijl = document.getElementById("first-rotate");
const secondPijl = document.getElementById("second-rotate");

let clickCount = 0; // Houdt bij hoeveel keer er is geklikt
let baseBallPressure = 0; // Basisdruk (op basis van tweede pijl)
let isAnimationActive = true; // Animatie van eerste pijl is standaard actief

// Functie om de omgevingsdruk te berekenen op basis van hoogte
function calculatePressure(height) {
    const p0 = 1.013; // Druk op zeeniveau in bar
    const hScale = 7; // Schaalhoogte in km (benadering)
    return p0 * Math.exp(-height / hScale); // Exponentiële formule voor druk
}

// Functie om de baldruk te berekenen op basis van omgevingsdruk en basisdruk
function calculateBallPressure(envPressure) {
    const constantFactor = 0.2; // Constante druktoename factor
    const additionalPressure = constantFactor / envPressure; // Extra druk op basis van omgevingsdruk
    const totalPressure = Math.max(baseBallPressure, baseBallPressure + additionalPressure);
    return Math.min(totalPressure, 5.0); // Limiteer tot maximaal 5.0 bar
}

// Functie om de displays bij te werken
function updateDisplay() {
    const scrollY = window.scrollY + window.innerHeight / 2; // Midden van het scherm
    let displayValue = 400; // Standaardwaarde

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
        displayValue = values[0];
    } else if (scrollY >= items[items.length - 1].offsetTop) {
        displayValue = 0;
    }

    // Werk de hoogte-display bij
    display.textContent = formatValue(displayValue);

    // Bereken de omgevingsdruk
    const envPressure = calculatePressure(displayValue);
    pressureDisplay.textContent = `${envPressure.toFixed(6)} bar`;

    // Bereken de baldruk en werk het display bij
    const ballPressure = calculateBallPressure(envPressure);
    ballPressureDisplay.textContent = `${ballPressure.toFixed(1)} bar`;
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

// Functie om de rotatie van de pijl op te halen
function getRotationDegrees(element) {
    const style = window.getComputedStyle(element);
    const transform = style.transform;

    if (transform && transform !== 'none') {
        const values = transform.split('(')[1].split(')')[0].split(',');
        const a = values[0];
        const b = values[1];
        const angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
        return angle < 0 ? angle + 360 : angle;
    }
    return 0; // Geen rotatie gevonden
}

// Functie om graden naar percentage om te rekenen
function getRotationPercentage(degrees) {
    return (degrees / 240) * 100; // Omrekenen naar percentage van 240 graden
}

// Functie om percentage om te zetten naar bar
function convertPercentageToPressure(percentage) {
    return (percentage / 100) * 5.0; // 0-100% naar 0-5 bar
}

// Functie voor vloeiend scrollen
function smoothScroll(targetPosition) {
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    const duration = 2000;
    let startTime = null;

    function animateScroll(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const easeInOut = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        const easingProgress = easeInOut(progress / duration);
        const currentPosition = startPosition + distance * easingProgress;

        window.scrollTo(0, currentPosition);

        if (progress < duration) {
            requestAnimationFrame(animateScroll);
        }
    }

    requestAnimationFrame(animateScroll);
}
// Functie om de displays zichtbaar te maken als de tweede pijl gestopt is
function showDisplaysIfSecondPijlPaused() {
    const style = window.getComputedStyle(secondPijl);
    const animationPlayState = style.animationPlayState;

    if (animationPlayState === "paused") {
        // Verwijder de 'display-none' class om de displays zichtbaar te maken
        pressureDisplay.classList.remove("display-none");
        ballPressureDisplay.classList.remove("display-none");

        // Verzeker je dat de display-stijl wordt aangepast
        pressureDisplay.style.display = "block";  // Zet de display weer op 'block'
        ballPressureDisplay.style.display = "block";  // Zet de display weer op 'block'
    }
}



// Eventlistener voor klikken
document.body.addEventListener("click", () => {
    // Controleer of je niet op de pagina bent waar de functie niet moet werken
    if (!window.location.pathname.includes("game.html")) {
        return; // Stop de functie als je op de specifieke pagina bent
    }

    clickCount++;
    if (clickCount === 1) {
        // Eerste klik: stop animatie van de eerste pijl
        isAnimationActive = false;
        firstPijl.style.animationPlayState = "paused";
        secondPijl.style.animationPlayState = "running"; // Start de tweede pijl
    } else if (clickCount === 2) {
        // Tweede klik: stop de tweede pijl en stel de basisdruk in
        secondPijl.style.animationPlayState = "paused";
        const rotationDegreesSecond = getRotationDegrees(secondPijl);
        const rotationPercentageSecond = getRotationPercentage(rotationDegreesSecond);
        baseBallPressure = convertPercentageToPressure(rotationPercentageSecond); // Stel basisdruk in

        // Scroll omhoog op basis van de eerste pijl
        const rotationDegreesFirst = getRotationDegrees(firstPijl);
        const rotationPercentageFirst = getRotationPercentage(rotationDegreesFirst);
        const scrollPosition = (document.body.scrollHeight - window.innerHeight) * (1 - (rotationPercentageFirst / 100));
        smoothScroll(scrollPosition);

        // Roep de functie aan om de displays zichtbaar te maken
        showDisplaysIfSecondPijlPaused();
    }
});




// Scroll direct naar onderaan bij laden
document.addEventListener("DOMContentLoaded", () => {
    window.scrollTo(0, document.body.scrollHeight);
    updateDisplay();
});

// Eventlistener voor scrollen
window.addEventListener("scroll", updateDisplay);


document.addEventListener("DOMContentLoaded", function() {
    const emergencyButton = document.querySelector(".emergency-image");

    emergencyButton.addEventListener("click", function() {
        // Scroll de pagina volledig naar beneden
        window.scrollTo(0, document.body.scrollHeight);

        // Herlaad de pagina na een korte vertraging, zodat de scrollactie kan plaatsvinden
        setTimeout(function() {
            window.location.reload();
        }, 100);  // Vertraging van 100 ms om het scrollen de tijd te geven
    });
});

window.addEventListener('scroll', () => {
    const element = document.getElementById('center-image-container');
    const scrollPosition = window.scrollY;

    const pageHeight = document.body.scrollHeight - window.innerHeight; // Totale scrollbare hoogte
    const parallaxSpeed = 2; // Factor voor versterking van beweging

    // Bereken een percentage van de scrollpositie over de gehele pagina
    const scrollPercentage = scrollPosition / pageHeight;

    // Laat de bal bewegen tussen -200px en 200px (aanpasbaar)
    const translateY = (scrollPercentage * 2 - 1) * parallaxSpeed * 100;

    // Pas de transform toe
    element.style.transform = `translateY(${translateY}px)`;
});

// Selecteer alle hover-elementen
const hoverElements = document.querySelectorAll('.hover1, .hover2, .hover3');
const tooltip = document.createElement('div');
tooltip.classList.add('tooltip'); // Voeg de tooltip class toe
document.body.appendChild(tooltip); // Voeg de tooltip toe aan de body van de pagina

// Voeg event listener toe voor hover
hoverElements.forEach(element => {
    element.addEventListener('mouseenter', function() {
        tooltip.textContent = element.getAttribute('alt'); // Haal de alt-tekst op voor de tooltip
        tooltip.style.visibility = 'visible'; // Maak de tooltip zichtbaar
        tooltip.style.opacity = 1; // Maak de tooltip volledig zichtbaar
    });

    element.addEventListener('mouseleave', function() {
        tooltip.style.visibility = 'hidden'; // Maak de tooltip onzichtbaar als de hover stopt
        tooltip.style.opacity = 0; // Zorg ervoor dat de tooltip verdwijnt
    });

    // Volg de cursor tijdens het hoveren
    element.addEventListener('mousemove', function(e) {
        const cursorX = e.clientX + 10; // Verplaats de tooltip iets naar rechts
        const cursorY = e.clientY + 10; // Verplaats de tooltip iets naar beneden
        tooltip.style.left = cursorX + 'px';
        tooltip.style.top = cursorY + 'px';
    });
});



// Nieuwe melding toevoegen aan de DOM
const pressureAlert = document.createElement('div');
pressureAlert.classList.add('pressure-alert');
pressureAlert.textContent = "5.0 Bar bereikt!";
document.body.appendChild(pressureAlert); // Voeg het element toe aan de body

// Functie om de melding te tonen met vertraging
function showPressureAlert() {
    setTimeout(() => {
        pressureAlert.style.visibility = 'visible'; // Toon de melding
        pressureAlert.style.opacity = 1; // Maak de melding volledig zichtbaar

        // Verberg de melding na 2 seconden
        setTimeout(() => {
            pressureAlert.style.visibility = 'hidden'; // Verberg de melding
            pressureAlert.style.opacity = 0; // Maak de melding onzichtbaar
        }, 2000); // Verberg na 2 seconden
    }, 2000); // Toon na 2 seconden vertraging
}

// Verkrijg de video-overlay div en het video-element
const videoOverlay = document.getElementById("video-overlay");
const video = document.getElementById("video");

// Pas de functie voor baldrukberekening aan
function calculateBallPressure(envPressure) {
    const constantFactor = 0.2;  // Constante druktoename factor
    const additionalPressure = constantFactor / envPressure;  // Extra druk op basis van omgevingsdruk
    const totalPressure = Math.max(baseBallPressure, baseBallPressure + additionalPressure);
    const ballPressure = Math.min(totalPressure, 5.0);  // Limiteer tot maximaal 5.0 bar

    // Controleer of 5.0 bar is bereikt
    if (ballPressure >= 5.0 && ballPressure < 5.0 + 0.1) {  // Zorg ervoor dat de waarde echt 5.0 is
        console.log("5.0 Bar bereikt! Video wordt getoond na 1 seconde...");

        // Maak de video-overlay zichtbaar na 1 seconde
        setTimeout(() => {
            videoOverlay.style.display = "block";  // Maak de overlay zichtbaar
            video.play();  // Start de video pas nadat de overlay zichtbaar is
        }, 1000); // 1 seconde vertraging
    }

    return ballPressure;
}



// Pas de displays bij
function updateDisplay() {
    const scrollY = window.scrollY + window.innerHeight / 2; // Midden van het scherm
    let displayValue = 400; // Standaardwaarde

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
        displayValue = values[0];
    } else if (scrollY >= items[items.length - 1].offsetTop) {
        displayValue = 0;
    }

    // Werk de hoogte-display bij
    display.textContent = formatValue(displayValue);

    // Bereken de omgevingsdruk
    const envPressure = calculatePressure(displayValue);
    pressureDisplay.textContent = `${envPressure.toFixed(6)} bar`;

    // Bereken de baldruk en werk het display bij
    const ballPressure = calculateBallPressure(envPressure);
    ballPressureDisplay.textContent = `${ballPressure.toFixed(1)} bar`;
}

