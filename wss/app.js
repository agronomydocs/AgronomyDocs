console.log("app.js loaded");

function runSawflyModel(seedingDate, gdd, cropStage) {

    // Placeholder model logic — replace with ANN later
    let riskScore = 0;

    // Simple heuristic until ANN is added
    if (gdd > 700) riskScore += 0.3;
    if (cropStage === "heading" || cropStage === "flowering") riskScore += 0.4;

    const dateObj = new Date(seedingDate);
    const dayOfYear = Math.floor((dateObj - new Date(dateObj.getFullYear(), 0, 0)) / 86400000);
    if (dayOfYear < 140) riskScore += 0.2;

    // Convert score to risk category
    if (riskScore < 0.3) return "🟢 Low Sawfly Risk";
    if (riskScore < 0.6) return "🟡 Moderate Sawfly Risk";
    return "🔴 High Sawfly Risk";
}
