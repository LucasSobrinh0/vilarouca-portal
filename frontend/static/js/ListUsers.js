
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

    const response_companies = await fetch("http://127.0.0.1:8000/api/users/companies/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response_companies.ok) {
      throw new Error("Erro ao buscar empresas.");
    }

    const companies = await response_companies.json();

    const response = await fetch("http://127.0.0.1:8000/api/users/list/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar usuários.");
    }

    const users = await response.json();

    const tbody = document.getElementById("users-list");
    tbody.innerHTML = "";

    users.forEach((user) => {
      const companyNames = user.companies.length > 0
        ? user.companies.map(companyId => {
            const company = companies.find(c => c.id === companyId);
            return company ? company.name : `ID ${companyId}`;
          }).join(", ")
        : "Nenhuma";

      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${user.id}</td>
        <td>${user.username}</td>
        <td>${user.role}</td>
        <td>${companyNames}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="editUser(${user.id})">
            <i class="bi bi-pencil-square"></i> Editar
          </button>
        </td>
      `;

      tbody.appendChild(tr);
    });

  } catch (error) {
    console.error("Erro ao listar usuários:", error);
  }
})();

function editUser(userId) {
  window.location.href = `edit_users.html?id=${userId}`;
}
