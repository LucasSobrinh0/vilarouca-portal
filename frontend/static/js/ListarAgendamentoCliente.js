(async () => {
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  const token = getCookie("access");
  if (!token) return console.error("Token não encontrado");

  try {
    const res = await fetch("http://127.0.0.1:8000/api/scheduling/client/list/", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    const container = document.getElementById("agendamentos-container");
    container.innerHTML = "";

    if (!data.length) {
      container.innerHTML = "<p class='text-center text-white'>Nenhum agendamento encontrado.</p>";
      return;
    }

    data.forEach(agendamento => {
      const statusBadge = {
        pending: '<span class="badge bg-warning text-dark">Pendente</span>',
        confirmed: '<span class="badge bg-success">Confirmado</span>',
        cancelled: '<span class="badge bg-danger">Cancelado</span>'
      }[agendamento.status] || '<span class="badge bg-secondary">Desconhecido</span>';

      const podeEditar = agendamento.status === "pending";
      const btnEditar = podeEditar
        ? `<button class="btn btn-sm btn-outline-light mt-3" onclick="abrirModalEdicao(${agendamento.id}, '${agendamento.date}', '${agendamento.time}', \`${agendamento.observation || ''}\`)">
             <i class="bi bi-pencil-square"></i> Editar
           </button>`
        : "";

      const card = document.createElement("div");
      card.className = "col-12 col-md-6 col-lg-4";

      card.innerHTML = `
        <div class="card bg-dark text-white border-light shadow h-100">
          <div class="card-body d-flex flex-column justify-content-between">
            <h5 class="card-title">
              <i class="bi bi-calendar-event"></i> ${agendamento.date.split("-").reverse().join("/")} - ${agendamento.time.slice(0, 5)}
            </h5>
            <p class="card-text mb-1"><strong>Status:</strong> ${statusBadge}</p>
            <p class="card-text mb-1"><strong>Observação:</strong> ${agendamento.observation || '---'}</p>
            ${btnEditar}
          </div>
        </div>
      `;

      container.appendChild(card);
    });

  } catch (err) {
    console.error("Erro ao buscar agendamentos:", err);
    const container = document.getElementById("agendamentos-container");
    container.innerHTML = "<p class='text-danger'>Erro ao carregar agendamentos.</p>";
  }
})();

// Função para abrir modal e preencher campos
window.abrirModalEdicao = (id, date, time, observation) => {
  document.getElementById("edit-id").value = id;
  document.getElementById("edit-date").value = date;
  document.getElementById("edit-time").value = time;
  document.getElementById("edit-observation").value = observation;
  new bootstrap.Modal(document.getElementById("editarAgendamentoModal")).show();
};

// Submit do formulário de edição
document.getElementById("form-editar-agendamento").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("edit-id").value;
  const date = document.getElementById("edit-date").value;
  const time = document.getElementById("edit-time").value;
  const observation = document.getElementById("edit-observation").value;
  const feedback = document.getElementById("edit-feedback");
  feedback.innerText = "";

  const token = document.cookie
    .split("; ")
    .find(row => row.startsWith("access="))
    ?.split("=")[1];

  try {
    const res = await fetch(`http://127.0.0.1:8000/api/scheduling/client/update/${id}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ date, time, observation })
    });

    const result = await res.json();
    if (!res.ok) {
      feedback.innerText = result.detail || "Erro ao atualizar.";
      feedback.className = "text-danger text-center";
      return;
    }

    feedback.innerText = "Agendamento atualizado com sucesso!";
    feedback.className = "text-success text-center";
    setTimeout(() => window.location.reload(), 1000);
  } catch (err) {
    feedback.innerText = "Erro ao comunicar com o servidor.";
    feedback.className = "text-danger text-center";
  }
});
