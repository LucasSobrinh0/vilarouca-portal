document.addEventListener("DOMContentLoaded", async () => {
    console.log("[EditUser.js] Carregado.");
  
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get("id");
    const form = document.getElementById("editUserForm");
    const successMessage = document.getElementById("success-message");
    const errorMessage = document.getElementById("error-message");
    const deleteBtn = document.getElementById("deleteBtn");
  
    // Listas de empresas
    const userCompaniesList = document.getElementById("user-companies-list");
    const availableCompaniesList = document.getElementById("available-companies-list");
  
    // Se não recebeu "id" na URL, erro
    if (!userId) {
      errorMessage.textContent = "ID de usuário não informado.";
      errorMessage.style.display = "block";
      return;
    }
  
    // Cookie / Token
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    };
    const token = getCookie("access");
    if (!token) {
      errorMessage.textContent = "Usuário não autenticado. Faça login.";
      errorMessage.style.display = "block";
      return;
    }
  
    // Arrays e sets
    let allCompanies = [];
    let userCompanies = new Set();
    let userData = null;
  
    try {
      // 1) Carregar todas as empresas
      console.log("[EditUser] Carregando lista de empresas...");
      const companyResponse = await fetch("http://127.0.0.1:8000/api/users/companies/", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!companyResponse.ok) throw new Error("Erro ao buscar lista de empresas.");
  
      allCompanies = await companyResponse.json();
      // Ordena se quiser
      allCompanies.sort((a, b) => a.name.localeCompare(b.name));
  
      // 2) Carregar lista de usuários
      console.log("[EditUser] Carregando lista de usuários...");
      const userResponse = await fetch("http://127.0.0.1:8000/api/users/list/", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!userResponse.ok) throw new Error("Erro ao buscar lista de usuários.");
  
      const users = await userResponse.json();
  
      // 3) Achar o user
      userData = users.find(u => u.id == userId);
      if (!userData) throw new Error("Usuário não encontrado.");
  
      console.log("Usuário encontrado:", userData);
  
      // 4) Preenche form
      form.username.value = userData.username;
      form.role.value = userData.role;
  
      // 5) Pega IDs das empresas do usuário
      userData.companies.forEach(cId => userCompanies.add(cId));
  
      // 6) Renderiza as listas
      renderLists();
  
      // =============== FUNÇÃO renderLists ===============
      function renderLists() {
        userCompaniesList.innerHTML = "";
        availableCompaniesList.innerHTML = "";
  
        // Lista: empresas do usuário
        userCompanies.forEach(cId => {
          const companyObj = allCompanies.find(c => c.id == cId);
          if (!companyObj) return;
  
          const li = document.createElement("li");
          li.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
          li.textContent = companyObj.name;
  
          // Botão de remover
          const removeBtn = document.createElement("button");
          removeBtn.classList.add("btn", "btn-sm", "btn-outline-danger");
          removeBtn.innerHTML = `<i class="bi bi-dash"></i>`;
          removeBtn.addEventListener("click", () => {
            userCompanies.delete(cId);
            renderLists();
          });
  
          li.appendChild(removeBtn);
          userCompaniesList.appendChild(li);
        });
  
        // Lista: empresas disponíveis
        allCompanies.forEach(company => {
          if (userCompanies.has(company.id)) return;
  
          const li = document.createElement("li");
          li.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
          li.textContent = company.name;
  
          // Botão de adicionar
          const addBtn = document.createElement("button");
          addBtn.classList.add("btn", "btn-sm", "btn-outline-success");
          addBtn.innerHTML = `<i class="bi bi-plus"></i>`;
          addBtn.addEventListener("click", () => {
            userCompanies.add(company.id);
            renderLists();
          });
  
          li.appendChild(addBtn);
          availableCompaniesList.appendChild(li);
        });
      }
  
      // =============== Salvar (PATCH) ===============
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        console.log("[EditUser] Botão SALVAR clicado");
  
        successMessage.style.display = "none";
        errorMessage.style.display = "none";
  
        const username = form.username.value;
        const password = form.password.value;
        const role = form.role.value;
        const companiesArray = Array.from(userCompanies);
  
        const body = { username, role, companies: companiesArray };
        if (password) body.password = password;
  
        console.log("Enviando update:", body);
  
        // Chamada PATCH
        const updateResponse = await fetch(`http://127.0.0.1:8000/api/users/update/${userId}/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(body)
        });
  
        if (!updateResponse.ok) {
          console.warn("Resposta update:", updateResponse);
          const errorData = await updateResponse.json();
          console.error("Erro do backend:", errorData);
          const msg = errorData.detail || JSON.stringify(errorData);
          throw new Error(msg);
        }
  
        // Sucesso
        alert("Usuário atualizado com sucesso!");
        window.location.href = "dashboard_admin.html";
      });
  
      // =============== Excluir (DELETE) ===============
      deleteBtn.addEventListener("click", async () => {
        console.log("[EditUser] Botão EXCLUIR clicado");
  
        const confirmDelete = confirm("Tem certeza que deseja excluir este usuário?");
        if (!confirmDelete) return;
  
        const deleteResponse = await fetch(`http://127.0.0.1:8000/api/users/delete/${userId}/`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
  
        if (!deleteResponse.ok) {
          throw new Error("Erro ao excluir usuário.");
        }
  
        alert("Usuário excluído com sucesso!");
        window.location.href = "dashboard_admin.html";
      });
      
    } catch (err) {
      console.error("[EditUser] ERRO:", err);
      errorMessage.textContent = err.message;
      errorMessage.style.display = "block";
    }
  });
  