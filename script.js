
const apiKey = "46efa0450e9fdaaa16b02c2f24cf859c"


window.addEventListener("load", loaded)
getGeoposition()

function getGeoposition() {
   var geolocation = navigator.geolocation;
   geolocation.getCurrentPosition(getCurrentLocation, geolocationError)
}

function loaded() {
   getCitiesFromLocalStorage()
   document.querySelector("#addCityForm").addEventListener("submit", formSubmit)
   document.querySelector("#updateBtn").addEventListener("click", updateSubmit)
   document.querySelector("#updateBtnLtl").addEventListener("click", updateSubmit)
}


function getCitiesFromLocalStorage() {
   hideFavoritesLoader(true)
   for(let i = 0; i < localStorage.length; i++) {
      let key = localStorage.key(i)
      const city = localStorage.getItem(key)
      const card = createCityCard(city)
      getCityWeatherByName(city, function(data) {
         fillCard(card, data)
         fillCardHeader(card, data)
         hideCardLoader(card, true)
      })
    }

}

function formSubmit(event) {
   
   const field = document.getElementById("addCityField")
   const city = field.value

   if (!isEmptyOrSpaces(city)) {
      hideFavoritesLoader(false)
      getCityWeatherByName(city, function(data) {
   
         hideFavoritesLoader(true)
         if (localStorage.getItem(city) == null) {
            localStorage[city] = city
            const card = createCityCard(city)
            fillCard(card, data)
            fillCardHeader(card, data)
            hideCardLoader(card, true)
         }
         
      })
   }
   
   field.value = ""

   event.preventDefault()
}

function isEmptyOrSpaces(str) {
   return str === null || str.match(/^ *$/) !== null;
}

function updateSubmit() {
   hideMainLoader(false)
   getGeoposition()
}

function getCurrentLocation(position) {
    const latitude = position.coords.latitude
    const longitude = position.coords.longitude

    getCityWeather(latitude, longitude, function(data) {
      showWeatherForMainCity(data)
      hideMainLoader(true)
    })
 }

 function geolocationError(err) {
   getCityWeatherByName("Санкт-Петербург", function(data) {
      showWeatherForMainCity(data)
   })
 }

 function handleErrors(response) {
   if (!response.ok) {
       throw response.statusText
   }
   return response
}

 function getCityWeather(cityLat, cityLon, callback) {

    const base = `https://api.openweathermap.org/data/2.5/weather?lat=${cityLat}&lon=${cityLon}&lang=ru&appid=${apiKey}&units=metric`

    fetch(base)
      .then(handleErrors)
      .then((response) => {
        return response.json()
      })
      .then((data) => {
         const weather = parseWeather(data)
         callback(weather)
      })
      .catch(function(error) {
         alert(error)
     })
}

function getCityWeatherByName(cityname, callback) {
   const base = `https://api.openweathermap.org/data/2.5/weather?q=${cityname}&lang=ru&appid=${apiKey}&units=metric`
   
   fetch(base)
      .then(handleErrors)
      .then((response) => {
        return response.json()
      })
      .then((data) => {
         const weather = parseWeather(data)
         callback(weather)
      })
      .catch(function(error) {
         if (error == "Not Found") {
            alert("City not found")
            hideFavoritesLoader(true)
         } else {
            alert(error)
         }
     })
}

function parseWeather(data) {
    console.log(data)
    const { temp, pressure, humidity } = data.main
    const place = data.name
    const { description, icon } = data.weather[0]
    const wind = data.wind

    const cityTitle = place
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`
    const temperature = `${temp.toFixed(0)} °C`

    const windSpeed = wind.speed + " м/с"
    const desc = description
    const press = pressure + " мм рт."
    const humid = humidity + " %"
    const coord = "[" + data.coord.lon + ", " + data.coord.lat + "]"


    return { cityTitle, iconUrl, temperature, windSpeed, desc, press, humid, coord }

}

function showWeatherForMainCity(weather) {
    const cityTitle = document.querySelector("#currentCityTitle")
    const cityIcon = document.querySelector("#currentCityIcon")
    const cityWeather = document.querySelector("#currentCityWeather")
    
    cityTitle.textContent = weather.cityTitle
    cityIcon.src = weather.iconUrl
    cityWeather.textContent = weather.temperature
    
    const currCard = document.querySelector("#currentCityCard")

    fillCard(currCard, weather)
}

function fillCardHeader(card, weather) {

   const header = card.querySelector(".cityHeader")
   const cityLabel = header.querySelector("p")
   const image = header.querySelector("img")

   cityLabel.textContent = weather.temperature
   image.src = weather.iconUrl

}

function fillCard(card, weather) {

   const data = [ weather.windSpeed, weather.desc, weather.press, weather.humid, weather.coord ]
   const rows = card.querySelectorAll(".parametersRaw")
   
   for (let i = 0; i < rows.length; i++) {
      const pars = rows[i].querySelectorAll("p")
      pars[1].textContent = data[i]
   }

}

function hideMainLoader(isHidden) {
   document.querySelector("#mainLoader").hidden = isHidden
}

function hideFavoritesLoader(isHidden) {
   document.querySelector("#favoritesLoader").hidden = isHidden
}

function hideCardLoader(card, isHidden) {
   card.querySelector(".loaderContainer").hidden = isHidden
   card.querySelector(".parameters").hidden = !isHidden
}


function createCityCard(cityName) {

   const cardTemplate = document.getElementById("cardTemplate")
   const card = document.importNode(cardTemplate.content, true)
   
   card.querySelector("#cityHeader").textContent = cityName
   card.querySelector(".cityCard").id = cityName 
   card.querySelector(".parameters").hidden = true
   
   const list = document.getElementById("favoritesList")
   list.appendChild(card)

   const currCard = document.querySelector(`#${cityName}`)
   currCard.querySelector("input").addEventListener("click", function () {
      currCard.remove()
      localStorage.removeItem(cityName)
   })

   return currCard
}



