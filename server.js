
const express = require('express');
const conexao = require('./db');

const app = express();
const porta = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== CLIENTES ====================

// Listar clientes
app.get('/api/clientes', function (req, res) {
    conexao.query('SELECT * FROM clientes', function (erro, resultados) {
        if (erro) {
            return res.status(500).send('Erro ao buscar clientes');
        }

        res.json(resultados);
    });
});

// Cadastrar cliente
app.post('/api/clientes', function (req, res) {
    const { nome, telefone, email } = req.body;

    if (!nome) {
        return res.status(400).send('O nome é obrigatório');
    }

    const sql = 'INSERT INTO clientes (nome, telefone, email) VALUES (?, ?, ?)';

    conexao.query(sql, [nome, telefone, email], function (erro, resultado) {
        if (erro) {
            return res.status(500).send('Erro ao cadastrar cliente');
        }

        res.send('Cliente cadastrado com sucesso!');
    });
});

// Editar cliente
app.put('/api/clientes/:id', function (req, res) {
    const id = req.params.id;
    const { nome, telefone, email } = req.body;

    const sql = 'UPDATE clientes SET nome = ?, telefone = ?, email = ? WHERE id_cliente = ?';

    conexao.query(sql, [nome, telefone, email, id], function (erro, resultado) {
        if (erro) {
            return res.status(500).send('Erro ao editar cliente');
        }

        res.send('Cliente atualizado com sucesso!');
    });
});

// Excluir cliente
app.delete('/api/clientes/:id', function (req, res) {
    const id = req.params.id;

    conexao.query('DELETE FROM clientes WHERE id_cliente = ?', [id], function (erro, resultado) {
        if (erro) {
            return res.status(500).send('Erro ao excluir cliente');
        }

        res.send('Cliente excluído com sucesso!');
    });
});

// ==================== PETS ====================

// Listar pets com o nome do dono
app.get('/api/pets', function (req, res) {
    const sql = `
        SELECT pets.*, clientes.nome AS nome_cliente
        FROM pets
        INNER JOIN clientes ON pets.id_cliente = clientes.id_cliente
    `;

    conexao.query(sql, function (erro, resultados) {
        if (erro) {
            return res.status(500).send('Erro ao buscar pets');
        }

        res.json(resultados);
    });
});

// Cadastrar pet
app.post('/api/pets', function (req, res) {
    const { nome, especie, raca, idade, id_cliente } = req.body;

    if (!nome || !especie || !id_cliente) {
        return res.status(400).send('Nome, espécie e dono são obrigatórios');
    }

    const sql = `
        INSERT INTO pets (nome, especie, raca, idade, id_cliente)
        VALUES (?, ?, ?, ?, ?)
    `;

    conexao.query(sql, [nome, especie, raca, idade, id_cliente], function (erro, resultado) {
        if (erro) {
            return res.status(500).send('Erro ao cadastrar pet');
        }

        res.send('Pet cadastrado com sucesso!');
    });
});

// Editar pet
app.put('/api/pets/:id', function (req, res) {
    const id = req.params.id;
    const { nome, especie, raca, idade, id_cliente } = req.body;

    const sql = `
        UPDATE pets
        SET nome = ?, especie = ?, raca = ?, idade = ?, id_cliente = ?
        WHERE id_pet = ?
    `;

    conexao.query(sql, [nome, especie, raca, idade, id_cliente, id], function (erro, resultado) {
        if (erro) {
            return res.status(500).send('Erro ao editar pet');
        }

        res.send('Pet atualizado com sucesso!');
    });
});

// Excluir pet
app.delete('/api/pets/:id', function (req, res) {
    const id = req.params.id;

    conexao.query('DELETE FROM pets WHERE id_pet = ?', [id], function (erro, resultado) {
        if (erro) {
            return res.status(500).send('Erro ao excluir pet');
        }

        res.send('Pet excluído com sucesso!');
    });
});

// ==================== SERVIÇOS ====================

// Listar serviços
app.get('/api/servicos', function (req, res) {
    conexao.query('SELECT * FROM servicos', function (erro, resultados) {
        if (erro) {
            return res.status(500).send('Erro ao buscar serviços');
        }

        res.json(resultados);
    });
});

// Cadastrar serviço
app.post('/api/servicos', function (req, res) {
    const { nome, valor, descricao } = req.body;

    if (!nome || valor === undefined || valor === '') {
        return res.status(400).send('Nome e valor são obrigatórios');
    }

    const sql = 'INSERT INTO servicos (nome, valor, descricao) VALUES (?, ?, ?)';

    conexao.query(sql, [nome, valor, descricao], function (erro, resultado) {
        if (erro) {
            return res.status(500).send('Erro ao cadastrar serviço');
        }

        res.send('Serviço cadastrado com sucesso!');
    });
});

// Editar serviço
app.put('/api/servicos/:id', function (req, res) {
    const id = req.params.id;
    const { nome, valor, descricao } = req.body;

    const sql = 'UPDATE servicos SET nome = ?, valor = ?, descricao = ? WHERE id_servico = ?';

    conexao.query(sql, [nome, valor, descricao, id], function (erro, resultado) {
        if (erro) {
            return res.status(500).send('Erro ao editar serviço');
        }

        res.send('Serviço atualizado com sucesso!');
    });
});

// Excluir serviço
app.delete('/api/servicos/:id', function (req, res) {
    const id = req.params.id;

    conexao.query('DELETE FROM servicos WHERE id_servico = ?', [id], function (erro, resultado) {
        if (erro) {
            return res.status(500).send('Erro ao excluir serviço');
        }

        res.send('Serviço excluído com sucesso!');
    });
});

// ==================== SITE ====================

app.use(express.static('public'));

app.listen(porta, function () {
    console.log('Servidor PetCare rodando na porta ' + porta);
});
