const express = require('express');
let router = express.Router();

//Importar a api para fazer queries á base de dados
const pgApi = require('../database/pgApi.js');
const pgErrorHandler = require('../database/pgErrHand');

router.route('/addFakeVisits').get( async (req,res) => {


    let durations = []
    let countries = [ ['Portugal',38.759708, -9.295365], ['Spain',40.390209, -3.430164], ['Zimbabwe',-19.000655, 29.646352]]

    for (let i = 15; i <= 480; i = i+15) {
        if (i < 60){ durations.push(`00:${i}:00`)}
        else if (i < 120){ durations.push(`01:${i-60}:00`)}
        else if (i < 180){ durations.push(`02:${i-120}:00`)}
        else if (i < 240){ durations.push(`03:${i-180}:00`)}
        else if (i < 300){ durations.push(`04:${i-240}:00`)}
        else if (i < 360){ durations.push(`05:${i-300}:00`)}
        else if (i < 420){ durations.push(`06:${i-360}:00`)}
        else if (i < 480){ durations.push(`07:${i-420}:00`)}
        else if (i === 480){ durations.push(`08:${i-480}:00`)}
    }

    for (let line = 0; line < 1; line ++) {
        const tile = 'Title' + line
        const duration = durations[Math.floor(Math.random() * durations.length)]
        const minGroupSize = Math.floor(Math.random() * 5)
        const maxGroupSize = Math.floor(Math.random() * 10) + 5
        const description = 'sample description'
        const price = (Math.floor(Math.random() * 40) + 1).toString()
        const rating = (Math.random() * (5.0 - 1.0) + 1.0).toFixed(2)
        const countryIndex= Math.floor(Math.random() * 3)
        const country = countries[countryIndex][0]
        const lat = countries[countryIndex][1]
        const lon = countries[countryIndex][2]
        const buddy = 156

        console.log(tile)
        console.log(duration)
        console.log(minGroupSize)
        console.log(maxGroupSize)
        console.log(description)
        console.log(price)
        console.log(rating)
        console.log(country)
        console.log(lat)
        console.log(lon)
        console.log(buddy)

        pgApi.addFakeVisit(tile,duration,minGroupSize,maxGroupSize,description,price,rating,lat,lon,country,buddy, (err, res) => {
            if(err) pgErrorHandler.parseError(err)

            if(res) console.log(res)
        })
    }



});

module.exports = router;
