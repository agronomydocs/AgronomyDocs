console.log("weather.js loaded");

async function fetchWeatherData(stationId, startDate, endDate) {
    const url = `https://api.weather.gc.ca/collections/climate-daily/items?CLIMATE_IDENTIFIER=${stationId}&start=${startDate}&end=${endDate}&limit=500`;

    const response = await fetch(url);
    const data = await response.json();

    return data.features || [];
}

function calculateDailyGDD(tmax, tmin, base = 5) {
    const avg = (tmax + tmin) / 2;
    return Math.max(0, avg - base);
}

async function computeGDD(stationId, seedingDate) {
    const today = new Date().toISOString().split("T")[0];

    const records = await fetchWeatherData(stationId, seedingDate, today);

    let gddSum = 0;
console.log("Records:", records.length);

    records.forEach(day => {
        const tmax = day.properties.MAX_TEMPERATURE;
        const tmin = day.properties.MIN_TEMPERATURE;

        if (tmax !== null && tmin !== null) {
            gddSum += calculateDailyGDD(tmax, tmin);
        }
    });

    return Math.round(gddSum);
}

async function computeRecentRain(stationId) {
    const today = new Date();
    const start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const startDate = start.toISOString().split("T")[0];
    const endDate = today.toISOString().split("T")[0];

    const records = await fetchWeatherData(stationId, startDate, endDate);

    let rainSum = 0;

    records.forEach(day => {
        const rain = day.properties.TOTAL_PRECIPITATION;
        if (rain !== null) {
            rainSum += rain;
        }
    });

    return Math.round(rainSum);
}
