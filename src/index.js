const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const router = express.Router();
const PORT = 3000;

//Alterar os headers das requests, para dar handle a CORS Block
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
});

//Usar o router como midleware, bodyparser para tratar do body de requests
app.use(router);
router.use(bodyParser.urlencoded({ extended:  false }));
router.use(bodyParser.json());

//Mensagem quando pedido get feito ao root do server
router.get('/', (req, res) => {
    res.json({ info: 'Node.js, Express, and Postgres API' })
});

// Inserir aqui os diversos routings necessarios
//Routing para pedidos de "auth"
const auth = require('./routes/auth');
app.use('/auth',auth);


//Ouvir por pedidos feitos a "localhost:3000/"
app.listen(PORT, () => {
    console.log('Servidor ligado em ' + PORT)
});