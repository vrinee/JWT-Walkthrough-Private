// server.js arquivo inicial da aplicação
// definições iniciais e configuração do servidor
require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Middleware para validação de token JWT
// Verifica se o token está presente no header Authorization
const ValidarToken = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ');
        if (!token || token.length !== 2 || token[0] !== 'Bearer') {
            return res.status(401).json({ message: 'Token inválido ou não fornecido!' });
        }
        const decodedToken = jwt.verify(token[1], process.env.JWT_SECRET);
        console.log("Token decodificado:", decodedToken);
        req.user = { valid: true, userName: decodedToken.user.username, safeFile: decodedToken.user.safeFile  };  // Adiciona informações do usuário ao objeto de requisição
        next();
    } catch (error) {
        res.status(401).json({ message: 'Autenticação falhou!' });
    }
};


var app = express();

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
    safeFile: {
        type: String,
        required: false
    }
});

const User = mongoose.model('User', userSchema);

const arrayOfUsers = [{
    username: "Fulano",
    password: "1234",
    safeFile: "CatVideo.mp4"
},
{    username: "Ciclano",
    password: "5678",
    safeFile: "CatVideo.mp4"
},{    
    username: "Beltrano",
    password: "91011",
    safeFile: "CatVideo.mp4"
}];

// inserir os usuários no banco
// Primeiro remove todos os usuários existentes, depois insere os novos
async function initializeUsers() {
    try {
        // Delete all existing users
        const deleteResult = await User.deleteMany({});
        console.log(`${deleteResult.deletedCount} usuários removidos`);
        
        // Insert new users
        const insertResult = await User.insertMany(arrayOfUsers);
        console.log(`${insertResult.length} usuários inseridos`);
    } catch (error) {
        console.error("Erro ao inicializar usuários:", error);
    }
}

// Execute the initialization
initializeUsers();


// Configura o CORS para permitir requisições de qualquer origem
app.use(cors());

// instancia os arquivos estaticos publicos
app.use(express.static('public'));

// middleware para parsing do JSON
app.use(express.json());

// serve a página inicial no caminho 'root'
app.get("/",(req,res)=>{
    res.sendFile(__dirname + "/views/index.html");
});

// serve a página de login no caminho /login via GET (navegador)
app.get("/login",(req,res)=>{
    res.sendFile(__dirname + "/views/login.html");
});

// API POST para login
// Recebe username e password, valida e retorna um token JWT
app.post("/login",(req,res)=>{
    const {body} = req;
    const {username,password} = body;
    User.findOne({username,password}).then((user)=>{
        const token = jwt.sign({user}, process.env.JWT_SECRET);
        res.json({token, redirectUrl: "/safe"});
    });

});

// serve a página safe no caminho /safe (sem verificar autenticação)
// reverificação de autenticação para abrir o cofre é feita no front-end
app.get("/safe", (req,res)=>{
    res.sendFile(__dirname + "/views/safe.html");
});

// API GET para pegar o arquivo seguro
app.get("/api/safe-file/:videofile", (req, res) => {
    const videofile = req.params.videofile;
    const filePath = path.join(__dirname, 'safe-videos', videofile);
    /*  Este é a opção mais simples, porém não é melhor para arquivos grandes
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Erro ao enviar o arquivo:', err);
            if (!res.headersSent) {
                res.status(404).json({ message: 'Arquivo não encontrado' });
            }
        }
    });*/
    const stat = fs.statSync(filePath); // aqui esta fazendo stream do arquivo
    res.writeHead(200, {
        'Content-Type': 'video/mp4',
        'Content-Length': stat.size
    });
    fs.createReadStream(filePath).pipe(res);
});
// API GET para validar o token JWT
app.get("/api/validate-token", ValidarToken, (req,res)=>{
    if(!req.user || !req.user.valid) {
            res.status(403).json({valid: false, message: "Invalid token"});
        } else {
            console.log("Usuário autenticado:", req.user);
            res.json(req.user);
        }
});
// listener da aplicação
const listener = app.listen(process.env.PORT || 3000, function () {
    console.log("Seu app esta no port " + '3000');
  });