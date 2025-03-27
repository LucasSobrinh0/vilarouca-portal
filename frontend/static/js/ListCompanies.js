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
  
      const response = await fetch("http://127.0.0.1:8000/api/users/companies/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        throw new Error("Erro ao buscar usuários.");
      }
  
      const companies = await response.json();
  
      const tbody = document.getElementById("companies-list");
      tbody.innerHTML = "";
  
      companies.forEach((company) => {
        const tr = document.createElement("tr");
      
        tr.innerHTML = `
          <td>${company.id}</td>
          <td>${company.name}</td>
          <td>${company.cnpj}</td>
          <td>
            <button class="btn btn-sm btn-primary" onclick="editCompany(${company.id})">
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
  