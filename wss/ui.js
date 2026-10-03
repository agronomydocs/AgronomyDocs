console.log("ui.js loaded");
window.addEventListener("load", async () => {
    const recentRain = await computeRecentRain();
    document.getElementById("recentRain").value = recentRain;
    updateResult("Enter field data and click Predict.");

});
document.getElementById("seedingDate").addEventListener("change", async () => {
    const seedingDate = document.getElementById("seedingDate").value;

    if (seedingDate) {
        const gdd = await computeGDD(seedingDate);
        document.getElementById("gdd").value = gdd;
        document.getElementById("gdd").disabled = false;
    }
});

document.getElementById("predictBtn").addEventListener("click", async () => {
    const seedingDate = document.getElementById("seedingDate").value;
    const cropStage = document.getElementById("cropStage").value;
    const prevCut = parseFloat(document.getElementById("prevCut").value) || 0;

    if (!seedingDate || !cropStage) {
        updateResult("Please fill in all fields.");
        return;
    }

   // Auto-fetch GDD (requires seeding date)
const gdd = await computeGDD(seedingDate);
document.getElementById("gdd").value = gdd;

// Auto-fetch recent rainfall
const recentRain = await computeRecentRain();
document.getElementById("recentRain").value = recentRain;

    // Run your ANN model
    cropStage = cropStage.toLowerCase();
    const prediction = runSawflyModel(seedingDate, gdd, cropStage);
    
// Threat level with moisture suppression
const threat = calculateThreatLevel(prediction, prevCut, recentRain);

// Icon mapping
let icon = "";
if (threat === "Low") icon = "🌱";
else if (threat === "Moderate") icon = "⚠️";
else if (threat === "High") icon = "🔥";
else if (threat === "Extreme") icon = "🛑";

// Update threat text with icon
document.getElementById("threatLevel").innerText = `${icon} Threat Level: ${threat}`;

// Apply color coding
const threatBox = document.getElementById("threatLevel");

// Remove previous risk classes
threatBox.classList.remove(
    "risk-low",
    "risk-moderate",
    "risk-high",
    "risk-extreme"
);

// Add new class based on threat
if (threat === "Low") {
    threatBox.classList.add("risk-low");
} else if (threat === "Moderate") {
    threatBox.classList.add("risk-moderate");
} else if (threat === "High") {
    threatBox.classList.add("risk-high");
} else if (threat === "Extreme") {
    threatBox.classList.add("risk-extreme");
}

const resultBox = document.getElementById("resultBox");
resultBox.classList.add("flash");
setTimeout(() => resultBox.classList.remove("flash"), 700);

});


function updateResult(text) {
    document.getElementById("resultBox").innerHTML = text;
}
function calculateThreatLevel(prediction, prevCut, recentRain) {
    let threat = "Low";

    // Previous-year cutting thresholds
    if (prevCut > 15) {
        threat = "High";
    } else if (prevCut > 5) {
        threat = "Moderate";
    }

    // Environmental modifier from model prediction
    if (prediction > 20 && threat !== "High") {
        threat = "Moderate";
    }
    if (prediction > 35) {
        threat = "High";
    }

    // Moisture suppression logic
    // High rainfall suppresses flight, mating, and oviposition
    if (recentRain >= 10 && threat === "High") {
        threat = "Moderate";
    }
    if (recentRain >= 20 && threat === "Moderate") {
        threat = "Low";
    }

    return threat;
}

