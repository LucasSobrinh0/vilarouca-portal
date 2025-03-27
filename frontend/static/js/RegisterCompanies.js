document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registerCompanyForm");
    const errorMessage = document.getElementById("error-message");
    const successMessage = document.getElementById("success-message");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        errorMessage.style.display = "none";
        successMessage.style.display = "none";

        const formData = new FormData(form);
        const company_name = formData.get("company_name");
        const cnpj = formData.get("cnpj");

        try {
            const token = document.cookie
                .split("; ")
                .find((row) => row.startsWith("access="))
                ?.split("=")[1];

            const response = await fetch("http://127.0.0.1:8000/api/users/companies/create/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ name: company_name, cnpj }),
            });

            const data = await response.json();

            if (response.status === 200 || response.status === 201) {
                successMessage.textContent = "Empresa cadastrado com sucesso!";
                successMessage.style.display = "block";
            
                setTimeout(() => {
                    successMessage.style.display = "none";
                }, 40000);
            
                form.reset();
            } else {
                throw new Error(data.detail || "Erro ao cadastrar usuário.");
            }
        } catch (err) {
            errorMessage.textContent = err.message;
            errorMessage.style.display = "block";
        }
    });
});
