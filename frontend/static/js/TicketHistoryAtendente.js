(async () => {
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
    };
  
    const token = getCookie("access");
    if (!token) {
      console.error("Token não encontrado.");
      return;
    }
  
    const response = await fetch("http://127.0.0.1:8000/api/tickets/list/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
  
    if (!response.ok) {
      console.error("Erro ao buscar tickets");
      return;
    }
  
    const data = await response.json();
  
    const container = document.getElementById("atendimentos-container");
    const filtro = document.getElementById("filtroStatus");
  
    const renderizarTickets = (statusFiltro) => {
      container.innerHTML = "";
  
      const filtrados = data.filter((t) => {
        if (t.status !== "fechado" && t.status !== "sem_solucao") return false;
        if (statusFiltro === "todos") return true;
        return t.status === statusFiltro;
      });
  
      if (filtrados.length === 0) {
        container.innerHTML = "<p class='text-white'>Nenhum atendimento encontrado para este filtro.</p>";
        return;
      }
  
      filtrados.forEach((ticket) => {
        const card = document.createElement("div");
        card.classList.add("card", "mb-3", "bg-secondary", "text-white", "shadow");
  
        const badge =
          ticket.status === "fechado"
            ? `<span class="badge bg-success">Finalizado</span>`
            : `<span class="badge bg-danger">Sem Solução</span>`;
  
        card.innerHTML = `
          <div class="card-body">
            <h5 class="card-title">${ticket.title} ${badge}</h5>
            <p class="card-text"><strong>Cliente:</strong> ${ticket.cliente.username}</p>
            <p class="card-text"><strong>Criado em:</strong> ${new Date(ticket.created_at).toLocaleString()}</p>
            <a href="detalhar_ticket_atendente.html?id=${ticket.id}" class="btn btn-outline-light btn-sm mt-2">
              Ver detalhes
            </a>
          </div>
        `;
        container.appendChild(card);
      });
    };
  
    // Evento de filtro
    filtro.addEventListener("change", () => {
      renderizarTickets(filtro.value);
    });
  
    // Render inicial
    renderizarTickets("todos");
  })();
  