// ===============================
// GPS + Open-Meteo Weather Module
// ===============================

console.log("weather.js loaded");

// -------------------------------
// 1. Get GPS location
// -------------------------------
async function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject("Geolocation not supported");
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                resolve({
                    lat: pos.coords.latitude,
                    lon: pos.coords.longitude
                });
            },
            (err) => reject(err)
        );
    });
}

// -------------------------------
// 2. Fetch daily weather from Open-Meteo
// -------------------------------
async function fetchDailyWeather(lat, lon, startDate, endDate) {
    const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&start_date=${startDate}&end_date=${endDate}` +
        `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum` +
        `&timezone=auto`;

    console.log("Fetch URL:", url);

    const response = await fetch(url);
    const data = await response.json();

    console.log("Raw response:", data);

    return data.daily || null;
}

// -------------------------------
// 3. Compute GDD
// -------------------------------
function calculateDailyGDD(tmax, tmin, base = 5) {
    const avg = (tmax + tmin) / 2;
    return Math.max(0, avg - base);
}

async function computeGDD(seedingDate) {
    const today = new Date().toISOString().split("T")[0];

    // Get GPS location
    const { lat, lon } = await getUserLocation();

    // Fetch daily weather
    const daily = await fetchDailyWeather(lat, lon, seedingDate, today);

    if (!daily || !daily.temperature_2m_max) {
        console.log("No daily weather records found.");
        return 0;
    }

    let gddSum = 0;

    for (let i = 0; i < daily.temperature_2m_max.length; i++) {
        const tmax = daily.temperature_2m_max[i];
        const tmin = daily.temperature_2m_min[i];

        gddSum += calculateDailyGDD(tmax, tmin);
    }

    console.log("GDD Sum:", gddSum);
    return Math.round(gddSum);
}

// -------------------------------
// 4. Compute rainfall last 7 days
// -------------------------------
async function computeRecentRain() {
    const today = new Date();
    const start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const startDate = start.toISOString().split("T")[0];
    const endDate = today.toISOString().split("T")[0];

    // Get GPS location
    const { lat, lon } = await getUserLocation();

    // Fetch daily weather
    const daily = await fetchDailyWeather(lat, lon, startDate, endDate);

    if (!daily || !daily.precipitation_sum) {
        console.log("No rainfall records found.");
        return 0;
    }

    let rainSum = 0;

    daily.precipitation_sum.forEach(rain => {
        rainSum += rain || 0;
    });

    console.log("Rainfall Sum:", rainSum);
    return Math.round(rainSum);
}

