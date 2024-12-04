document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
  
    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault(); // Impede o comportamento padrão do formulário
  
      // Capturar os dados do formulário
      const nome = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
  
      // Validação básica
      if (!nome || !email || !password) {
        alert("Por favor, preencha todos os campos.");
        return;
      }
  
      // Enviar os dados para o servidor
      try {
        const response = await fetch("https://www.epamig.tech/germoplasma/usuarios.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "register",
            nome,
            email,
            password,
          }),
        });
  
        const data = await response.json();
  
        if (data.success) {
          alert("Usuário cadastrado com sucesso!");
          registerForm.reset(); // Limpar o formulário
        } else {
          alert(data.message || "Erro ao cadastrar o usuário.");
        }
      } catch (error) {
        console.error("Erro ao cadastrar o usuário:", error);
        alert("Erro ao cadastrar o usuário. Por favor, tente novamente.");
      }
    });
  });
  