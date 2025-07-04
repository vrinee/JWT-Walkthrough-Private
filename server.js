//server.js arquivo inicial da aplicação
require('dotenv').config()
//init da aplicação
var express = require("express");
var app = express();
var jwt = require('jsonwebtoken');
mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

//instancia os arquivos staticos
app.use(express.static('public'));

//serve o index no caminho /, isto é praticamente sempre
app.get("/",(req,res)=>{
    res.sendFile(__dirname + "/views/index.html");
});

//fazer as funções do jwt que serão usadas, implementação no public/main.js



























//listener da aplicação
const listener = app.listen(process.env.PORT || 3000, function () {
    console.log("Seu app esta no port " + listener.address().port);
  });