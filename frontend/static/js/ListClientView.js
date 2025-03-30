(async () => {
    try {
      const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
      };

      const token = getCookie("access");
      if (!token) {
        console.error("Usuário não autenticado");
        return;
      }

      const container = document.getElementById("ticketsContainer");
      container.innerHTML = "";

      const response = await fetch("http://127.0.0.1:8000/api/tickets/cliente/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.error("Erro ao buscar tickets");
        return;
      }

      const data = await response.json();

      if (data.length === 0) {
        container.innerHTML = "<p class='text-white'>Nenhum ticket encontrado.</p>";
        return;
      }

      data.forEach(ticket => {
        const createdDate = ticket.created_at ? new Date(ticket.created_at).toLocaleString() : '---';
        const card = document.createElement("div");
        card.className = "ticket-card";
        card.innerHTML = `
          <h5>${ticket.title}</h5>
          <p><strong>Status:</strong> ${ticket.status}</p>
          <p><strong>Data de Criação:</strong> ${createdDate}</p>
          <p><strong>Atendente:</strong> ${ticket.atendente ? ticket.atendente.username : 'Aguardando atribuição'}</p>
          <button class="btn btn-sm btn-outline-light mt-2" onclick="verDetalhes(${ticket.id})">
            Detalhar
          </button>
        `;
        container.appendChild(card);
      });
    } catch (error) {
      console.error("Erro ao buscar tickets:", error);
    }
  })();

  function verDetalhes(ticketId) {
    window.location.href = `ticket_detalhe.html?id=${ticketId}`;
  }