document.getElementById("form-agendamento").addEventListener("submit", async (e) => {
    e.preventDefault();

    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
    };

    const token = getCookie("access");
    const data = document.getElementById("data").value;
    const time = document.getElementById("hora").value;
    const observation = document.getElementById("observacao").value;

    const feedback = document.getElementById("mensagem-feedback");
    feedback.innerText = "";

    try {
      const res = await fetch("http://127.0.0.1:8000/api/scheduling/client/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ date: data, time, observation }),
      });

      const result = await res.json();
      if (!res.ok) {
        feedback.innerText = result.detail || "Erro ao solicitar agendamento.";
        feedback.className = "text-danger";
        return;
      }

      feedback.innerText = "Agendamento solicitado com sucesso!";
      feedback.className = "text-success";

      document.getElementById("form-agendamento").reset();
    } catch (err) {
      feedback.innerText = "Erro ao se comunicar com o servidor.";
      feedback.className = "text-danger";
    }
  });

  