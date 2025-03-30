(async () => {
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  const token = getCookie("access");
  if (!token) return console.error("Token não encontrado");

  try {
    const res = await fetch("http://127.0.0.1:8000/api/scheduling/attendant/list/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    const container = document.getElementById("atendimentos-container");
    container.innerHTML = "";

    if (!Array.isArray(data)) {
      container.innerHTML = "<p class='text-danger'>Erro ao carregar agendamentos. Verifique sua permissão de atendente.</p>";
      return;
    }

    const pendentes = data.filter(ag => ag.status === "pending");

    if (!pendentes.length) {
      container.innerHTML = "<p class='text-white'>Nenhum agendamento pendente no momento.</p>";
      return;
    }

    pendentes.forEach(agendamento => {
      const card = document.createElement("div");
      card.className = "card bg-dark text-white border-light shadow mb-4";

      card.innerHTML = `
        <div class="card-body">
          <h5 class="card-title"><i class="bi bi-calendar-event"></i> ${agendamento.date.split("-").reverse().join("/")} - ${agendamento.time.slice(0, 5)}</h5>
          <p class="card-text"><strong>Cliente:</strong> ${agendamento.client?.username || "Desconhecido"}</p>
          <p class="card-text"><strong>Observação:</strong> ${agendamento.observation || "Nenhuma"}</p>
          <div class="d-flex gap-2 mt-3">
            <button class="btn btn-success btn-sm" onclick="confirmarAgendamento(${agendamento.id})">
              <i class="bi bi-check-circle"></i> Confirmar
            </button>
            <button class="btn btn-outline-light btn-sm" onclick="editarAgendamento(${agendamento.id}, '${agendamento.date}', '${agendamento.time}', \`${agendamento.observation || ""}\`)">
              <i class="bi bi-pencil-square"></i> Editar
            </button>
            <button class="btn btn-danger btn-sm" onclick="cancelarAgendamento(${agendamento.id})">
              <i class="bi bi-x-circle"></i> Cancelar
            </button>
          </div>
        </div>
      `;

      container.appendChild(card);
    });
  } catch (err) {
    console.error("Erro ao buscar agendamentos:", err);
  }
})();

window.confirmarAgendamento = async (id) => {
  const token = document.cookie.split("; ").find(row => row.startsWith("access="))?.split("=")[1];

  const res = await fetch(`http://127.0.0.1:8000/api/scheduling/attendant/confirm/${id}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status: "confirmed" })
  });

  if (res.ok) {
    alert("Agendamento confirmado!");
    window.location.reload();
  } else {
    const erro = await res.json();
    alert("Erro: " + (erro.detail || "Erro ao confirmar agendamento."));
  }
};

window.editarAgendamento = (id, date, time, observation) => {
  document.getElementById("edit-id-att").value = id;
  document.getElementById("edit-date-att").value = date;
  document.getElementById("edit-time-att").value = time;
  document.getElementById("edit-observation-att").value = observation;
  new bootstrap.Modal(document.getElementById("editarModalAtendente")).show();
};

document.getElementById("form-editar-atendente").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("edit-id-att").value;
  const date = document.getElementById("edit-date-att").value;
  const time = document.getElementById("edit-time-att").value;
  const observation = document.getElementById("edit-observation-att").value;
  const feedback = document.getElementById("feedback-att");

  const token = document.cookie.split("; ").find(row => row.startsWith("access="))?.split("=")[1];

  try {
    const res = await fetch(`http://127.0.0.1:8000/api/scheduling/attendant/update/${id}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ date, time, observation })
    });

    if (!res.ok) {
      const data = await res.json();
      feedback.innerText = data.detail || "Erro ao atualizar.";
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

let agendamentoIdParaCancelar = null;

window.cancelarAgendamento = (id) => {
  agendamentoIdParaCancelar = id;
  const modal = new bootstrap.Modal(document.getElementById("modalCancelarAgendamento"));
  modal.show();
};

window.confirmarCancelamento = async () => {
  const token = document.cookie.split("; ").find(row => row.startsWith("access="))?.split("=")[1];

  try {
    const res = await fetch(`http://127.0.0.1:8000/api/scheduling/attendant/cancel/${agendamentoIdParaCancelar}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: "cancelled" })
    });

    if (res.ok) {
      alert("Agendamento cancelado com sucesso!");
      window.location.reload();
    } else {
      const erro = await res.json();
      alert("Erro: " + (erro.detail || "Erro ao cancelar agendamento."));
    }
  } catch (err) {
    alert("Erro ao comunicar com o servidor.");
    console.error(err);
  }
};