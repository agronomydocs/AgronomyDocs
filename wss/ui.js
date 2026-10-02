document.getElementById("predictBtn").addEventListener("click", () => {
    const seedingDate = document.getElementById("seedingDate").value;
    const gdd = parseFloat(document.getElementById("gdd").value);
    const cropStage = document.getElementById("cropStage").value;
    const prevCut = parseFloat(document.getElementById("prevCut").value) || 0;

    if (!seedingDate || isNaN(gdd) || !cropStage) {
        updateResult("Please fill in all fields.");
        return;
    }

    const prediction = runSawflyModel(seedingDate, gdd, cropStage);

    const threat = calculateThreatLevel(prediction, prevCut);

    updateResult(prediction);
document.getElementById("threatLevel").innerText = `Threat Level: ${threat}`;
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

