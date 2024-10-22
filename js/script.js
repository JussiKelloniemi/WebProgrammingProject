// API key: 7e3c209cb4470d0a6a40fe3f722a2ee4
// Coordinates API call: http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}
// Weather API call: https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}
// Weather 7 Day API call: https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,rain_sum,wind_speed_10m_max&timezone=Europe%2FMoscow&forecast_days=8

const getLocation = async () => {
    event.preventDefault();
    const location = document.getElementById("search-location").value;
    //console.log(location);

    const url = `http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=5&appid=7e3c209cb4470d0a6a40fe3f722a2ee4`;

    const response = await fetch(url);
    const data = await response.json();


    //console.log(data);
    const lat = data[0].lat;
    const lon = data[0].lon;
    //console.log(lat, lon);
    currentWeather(lat, lon);
    weather24h(lat, lon);
    weekWeather(lat, lon);
}

const getCurrentLocation = async () => {
    navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        //console.log(position);
        
        currentWeather(lat, lon);
        weather24h(lat, lon);
        weekWeather(lat, lon);
    });
}

const weekWeather = async (lat, lon) => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,rain_sum,wind_speed_10m_max&timezone=Europe%2FMoscow&forecast_days=8`
    const response = await fetch(url);
    const data = await response.json();

    const dates = data.daily.time;
    const maxTemps = data.daily.temperature_2m_max;
    const minTemps = data.daily.temperature_2m_min;
    const rain = data.daily.rain_sum;
    const windSpeeds = data.daily.wind_speed_10m_max;

    //console.log(dates, maxTemps);

    const weather8d = document.getElementById("weather-7d");
    weather8d.innerHTML = `
    <h3>Seven day forecast</h3>
    <div id="weather-7d-container"></div>
    `
    const container7d = document.getElementById("weather-7d-container");

    for (let i = 1; i < dates.length; i++) {
        const date = dates[i];
        const maxTemp = maxTemps[i];
        const minTemp = minTemps[i];
        const rainAmount = rain[i];
        const wind = windSpeeds[i];

        container7d.innerHTML += `
        <div id="day${i + 1}">
        <h1>${date}</h1>
            <p>Max temp: ${maxTemp} °C</p>
            <p>Min temp: ${minTemp} °C</p>
            <p>Rain: ${rainAmount} mm</p>
            <p>Max wind speed: ${wind} m/s</p>
        </div>
        `;
    }
}

const weather24h = async (lat, lon) => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,rain&timezone=Europe%2FMoscow&forecast_days=1`
    const response = await fetch(url);
    const data = await response.json();
    
    const hours = data.hourly.time.map(time => time.split("T").pop());
    const temps = data.hourly.temperature_2m;
    const rain = data.hourly.rain;
    
    //console.log(hours, temps, rain);

    const weather24h = document.getElementById("weather-24h");
    weather24h.innerHTML = `
    <h3>24 hour forecast</h3>
    <div id="weather-24h-chart"></div>
    `
    
    const chartData = {
        labels: hours,
        datasets: [
            {
                name: "Temperature °C",
                chartType: "line",
                values: temps
            },
            {
                name: "Rain in mm",
                chartType: "bar",
                values: rain
            }
        ]
    };

    const chart = new frappe.Chart("#weather-24h-chart", {
        title: "24 hour forecast",
        data: chartData,
        type: "axis-mixed",
        height: 350,
        colors: ["#7cd6fd", "#743ee2"],
        axisOptions: {
            xAxisMode: "span",
            xIsSeries: true
        }
    });
}

const currentWeather = async (lat, lon) => {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=7e3c209cb4470d0a6a40fe3f722a2ee4`
    const response = await fetch(url);
    const data = await response.json();

    const city = data.name;
    const temp = (data.main.temp - 273.15).toFixed(2);
    const feelsLike = (data.main.feels_like - 273.15).toFixed(2);
    const windSpeed = data.wind.speed;
    const weather = data.weather[0].main;
    const weatherIcon = data.weather[0].icon;

    const weatherContainer = document.getElementById("current-weather");
    weatherContainer.innerHTML = `
        <h2>${city}</h2>
        <p>Weather: ${weather}</p>
        <p>Temperature: ${temp} °C</p>
        <p>Feels like: ${feelsLike} °C</p>
        <p>Wind speed: ${windSpeed} m/s</p>
        <img src="https://openweathermap.org/img/wn/${weatherIcon}@2x.png" alt="Weather Icon">
    `
    //console.log(temp, feelsLike, windSpeed, weather);
    //console.log(data);
}

getCurrentLocation();
document.getElementById("search-button").addEventListener("click", getLocation);

