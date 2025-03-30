const form = document.getElementById("loginForm");
const errorMessage = document.getElementById("error-message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const username = formData.get("username");
  const password = formData.get("password");

  try {
    const response = await fetch("http://127.0.0.1:8000/api/users/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    console.log("Resposta da API:", response);


    if (!response.ok) {
      throw new Error("Usuário ou senha inválidos.");
    }

    const data = await response.json();
    console.log("Resposta da API:", data);

    // Armazena o token em cookie com segurança
    document.cookie = `access=${data.access}; path=/; secure; samesite=strict`;

    // Verifica a role e redireciona
    if (data.role === "administrator") {
      window.location.href = "../templates/admin/dashboard_admin.html"; // substitua pelo seu path
    } else if (data.role === "atendente") {
      window.location.href = "../templates/atendente/dashboard_atendente.html";
    } else if (data.role === "cliente") {
      window.location.href = "../templates/clientes/dashboard.html";
    } else {
      throw new Error("Tipo de usuário não reconhecido.");
    }

  } catch (err) {
    errorMessage.style.display = "block";
    errorMessage.textContent = err.message;
  }
});