document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("ticketForm");
  const titulo = document.getElementById("titulo");
  const descricao = document.getElementById("descricao");
  const mensagem = document.getElementById("mensagem");

  const token = getCookie("access");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const res = await fetch("http://127.0.0.1:8000/api/tickets/create/", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        titulo: titulo.value,
        descricao: descricao.value,
      }),
    });

    if (res.ok) {
      mensagem.innerHTML = `<div class="alert alert-success">Ticket enviado com sucesso!</div>`;
      titulo.value = "";
      descricao.value = "";
    } else {
      mensagem.innerHTML = `<div class="alert alert-danger">Erro ao enviar ticket.</div>`;
    }
  });

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }
});
