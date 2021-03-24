
const apiKey = "46efa0450e9fdaaa16b02c2f24cf859c"

getGeoposition()

function getGeoposition() {
   var geolocation = navigator.geolocation;
   geolocation.getCurrentPosition(getCurrentLocation, geolocationError)
}

window.onload = function() {
   getCitiesFromLocalStorage()
   formSubmit()
   updateSubmit()
}



function getCitiesFromLocalStorage() {

   for(let i=0; i<localStorage.length; i++) {
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

function formSubmit() {

   document.getElementById("addCityForm").onsubmit = function() {
      
      const field = document.getElementById("addCityField")
      const city = field.value

      field.value = ""

      getCityWeatherByName(city, function(data) {

         if (localStorage.getItem(city) == null) {
            localStorage[city] = city
            const card = createCityCard(city)
            fillCard(card, data)
            fillCardHeader(card, data)
            hideCardLoader(card, true)
         }
         
      })

      return false
   }

}

function updateSubmit() {
   document.getElementById("updateBtn").onclick = function () {
      hideMainLoader(false)
      getGeoposition()
   }
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
    const iconUrl = `http://openweathermap.org/img/wn/${icon}@2x.png`
    const temperature = `${temp.toFixed(0)} °C`
    

    const windSpeed = wind.speed + " м/с"
    const desc = description
    const press = pressure + " мм рт."
    const humid = humidity + " %"
    const coord = "[" + data.coord.lon + ", " + data.coord.lat + "]"


    return { cityTitle, iconUrl, temperature, windSpeed, desc, press, humid, coord }

}

function showWeatherForMainCity(weather) {
    const cityTitle = document.getElementById("currentCityTitle")
    const cityIcon = document.getElementById("currentCityIcon")
    const cityWeather = document.getElementById("currentCityWeather")
    
    cityTitle.textContent = weather.cityTitle
    cityIcon.src = weather.iconUrl
    cityWeather.textContent = weather.temperature
    
    const currCard = document.getElementById("currentCityCard")

    fillCard(currCard, weather)
}

function hideMainLoader(isHidden) {
   document.getElementById("mainLoader").hidden = isHidden
}

function fillCardHeader(card, weather) {

   const header = card.getElementsByClassName("cityHeader")[0]
   const cityLabel = header.getElementsByTagName("p")[0]
   const image = header.getElementsByTagName("img")[0]

   cityLabel.textContent = weather.temperature
   image.src = weather.iconUrl

}

function fillCard(card, weather) {

   const data = [ weather.windSpeed, weather.desc, weather.press, weather.humid, weather.coord ]
   const rows = card.getElementsByClassName("parametersRaw")
   
   for (let i = 0; i < rows.length; i++) {
      const pars = rows[i].getElementsByTagName("p")
      pars[1].textContent = data[i]
   }

}

function hideCardLoader(card, isHidden) {
   card.getElementsByClassName("loaderContainer")[0].hidden = isHidden
   card.getElementsByClassName("parameters")[0].hidden = !isHidden
}


function createCityCard(cityName) {

   const card = document.createElement("div")
   card.setAttribute("class", "cityCard")

   const header = createCityHeader(cityName)
   const loader = createLoader()
   const info = createCityInfo()
   
   card.appendChild(header)
   card.appendChild(loader)
   info.hidden = true
   card.appendChild(info)
   
   const list = document.getElementById("favoritesList")
   list.appendChild(card)


   card.getElementsByTagName("input")[0].onclick = function () {
      card.remove()
      localStorage.removeItem(cityName)
   }

   return card
}

function createCityHeader(cityName) {

   const header = document.createElement("div")
   header.setAttribute("class", "cityHeader")

   const name = document.createElement("h3")
   name.textContent = cityName

   const temp = document.createElement("p")
   temp.setAttribute("class", "cityLabel")

   const img = document.createElement("img")

   const deleteBtn = document.createElement("input")
   deleteBtn.setAttribute("type", "image")
   deleteBtn.src = "images/trash.png"

   header.appendChild(name)
   header.appendChild(temp)
   header.appendChild(img)
   header.appendChild(deleteBtn)

   return header

}

function createLoader() {

   const loaderContainer = document.createElement("div")
   loaderContainer.setAttribute("class", "loaderContainer")

   const loader = document.createElement("div")
   loader.setAttribute("class", "loader")

   loaderContainer.appendChild(loader)

   return loaderContainer
}

function createCityInfo() {

   const parameters = document.createElement("ul")
   parameters.setAttribute("class", "parameters")

   const wind = createParametersRow("Ветер")
   parameters.appendChild(wind)

   const cloudy = createParametersRow("Облачность")
   parameters.appendChild(cloudy)

   const pressure = createParametersRow("Давление")
   parameters.appendChild(pressure)

   const humidity = createParametersRow("Влажность")
   parameters.appendChild(humidity)

   const coordinates = createParametersRow("Координаты")
   parameters.appendChild(coordinates)

   return parameters
}

function createParametersRow(rowTitle) {

   const row = document.createElement("li")
   row.setAttribute("class", "parametersRaw")

   const title = document.createElement("p")
   title.textContent = rowTitle

   const info = document.createElement("p")

   row.appendChild(title)
   row.appendChild(info)

   return row
}



