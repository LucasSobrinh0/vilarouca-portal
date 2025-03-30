let ticketId = null;

(async () => {
  // ------------------------------------------------------------
  // 1. Função para obter o cookie
  // ------------------------------------------------------------
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  // ------------------------------------------------------------
  // 2. Verifica se há token e ticketId
  // ------------------------------------------------------------
  const token = getCookie("access");
  if (!token) {
    console.error("Token não encontrado.");
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  ticketId = urlParams.get("id");

  if (!ticketId) {
    document.getElementById("detalhesTicket").innerHTML = "ID do ticket não fornecido.";
    return;
  }

  // ------------------------------------------------------------
  // 3. BUSCA DETALHES DO TICKET
  // ------------------------------------------------------------
  const resTicket = await fetch(`http://127.0.0.1:8000/api/tickets/detail/${ticketId}/`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });

  const ticket = await resTicket.json();

  // Exibe dados do ticket
  document.getElementById("detalhesTicket").innerHTML = `
    <p><strong>ID:</strong> ${ticket.id}</p>
    <p><strong>Título:</strong> ${ticket.title}</p>
    <p><strong>Descrição:</strong> ${ticket.description || '---'}</p>
    <p><strong>Status:</strong> ${ticket.status}</p>
    <p><strong>Cliente:</strong> ${
      ticket.cliente ? ticket.cliente.username : '---'
    }</p>
    <p><strong>Atendente:</strong> ${
      ticket.atendente ? ticket.atendente.username : 'Você'
    }</p>
    <p><strong>Criado em:</strong> ${
      ticket.created_at ? new Date(ticket.created_at).toLocaleString() : '---'
    }</p>
    <p><strong>Atualizado em:</strong> ${
      ticket.updated_at ? new Date(ticket.updated_at).toLocaleString() : '---'
    }</p>
  `;

  // ------------------------------------------------------------
  // 4. BUSCA MENSAGENS RELACIONADAS AO TICKET
  // ------------------------------------------------------------
  const resMensagens = await fetch(`http://127.0.0.1:8000/api/tickets/mensagem/list/`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });

  const mensagens = await resMensagens.json();
  const ul = document.getElementById("mensagensTicket");

  mensagens
    .filter(msg => msg.ticket === parseInt(ticketId))
    .forEach(msg => {
      const li = document.createElement("li");
      li.classList.add("list-group-item", "bg-dark", "text-white", "border-light");
      li.innerHTML = `
        <p>
          <strong>${
            msg.remetente ? msg.remetente.username : 'Desconhecido'
          }:</strong> ${msg.mensagem}
        </p>
        <small class="text-muted">Enviado em: ${new Date(msg.created_at).toLocaleString()}</small>
      `;
      ul.appendChild(li);
    });

})();

// ------------------------------------------------------------
// 5. FORMULÁRIO PARA RESPONDER O CLIENTE
// ------------------------------------------------------------
const respostaForm = document.getElementById("respostaForm");
const mensagemFeedback = document.getElementById("mensagemFeedback");

respostaForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  mensagemFeedback.textContent = "";

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  const mensagem = document.getElementById("mensagemResposta").value.trim();
  if (!mensagem) {
    mensagemFeedback.textContent = "A mensagem não pode estar vazia.";
    mensagemFeedback.classList.add("text-danger");
    return;
  }

  try {
    const res = await fetch("http://127.0.0.1:8000/api/tickets/mensagem/create/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getCookie("access")}`
      },
      body: JSON.stringify({
        mensagem: mensagem,
        ticket: ticketId
      })
    });

    const data = await res.json();

    if (!res.ok) {
      mensagemFeedback.textContent = data.detail || "Erro ao enviar a mensagem.";
      mensagemFeedback.classList.add("text-danger");
      return;
    }

    mensagemFeedback.textContent = "Mensagem enviada com sucesso.";
    mensagemFeedback.classList.remove("text-danger");
    mensagemFeedback.classList.add("text-success");
    document.getElementById("mensagemResposta").value = "";

    // Apende mensagem na listagem
    const ul = document.getElementById("mensagensTicket");
    const li = document.createElement("li");
    li.classList.add("list-group-item", "bg-dark", "text-white", "border-light");
    li.innerHTML = `
      <p><strong>Você:</strong> ${mensagem}</p>
      <small class="text-muted">Enviado em: ${new Date().toLocaleString()}</small>
    `;
    ul.appendChild(li);

  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    mensagemFeedback.textContent = "Erro ao enviar mensagem.";
    mensagemFeedback.classList.add("text-danger");
  }
});

// ------------------------------------------------------------
// 6. FORMULÁRIO PARA ATUALIZAR O STATUS
// ------------------------------------------------------------
const statusForm = document.getElementById("statusForm");
const statusSelect = document.getElementById("statusSelect");
const statusFeedback = document.getElementById("statusFeedback");

statusForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  const novoStatus = statusSelect.value;

  try {
    const res = await fetch(`http://127.0.0.1:8000/api/tickets/atendente/update/${ticketId}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getCookie("access")}`
      },
      body: JSON.stringify({ status: novoStatus })
    });

    const data = await res.json();

    if (!res.ok) {
      statusFeedback.textContent = data.detail || "Erro ao atualizar status.";
      statusFeedback.classList.add("text-danger");
      return;
    }

    statusFeedback.textContent = "Status atualizado com sucesso.";
    statusFeedback.classList.remove("text-danger");
    statusFeedback.classList.add("text-success");

    // Atualizar dados no painel
    const detalhesDiv = document.getElementById("detalhesTicket");
    // 4º parágrafo = Status
    detalhesDiv.querySelector("p:nth-child(4)").innerHTML = `<strong>Status:</strong> ${data.status}`;
    // 6º parágrafo = Atendente
    const atendenteNome = data.atendente ? data.atendente.username : 'Você';
    detalhesDiv.querySelector("p:nth-child(6)").innerHTML = `<strong>Atendente:</strong> ${atendenteNome}`;

  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    statusFeedback.textContent = "Erro ao atualizar status.";
    statusFeedback.classList.add("text-danger");
  }
});
