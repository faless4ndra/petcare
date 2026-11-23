console.log('PetCare funcionando!');

// ==================== NAVEGACAO ====================

function mostrarInicio() {
    document.getElementById('pagina-inicio').style.display = 'block';
    document.getElementById('pagina-clientes').style.display = 'none';
    document.getElementById('pagina-pets').style.display = 'none';
    document.getElementById('pagina-servicos').style.display = 'none';
    document.getElementById('pagina-agendamentos').style.display = 'none';
}

function mostrarClientes() {
    document.getElementById('pagina-inicio').style.display = 'none';
    document.getElementById('pagina-clientes').style.display = 'block';
    document.getElementById('pagina-pets').style.display = 'none';
    document.getElementById('pagina-servicos').style.display = 'none';
    document.getElementById('pagina-agendamentos').style.display = 'none';

    listarClientes();
}

function mostrarPets() {
    document.getElementById('pagina-inicio').style.display = 'none';
    document.getElementById('pagina-clientes').style.display = 'none';
    document.getElementById('pagina-pets').style.display = 'block';
    document.getElementById('pagina-servicos').style.display = 'none';
    document.getElementById('pagina-agendamentos').style.display = 'none';

    listarClientesPets();
    listarPets();
}

function mostrarServicos() {
    document.getElementById('pagina-inicio').style.display = 'none';
    document.getElementById('pagina-clientes').style.display = 'none';
    document.getElementById('pagina-pets').style.display = 'none';
    document.getElementById('pagina-servicos').style.display = 'block';
    document.getElementById('pagina-agendamentos').style.display = 'none';

    listarServicos();
}

async function mostrarAgendamentos() {
    document.getElementById('pagina-inicio').style.display = 'none';
    document.getElementById('pagina-clientes').style.display = 'none';
    document.getElementById('pagina-pets').style.display = 'none';
    document.getElementById('pagina-servicos').style.display = 'none';
    document.getElementById('pagina-agendamentos').style.display = 'block';

    await listarClientesAgendamento();
    await listarServicosAgendamento();
    await listarPetsAgendamento();
}

// ==================== AGENDAMENTOS ====================

async function listarClientesAgendamento() {
    const resposta = await fetch('/api/clientes');
    const clientes = await resposta.json();

    const select = document.getElementById('cliente_agendamento');

    select.innerHTML = '<option value="">Selecione o cliente</option>';

    clientes.forEach(function(cliente) {
        select.innerHTML +=
            '<option value="' + cliente.id_cliente + '">' +
            cliente.nome +
            '</option>';
    });
}

async function listarPetsAgendamento() {
    const resposta = await fetch('/api/pets');
    const pets = await resposta.json();

    const select = document.getElementById('pet_agendamento');

    select.innerHTML = '<option value="">Selecione o pet</option>';

    pets.forEach(function(pet) {
        select.innerHTML +=
            '<option value="' + pet.id_pet + '" data-cliente="' + pet.id_cliente + '">' +
            pet.nome +
            '</option>';
    });
}

async function listarServicosAgendamento() {
    const resposta = await fetch('/api/servicos');
    const servicos = await resposta.json();

    const select = document.getElementById('servico_agendamento');

    select.innerHTML = '<option value="">Selecione o serviço</option>';

    servicos.forEach(function(servico) {
        const valor = Number(servico.valor).toFixed(2).replace('.', ',');

        select.innerHTML +=
            '<option value="' + servico.id_servico + '">' +
            servico.nome + ' - R$ ' + valor +
            '</option>';
    });
}

// Filtrar os pets pelo cliente selecionado
document.getElementById('cliente_agendamento').addEventListener('change', async function() {
    const idCliente = this.value;
    const selectPet = document.getElementById('pet_agendamento');

    selectPet.innerHTML = '<option value="">Selecione o pet</option>';

    if (idCliente === '') {
        return;
    }

    const resposta = await fetch('/api/pets');
    const pets = await resposta.json();

    pets.forEach(function(pet) {
        if (pet.id_cliente == idCliente) {
            selectPet.innerHTML +=
                '<option value="' + pet.id_pet + '">' +
                pet.nome +
                '</option>';
        }
    });
});

// ==================== CLIENTES ====================

async function listarClientes() {
    const resposta = await fetch('/api/clientes');
    const clientes = await resposta.json();

    const tabela = document.getElementById('tabela-clientes');

    tabela.innerHTML = '';

    clientes.forEach(function(cliente) {
        tabela.innerHTML +=
            '<tr>' +
                '<td>' + cliente.nome + '</td>' +
                '<td>' + (cliente.telefone || '') + '</td>' +
                '<td>' + (cliente.email || '') + '</td>' +
                '<td>' +
                    '<button onclick="editarCliente(' + cliente.id_cliente + ')">Editar</button> ' +
                    '<button onclick="excluirCliente(' + cliente.id_cliente + ')">Excluir</button>' +
                '</td>' +
            '</tr>';
    });
}

// Cadastrar ou editar cliente
document.getElementById('form-cliente').addEventListener('submit', async function(event) {
    event.preventDefault();

    const id = document.getElementById('id_cliente').value;
    const nome = document.getElementById('nome').value;
    const telefone = document.getElementById('telefone').value;
    const email = document.getElementById('email').value;

    const cliente = {
        nome: nome,
        telefone: telefone,
        email: email
    };

    if (id === '') {
        await fetch('/api/clientes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cliente)
        });
    } else {
        await fetch('/api/clientes/' + id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cliente)
        });
    }

    limparFormulario();
    listarClientes();
});

// Editar cliente
async function editarCliente(id) {
    const resposta = await fetch('/api/clientes');
    const clientes = await resposta.json();

    const cliente = clientes.find(function(c) {
        return c.id_cliente == id;
    });

    if (!cliente) {
        return;
    }

    document.getElementById('id_cliente').value = cliente.id_cliente;
    document.getElementById('nome').value = cliente.nome;
    document.getElementById('telefone').value = cliente.telefone || '';
    document.getElementById('email').value = cliente.email || '';

    document.getElementById('btn-salvar').textContent = 'Salvar alterações';
    document.getElementById('btn-cancelar').style.display = 'inline-block';
}

// Excluir cliente
async function excluirCliente(id) {
    const confirmar = confirm('Deseja realmente excluir este cliente?');

    if (confirmar) {
        await fetch('/api/clientes/' + id, {
            method: 'DELETE'
        });

        listarClientes();
    }
}

// Limpar formulário de clientes
function limparFormulario() {
    document.getElementById('form-cliente').reset();
    document.getElementById('id_cliente').value = '';

    document.getElementById('btn-salvar').textContent = 'Cadastrar cliente';
    document.getElementById('btn-cancelar').style.display = 'none';
}

// ==================== PETS ====================

async function listarClientesPets() {
    const resposta = await fetch('/api/clientes');
    const clientes = await resposta.json();

    const select = document.getElementById('dono_pet');

    select.innerHTML = '<option value="">Selecione o cliente</option>';

    clientes.forEach(function(cliente) {
        select.innerHTML +=
            '<option value="' + cliente.id_cliente + '">' +
            cliente.nome +
            '</option>';
    });
}

// Listar pets
async function listarPets() {
    const resposta = await fetch('/api/pets');
    const pets = await resposta.json();

    const tabela = document.getElementById('tabela-pets');

    tabela.innerHTML = '';

    pets.forEach(function(pet) {
        tabela.innerHTML +=
            '<tr>' +
                '<td>' + pet.nome + '</td>' +
                '<td>' + pet.especie + '</td>' +
                '<td>' + (pet.raca || '') + '</td>' +
                '<td>' + (pet.idade ?? '') + '</td>' +
                '<td>' + pet.nome_cliente + '</td>' +
                '<td>' +
                    '<button onclick="editarPet(' + pet.id_pet + ')">Editar</button> ' +
                    '<button onclick="excluirPet(' + pet.id_pet + ')">Excluir</button>' +
                '</td>' +
            '</tr>';
    });
}

// Cadastrar ou editar pet
document.getElementById('form-pet').addEventListener('submit', async function(event) {
    event.preventDefault();

    const id = document.getElementById('id_pet').value;

    const pet = {
        nome: document.getElementById('nome_pet').value,
        especie: document.getElementById('especie').value,
        raca: document.getElementById('raca').value,
        idade: document.getElementById('idade').value,
        id_cliente: document.getElementById('dono_pet').value
    };

    if (id === '') {
        await fetch('/api/pets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pet)
        });
    } else {
        await fetch('/api/pets/' + id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pet)
        });
    }

    limparFormularioPet();
    listarPets();
});

// Editar pet
async function editarPet(id) {
    const resposta = await fetch('/api/pets');
    const pets = await resposta.json();

    const pet = pets.find(function(p) {
        return p.id_pet == id;
    });

    if (!pet) {
        return;
    }

    await listarClientesPets();

    document.getElementById('id_pet').value = pet.id_pet;
    document.getElementById('nome_pet').value = pet.nome;
    document.getElementById('especie').value = pet.especie;
    document.getElementById('raca').value = pet.raca || '';
    document.getElementById('idade').value = pet.idade ?? '';
    document.getElementById('dono_pet').value = pet.id_cliente;

    document.getElementById('btn-salvar-pet').textContent = 'Salvar alterações';
    document.getElementById('btn-cancelar-pet').style.display = 'inline-block';
}

// Excluir pet
async function excluirPet(id) {
    const confirmar = confirm('Deseja realmente excluir este pet?');

    if (confirmar) {
        await fetch('/api/pets/' + id, {
            method: 'DELETE'
        });

        listarPets();
    }
}

// Limpar formulário de pets
function limparFormularioPet() {
    document.getElementById('form-pet').reset();
    document.getElementById('id_pet').value = '';

    document.getElementById('btn-salvar-pet').textContent = 'Cadastrar pet';
    document.getElementById('btn-cancelar-pet').style.display = 'none';
}

// ==================== SERVICOS ====================

// Mostrar formulário de serviço
function mostrarFormularioServico() {
    document.getElementById('formulario-servico').style.display = 'block';
    document.getElementById('titulo-form-servico').textContent = 'Cadastrar novo serviço';
    document.getElementById('btn-salvar-servico').textContent = 'Cadastrar serviço';
}

// Listar serviços
async function listarServicos() {
    const resposta = await fetch('/api/servicos');
    const servicos = await resposta.json();

    const tabela = document.getElementById('tabela-servicos');

    tabela.innerHTML = '';

    servicos.forEach(function(servico) {
        const valor = Number(servico.valor).toFixed(2).replace('.', ',');

        tabela.innerHTML +=
            '<tr>' +
                '<td>' + servico.nome + '</td>' +
                '<td>R$ ' + valor + '</td>' +
                '<td>' + (servico.descricao || '') + '</td>' +
                '<td>' +
                    '<button onclick="editarServico(' + servico.id_servico + ')">Editar</button> ' +
                    '<button onclick="excluirServico(' + servico.id_servico + ')">Excluir</button>' +
                '</td>' +
            '</tr>';
    });
}

// Cadastrar ou editar serviço
document.getElementById('form-servico').addEventListener('submit', async function(event) {
    event.preventDefault();

    const id = document.getElementById('id_servico').value;

    const servico = {
        nome: document.getElementById('nome_servico').value,
        valor: document.getElementById('valor_servico').value,
        descricao: document.getElementById('descricao_servico').value
    };

    if (id === '') {
        await fetch('/api/servicos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(servico)
        });
    } else {
        await fetch('/api/servicos/' + id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(servico)
        });
    }

    limparFormularioServico();
    listarServicos();
});

// Editar serviço
async function editarServico(id) {
    const resposta = await fetch('/api/servicos');
    const servicos = await resposta.json();

    const servico = servicos.find(function(s) {
        return s.id_servico == id;
    });

    if (!servico) {
        return;
    }

    document.getElementById('id_servico').value = servico.id_servico;
    document.getElementById('nome_servico').value = servico.nome;
    document.getElementById('valor_servico').value = servico.valor;
    document.getElementById('descricao_servico').value = servico.descricao || '';

    document.getElementById('formulario-servico').style.display = 'block';
    document.getElementById('titulo-form-servico').textContent = 'Editar serviço';
    document.getElementById('btn-salvar-servico').textContent = 'Salvar alterações';
}

// Excluir serviço
async function excluirServico(id) {
    const confirmar = confirm('Deseja realmente excluir este serviço?');

    if (confirmar) {
        await fetch('/api/servicos/' + id, {
            method: 'DELETE'
        });

        listarServicos();
    }
}

// Limpar formulário de serviços
function limparFormularioServico() {
    document.getElementById('form-servico').reset();
    document.getElementById('id_servico').value = '';

    document.getElementById('formulario-servico').style.display = 'none';
    document.getElementById('titulo-form-servico').textContent = 'Cadastrar novo serviço';
    document.getElementById('btn-salvar-servico').textContent = 'Cadastrar serviço';
}