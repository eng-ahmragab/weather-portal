//open weather map api contstants
import { APIKEY } from "./constants.js";

//DOM Selection
const cityNameElement = document.getElementById("cityName");
const iconElement = document.getElementById("icon");
const descriptionElement = document.getElementById("description");
const temperatureElement = document.getElementById("temperature");
const degreeElement = document.querySelector("#temperature h2");
const unitElement = document.querySelector("#temperature #unit");
const searchFormElement = document.getElementById("searchForm");
const cityOrZipElement = document.getElementById("cityOrZip");
const errorAlertElement = document.getElementById("errorAlert");








function renderError(error){
    errorAlertElement.innerHTML = `
    <div class="alert alert-danger alert-dismissible fade show mb-2 mx-1" role="alert">
        ${error}
        <button class="close" data-dismiss="alert">
            <span> &times; </span>
        </button>
    </div>
    `;
}


const toggleUnit = function () {
    let unit = unitElement.innerText;
    let tempF;
    let tempC;

    if (unit.toUpperCase() == "F") {
        tempF = degreeElement.innerText;
        tempC = Math.round((tempF - 32) * 5 / 9);
        degreeElement.innerText = tempC;
        unitElement.innerText = "C";
    } else if (unit.toUpperCase() == "C") {
        tempC = degreeElement.innerText;
        tempF = Math.round((tempC * 9 / 5) + 32);
        degreeElement.innerText = tempF;
        unitElement.innerText = "F";
    }
}


//Update Weather animation based on the returned weather description
function setIcons(icon, iconElement) {
    //skyons: https://github.com/darkskyapp/skycons
    const skycons = new Skycons({ color: "white" });

    //set the canvas to an icon based on the icon-code we got from the open-weather-map api
    if (icon == "01d") {
        skycons.add(iconElement, Skycons.CLEAR_DAY);
    } else if (icon == "01n") {
        skycons.add(iconElement, Skycons.CLEAR_NIGHT);
    } else if (icon == "02d" || icon == "03d" || icon == "04d") {
        skycons.add(iconElement, Skycons.PARTLY_CLOUDY_DAY);
    } else if (icon == "02n" || icon == "03n" || icon == "04n") {
        skycons.add(iconElement, Skycons.PARTLY_CLOUDY_NIGHT);
    } else if (icon == "09d" || icon == "09n" || icon == "10d" || icon == "10n") {
        skycons.add(iconElement, Skycons.RAIN);
    } else if (icon == "13d" || icon == "13n") {
        skycons.add(iconElement, Skycons.SNOW);
    } else if (icon == "11d" || icon == "11n") {
        skycons.add(iconElement, Skycons.SLEET);
    } else if (icon == "50d" || icon == "50n") {
        skycons.add(iconElement, Skycons.FOG);
    }

    skycons.play();
}


async function fetchWeatherData(lat, long, cityOrZip, units) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityOrZip}&lat=${lat}&lon=${long}&units=${units}&appid=${APIKEY}`;
    try {
        const resp = await fetch(url);
        const data = await resp.json();
        // if we don't get http 200, throw an error with the message returned from the API
        if (!resp.ok && data.message){
                throw new Error(data.message);
        }
        if (!resp.ok){
            throw new Error("Bad response code: " + resp.status);
        }
        //DEBUG
        //console.log(data);
        const cityName = data.name;
        const temp = Math.round(data.main.temp);
        const { description, icon } = data.weather[0];
        //set DOM Elements
        degreeElement.innerText = temp;
        descriptionElement.innerText = description;
        cityNameElement.innerText = cityName;
        //set skycons
        //console.log("Icon: ", icon);
        setIcons(icon, iconElement);
    } catch (err) {
        console.error(err.message);
        renderError(err.message);
    }

}


//Toggle temperature unit (Celsius/Fahrenheit)
temperatureElement.addEventListener("click", (e) => {
    toggleUnit();
});


//fetch weather data by city
searchFormElement.addEventListener("submit", (e) => {
    e.preventDefault();
    const lat = "";
    const long = "";
    const cityOrZip = cityOrZipElement.value.trim();
    const units = "metric";

    if (cityOrZip === ""){
        console.error("City or Zip Code field can't be empty!");
        renderError("City or Zip Code field can't be empty!");
        return;
    }
    fetchWeatherData(lat, long, cityOrZip, units);
    cityOrZipElement.value = "";

});




//Hide error alert in startup
errorAlertElement.innerHTML = "";

//Geolocation API
window.navigator.geolocation.getCurrentPosition(
    (position) => {
        //console.log(position);
        const lat = position.coords.latitude;
        const long = position.coords.longitude;
        const cityOrZip = "";
        const units = "metric";

        fetchWeatherData(lat, long, cityOrZip, units);
    },
    (err) => {
        console.error("Failed to get user's location" + err);
        renderError("Failed to get user's location" + err);
    }
);





