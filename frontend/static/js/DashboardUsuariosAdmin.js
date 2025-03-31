(async () => {
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
    };
  
    const token = getCookie("access");
    if (!token) return console.error("Token não encontrado");
  
    try {
      const response = await fetch("http://127.0.0.1:8000/api/users/dashboardUsuarios/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      const data = await response.json();
  
      const animateCounter = (el, target) => {
        let count = 0;
        const step = Math.ceil(target / 60); // velocidade da animação
        const interval = setInterval(() => {
          count += step;
          if (count >= target) {
            count = target;
            clearInterval(interval);
          }
          el.textContent = count;
        }, 15);
      };
  
      animateCounter(document.getElementById("total-usuarios"), data.total || 0);
      animateCounter(document.getElementById("total-clientes"), data.clientes || 0);
      animateCounter(document.getElementById("total-atendentes"), data.atendentes || 0);
      animateCounter(document.getElementById("total-admins"), data.administradores || 0);
  
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    }
  })();
  