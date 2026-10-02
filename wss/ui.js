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

});

function updateResult(text) {
    document.getElementById("resultBox").innerHTML = text;
}
function calculateThreatLevel(modelPrediction, prevCut) {
    let threat = "Low";

    // Previous-year cutting thresholds (your validated categories)
    if (prevCut > 15) {
        threat = "High";
    } else if (prevCut > 5) {
        threat = "Moderate";
    }

    // Environmental modifier from ANN prediction
    // (modelPrediction = % cutting predicted in solid-stem wheat)
    if (modelPrediction > 20 && threat !== "High") {
        threat = "Moderate";
    }
    if (modelPrediction > 35) {
        threat = "High";
    }

    return threat;
}
