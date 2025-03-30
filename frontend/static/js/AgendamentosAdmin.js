// Variáveis globais
let agendamentosFiltrados = [];
let agendamentoCancelar = null;

(async () => {
  // Função utilitária para ler cookies
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  // Recuperar token
  const token = getCookie("access");
  if (!token) return console.error("Token não encontrado");

  // Elementos do DOM
  const container = document.getElementById("agendamentos-container");
  const filtroStatus = document.getElementById("filtroStatus");

  // Spinner de carregamento
  const spinner = document.createElement("div");
  spinner.className = "text-center my-5";
  spinner.innerHTML = `<div class="spinner-border text-light" role="status"><span class="visually-hidden">Carregando...</span></div>`;
  container.appendChild(spinner);

  // Buscar agendamentos via API
  try {
    const res = await fetch("http://127.0.0.1:8000/api/scheduling/admin/list/", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    spinner.remove();

    if (!Array.isArray(data)) {
      container.innerHTML = "<p class='text-danger'>Erro ao carregar agendamentos.</p>";
      return;
    }

    // Renderiza a listagem
    renderizarAgendamentos(data);

    // Reaplica o render a cada mudança de filtro
    filtroStatus.addEventListener("change", () => renderizarAgendamentos(data));

  } catch (err) {
    spinner.remove();
    container.innerHTML = "<p class='text-danger'>Erro ao carregar agendamentos.</p>";
  }

  // Função principal: filtra e exibe na tela
  function renderizarAgendamentos(lista) {
    container.innerHTML = "";
    const statusFiltro = filtroStatus.value;

    // Filtramos globalmente para usar em confirmarAdmin
    agendamentosFiltrados = lista.filter(ag => {
      return statusFiltro === "all" || ag.status === statusFiltro;
    });

    if (!agendamentosFiltrados.length) {
      container.innerHTML = "<p class='text-white'>Nenhum agendamento encontrado.</p>";
      return;
    }

    // Cria um card para cada agendamento
    agendamentosFiltrados.forEach(ag => {
      const statusBadge = {
        pending: `<span class="badge bg-warning text-dark"><i class="bi bi-hourglass-split"></i> Pendente</span>`,
        confirmed: `<span class="badge bg-success"><i class="bi bi-check-circle"></i> Confirmado</span>`,
        cancelled: `<span class="badge bg-danger"><i class="bi bi-x-circle"></i> Cancelado</span>`,
      }[ag.status];

      const card = document.createElement("div");
      card.className = "card bg-dark text-white border-light shadow mb-4";

      card.innerHTML = `
        <div class="card-body">
          <h5 class="card-title d-flex justify-content-between">
            ${ag.date.split("-").reverse().join("/")} - ${ag.time.slice(0, 5)}
            ${statusBadge}
          </h5>
          <p class="card-text"><strong>Cliente:</strong> ${ag.client}</p>
          <p class="card-text"><strong>Atendente:</strong> ${ag.atendente || "Sem atendente"}</p>
          <p class="card-text"><strong>Observação:</strong> ${ag.observation || "Nenhuma"}</p>
          <div class="d-flex gap-2 mt-3">
            <button class="btn btn-success btn-sm" onclick="confirmarAdmin(${ag.id})">
              <i class="bi bi-check-circle"></i> Confirmar
            </button>
            <button class="btn btn-outline-light btn-sm" 
                    onclick="editarAdmin(${ag.id}, '${ag.date}', '${ag.time}', \`${ag.observation || ""}\`)">
              <i class="bi bi-pencil-square"></i> Editar
            </button>
            <button class="btn btn-danger btn-sm" 
                    onclick='abrirModalCancelar(${JSON.stringify(ag)})'>
              <i class="bi bi-x-circle"></i> Cancelar
            </button>
          </div>
        </div>
      `;

      container.appendChild(card);
    });
  }
})();

// Confirmar agendamento
window.confirmarAdmin = async (id) => {
  const token = document.cookie.split("; ").find(row => row.startsWith("access="))?.split("=")[1];

  // Encontrar o agendamento a confirmar
  const agendamento = agendamentosFiltrados.find(ag => ag.id === id);
  if (!agendamento) {
    toast("Agendamento não encontrado", "danger");
    return;
  }

  // Enviar PUT com todos os campos obrigatórios
  const { date, time, observation } = agendamento;

  const res = await fetch(`http://127.0.0.1:8000/api/scheduling/admin/update/${id}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      date,
      time,
      observation: observation || "",
      status: "confirmed"
    })
  });

  const resposta = await res.json();
  console.log("Resposta da API:", resposta);

  if (res.ok) {
    toast("Agendamento confirmado!", "success");
    setTimeout(() => location.reload(), 1000);
  } else {
    toast("Erro: " + (resposta.detail || JSON.stringify(resposta)), "danger");
  }
};

// Abrir modal de edição
window.editarAdmin = (id, date, time, observation) => {
  document.getElementById("edit-id").value = id;
  document.getElementById("edit-date").value = date;
  document.getElementById("edit-time").value = time;
  document.getElementById("edit-observation").value = observation;
  new bootstrap.Modal(document.getElementById("modalEditar")).show();
};

// Submeter formulário de edição
document.getElementById("form-editar-agendamento").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("edit-id").value;
  const date = document.getElementById("edit-date").value;
  const time = document.getElementById("edit-time").value;
  const observation = document.getElementById("edit-observation").value;

  const token = document.cookie.split("; ").find(row => row.startsWith("access="))?.split("=")[1];

  // Enviar PUT
  const res = await fetch(`http://127.0.0.1:8000/api/scheduling/admin/update/${id}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ date, time, observation })
  });

  if (res.ok) {
    toast("Agendamento atualizado com sucesso!", "success");
    setTimeout(() => location.reload(), 1000);
  } else {
    toast("Erro ao atualizar agendamento", "danger");
  }
});

// Cancelar agendamento
window.abrirModalCancelar = (agendamento) => {
  // armazenar o agendamento inteiro numa variável global
  agendamentoCancelar = agendamento;
  new bootstrap.Modal(document.getElementById("modalCancelarAgendamento")).show();
};

window.confirmarCancelamento = async () => {
  const token = document.cookie.split("; ").find(row => row.startsWith("access="))?.split("=")[1];

  if (!agendamentoCancelar) {
    toast("Agendamento não encontrado para cancelamento", "danger");
    return;
  }

  // Pegar os campos do agendamento
  const { id, date, time, observation } = agendamentoCancelar;

  // Enviar PUT com os campos obrigatórios
  const res = await fetch(`http://127.0.0.1:8000/api/scheduling/admin/update/${id}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      date,
      time,
      observation: observation || "",
      status: "cancelled"
    })
  });

  const resposta = await res.json();
  console.log("Resposta da API:", resposta);

  if (res.ok) {
    toast("Agendamento cancelado com sucesso!", "success");
    setTimeout(() => location.reload(), 1000);
  } else {
    toast("Erro: " + (resposta.detail || JSON.stringify(resposta)), "danger");
  }
};

// Toast helper
function toast(message, type = "info") {
  const colors = {
    success: "bg-success text-white",
    danger: "bg-danger text-white",
    info: "bg-info text-dark"
  };

  const toast = document.createElement("div");
  toast.className = `toast align-items-center text-white ${colors[type] || "bg-secondary"} border-0 position-fixed top-0 end-0 m-3`;
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "assertive");
  toast.setAttribute("aria-atomic", "true");
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Fechar"></button>
    </div>
  `;

  document.body.appendChild(toast);
  const bsToast = new bootstrap.Toast(toast);
  bsToast.show();

  setTimeout(() => toast.remove(), 4000);
}
