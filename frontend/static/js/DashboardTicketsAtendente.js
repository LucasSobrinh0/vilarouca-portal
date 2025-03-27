document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("atendimentos-container");
  const token = getCookie("access");

  try {
    const res = await fetch("http://127.0.0.1:8000/api/tickets/list/", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const tickets = await res.json();

    if (!tickets.length) {
      container.innerHTML = `<div class="alert alert-info">Nenhum ticket encontrado.</div>`;
      return;
    }

    tickets.forEach(ticket => {
      const card = document.createElement("div");
      card.className = "card mb-3 bg-dark text-white";

      card.innerHTML = `
        <div class="card-body">
          <h5 class="card-title">Título: ${ticket.titulo}</h5>
          <p><strong>Cliente:</strong> ${ticket.cliente}</p>
          <p><strong>Status:</strong> <span class="badge bg-${statusColor(ticket.status)}">${ticket.status}</span></p>
          <p><strong>Descrição:</strong> ${ticket.descricao}</p>

          <textarea id="resposta-${ticket.id}" class="form-control mb-2" placeholder="Responder ao cliente...">${ticket.resposta || ''}</textarea>

          <div class="d-flex gap-2">
            <button class="btn btn-primary" onclick="responderTicket(${ticket.id})"><i class="bi bi-send"></i> Responder</button>
            <select class="form-select w-auto" id="status-${ticket.id}">
              <option value="aberto" ${ticket.status === "aberto" ? "selected" : ""}>Aberto</option>
              <option value="em_andamento" ${ticket.status === "em_andamento" ? "selected" : ""}>Em Andamento</option>
              <option value="respondido" ${ticket.status === "respondido" ? "selected" : ""}>Respondido</option>
              <option value="fechado" ${ticket.status === "fechado" ? "selected" : ""}>Fechado</option>
            </select>
            <button class="btn btn-success" onclick="atualizarStatus(${ticket.id})">Atualizar Status</button>
          </div>
        </div>
      `;

      container.appendChild(card);
    });

  } catch (error) {
    container.innerHTML = `<div class="alert alert-danger">Erro ao buscar tickets.</div>`;
  }

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }

  function statusColor(status) {
    switch (status) {
      case "aberto": return "secondary";
      case "em_andamento": return "info";
      case "respondido": return "primary";
      case "fechado": return "success";
      default: return "light";
    }
  }
});

async function responderTicket(ticketId) {
  const token = getCookie("access");
  const resposta = document.getElementById(`resposta-${ticketId}`).value;

  const res = await fetch(`http://127.0.0.1:8000/api/tickets/responder/${ticketId}/`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ resposta }),
  });

  if (res.ok) {
    alert("Resposta enviada com sucesso!");
  } else {
    alert("Erro ao enviar resposta.");
  }
}

async function atualizarStatus(ticketId) {
  const token = getCookie("access");
  const status = document.getElementById(`status-${ticketId}`).value;

  const res = await fetch(`http://127.0.0.1:8000/api/tickets/responder/${ticketId}/`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (res.ok) {
    alert("Status atualizado!");
    location.reload();
  } else {
    alert("Erro ao atualizar status.");
  }
}
