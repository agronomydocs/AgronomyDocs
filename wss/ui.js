console.log("ui.js loaded");

document.getElementById("predictBtn").addEventListener("click", async () => {
    const seedingDate = document.getElementById("seedingDate").value;
    const cropStage = document.getElementById("cropStage").value;
    const prevCut = parseFloat(document.getElementById("prevCut").value) || 0;

    if (!seedingDate || !cropStage) {
        updateResult("Please fill in all fields.");
        return;
    }

    // Auto-fetch GDD
    const gdd = await computeGDD(seedingDate);
    document.getElementById("gdd").value = gdd;

    // Auto-fetch recent rainfall
  const recentRain = await computeRecentRain();
    document.getElementById("recentRain").value = recentRain;

    // Run your ANN model
    const prediction = runSawflyModel(seedingDate, gdd, cropStage);

    // Threat level with moisture suppression
    const threat = calculateThreatLevel(prediction, prevCut, recentRain);

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

