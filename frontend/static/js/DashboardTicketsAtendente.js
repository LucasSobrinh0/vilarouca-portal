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

  // função para exibir os tickets com base no filtro
  function renderizarTickets(filtro) {
    container.innerHTML = "";

    let filtrados = [];

    switch (filtro) {
      case "aberto":
        filtrados = data.filter((t) => t.status === "aberto");
        break;
      case "em_andamento":
        filtrados = data.filter((t) => t.status === "em_andamento");
        break;
      case "ativos":
        filtrados = data.filter(
          (t) => t.status === "aberto" || t.status === "em_andamento"
        );
        break;
      default:
        filtrados = data;
    }

    if (filtrados.length === 0) {
      container.innerHTML =
        "<p class='text-white'>Nenhum ticket correspondente.</p>";
      return;
    }

    filtrados.forEach((ticket) => {
      const card = document.createElement("div");
      card.classList.add("card", "mb-3", "bg-dark", "text-white", "shadow");

      card.innerHTML = `
        <div class="card-body">
          <h5 class="card-title">${ticket.title}</h5>
          <p class="card-text"><strong>Status:</strong> ${ticket.status}</p>
          <p class="card-text"><strong>Cliente:</strong> ${ticket.cliente.username}</p>
          <p class="card-text"><strong>Criado em:</strong> ${new Date(ticket.created_at).toLocaleString()}</p>
          <a href="detalhar_ticket_atendente.html?id=${ticket.id}" class="btn btn-primary btn-sm mt-2">
            Detalhar
          </a>
        </div>
      `;
      container.appendChild(card);
    });
  }

  // Render inicial com tickets ativos (abertos e em andamento)
  renderizarTickets("ativos");

  // Evento do filtro
  const filtroSelect = document.getElementById("filtroStatus");
  filtroSelect.addEventListener("change", () => {
    const filtroSelecionado = filtroSelect.value;
    renderizarTickets(filtroSelecionado);
  });
})();
