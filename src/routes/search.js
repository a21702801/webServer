const express = require('express');
let router = express.Router();

//Importar a api para fazer queries á base de dados
const pgApi = require('../database/pgApi.js');
const pgErrorHandler = require('../database/pgErrHand');

const jwtAuth = require('../jwt/jwtAuth');

router.route('/getSearchCards').post( async (req,res) => {
    jwtAuth.autenticateToken(req,res, async () => {
        await pgApi.getFiveSearchCards(
            req.body.id,
            req.body.country,
            req.body.priceRangeLower,
            req.body.priceRangeUpper,
            req.body.ratingRangeLower,
            req.body.ratingRangeUpper,
            req.body.maxDuration,
            req.body.groupSizeLower,
            req.body.groupSizeUpper,
            req.body.distance,
            req.body.latitude,
            req.body.longitude,
            req.body.unit,
            async (err, result) => {
                if (err) pgErrorHandler.parseError(err)

                if (result) {
                    console.log(result.rows);
                    res.status(200).send({cards: result.rows, accessToken: req.accessToken})
                }
            })
    })
});

module.exports = router;
