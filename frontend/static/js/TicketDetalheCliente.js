let ticketId = null;

(async () => {
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  const token = getCookie("access");
  if (!token) {
    console.error("Token não encontrado.");
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  ticketId = urlParams.get("id");

  if (!ticketId) {
    document.getElementById("detalhesTicket").innerHTML = "ID do ticket não fornecido.";
    return;
  }

  // Buscar detalhes do ticket
  const resTicket = await fetch(`http://127.0.0.1:8000/api/tickets/detail/${ticketId}/`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });

  const ticket = await resTicket.json();

  document.getElementById("detalhesTicket").innerHTML = `
    <p><strong>Título:</strong> ${ticket.title}</p>
    <p><strong>Descrição:</strong> ${ticket.description || '---'}</p>
    <p><strong>Status:</strong> ${ticket.status}</p>
    <p><strong>Data de Criação:</strong> ${new Date(ticket.created_at).toLocaleString()}</p>
    <p><strong>Última Atualização:</strong> ${new Date(ticket.updated_at).toLocaleString()}</p>
    <p><strong>Atendente:</strong> ${ticket.atendente ? ticket.atendente.username : 'Aguardando atribuição'}</p>
  `;

  // Se o ticket estiver fechado ou sem solução, não permitir envio de mensagens
  if (ticket.status === "fechado" || ticket.status === "sem_solucao") {
    const respostaForm = document.getElementById("respostaForm");
    respostaForm.style.display = "none";

    const aviso = document.createElement("p");
    aviso.classList.add("text-warning", "mt-3");
    aviso.innerText = "Este ticket está fechado. Você não pode mais enviar mensagens.";
    document.querySelector(".container").appendChild(aviso);
  }

  // Buscar mensagens
  const resMensagens = await fetch(`http://127.0.0.1:8000/api/tickets/mensagem/list/`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });

  const mensagens = await resMensagens.json();
  const ul = document.getElementById("mensagensTicket");

  mensagens
    .filter(msg => msg.ticket === parseInt(ticketId))
    .forEach(msg => {
      const li = document.createElement("li");
      li.classList.add("list-group-item", "bg-dark", "text-white", "border-light");
      li.innerHTML = `
        <p><strong>${msg.remetente ? msg.remetente.username : 'Remetente desconhecido'}:</strong> ${msg.mensagem}</p>
        <small class="text-muted">Enviado em: ${new Date(msg.created_at).toLocaleString()}</small>
      `;
      ul.appendChild(li);
    });

})();

// Envio de resposta
const respostaForm = document.getElementById("respostaForm");
const mensagemFeedback = document.getElementById("mensagemFeedback");

respostaForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  mensagemFeedback.textContent = "";

  const mensagem = document.getElementById("mensagemResposta").value.trim();
  if (!mensagem) {
    mensagemFeedback.textContent = "A mensagem não pode estar vazia.";
    mensagemFeedback.classList.add("text-danger");
    return;
  }

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  const token = getCookie("access");

  try {
    const res = await fetch("http://127.0.0.1:8000/api/tickets/mensagem/create/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        mensagem: mensagem,
        ticket: ticketId
      })
    });

    const data = await res.json();

    if (!res.ok) {
      mensagemFeedback.textContent = data.detail || "Erro ao enviar a mensagem.";
      mensagemFeedback.classList.add("text-danger");
      return;
    }

    mensagemFeedback.textContent = "Mensagem enviada com sucesso.";
    mensagemFeedback.classList.remove("text-danger");
    mensagemFeedback.classList.add("text-success");
    document.getElementById("mensagemResposta").value = "";

    const li = document.createElement("li");
    li.classList.add("list-group-item", "bg-dark", "text-white", "border-light");
    li.innerHTML = `
      <p><strong>Você:</strong> ${mensagem}</p>
      <small class="text-muted">Enviado agora</small>
    `;
    document.getElementById("mensagensTicket").appendChild(li);

  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    mensagemFeedback.textContent = "Erro ao enviar mensagem.";
    mensagemFeedback.classList.add("text-danger");
  }
});
