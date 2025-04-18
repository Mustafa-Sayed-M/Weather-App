/* ################################### */
// Get elements:
const [
    formSearch,
    countrySearchInput,
    btnSubmit,
    weatherDegree,
    weatherText,
    daysList,
    weatherIcon,
    windSpeed,
    humidity,
    dateInfo,
    swiperWrapper,
    sideDays,
] = [
        document.getElementById('formSearch'),
        document.getElementById('countrySearchInput'),
        document.getElementById('btnSubmit'),
        document.getElementById('weatherDegree'),
        document.getElementById('weatherText'),
        document.getElementById('daysList'),
        document.getElementById('weatherIcon'),
        document.getElementById('windSpeed'),
        document.getElementById('humidity'),
        document.getElementById('dateInfo'),
        document.getElementById('swiperWrapper'),
        document.getElementById('sideDays'),
    ];
/* ################################### */

/* ################################### */
// Base url api:
const baseApi = 'https://api.weatherapi.com/v1';
// Api key:
const apiKey = 'b082f77af6e345378cb165352251704';
/* ################################### */

/* ################################### */
let forecastIndex = 0;
let forecastDay = [];
let searchCaching = JSON.parse(sessionStorage.getItem('SEARCH_CACHING')) || [];
/* ################################### */

/* ################################### */
// Get cairo weather with forecast for 6 days:
const getCairoWeather = async () => {
    try {
        // console.log('Fetch Starting...');
        const res = await fetch(`${baseApi}/forecast.json?key=${apiKey}&q=cairo&days=5`);
        const data = await res.json();
        forecastDay = data.forecast.forecastday
        displayWeatherData(forecastIndex);
        displayWeatherDaysList();
        displayHoursItems(forecastIndex);
    } catch (err) {
        console.log('Fetch Error:');
        console.log(err);
    } finally {
        // console.log('Fetch Well Done.');
    }
};

// Trigger when page load:
window.addEventListener('load', () => {
    displayDateInfo();
    getCairoWeather();
});
/* ################################### */

/* ################################### */
// Search for country:
const searchCountry = async (e) => {
    e.preventDefault();
    const searchValue = countrySearchInput.value;
    const oldSearch = searchCaching.find(item => item.key === searchValue);
    if (oldSearch) {
        console.log('Old Search ( cached data ):');
        console.log(oldSearch);
        forecastDay = oldSearch.data.forecast.forecastday;
        displayWeatherData(forecastIndex);
        displayWeatherDaysList();
        displayHoursItems(forecastIndex);
    } else {
        try {
            btnSubmit.innerText = 'Loading...';
            btnSubmit.setAttribute('disabled', true);
            const res = await fetch(`${baseApi}/forecast.json?key=${apiKey}&q=${searchValue}&days=5`);
            const data = await res.json();
            if (data.error) {
                console.log('Error Message => ' + data.error.message);
                errorMsg(data.error.message).showToast();
            } else {
                const newItem = {
                    key: searchValue,
                    data
                };
                searchCaching.push(newItem);
                sessionStorage.setItem('SEARCH_CACHING', JSON.stringify([...searchCaching, newItem]));
                forecastDay = data.forecast.forecastday;
                displayWeatherData(forecastIndex);
                displayWeatherDaysList();
                displayHoursItems(forecastIndex);
            }
        } catch (err) {
            console.log(err);
        } finally {
            btnSubmit.innerText = 'Find';
            btnSubmit.removeAttribute('disabled');
        }
    }
};
formSearch.addEventListener('submit', searchCountry);
/* ################################### */

/* ################################### */
// Display weather data:
const displayWeatherData = (index) => {
    const data = forecastDay[index];
    let faviconLink = document.querySelector("link[rel~='icon' i]");
    weatherDegree.innerHTML = `${data.day.avgtemp_c} <sup>&#176;C</sup>`;
    weatherText.innerText = data.day.condition.text;
    windSpeed.innerText = `${data.day.maxwind_kph} km/h`;
    humidity.innerText = `${data.day.avghumidity}%`;
    const iconUrl = data.day.condition.icon.startsWith("//") ? "https:" + data.day.condition.icon : data.day.condition.icon;
    weatherIcon.src = iconUrl
    faviconLink.href = iconUrl;
    document.title = 'Weather App - ' + data.day.condition.text
};
/* ################################### */

/* ################################### */
// Display weather days list:
const displayWeatherDaysList = () => {
    daysList.innerHTML = '';
    forecastDay.forEach((item, index) => {
        const secureIcon = item.day.condition.icon.startsWith("//") ? "https:" + item.day.condition.icon : item.day.condition.icon;
        const dayItem = `<li class="day-item ${index === 0 && 'active'}" onclick="selectDay(this)" data-index="${index}">
        <div class="day-box">
            <!-- Icon -->
            <img src="${secureIcon}" alt="..." height="70">
            <!-- Info -->
            <div class="info">
                <!-- Day Name -->
                <h3>${new Date(item.date).toLocaleDateString('en', {
            weekday: 'long'
        })}</h3>
                <!-- Weather State -->
                <p>${item.day.condition.text}</p>
            </div>
            <!-- Degree -->
            <div class="degree">${item.day.avgtemp_c} <sup>&#176;C</sup></div>
        </div>
    </li>`;
        daysList.innerHTML += dayItem;
    })
};
/* ################################### */

/* ################################### */
// Display hours items:
const displayHoursItems = (index) => {
    const hoursData = forecastDay[index].hour;
    swiperWrapper.innerHTML = ``;

    let currentHourIndex = 0;

    const now = new Date();
    const currentHour = now.getHours();

    hoursData.forEach((item, i) => {

        const itemHour = new Date(item.time).getHours();

        const isActive = itemHour === currentHour;

        if (isActive) {
            currentHourIndex = i;
        }

        swiperWrapper.innerHTML += `<div class="swiper-slide">
                <div class="time-card ${isActive ? 'active-hour' : ''}">
                    <div class="time-degree">${item.temp_c} &#176;</div>
                    <hr>
                    <div class="time-hour">
                        ${new Date(item.time).toLocaleTimeString('en', { timeStyle: 'short' })}
                    </div>
                </div>
            </div>`;
    });
    swiper.update();
    swiper.slideTo(currentHourIndex, 500);
};
/* ################################### */

/* ################################### */
// Select day:
const selectDay = (item) => {
    // Re-Trigger display hours items data:
    displayHoursItems(forecastIndex);
    //  But most check first!
    if (!item.classList.contains('active')) {
        // Update forecast Index:
        forecastIndex = item.dataset.index;
        // Re-Trigger display weather data:
        displayWeatherData(forecastIndex);
        // Remove active class from all items:
        daysList.querySelectorAll('li').forEach(item => item.classList.remove('active'));
        // Update active item:
        item.classList.add('active');
    }
};
/* ################################### */

/* ################################### */
// Display date info:
const displayDateInfo = () => {
    const dateText = new Date().toLocaleDateString('en', {
        dateStyle: 'full',
    })
    dateInfo.innerHTML = dateText;
};
/* ################################### */

/* ################################### */
// Error message:
const errorMsg = (msg) => {
    return Toastify({
        text: msg,
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: "bottom",
        position: "center",
        stopOnFocus: true,
        style: {
            background: "#600801",
            boxShadow: 'none'
        },
    })
};
/* ################################### */

/* ################################### */
// side days toggler:
const sideDaysToggler = (e) => {
    sideDays.classList.toggle('open');
};
sideDays.addEventListener('click', (e) => {
    sideDays.classList.remove('open');
})
/* ################################### */