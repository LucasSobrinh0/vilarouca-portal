function logout() {
    document.cookie = "access=; path=/; max-age=0; secure; samesite=strict";
    window.location.href = "../../templates/login.html";
  }
