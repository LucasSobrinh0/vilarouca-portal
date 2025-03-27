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
  
      const response = await fetch("http://127.0.0.1:8000/api/users/current-user/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        throw new Error("Erro ao buscar usuário atual.");
      }
  
      const user = await response.json();
  
      const userName = document.getElementById("user-name");
      userName.textContent = user.username;
  
    } catch (error) {
      console.error("Erro ao carregar nome do usuário:", error);
    }
  })();
  