
const apiKey = "46efa0450e9fdaaa16b02c2f24cf859c"

function getCurrentLocation(position) {
    const latitude = position.coords.latitude
    const longitude = position.coords.longitude

    getCityWeather(latitude, longitude)
 }

 function errorHandler( err ) {
   
    if (err.code == 1) {
       console.log("acces denied")
    }

 }

 function handleErrors(response) {
   if (!response.ok) {
       throw response.statusText
   }
   return response
}

 function getCityWeather(cityLat, cityLon) {

    const base = `https://api.openweathermap.org/data/2.5/weather?lat=${cityLat}&lon=${cityLon}&lang=ru&appid=${apiKey}&units=metric`

    fetch(base)
      .then(handleErrors)
      .then((response) => {
        return response.json()
      })
      .then((data) => {
         showWeatherForMainCity(data)
      })
      .catch(function(error) {
         alert(error)
     })
}

function getCityWeatherByName(cityname, callback) {
   const base = `https://api.openweathermap.org/data/2.5/weather?q=${cityname}&appid=${apiKey}`

   fetch(base)
      .then(handleErrors)
      .then((response) => {
        return response.json()
      })
      .then((data) => {
         callback(data)
      })
      .catch(function(error) {
         if (error == "Not Found") {
            alert("City not found")
         } else {
            alert(error)
         }
     })
}

function showWeatherForMainCity(data) {
   console.log(data)
    const cityTitle = document.getElementById("currentCityTitle")
    const cityIcon = document.getElementById("currentCityIcon")
    const cityWeather = document.getElementById("currentCityWeather")
    
    const { temp, pressure, humidity } = data.main
    const place = data.name
    const { description, icon } = data.weather[0]
    const iconUrl = `http://openweathermap.org/img/wn/${icon}@2x.png`
    const wind = data.wind


    cityTitle.textContent = place
    cityIcon.src = iconUrl
    cityWeather.textContent = `${temp.toFixed(0)} °C`
    
    
    const currCard = document.getElementById("currentCityCard")

    const windSpeed = wind.speed + " м/с"
    const desc = description
    const press = pressure + "мм рт."
    const humid = humidity + "%"
    const coord = "[" + data.coord.lon + ", " + data.coord.lat + "]"

    fillCard(currCard, [ windSpeed, desc, press, humid, coord ])
}

function fillCard(card, weather) {

   const rows = card.getElementsByClassName("parametersRaw")
   
   for (let i = 0; i < rows.length; i++) {
      const pars = rows[i].getElementsByTagName("p")
      pars[1].textContent = weather[i]
   }

}


var geolocation = navigator.geolocation;
geolocation.getCurrentPosition(getCurrentLocation)

window.onload = function() {
   getCitiesFromLocalStorage()
   formSubmit()
}

function getCitiesFromLocalStorage() {

   for(let i=0; i<localStorage.length; i++) {
      let key = localStorage.key(i);
      console.log(`${key}: ${localStorage.getItem(key)}`);
    }

}

function formSubmit() {

   document.getElementById("addCityForm").onsubmit = function() {
      
      const field = document.getElementById("addCityField")
      const city = field.value

      
      getCityWeatherByName(city, function(data) {
         localStorage[city] = city
         createCityCard(city)
         console.log(data)
      })

      return false
   }

}

function createCityCard(cityName) {

   const card = document.createElement("div")
   card.setAttribute("class", "cityCard")

   const header = createCityHeader(cityName)  
   const info = createCityInfo()
   
   card.appendChild(header)
   card.appendChild(info)
   
   const list = document.getElementById("favoritesList")
   list.appendChild(card)

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



