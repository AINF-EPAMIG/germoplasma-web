document.addEventListener("DOMContentLoaded", function () {
    const url = "https://www.epamig.tech/germoplasma/usuarios.php";
  
    async function checkLogin() {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_user" }),
          credentials: "include", // Necessário para enviar cookies
        });
  
        const data = await response.json();
  
        if (!data.success) {
          // Redireciona para a página de login se o usuário não estiver logado
          window.location.href = "/germoplasma/home/login.html";
        }
  
        return data.data; // Retorna os dados do usuário logado
      } catch (error) {
        console.error("Erro ao verificar login:", error);
        window.location.href = "/germoplasma/home/login.html";
      }
    }
  
    // Função para preencher os detalhes do perfil do usuário
    async function loadUserProfile() {
      const userData = await checkLogin();
  
      if (userData) {
        // Atualiza os campos do perfil
        document.getElementById("dropdownUserName").textContent = userData.nome || "Usuário";
        document.getElementById("userName").textContent = userData.nome || "User";
        document.getElementById("nomeusuario").textContent = userData.nome || "Nome não encontrado";
        document.getElementById("emailusuario").textContent = userData.email || "Email não disponível";
        document.getElementById("datacadastrousuario").textContent = userData.data_cadastro || "Data não disponível";
      } else {
        console.error("Nenhum dado de usuário encontrado.");
      }
    }
  
    // Função para alterar a senha
    document
      .querySelector("#profile-change-password form")
      ?.addEventListener("submit", async function (event) {
        event.preventDefault();
  
        const currentPassword = document
          .getElementById("currentPassword")
          .value.trim();
        const newPassword = document.getElementById("newPassword").value.trim();
        const renewPassword = document
          .getElementById("renewPassword")
          .value.trim();
  
        if (!currentPassword || !newPassword || !renewPassword) {
          alert("Por favor, preencha todos os campos.");
          return;
        }
  
        if (newPassword !== renewPassword) {
          alert("As novas senhas não coincidem.");
          return;
        }
  
        try {
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "change_password",
              current_password: currentPassword,
              new_password: newPassword,
            }),
            credentials: "include",
          });
  
          const data = await response.json();
          if (data.success) {
            alert("Senha alterada com sucesso!");
          } else {
            alert(`Erro: ${data.message}`);
          }
        } catch (error) {
          console.error("Erro ao alterar senha:", error);
          alert("Ocorreu um erro ao alterar a senha. Tente novamente.");
        }
      });
  
    // Carregar o perfil do usuário
    loadUserProfile();
  });  