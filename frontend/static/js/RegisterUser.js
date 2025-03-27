document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registerUserForm");
    const errorMessage = document.getElementById("error-message");
    const successMessage = document.getElementById("success-message");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        errorMessage.style.display = "none";
        successMessage.style.display = "none";

        const formData = new FormData(form);
        const username = formData.get("username");
        const password = formData.get("password");
        const role = formData.get("role");

        try {
            const token = document.cookie
                .split("; ")
                .find((row) => row.startsWith("access="))
                ?.split("=")[1];

            const response = await fetch("http://127.0.0.1:8000/api/users/register/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ username, password, role }),
            });

            const data = await response.json();

            if (response.status === 200 || response.status === 201) {
                console.log("SUCESSO! STATUS:", response.status);
                successMessage.textContent = "Usuário cadastrado com sucesso!";
                successMessage.style.display = "block";
            
                setTimeout(() => {
                    successMessage.style.display = "none";
                }, 4000);
            
                form.reset();
            
                return; // <-- ADICIONA ISSO PRA PARAR AQUI
            } else {
                console.log("ERRO! STATUS:", response.status); // <-- ADICIONA ISSO
                throw new Error(data.detail || "Erro ao cadastrar usuário.");
            }
        } catch (err) {
            console.log("ERRO! STATUS:", err.status); // <-- ADICIONA ISSO
            errorMessage.textContent = err.message;
            errorMessage.style.display = "block";
        }
    });
});
