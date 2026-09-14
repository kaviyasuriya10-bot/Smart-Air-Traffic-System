async function loadRadar() {
    const response = await fetch("/api/radar");
    const data = await response.json();
    document.getElementById("radar").textContent =
        JSON.stringify(data, null, 2);
}

async function loadHistory() {
    const response = await fetch("/api/flights");
    const data = await response.json();
    document.getElementById("history").textContent =
        JSON.stringify(data, null, 2);
}

document.getElementById("aircraftForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const payload = Object.fromEntries(formData.entries());

    const response = await fetch("/api/process", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json();

    document.getElementById("result").textContent =
        JSON.stringify(data, null, 2);

    loadRadar();
    loadHistory();
});

document.getElementById("radarButton").addEventListener("click", loadRadar);
document.getElementById("historyButton").addEventListener("click", loadHistory);

loadRadar();
