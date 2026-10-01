document.getElementById("predictBtn").addEventListener("click", () => {
    const seedingDate = document.getElementById("seedingDate").value;
    const gdd = parseFloat(document.getElementById("gdd").value);
    const cropStage = document.getElementById("cropStage").value;

    if (!seedingDate || isNaN(gdd) || !cropStage) {
        updateResult("Please fill in all fields.");
        return;
    }

    const prediction = runSawflyModel(seedingDate, gdd, cropStage);
    updateResult(prediction);
});

function updateResult(text) {
    document.getElementById("resultBox").innerHTML = text;
}
