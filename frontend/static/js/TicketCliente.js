/**
 * TicketCliente.js
 * Script responsável pela criação de Tickets (lado do cliente).
 * Utiliza JavaScript puro + Bootstrap + Fetch API.
 */

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
      
      const ticketForm = document.getElementById("ticketForm");
      const mensagem = document.getElementById("mensagem");

      ticketForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        mensagem.textContent = "";
        mensagem.classList.remove("text-danger", "text-success");

        const title = document.getElementById("title").value.trim();
        const description = document.getElementById("description").value.trim();

        if (!title) {
          exibirMensagem("O título do ticket é obrigatório.", true);
          return;
        }

        if (!description) {
          exibirMensagem("A descrição do ticket é obrigatória.", true);
          return;
        }

        try {
          const response = await fetch("http://127.0.0.1:8000/api/tickets/create/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ title, description })
          });
          const data = await response.json();
          
          if (!response.ok) {
            exibirMensagem(data.detail || "Erro ao criar o ticket.", true);
            return;
          }
          
          exibirMensagem("Ticket criado com sucesso.", false);
          ticketForm.reset();
        } catch (error) {
          console.error("Erro ao criar o ticket:", error);
          exibirMensagem("Erro ao criar o ticket. Por favor, tente novamente.", true);
        }
      });
  
      function exibirMensagem(texto, isErro) {
        mensagem.textContent = texto;
        mensagem.classList.toggle("text-danger", isErro);
        mensagem.classList.toggle("text-success", !isErro);
      }
    } catch (error) {
      console.error("Erro ao inicializar o script:", error);
    }
})();
