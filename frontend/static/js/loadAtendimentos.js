async function carregarAtendimentos() {
    const token = getToken();
    const res = await fetch("http://127.0.0.1:8000/api/atendimentos/list/", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const atendimentos = await res.json();
  
    const container = document.getElementById("atendimentos-container");
    container.innerHTML = "";
  
    atendimentos.forEach(at => {
      const card = document.createElement("div");
      card.classList.add("card", "bg-dark", "text-white", "mb-3", "p-3");
      card.innerHTML = `
        <h5>Atendente: ${at.atendente}</h5>
        <p>Status: <strong>${at.status}</strong></p>
        <a href="chat.html?contact=${at.atendente}" class="btn btn-outline-light btn-sm">Abrir Chat</a>
      `;
      container.appendChild(card);
    });
  }
  