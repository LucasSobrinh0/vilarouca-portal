(async () => {
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
    };
  
    const token = getCookie("access");
    if (!token) return console.error("Token não encontrado");
  
    const statusSelect = document.getElementById("filtroStatus");
    const container = document.getElementById("atendimentos-container");
  
    const carregarAgendamentos = async (statusInicial = true) => {
      const statusSelecionado = statusInicial ? "confirmed_cancelled" : statusSelect.value;
  
      try {
        const res = await fetch("http://127.0.0.1:8000/api/scheduling/attendant/all/", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
  
        const data = await res.json();
        container.innerHTML = "";
  
        let agendamentosFiltrados = [];
  
        if (statusSelecionado === "confirmed_cancelled") {
          agendamentosFiltrados = data.filter(ag => ag.status === "confirmed" || ag.status === "cancelled");
        } else if (statusSelecionado === "all") {
          agendamentosFiltrados = data;
        } else {
          agendamentosFiltrados = data.filter(ag => ag.status === statusSelecionado);
        }
  
        if (!agendamentosFiltrados.length) {
          container.innerHTML = "<p class='text-white'>Nenhum agendamento encontrado.</p>";
          return;
        }
  
        agendamentosFiltrados.forEach(agendamento => {
          const statusBadge = {
            pending: '<span class="badge bg-warning text-dark">Pendente</span>',
            confirmed: '<span class="badge bg-success">Confirmado</span>',
            cancelled: '<span class="badge bg-danger">Cancelado</span>',
          }[agendamento.status];
  
          const card = document.createElement("div");
          card.className = "card bg-dark text-white border-light shadow mb-4";
  
          card.innerHTML = `
            <div class="card-body">
              <h5 class="card-title"><i class="bi bi-calendar-event"></i> ${agendamento.date.split("-").reverse().join("/")} - ${agendamento.time.slice(0, 5)}</h5>
              <p class="card-text"><strong>Status:</strong> ${statusBadge}</p>
              <p class="card-text"><strong>Cliente:</strong> ${agendamento.client?.username || "Desconhecido"}</p>
              <p class="card-text"><strong>Observação:</strong> ${agendamento.observation || "Nenhuma"}</p>
            </div>
          `;
  
          container.appendChild(card);
        });
  
      } catch (err) {
        console.error("Erro ao buscar agendamentos:", err);
        container.innerHTML = "<p class='text-danger'>Erro ao carregar dados.</p>";
      }
    };
  
    statusSelect.addEventListener("change", () => carregarAgendamentos(false));
    carregarAgendamentos(); // Carrega apenas confirmados e cancelados ao iniciar
  })();
  