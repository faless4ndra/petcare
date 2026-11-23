console.log('PetCare funcionando!');

// ==================== NAVEGAÇÃO ====================

function esconderTodasPaginas() {
    const paginas = [
        'pagina-inicio',
        'pagina-clientes',
        'pagina-pets',
        'pagina-servicos',
        'pagina-agendamentos'
    ];

    paginas.forEach(function(id) {
        const pagina = document.getElementById(id);
        if (pagina) pagina.style.display = 'none';
    });
}

function mostrarInicio() {
    esconderTodasPaginas();
    document.getElementById('pagina-inicio').style.display = 'block';
}

async function mostrarClientes() {
    esconderTodasPaginas();
    document.getElementById('pagina-clientes').style.display = 'block';
    await listarClientes();
}

async function mostrarPets() {
    esconderTodasPaginas();
    document.getElementById('pagina-pets').style.display = 'block';
    await listarClientesPet();
    await listarPets();
}

async function mostrarServicos() {
    esconderTodasPaginas();
    document.getElementById('pagina-servicos').style.display = 'block';
    await listarServicos();
}

async function mostrarAgendamentos() {
    esconderTodasPaginas();
    document.getElementById('pagina-agendamentos').style.display = 'block';

    await listarClientesAgendamento();
    await listarServicosAgendamento();
    await listarPetsAgendamento();
    await listarAgendamentos();
}

// ==================== CLIENTES ====================

// CADASTRAR E EDITAR CLIENTES

document.getElementById('form-cliente').addEventListener('submit', async function(event) {
    event.preventDefault();

    const id = document.getElementById('id_cliente').value;

    const cliente = {
        nome: document.getElementById('nome').value,
        telefone: document.getElementById('telefone').value,
        email: document.getElementById('email').value
    };

    try {
        let resposta;

        if (id === '') {
            resposta = await fetch('/api/clientes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cliente)
            });
        } else {
            resposta = await fetch('/api/clientes/' + id, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cliente)
            });
        }

        if (!resposta.ok) {
            alert('Erro ao salvar cliente.');
            return;
        }

        alert(id === '' ? 'Cliente cadastrado com sucesso!' : 'Cliente atualizado com sucesso!');

        limparFormularioCliente();
        await listarClientes();

    } catch (erro) {
        console.log(erro);
        alert('Erro ao conectar com o servidor.');
    }
});

// LISTAR E PESQUISAR CLIENTES POR NOME OU TELEFONE

async function listarClientes() {
    try {
        const resposta = await fetch('/api/clientes');

        if (!resposta.ok) {
            alert('Erro ao carregar clientes.');
            return;
        }

        const clientes = await resposta.json();

        const tabela = document.getElementById('tabela-clientes');
        const pesquisa = document.getElementById('pesquisa-clientes');

        tabela.innerHTML = '';

        const textoPesquisa = pesquisa ? pesquisa.value.trim().toLowerCase() : '';
        const telefonePesquisa = textoPesquisa.replace(/\D/g, '');

        const clientesFiltrados = clientes.filter(function(cliente) {
            const nomeCliente = (cliente.nome || '').toLowerCase();
            const telefoneCliente = (cliente.telefone || '').replace(/\D/g, '');

            const encontrouNome = nomeCliente.includes(textoPesquisa);

            const encontrouTelefone = telefonePesquisa !== '' &&
                telefoneCliente.includes(telefonePesquisa);

            return textoPesquisa === '' || encontrouNome || encontrouTelefone;
        });

        if (clientesFiltrados.length === 0) {
            tabela.innerHTML =
                '<tr><td colspan="4">Nenhum cliente encontrado.</td></tr>';
            return;
        }

        clientesFiltrados.forEach(function(cliente) {
            tabela.innerHTML +=
                '<tr>' +
                    '<td>' + (cliente.nome || '') + '</td>' +
                    '<td>' + (cliente.telefone || '') + '</td>' +
                    '<td>' + (cliente.email || '') + '</td>' +
                    '<td>' +
                        '<button onclick="editarCliente(' + cliente.id_cliente + ')">Editar</button> ' +
                        '<button onclick="excluirCliente(' + cliente.id_cliente + ')">Excluir</button>' +
                    '</td>' +
                '</tr>';
        });

    } catch (erro) {
        console.log(erro);
        alert('Erro ao buscar clientes.');
    }
}

// PESQUISA AUTOMÁTICA DE CLIENTES

document.getElementById('pesquisa-clientes').addEventListener('input', function() {
    listarClientes();
});

// EDITAR CLIENTE

async function editarCliente(id) {
    try {
        const resposta = await fetch('/api/clientes');
        const clientes = await resposta.json();

        const cliente = clientes.find(function(c) {
            return c.id_cliente == id;
        });

        if (!cliente) {
            alert('Cliente não encontrado!');
            return;
        }

        document.getElementById('id_cliente').value = cliente.id_cliente;
        document.getElementById('nome').value = cliente.nome;
        document.getElementById('telefone').value = cliente.telefone;
        document.getElementById('email').value = cliente.email;

    } catch (erro) {
        console.log(erro);
        alert('Erro ao carregar cliente.');
    }
}

// EXCLUIR CLIENTE

async function excluirCliente(id) {
    const confirmar = confirm('Deseja realmente excluir este cliente?');

    if (!confirmar) return;

    try {
        const resposta = await fetch('/api/clientes/' + id, {
            method: 'DELETE'
        });

        if (!resposta.ok) {
            alert('Erro ao excluir cliente. Verifique se ele possui pets cadastrados.');
            return;
        }

        alert('Cliente excluído com sucesso!');
        await listarClientes();

    } catch (erro) {
        console.log(erro);
        alert('Erro ao conectar com o servidor.');
    }
}

// LIMPAR FORMULÁRIO DE CLIENTE

function limparFormularioCliente() {
    document.getElementById('form-cliente').reset();
    document.getElementById('id_cliente').value = '';
}

// ==================== PETS ====================

// CONTAR PETS CADASTRADOS

async function carregarTotalPets() {
    try {
        const resposta = await fetch('/api/pets/total');

        if (!resposta.ok) {
            throw new Error('Erro ao carregar total de pets');
        }

        const dados = await resposta.json();

        const contador = document.getElementById('total-pets');

        if (contador) {
            contador.textContent = dados.total;
        }

    } catch (erro) {
        console.log('Erro ao carregar contador de pets:', erro);
    }
}

// CARREGAR CLIENTES NO SELECT DO CADASTRO DE PETS

async function listarClientesPet() {
    try {
        const resposta = await fetch('/api/clientes');
        const clientes = await resposta.json();

        const select = document.getElementById('dono_pet');

        if (!select) return;

        select.innerHTML = '<option value="">Selecione o cliente</option>';

        clientes.forEach(function(cliente) {
            select.innerHTML +=
                '<option value="' + cliente.id_cliente + '">' +
                cliente.nome +
                '</option>';
        });

    } catch (erro) {
        console.log(erro);
    }
}

// CADASTRAR E EDITAR PETS

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

    try {
        let resposta;

        if (id === '') {
            resposta = await fetch('/api/pets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pet)
            });
        } else {
            resposta = await fetch('/api/pets/' + id, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pet)
            });
        }

        if (!resposta.ok) {
            alert('Erro ao salvar pet.');
            return;
        }

        alert(id === '' ? 'Pet cadastrado com sucesso!' : 'Pet atualizado com sucesso!');

        limparFormularioPet();
        await listarPets();

    } catch (erro) {
        console.log(erro);
        alert('Erro ao conectar com o servidor.');
    }
});

// LISTAR E PESQUISAR PETS PELO TELEFONE DO DONO

async function listarPets() {
    try {
        const respostaPets = await fetch('/api/pets');
        const respostaClientes = await fetch('/api/clientes');

        if (!respostaPets.ok || !respostaClientes.ok) {
            alert('Erro ao carregar pets ou clientes.');
            return;
        }

        const pets = await respostaPets.json();
        const clientes = await respostaClientes.json();

        // Atualizar contador com o total de pets do banco
        await carregarTotalPets();

        const tabela = document.getElementById('tabela-pets');
        const pesquisa = document.getElementById('pesquisa-pets');

        tabela.innerHTML = '';

        const textoPesquisa = pesquisa ? pesquisa.value.trim() : '';
        const telefonePesquisa = textoPesquisa.replace(/\D/g, '');

        const petsFiltrados = pets.filter(function(pet) {
            const cliente = clientes.find(function(c) {
                return c.id_cliente == pet.id_cliente;
            });

            const telefoneCliente = cliente ?
                (cliente.telefone || '').replace(/\D/g, '') : '';

            if (textoPesquisa === '') {
                return true;
            }

            return telefoneCliente.includes(telefonePesquisa);
        });

        if (petsFiltrados.length === 0) {
            tabela.innerHTML =
                '<tr><td colspan="6">Nenhum pet encontrado para esse telefone.</td></tr>';
            return;
        }

        petsFiltrados.forEach(function(pet) {
            const cliente = clientes.find(function(c) {
                return c.id_cliente == pet.id_cliente;
            });

            const nomeDono = cliente ? cliente.nome : (pet.nome_cliente || '');
            const telefoneDono = cliente ? cliente.telefone : '';

            tabela.innerHTML +=
                '<tr>' +
                    '<td>' + (pet.nome || '') + '</td>' +
                    '<td>' + (pet.especie || '') + '</td>' +
                    '<td>' + (pet.raca || '') + '</td>' +
                    '<td>' + (pet.idade ?? '') + '</td>' +
                    '<td>' +
                        nomeDono +
                        (telefoneDono ? '<br><small>' + telefoneDono + '</small>' : '') +
                    '</td>' +
                    '<td>' +
                        '<button onclick="editarPet(' + pet.id_pet + ')">Editar</button> ' +
                        '<button onclick="excluirPet(' + pet.id_pet + ')">Excluir</button>' +
                    '</td>' +
                '</tr>';
        });

    } catch (erro) {
        console.log(erro);
        alert('Erro ao buscar pets.');
    }
}

// PESQUISA AUTOMÁTICA DE PET PELO TELEFONE DO DONO

document.getElementById('pesquisa-pets').addEventListener('input', function() {
    listarPets();
});

// EDITAR PET

async function editarPet(id) {
    try {
        const resposta = await fetch('/api/pets');
        const pets = await resposta.json();

        const pet = pets.find(function(p) {
            return p.id_pet == id;
        });

        if (!pet) {
            alert('Pet não encontrado!');
            return;
        }

        await listarClientesPet();

        document.getElementById('id_pet').value = pet.id_pet;
        document.getElementById('nome_pet').value = pet.nome;
        document.getElementById('especie').value = pet.especie;
        document.getElementById('raca').value = pet.raca;
        document.getElementById('idade').value = pet.idade;
        document.getElementById('dono_pet').value = pet.id_cliente;

    } catch (erro) {
        console.log(erro);
        alert('Erro ao carregar pet.');
    }
}

// EXCLUIR PET

async function excluirPet(id) {
    const confirmar = confirm('Deseja realmente excluir este pet?');

    if (!confirmar) return;

    try {
        const resposta = await fetch('/api/pets/' + id, {
            method: 'DELETE'
        });

        if (!resposta.ok) {
            alert('Erro ao excluir pet. Verifique se ele possui agendamentos.');
            return;
        }

        alert('Pet excluído com sucesso!');
        await listarPets();

    } catch (erro) {
        console.log(erro);
        alert('Erro ao conectar com o servidor.');
    }
}

// LIMPAR FORMULÁRIO DE PET

function limparFormularioPet() {
    document.getElementById('form-pet').reset();
    document.getElementById('id_pet').value = '';
}

// ==================== SERVIÇOS ====================

// CADASTRAR E EDITAR SERVIÇOS

document.getElementById('form-servico').addEventListener('submit', async function(event) {
    event.preventDefault();

    const id = document.getElementById('id_servico').value;

    const servico = {
        nome: document.getElementById('nome_servico').value,
        valor: document.getElementById('valor_servico').value,
        descricao: document.getElementById('descricao_servico').value
    };

    try {
        let resposta;

        if (id === '') {
            resposta = await fetch('/api/servicos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(servico)
            });
        } else {
            resposta = await fetch('/api/servicos/' + id, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(servico)
            });
        }

        if (!resposta.ok) {
            alert('Erro ao salvar serviço.');
            return;
        }

        alert(id === '' ? 'Serviço cadastrado com sucesso!' : 'Serviço atualizado com sucesso!');

        limparFormularioServico();
        await listarServicos();

    } catch (erro) {
        console.log(erro);
        alert('Erro ao conectar com o servidor.');
    }
});

// LISTAR SERVIÇOS

async function listarServicos() {
    try {
        const resposta = await fetch('/api/servicos');

        if (!resposta.ok) {
            alert('Erro ao carregar serviços.');
            return;
        }

        const servicos = await resposta.json();
        const tabela = document.getElementById('tabela-servicos');

        tabela.innerHTML = '';

        servicos.forEach(function(servico) {
            tabela.innerHTML +=
                '<tr>' +
                    '<td>' + servico.nome + '</td>' +
                    '<td>R$ ' + Number(servico.valor).toFixed(2).replace('.', ',') + '</td>' +
                    '<td>' + (servico.descricao || '') + '</td>' +
                    '<td>' +
                        '<button onclick="editarServico(' + servico.id_servico + ')">Editar</button> ' +
                        '<button onclick="excluirServico(' + servico.id_servico + ')">Excluir</button>' +
                    '</td>' +
                '</tr>';
        });

    } catch (erro) {
        console.log(erro);
        alert('Erro ao buscar serviços.');
    }
}

// EDITAR SERVIÇO

async function editarServico(id) {
    try {
        const resposta = await fetch('/api/servicos');
        const servicos = await resposta.json();

        const servico = servicos.find(function(s) {
            return s.id_servico == id;
        });

        if (!servico) {
            alert('Serviço não encontrado!');
            return;
        }

        document.getElementById('id_servico').value = servico.id_servico;
        document.getElementById('nome_servico').value = servico.nome;
        document.getElementById('valor_servico').value = servico.valor;
        document.getElementById('descricao_servico').value = servico.descricao;

    } catch (erro) {
        console.log(erro);
        alert('Erro ao carregar serviço.');
    }
}

// EXCLUIR SERVIÇO

async function excluirServico(id) {
    const confirmar = confirm('Deseja realmente excluir este serviço?');

    if (!confirmar) return;

    try {
        const resposta = await fetch('/api/servicos/' + id, {
            method: 'DELETE'
        });

        if (!resposta.ok) {
            alert('Erro ao excluir serviço. Verifique se ele possui agendamentos.');
            return;
        }

        alert('Serviço excluído com sucesso!');
        await listarServicos();

    } catch (erro) {
        console.log(erro);
        alert('Erro ao conectar com o servidor.');
    }
}

// LIMPAR FORMULÁRIO DE SERVIÇO

function limparFormularioServico() {
    document.getElementById('form-servico').reset();
    document.getElementById('id_servico').value = '';
}

// ==================== AGENDAMENTOS ====================

// CARREGAR CLIENTES NO SELECT

async function listarClientesAgendamento() {
    try {
        const resposta = await fetch('/api/clientes');
        const clientes = await resposta.json();

        const select = document.getElementById('cliente_agendamento');
        if (!select) return;

        select.innerHTML = '<option value="">Selecione o cliente</option>';

        clientes.forEach(function(cliente) {
            select.innerHTML +=
                '<option value="' + cliente.id_cliente + '">' +
                cliente.nome +
                '</option>';
        });

    } catch (erro) {
        console.log(erro);
    }
}

// CARREGAR PETS NO SELECT

async function listarPetsAgendamento() {
    try {
        const resposta = await fetch('/api/pets');
        const pets = await resposta.json();

        const select = document.getElementById('pet_agendamento');
        if (!select) return;

        select.innerHTML = '<option value="">Selecione primeiro o cliente</option>';

        pets.forEach(function(pet) {
            select.innerHTML +=
                '<option value="' + pet.id_pet + '" data-cliente="' + pet.id_cliente + '">' +
                pet.nome +
                '</option>';
        });

    } catch (erro) {
        console.log(erro);
    }
}

// CARREGAR SERVIÇOS NO SELECT

async function listarServicosAgendamento() {
    try {
        const resposta = await fetch('/api/servicos');
        const servicos = await resposta.json();

        const select = document.getElementById('servico_agendamento');
        if (!select) return;

        select.innerHTML = '<option value="">Selecione o serviço</option>';

        servicos.forEach(function(servico) {
            select.innerHTML +=
                '<option value="' + servico.id_servico + '">' +
                servico.nome + ' - R$ ' +
                Number(servico.valor).toFixed(2).replace('.', ',') +
                '</option>';
        });

    } catch (erro) {
        console.log(erro);
        alert('Erro ao carregar serviços.');
    }
}

// CARREGAR SOMENTE PETS DO CLIENTE SELECIONADO

async function carregarPetsDoCliente(idCliente) {
    const selectPet = document.getElementById('pet_agendamento');

    if (!selectPet) return;

    if (!idCliente) {
        selectPet.innerHTML =
            '<option value="">Selecione primeiro o cliente</option>';
        return;
    }

    try {
        const resposta = await fetch('/api/pets');
        const pets = await resposta.json();

        selectPet.innerHTML = '<option value="">Selecione o pet</option>';

        const petsDoCliente = pets.filter(function(pet) {
            return pet.id_cliente == idCliente;
        });

        petsDoCliente.forEach(function(pet) {
            selectPet.innerHTML +=
                '<option value="' + pet.id_pet + '">' +
                pet.nome +
                '</option>';
        });

        if (petsDoCliente.length === 0) {
            selectPet.innerHTML =
                '<option value="">Este cliente não possui pets cadastrados</option>';
        }

    } catch (erro) {
        console.log(erro);
        alert('Erro ao carregar pets do cliente.');
    }
}

// EVENTO PARA SELECIONAR CLIENTE E CARREGAR SEUS PETS

document.getElementById('cliente_agendamento').addEventListener('change', async function() {
    await carregarPetsDoCliente(this.value);
});

// CADASTRAR OU EDITAR AGENDAMENTO

document.getElementById('form-agendamento').addEventListener('submit', async function(event) {
    event.preventDefault();

    const id = document.getElementById('id_agendamento').value;
    const data = document.getElementById('data_agendamento').value;
    const hora = document.getElementById('hora_agendamento').value;

    const agendamento = {
        id_pet: document.getElementById('pet_agendamento').value,
        id_servico: document.getElementById('servico_agendamento').value,
        data_agendamento: data + ' ' + hora + ':00',
        status: document.getElementById('status_agendamento').value
    };

    try {
        let resposta;

        if (id === '') {
            resposta = await fetch('/api/agendamentos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(agendamento)
            });
        } else {
            resposta = await fetch('/api/agendamentos/' + id, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(agendamento)
            });
        }

        if (!resposta.ok) {
            alert('Erro ao salvar agendamento.');
            return;
        }

        alert(id === '' ?
            'Agendamento cadastrado com sucesso!' :
            'Agendamento atualizado com sucesso!');

        limparFormularioAgendamento();
        await listarAgendamentos();

    } catch (erro) {
        console.log(erro);
        alert('Erro ao conectar com o servidor.');
    }
});

// FORMATAR STATUS PARA CRIAR CLASSES CSS

function classeStatus(status) {
    const classes = {
        'Agendado': 'status-agendado',
        'Em andamento': 'status-em-andamento',
        'Concluído': 'status-concluido',
        'Cancelado': 'status-cancelado'
    };

    return classes[status] || 'status-padrao';
}

// LISTAR, FILTRAR E ORGANIZAR AGENDAMENTOS

async function listarAgendamentos() {
    try {
        const resposta = await fetch('/api/agendamentos');

        if (!resposta.ok) {
            alert('Erro ao carregar agendamentos.');
            return;
        }

        const agendamentos = await resposta.json();

        const tabela = document.getElementById('tabela-agendamentos');
        const filtroData = document.getElementById('filtro-data-agendamento');
        const filtroStatus = document.getElementById('filtro-status-agendamento');

        if (!tabela) return;

        tabela.innerHTML = '';

        const dataSelecionada = filtroData ? filtroData.value : '';
        const statusSelecionado = filtroStatus ? filtroStatus.value : '';

        const agendamentosFiltrados = agendamentos.filter(function(agendamento) {
            const dataHora = String(agendamento.data_agendamento);
            const dataAgendamento = dataHora.substring(0, 10);

            const correspondeData =
                dataSelecionada === '' || dataAgendamento === dataSelecionada;

            const correspondeStatus =
                statusSelecionado === '' ||
                agendamento.status === statusSelecionado;

            return correspondeData && correspondeStatus;
        });

        agendamentosFiltrados.sort(function(a, b) {
            return String(a.data_agendamento).localeCompare(
                String(b.data_agendamento)
            );
        });

        if (agendamentosFiltrados.length === 0) {
            tabela.innerHTML =
                '<tr><td colspan="7">Nenhum agendamento encontrado para os filtros selecionados.</td></tr>';
            return;
        }

        agendamentosFiltrados.forEach(function(agendamento) {
            const dataHora = String(agendamento.data_agendamento);
            const data = dataHora.substring(0, 10);
            const hora = dataHora.substring(11, 16);
            const dataFormatada = data.split('-').reverse().join('/');

            const status = agendamento.status || 'Agendado';
            const classe = classeStatus(status);

            tabela.innerHTML +=
                '<tr>' +
                    '<td>' + (agendamento.nome_cliente || '') + '</td>' +
                    '<td>' + (agendamento.nome_pet || '') + '</td>' +
                    '<td>' + (agendamento.nome_servico || '') + '</td>' +
                    '<td>' + dataFormatada + '</td>' +
                    '<td>' + hora + '</td>' +
                    '<td><span class="status-agendamento ' + classe + '">' +
                        status +
                    '</span></td>' +
                    '<td>' +
                        '<button onclick="editarAgendamento(' + agendamento.id_agendamento + ')">Editar</button> ' +
                        '<button onclick="excluirAgendamento(' + agendamento.id_agendamento + ')">Excluir</button>' +
                    '</td>' +
                '</tr>';
        });

    } catch (erro) {
        console.log(erro);
        alert('Erro ao buscar agendamentos.');
    }
}

// FILTRO AUTOMÁTICO POR DATA

document.getElementById('filtro-data-agendamento').addEventListener('change', function() {
    listarAgendamentos();
});

// FILTRO AUTOMÁTICO POR STATUS

document.getElementById('filtro-status-agendamento').addEventListener('change', function() {
    listarAgendamentos();
});

// LIMPAR FILTROS

document.getElementById('limpar-filtros-agendamento').addEventListener('click', function() {
    document.getElementById('filtro-data-agendamento').value = '';
    document.getElementById('filtro-status-agendamento').value = '';

    listarAgendamentos();
});

// EDITAR AGENDAMENTO

async function editarAgendamento(id) {
    try {
        const resposta = await fetch('/api/agendamentos');
        const agendamentos = await resposta.json();

        const agendamento = agendamentos.find(function(a) {
            return a.id_agendamento == id;
        });

        if (!agendamento) {
            alert('Agendamento não encontrado!');
            return;
        }

        await listarClientesAgendamento();
        await listarServicosAgendamento();

        document.getElementById('id_agendamento').value =
            agendamento.id_agendamento;

        const respostaPets = await fetch('/api/pets');
        const pets = await respostaPets.json();

        const petSelecionado = pets.find(function(p) {
            return p.id_pet == agendamento.id_pet;
        });

        if (petSelecionado) {
            const selectCliente = document.getElementById('cliente_agendamento');

            selectCliente.value = petSelecionado.id_cliente;

            await carregarPetsDoCliente(petSelecionado.id_cliente);

            document.getElementById('pet_agendamento').value =
                agendamento.id_pet;
        }

        document.getElementById('servico_agendamento').value =
            agendamento.id_servico;

        const dataHora = String(agendamento.data_agendamento);

        document.getElementById('data_agendamento').value =
            dataHora.substring(0, 10);

        document.getElementById('hora_agendamento').value =
            dataHora.substring(11, 16);

        document.getElementById('status_agendamento').value =
            agendamento.status || 'Agendado';

    } catch (erro) {
        console.log(erro);
        alert('Erro ao carregar agendamento.');
    }
}

// EXCLUIR AGENDAMENTO

async function excluirAgendamento(id) {
    const confirmar = confirm('Deseja realmente excluir este agendamento?');

    if (!confirmar) return;

    try {
        const resposta = await fetch('/api/agendamentos/' + id, {
            method: 'DELETE'
        });

        if (!resposta.ok) {
            alert('Erro ao excluir agendamento.');
            return;
        }

        alert('Agendamento excluído com sucesso!');
        await listarAgendamentos();

    } catch (erro) {
        console.log(erro);
        alert('Erro ao conectar com o servidor.');
    }
}

// LIMPAR FORMULÁRIO DE AGENDAMENTO

function limparFormularioAgendamento() {
    document.getElementById('form-agendamento').reset();
    document.getElementById('id_agendamento').value = '';

    listarPetsAgendamento();
}