//server.js arquivo inicial da aplicação
require('dotenv').config()
//init da aplicação
var express = require("express");
var app = express();
var jwt = require('jsonwebtoken');
mongoose = require('mongoose');

// configura o mongoose e user
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    safeUrl: {
        type: String,
        required: false
    }
});
const User = mongoose.model('User', userSchema);

const arrayOfUsers = [{
    username: "Fulano",
    password: "1234",
    safeUrl: "CatVideo.mp3"
},
{    username: "Ciclano",
    password: "5678",
    safeUrl: "CatVideo.mp3"
},{    username: "Beltrano",
    password: "91011",
    safeUrl: "CatVideo.mp3"
}];
//inseri os usuários no banco
User.insertMany(arrayOfUsers).then(function(){
    console.log("Usuários inseridos")
}).catch(function(error){
    console.log(error)
});

//instancia os arquivos staticos
app.use(express.static('public'));

//serve o index no caminho 
app.get("/",(req,res)=>{
    res.sendFile(__dirname + "/views/index.html");
});

//serve o login no caminho /login e faz o post do login
app.get("/login",(req,res)=>{
    res.sendFile(__dirname + "/views/login.html");
});

app.post("/login",(req,res)=>{
    const {body} = req;
    const {username,password} = body;
    User.findOne({username,password}, (err,user)=>{
        if(err){
            console.log(err);
            res.status(500).json({message:"Erro no servidor"});
        }
        if(!user){
            return res.status(401).json({message:"Usuário ou senha inválidos"});
        }
        const token = jwt.sign({user}, process.env.JWT_SECRET);
        res.json({token, redirectUrl: "/safe"});
    });

});

//serve o safe no caminho /safe e valida o token
app.get("/safe",ValidateToken,(req,res)=>{
    jwt.verify(req.token, process.env.JWT_SECRET, (err, authData) => {
        if(err) {
            res.sendStatus(403);
        } else {
            console.log(authData);
            res.sendFile(__dirname + "/views/safe.html");
        }
    });
});


//fazer as funções do jwt que serão usadas

const ValidateToken = (req, res, next) => {
    const header = req.headers['authorization'];
    //Check if header is undefined
    if(typeof header !== 'undefined') {
        const bearer = header.split(' ');
        const token = bearer[1];

        req.token = token;
        next();
    } else {
        //If header is undefined return Forbidden (403)
        res.sendStatus(403)
    }
};

























//listener da aplicação
const listener = app.listen(process.env.PORT || 3000, function () {
    console.log("Seu app esta no port " + listener.address().port);
  });