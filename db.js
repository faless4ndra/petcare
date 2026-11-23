const mysql = require('mysql2');
require('dotenv').config();

const conexao = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

conexao.connect(function (erro) {
    if (erro) {
        console.log('Erro ao conectar ao banco de dados!');
        console.log(erro);
    } else {
        console.log('Conectado ao banco de dados PetCare!');
    }
});

module.exports = conexao;