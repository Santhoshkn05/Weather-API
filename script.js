function dateFormat(timestamp) {
    const date = new Date(timestamp * 1000);
    console.log(date.toUTCString());
    console.log(date.toLocaleString());
    return date.toLocaleString();
}

async function fetchAQIData(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${lon}&appid=a0ae6e2fe463f8a67f46b2b898ebbdaf`);
        const formattedData = await response.json();
        console.log('AQIData:', formattedData);
        if (!formattedData.list || formattedData.list.length === 0) {
            console.warn("No AQI data available");
            $('#coValue, #so2Value, #o3Value, #no2Value').text("--");
            return;
        }
        const list = formattedData.list[0].components;
        console.log("Fetched AQI Components: ", list);
        $('#coValue').text(list.co.toFixed(1));
        $('#so2Value').text(list.so2.toFixed(1));
        $('#o3Value').text(list.o3.toFixed(1));
        $('#no2Value').text(list.no2.toFixed(1));
    } catch (error) {
        console.error("Error fetching AQI data:", error);
        $('#coValue, #so2Value, #o3Value, #no2Value').text("--");
    }
}

async function fetchData() {
    let cityName = document.getElementsByClassName('inputfield')[0].value;
    console.log('current City: ', cityName)
    let requestData = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=a0ae6e2fe463f8a67f46b2b898ebbdaf&&units=metric`)
    let formattedData = await requestData.json();
    console.log("Formatted_Data: ", formattedData);
    let responseCityName = formattedData.name
    let responseTemp = formattedData.main.temp
    let skyDescription = formattedData.weather[0].description
    $('#cityName')[0].innerText=responseCityName;
    $('#cityTemp')[0].innerText=responseTemp;
    $('#skyDesc')[0].innerText=skyDescription;

            // updating date and time
    let properDate=dateFormat(formattedData.dt);
    let date=properDate.split(',')[0]
    let time = properDate.split(',')[1]
    $('#date')[0].innerText=date;
    $('#time')[0].innerText=time;

            // updating sunrise and sunset
    let sunriseTmeStamp = formattedData.sys.sunrise;
    let sunsetTimeStamp = formattedData.sys.sunset;
    let properSunriseTime = dateFormat(sunriseTmeStamp).split(',')[1]
    let properSunsetTime = dateFormat(sunsetTimeStamp).split(',')[1]
    console.log('Sunrise: ',properSunriseTime)
    console.log('Sunset: ', properSunsetTime)
    $('#sunriseTime')[0].innerText=properSunriseTime;
    $('#sunsetTime')[0].innerText=properSunsetTime;

    let lat=formattedData.coord.lat;
    let lon=formattedData.coord.lon;
    fetchAQIData(lat,lon)
    fetchForecast(lat,lon);
    fetchFiveDaysForecast(lat, lon);
    
    const pressure = formattedData.main.pressure;
    const humidity = formattedData.main.humidity;
    const WindSpeed = formattedData.wind.speed;
    const feelsLike = formattedData.main.feels_like.toFixed(1);

    $('.extraMetric').eq(0).find('img').attr('src', 'images/pressure.png');
    $('.extraMetric').eq(0).find('h6').eq(0).text('Pressure');
    $('.extraMetric').eq(0).find('h6').eq(1).text(`${pressure} hPa`);

    $('.extraMetric').eq(1).find('img').attr('src', 'images/pressure.png');
    $('.extraMetric').eq(1).find('h6').eq(0).text('Humidity');
    $('.extraMetric').eq(1).find('h6').eq(1).text(`${humidity}%`);

    $('.extraMetric').eq(2).find('img').attr('src', 'images/pressure.png');
    $('.extraMetric').eq(2).find('h6').eq(0).text('Wind Speed');
    $('.extraMetric').eq(2).find('h6').eq(1).text(`${WindSpeed}m/s`);

    $('.extraMetric').eq(3).find('img').attr('src', 'images/pressure.png');
    $('.extraMetric').eq(3).find('h6').eq(0).text('Feels Like');
    $('.extraMetric').eq(3).find('h6').eq(1).text(`${feelsLike}°C`);
}
async function fetchForecast(lat, lon) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=a0ae6e2fe463f8a67f46b2b898ebbdaf&units=metric`);
    const data = await response.json();
    const forecastData = data.list.slice(0, 6);
    console.log("Next 6 Forecasts:", forecastData);
    for (let i = 0; i < 6; i++) {
        updateCard(`#temp${i + 1}`, forecastData[i]);
    }
}

function updateCard(selector, forecast) {
    if (!forecast) {
        $(selector).find("h6").text("--");
        $(selector).find("h5").text("--");
        $(selector).find("img").attr("src", "images/na.png");
        return;
    }

    const date = new Date(forecast.dt * 1000);
    const hours = date.getHours();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 || 12;
    const formattedTime = `${displayHour} : 00 ${ampm}`;
    const temp = Math.round(forecast.main.temp);

    const main = forecast.weather[0].main.toLowerCase();
    let customIcon = "images/sun.png";

    if (main.includes("clear")) customIcon = "images/sun.png";
    else if (main.includes("cloud")) customIcon = "images/clouds.png";
    else if (main.includes("rain")) customIcon = "images/rain.png";
    else if (main.includes("thunder")) customIcon = "images/thunder.png";
    else if (main.includes("snow")) customIcon = "images/snow.png";
    else if (main.includes("mist") || main.includes("fog")) customIcon = "images/fog.png";

    $(selector).find("h6").text(formattedTime);
    $(selector).find("h5").html(`${temp}&deg;C`);
    $(selector).find("img").attr("src", customIcon);
}

async function fetchFiveDaysForecast(lat, lon) {
    const apiKey = "a0ae6e2fe463f8a67f46b2b898ebbdaf";
    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    const data = await response.json();

    const dailyData = {};
    data.list.forEach(item => {
        const date = item.dt_txt.split(" ")[0];
        if (!dailyData[date]) {
            dailyData[date] = [];
        }
        dailyData[date].push(item);
    });

    const days = Object.keys(dailyData).slice(1, 6);

    days.forEach((day, i) => {
        const forecasts = dailyData[day];
        const avgTemp =
            forecasts.reduce((sum, x) => sum + x.main.temp, 0) / forecasts.length;
        const main = forecasts[0].weather[0].main.toLowerCase();
        const dateObj = new Date(day);
        const weekday = dateObj.toLocaleDateString("en-US", { weekday: "long" });
        const formattedDate = `${String(dateObj.getDate()).padStart(2, "0")}-${String(
            dateObj.getMonth() + 1
        ).padStart(2, "0")}-${dateObj.getFullYear()}`;

        let iconPath = "images/sun.png";
        if (main.includes("clear")) iconPath = "images/sun.png";
        else if (main.includes("cloud")) iconPath = "images/clouds.png";
        else if (main.includes("rain")) iconPath = "images/rain.png";
        else if (main.includes("thunder")) iconPath = "images/thunder.png";
        else if (main.includes("snow")) iconPath = "images/snow.png";
        else if (main.includes("mist") || main.includes("fog")) iconPath = "images/fog.png";

        const row = $(".forecastRow").eq(i);
        row.find("img").attr("src", iconPath);
        row.find("h6").eq(0).html(`${Math.round(avgTemp)}&deg;C`);
        row.find("h6").eq(1).text(weekday);
        row.find("h6").eq(2).text(formattedDate);
    });
}