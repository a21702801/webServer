const express = require('express');
let router = express.Router();

//Importar a api para fazer queries á base de dados
const pgApi = require('../database/pgApi.js');
const pgErrorHandler = require('../database/pgErrHand');

const jwtAuth = require('../jwt/jwtAuth');

router.route('/getTopVisitCards').post( async (req,res) => {
    console.log('Entrei no TOPVIsits')
    jwtAuth.autenticateToken(req,res, async () => {
        console.log(req.body.country, req.body.quantity)
        console.log('Entrei no TOPVIsits JWT')
        await pgApi.getTopVisitCards(req.body.country, req.body.quantity, async (err,result) => {
            if (err) pgErrorHandler.parseError(err)

            if (result) {
                console.log(result.rows);
                res.status(200).send({cards: result.rows, accessToken: req.accessToken})
            }
        })
    })
});

router.route('/getTwoVisitsNearbyCards').post( async (req,res) => {
    console.log('Entrei no VisitisNearby')

    jwtAuth.autenticateToken(req,res, async () => {
        console.log(req.body.lat, req.body.lon, req.body.units, req.body.distance)
        await pgApi.getTwoVisitCardsByDistance(req.body.lat, req.body.lon, req.body.units, req.body.distance, async (err,result) => {
            if (err) pgErrorHandler.parseError(err)

            if (result) {
                console.log(result.rows);
                res.status(200).send({cards: result.rows, accessToken: req.accessToken})
            }
        })
    })
});

module.exports = router;
