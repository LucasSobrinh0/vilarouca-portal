function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }
  const token = getCookie("access");

  if (!token) {
    // Usuário não está logado, redireciona para login
    window.location.href = "../../templates/login.html";
  }
    

  fetch("http://127.0.0.1:8000/api/users/current-user/", {
    headers: {
      Authorization: `Bearer ${getCookie("access")}`
    }
  }).then(response => {
    if (response.status === 401) {
      window.location.href = "../../templates/login.html";
    }
  });