const express = require('express');
const app = express();
const router = express.Router();

const globalConfig = require('./config/global');
const PORT = globalConfig.PORT

const path = require('path');
const bodyParser = require('body-parser');

//Set views e static
app.set('views', path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname,'static')));

//Alterar os headers das requests, para dar handle a CORS Block
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS")
    next();
});

//Dar handle a json
app.use(bodyParser.json());
app.use(express.json())

//Usar o router como midleware, bodyparser para tratar do body de requests
app.use(router);
router.use(bodyParser.urlencoded({ extended:  false }));
router.use(bodyParser.json());

/************************** Routing **************************/
//Routing para pedidos de "auth"
const auth = require('./routes/auth');
app.use('/auth',auth);

//Routing para pedidos de "frogotPassword"
const forgotPassword = require('./routes/forgotPassword');
app.use('/forgotPassword',forgotPassword);

//Routing para pedidos de "home"
const home = require('./routes/home');
app.use('/home',home);

//Routing para pedidos de "home"
const search = require('./routes/search');
app.use('/search',search);

//Routing para pedidos de "populateDb"
/*const generica = require('./routes/generica');
app.use('/generica',generica);*/

//Routing para pedidos para o root do servidor
router.get('/', (req, res) => {
    res.json({ info: 'Webserver BuddyAbroad ligado '});
});

//Ouvir por pedidos feitos a "localhost:3000/"
app.listen(PORT, () => {
    console.log('Servidor ligado em ' + PORT);
});
