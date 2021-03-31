

function makeRequest(base, callback, onError) {
   https.get(base, (resp) => {
      let data = '';

      resp.on('data', (chunk) => {
         data += chunk;
      });


      resp.on('end', () => {

         if (resp.statusCode >= 400 && resp.statusCode < 500) {
            onError(resp.statusMessage)
         } else {
            callback(data)
         }
      });

   }).on("error", (err) => {
      onError(err)
   })
}

function insertCity(db, body, callback) {

   db.run(`REPLACE INTO cities (cityTitle, coords, desc, humid, iconUrl, press, temperature, windSpeed) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
   [body.cityTitle, body.coord, body.desc, body.humid, body.iconUrl, body.press, body.temperature, body.windSpeed], function(err) {
       callback(err)
   })

}

function deleteCity(db, city, callback) {

   db.run("DELETE FROM cities where cityTitle=?", city, function(err) {
      callback(err)
   })

}

function getCities(db, callback, onError) {

   let sql = `SELECT *
            FROM cities`
   
   db.all(sql, (err, data) => {
      if (err) {
         onError(err)
      } else {
         callback(data)
      }
   })
}

const apiKey = "46efa0450e9fdaaa16b02c2f24cf859c"
const express = require("express")
const https = require('https')
const sqlite3 = require('sqlite3')

const app = express()

let db = new sqlite3.Database("./database.db", (err) => {
   if (err) {
     console.log('Could not connect to database', err)
   } else {
     console.log('Connected to database')
   }
 })

 db.serialize(function() {

   db.run("CREATE TABLE IF NOT EXISTS cities ( cityTitle TEXT PRIMARY KEY, coords TEXT, desc TEXT, humid TEXT, iconUrl TEXT, press TEXT, temperature TEXT, windSpeed TEXT)");

 })

app.use(express.json())

app.get("/weather/city", function(request, response) {
     
   let query = request.query.q
   const base = `https://api.openweathermap.org/data/2.5/weather?q=${query}&lang=ru&appid=${apiKey}&units=metric`
   makeRequest(base, 
      function(data) {
         response.status(200).send(data)
   }, function(error) {
         response.status(404).send(error)
   })
})

app.get("/weather/coordinates", function(request, response) {
     
   let lat = request.query.lat
   let lon = request.query.lon
   const base = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&lang=ru&appid=${apiKey}&units=metric`

   makeRequest(base, 
      function(data) {
         response.status(200).send(data)
   }, function(error) {
         response.status(404).send(error)
   })

})

app.get("/favorites", function(request, response) {
   getCities(db, function(cities) {
      response.status(200).json(cities)
   }, function(err) {
      response.status(400).json({msg: err.message })
   })
})

app.post("/favorites", function(request, response) {

   getCities(db, function(cities) {

      for(let i = 0; i < cities.length; i++) {
         if (cities[i].cityTitle == request.body.cityTitle) {
            response.status(400).send("Exits")
            return
         }
      }

      insertCity(db, request.body, function(err) {
         if (err) {
            response.status(400).json({msg: err.message })
         } else {
           response.status(200).send("success")
         }
      })

   }, function(err) {
      response.status(400).json({msg: err.message })
   })

   
})

app.delete("/favorites", function(request, response) {

   let city = request.body.city
   deleteCity(db, city, function(err) {
      if (err) {
         response.status(400).json({msg: err.message })
      } else {
        response.status(200).send("success")
      }
   })

})

app.use(function(request, response, next) {

   response.status(404).send("<h1>Страница не найдена</h1>")

})

app.listen(3000)
