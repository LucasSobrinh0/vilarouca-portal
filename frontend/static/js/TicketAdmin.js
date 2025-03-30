// File: TicketAdmin.js

let ticketsFiltrados = [];
let ticketParaRemover = null; // usado para remoção
let ticketListaCompleta = []; // guarda a lista global

(async () => {
  // 1) Função para extrair cookie
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  // 2) Pega token e referências ao DOM
  const token = getCookie("access");
  if (!token) {
    console.error("Token não encontrado.");
    return;
  }

  const container = document.getElementById("tickets-container");
  const filtroStatus = document.getElementById("filtroStatus");

  // 3) Busca todos os tickets
  try {
    const res = await fetch("http://127.0.0.1:8000/api/tickets/list/", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();

    if (!Array.isArray(data)) {
      container.innerHTML = "<p class='text-danger'>Erro ao carregar tickets.</p>";
      return;
    }

    ticketListaCompleta = data;
    renderizarTickets();

    // evento de filtro por status
    filtroStatus.addEventListener("change", renderizarTickets);

  } catch (err) {
    container.innerHTML = "<p class='text-danger'>Erro ao carregar tickets.</p>";
  }

  // 4) Renderiza os tickets no container
  function renderizarTickets() {
    container.innerHTML = "";
    const statusFiltro = filtroStatus.value;

    ticketsFiltrados = ticketListaCompleta.filter(t => {
      if (statusFiltro === "all") return true;
      return t.status === statusFiltro;
    });

    if (!ticketsFiltrados.length) {
      container.innerHTML = "<p class='text-white'>Nenhum ticket encontrado.</p>";
      return;
    }

    ticketsFiltrados.forEach(ticket => {
      // Monta badge de status
      const statusBadge = {
        aberto: `<span class="badge bg-warning text-dark">Aberto</span>`,
        em_andamento: `<span class="badge bg-info text-dark">Em Andamento</span>`,
        fechado: `<span class="badge bg-success">Fechado</span>`,
        sem_solucao: `<span class="badge bg-danger">Sem Solução</span>`
      }[ticket.status] || `<span class="badge bg-secondary">Desconhecido</span>`;

      // Card do ticket
      const card = document.createElement("div");
      card.className = "card bg-dark text-white border-light shadow mb-4";

      card.innerHTML = `
        <div class="card-body">
          <h5 class="card-title d-flex justify-content-between align-items-center">
            ${ticket.title}
            ${statusBadge}
          </h5>
          <p class="card-text">
            <strong>ID:</strong> ${ticket.id} <br/>
            <strong>Descrição:</strong> ${ticket.description || "Nenhuma"}<br/>
            <strong>Cliente:</strong> ${ticket.cliente.username} <br/>
            <strong>Atendente:</strong> ${ticket.atendente?.username || "Nenhum"} <br/>
            <strong>Criado em:</strong> ${new Date(ticket.created_at).toLocaleString()}
          </p>

          <div class="d-flex gap-2 mt-3">
            <!-- Botão de editar -->
            <button class="btn btn-outline-light btn-sm" onclick='abrirModalEditar(${JSON.stringify(ticket)})'>
              <i class="bi bi-pencil-square"></i> Editar
            </button>

            <!-- Botão de responder (enviar mensagem) -->
            <button class="btn btn-primary btn-sm" onclick='abrirModalResponder(${ticket.id})'>
              <i class="bi bi-chat-dots"></i> Responder
            </button>

            <!-- Botão de ver histórico de mensagens -->
            <button class="btn btn-warning btn-sm" onclick='abrirModalHistoricoMensagens(${ticket.id})'>
              <i class="bi bi-envelope"></i> Ver Mensagens
            </button>

            <!-- Botão de remover ticket -->
            <button class="btn btn-danger btn-sm" onclick='abrirModalRemover(${JSON.stringify(ticket)})'>
              <i class="bi bi-trash"></i> Remover
            </button>
          </div>
        </div>
      `;

      container.appendChild(card);
    });
  }
})();

// -------------------------------------------------------------------------
// 5) Editar Ticket
// -------------------------------------------------------------------------
window.abrirModalEditar = (ticket) => {
  document.getElementById("edit-ticket-id").value = ticket.id;
  document.getElementById("edit-description").value = ticket.description || "";
  document.getElementById("edit-status").value = ticket.status;

  new bootstrap.Modal(document.getElementById("modalEditarTicket")).show();
};

document.getElementById("form-editar-ticket").addEventListener("submit", async (e) => {
  e.preventDefault();
  const feedback = document.getElementById("feedback-edit");
  feedback.textContent = "";

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };
  const token = getCookie("access");

  const id = document.getElementById("edit-ticket-id").value;
  const description = document.getElementById("edit-description").value.trim();
  const status = document.getElementById("edit-status").value;

  try {
    const res = await fetch(`http://127.0.0.1:8000/api/tickets/update/${id}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ description, status })
    });

    const data = await res.json();
    if (!res.ok) {
      feedback.textContent = data.detail || "Erro ao atualizar ticket.";
      feedback.className = "text-danger";
      return;
    }

    // deu certo
    feedback.textContent = "Ticket atualizado com sucesso!";
    feedback.className = "text-success";

    setTimeout(() => location.reload(), 1000);
  } catch (err) {
    feedback.textContent = "Falha de conexão ou erro inesperado.";
    feedback.className = "text-danger";
  }
});

// -------------------------------------------------------------------------
// 6) Responder Ticket (criar mensagem)
// -------------------------------------------------------------------------
window.abrirModalResponder = (ticketId) => {
  document.getElementById("responder-ticket-id").value = ticketId;
  document.getElementById("responder-mensagem").value = "";
  new bootstrap.Modal(document.getElementById("modalResponderTicket")).show();
};

document.getElementById("form-responder-ticket").addEventListener("submit", async (e) => {
  e.preventDefault();
  const feedback = document.getElementById("feedback-resposta");
  feedback.textContent = "";

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };
  const token = getCookie("access");

  const ticketId = document.getElementById("responder-ticket-id").value;
  const mensagem = document.getElementById("responder-mensagem").value.trim();

  if (!mensagem) {
    feedback.textContent = "A mensagem não pode estar vazia.";
    feedback.className = "text-danger";
    return;
  }

  try {
    const res = await fetch("http://127.0.0.1:8000/api/tickets/mensagem/create/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ mensagem, ticket: ticketId })
    });

    const data = await res.json();
    if (!res.ok) {
      feedback.textContent = data.detail || "Erro ao enviar mensagem.";
      feedback.className = "text-danger";
      return;
    }

    feedback.textContent = "Resposta enviada com sucesso!";
    feedback.className = "text-success";
    setTimeout(() => location.reload(), 1000);
  } catch (err) {
    feedback.textContent = "Erro ao enviar mensagem.";
    feedback.className = "text-danger";
  }
});

// -------------------------------------------------------------------------
// 7) Remover Ticket
// -------------------------------------------------------------------------
window.abrirModalRemover = (ticket) => {
  ticketParaRemover = ticket;
  new bootstrap.Modal(document.getElementById("modalRemoverTicket")).show();
};

window.confirmarRemocao = async () => {
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };
  const token = getCookie("access");

  if (!ticketParaRemover) return;

  try {
    const res = await fetch(`http://127.0.0.1:8000/api/tickets/delete/${ticketParaRemover.id}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      alert("Erro ao remover ticket.");
      return;
    }

    alert("Ticket removido com sucesso!");
    location.reload();
  } catch (err) {
    alert("Falha na comunicação com servidor.");
  }
};

// -------------------------------------------------------------------------
// 8) Ver histórico de mensagens do ticket
// -------------------------------------------------------------------------
window.abrirModalHistoricoMensagens = async (ticketId) => {
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };
  const token = getCookie("access");

  const historicoContainer = document.getElementById("historico-mensagens-container");
  historicoContainer.innerHTML = "<p>Carregando mensagens...</p>";

  try {
    const res = await fetch("http://127.0.0.1:8000/api/tickets/mensagem/list/", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      historicoContainer.innerHTML = "<p class='text-danger'>Erro ao carregar mensagens.</p>";
      new bootstrap.Modal(document.getElementById("modalHistoricoMensagens")).show();
      return;
    }

    const mensagens = await res.json();
    const mensagensDoTicket = mensagens.filter(msg => msg.ticket === ticketId);

    if (!mensagensDoTicket.length) {
      historicoContainer.innerHTML = "<p class='text-white'>Nenhuma mensagem encontrada para este ticket.</p>";
      new bootstrap.Modal(document.getElementById("modalHistoricoMensagens")).show();
      return;
    }

    let html = "";
    mensagensDoTicket.forEach(msg => {
      const remetente = msg.remetente?.username || "Desconhecido";
      const dataCriada = new Date(msg.created_at).toLocaleString();
      html += `
        <div class="border p-2 mb-2">
          <p><strong>${remetente}:</strong> ${msg.mensagem}</p>
          <small class="text-muted">Enviada em: ${dataCriada}</small>
        </div>
      `;
    });

    historicoContainer.innerHTML = html;
    new bootstrap.Modal(document.getElementById("modalHistoricoMensagens")).show();

  } catch (err) {
    historicoContainer.innerHTML = "<p class='text-danger'>Falha ao buscar mensagens.</p>";
    new bootstrap.Modal(document.getElementById("modalHistoricoMensagens")).show();
  }
};
