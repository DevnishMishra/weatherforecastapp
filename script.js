const API_KEY = "e8fc0adcfb07d4743263547d7ea8c491"; // OpenWeatherMap API Key
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const errorMsg = document.getElementById("errorMsg");
const recentCities = document.getElementById("recentCities");

const currentWeather = document.getElementById("currentWeather");
const forecastDiv = document.getElementById("forecast");

const locationName = document.getElementById("locationName");
const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const weatherIcon = document.getElementById("weatherIcon");
const unitToggle = document.getElementById("unitToggle");
const alertMsg = document.getElementById("alertMsg");

let isCelsius = true;
let currentTemp = 0;

/* Event Listeners */
searchBtn.addEventListener("click", () => fetchWeather(cityInput.value));
locationBtn.addEventListener("click", getLocation);
unitToggle.addEventListener("click", toggleUnit);
recentCities.addEventListener("change", e => fetchWeather(e.target.value));

/* Fetch Weather by City */
async function fetchWeather(city) {
  if (!city) {
    showError("Please enter a city name");
    return;
  }

  try {
    hideError();
    saveCity(city);

    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    if (!res.ok) throw new Error("City not found");

    const data = await res.json();
    displayCurrent(data);
    fetchForecast(data.coord.lat, data.coord.lon);
  } catch (err) {
    showError(err.message);
  }
}

/* Current Location */
function getLocation() {
  navigator.geolocation.getCurrentPosition(
    pos => fetchByCoords(pos.coords.latitude, pos.coords.longitude),
    () => showError("Location access denied")
  );
}

async function fetchByCoords(lat, lon) {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
  );
  const data = await res.json();
  displayCurrent(data);
  fetchForecast(lat, lon);
}

/* Display Current Weather */
function displayCurrent(data) {
  currentWeather.classList.remove("hidden");
  forecastDiv.classList.remove("hidden");

  locationName.textContent = `${data.name}, ${data.sys.country}`;
  currentTemp = data.main.temp;
  temperature.textContent = `${currentTemp}°C`;
  condition.textContent = data.weather[0].description;
  humidity.textContent = data.main.humidity;
  wind.textContent = data.wind.speed;
  weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

  document.body.classList.toggle("rainy", data.weather[0].main === "Rain");

  if (currentTemp > 40) {
    alertMsg.textContent = "Extreme heat alert!";
    alertMsg.classList.remove("hidden");
  } else {
    alertMsg.classList.add("hidden");
  }
}

/* Forecast */
async function fetchForecast(lat, lon) {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
  );
  const data = await res.json();
  forecastDiv.innerHTML = "";

  const daily = data.list.filter(item => item.dt_txt.includes("12:00"));

  daily.slice(0, 5).forEach(day => {
    forecastDiv.innerHTML += `
      <div class="bg-white text-gray-800 p-4 rounded-lg shadow">
        <p class="font-semibold">${new Date(day.dt_txt).toDateString()}</p>
        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" />
        <p>${day.main.temp}°C</p>
        <p class="text-sm">💨 ${day.wind.speed} km/h</p>
        <p class="text-sm">💧 ${day.main.humidity}%</p>
      </div>
    `;
  });
}

/* Unit Toggle */
function toggleUnit() {
  isCelsius = !isCelsius;
  temperature.textContent = isCelsius
    ? `${currentTemp}°C`
    : `${((currentTemp * 9) / 5 + 32).toFixed(1)}°F`;
  unitToggle.textContent = isCelsius ? "°F" : "°C";
}

/* Storage */
function saveCity(city) {
  let cities = JSON.parse(localStorage.getItem("cities")) || [];
  if (!cities.includes(city)) {
    cities.unshift(city);
    localStorage.setItem("cities", JSON.stringify(cities.slice(0, 5)));
  }
  loadCities();
}

function loadCities() {
  const cities = JSON.parse(localStorage.getItem("cities")) || [];
  if (cities.length === 0) return;

  recentCities.classList.remove("hidden");
  recentCities.innerHTML = `<option value="">Recently searched cities</option>`;
  cities.forEach(city => {
    recentCities.innerHTML += `<option value="${city}">${city}</option>`;
  });
}

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.remove("hidden");
}

function hideError() {
  errorMsg.classList.add("hidden");
}

loadCities();
