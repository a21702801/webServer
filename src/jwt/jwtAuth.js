module.exports = {

    autenticateToken: function authenticateToken(req, res, next) {
        if (
            req.url.includes('/auth')
            || req.url.includes('/forgotPassword')
            || req.url.includes('/populateDb')
        ) {
            console.log('No authNeeded')
        } else {
            const jwt = require('jsonwebtoken')

            //tokens[0] = auccess_token, tokens[1] = refresh_token, tokens[2] = email
            const authHeader = req.headers['authorization']
            const tokens = authHeader && authHeader.split(',')
            console.log('tokens:',tokens)

            //Verify header format
            if (!tokens) return res.status(401).send('No authorization')
            if (tokens.length !== 2) return res.status(401).send('No authorization')
            if (tokens[0] === null || tokens[1] === null) return res.status(401).send('No authorization')

            //If token is expired, request a new token
            jwt.verify(tokens[0], process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
                if (err) {
                    console.log('Expirou')
                    //Importar a api para fazer queries á base de dados
                    const pgApi = require('../database/pgApi.js');
                    const pgErrorHandler = require('../database/pgErrHand');

                    await pgApi.getRefreshToken(tokens[1], (err, result) => {

                        //If err in postgres, debug
                        if (err) {
                            console.log('Erro BD')
                            console.log(err)
                            pgErrorHandler.parseError(err)
                            res.status(403).send('Server Error')
                        }

                        //If refresh token does not exist
                        if (result.rows.length === 0) {
                            console.log('No refresh token found')
                            res.status(403).send('Request Denied:0')
                        }

                        //if refresh token exists
                        if (result.rows.length === 1) {
                            console.log('Entrei no criar novo token')
                            jwt.verify(tokens[1], process.env.REFRESH_TOKEN_SECRET, (err, user) => {
                                if (err) return res.status(403).send('Request Denied:1')
                                const accessToken = jwt.sign({email: user.email}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '10m'});
                                req.accessToken = (JSON.stringify({modified: 1, token: accessToken}))
                                next()
                            })
                        }
                    })

                } else {
                    req.accessToken = (JSON.stringify({modified: 0, token: tokens[0]}))
                    next()
                }

            })
        }

    },

}
