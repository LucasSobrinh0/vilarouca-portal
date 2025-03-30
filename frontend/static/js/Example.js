/**
 * TicketCliente.js
 * Script responsável pela criação de Tickets (lado do cliente).
 * Utiliza JavaScript puro + Bootstrap + Fetch API.
 */

document.addEventListener('DOMContentLoaded', () => {
    const ticketForm = document.getElementById('ticketForm');
    const mensagemDiv = document.getElementById('mensagem');
  
    // Monta o formulário dinamicamente
    ticketForm.innerHTML = `
    `;
  
    // Listener de submit
    ticketForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      mensagemDiv.textContent = ""; 
      mensagemDiv.className = ""; // limpa classes anteriores
  
      const title = document.getElementById('title').value.trim();
      const description = document.getElementById('description').value.trim();
  
      if (!title) {
        exibirMensagem("O título do ticket é obrigatório.", true);
        return;
      }
  
      // Tenta buscar o token
      const token = localStorage.getItem('access') || sessionStorage.getItem('access');
      if (!token) {
        exibirMensagem("Você não está autenticado. Faça login novamente.", true);
        return;
      }
  
      try {
        const resposta = await fetch('/api/tickets/create/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ title, description })
        });
  
        if (!resposta.ok) {
          const errorData = await resposta.json();
          const msg = errorData.detail || JSON.stringify(errorData);
          throw new Error(msg || `Erro HTTP: ${resposta.status}`);
        }
  
        const data = await resposta.json();
        // Sucesso
        exibirMensagem(`Ticket criado com sucesso! ID #${data.id}`, false);
        
        // Limpa o formulário
        ticketForm.reset();
      } catch (error) {
        exibirMensagem(`Falha ao criar ticket: ${error.message}`, true);
      }
    });
  
    /**
     * Exibe mensagem de sucesso ou erro na div #mensagem
     * @param {string} texto
     * @param {boolean} isErro
     */
    function exibirMensagem(texto, isErro) {
      mensagemDiv.textContent = texto;
      mensagemDiv.classList.toggle('erro', isErro);
      mensagemDiv.classList.toggle('sucesso', !isErro);
    }
  });
  