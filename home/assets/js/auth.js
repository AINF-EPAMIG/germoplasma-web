document.addEventListener("DOMContentLoaded", function () {
  const url = "https://www.epamig.tech/germoplasma/usuarios.php";

  // Selecionar os itens do menu
  const minhaConta = document.getElementById("minhaConta");
  const register = document.getElementById("register");
  const login = document.getElementById("login");

  // Ocultar itens do menu inicialmente
  if (minhaConta) minhaConta.style.display = "none";
  if (register) register.style.display = "none";
  if (login) login.style.display = "none";

  // Função para verificar e atualizar os dados do usuário
  async function fetchUserData() {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "get_user" }),
        credentials: "include", // Necessário para enviar cookies
      });

      const data = await response.json();

      if (data.success) {
        const { nivel_permissao } = data.data;

        // Usuário logado: exibe "Minha Conta" e oculta "Login"
        if (minhaConta) minhaConta.style.display = "block";
        if (login) login.style.display = "none";

        // Exibir "Register" apenas para usuários com nível de permissão 1
        if (nivel_permissao === 1 && register) {
          register.style.display = "block";
        } else if (register) {
          register.style.display = "none";
        }
      } else {
        // Usuário não logado: exibe "Login" e oculta "Minha Conta" e "Register"
        if (minhaConta) minhaConta.style.display = "none";
        if (register) register.style.display = "none";
        if (login) login.style.display = "block";
      }
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);

      // Como fallback, exibe apenas o "Login" para usuários não autenticados
      if (minhaConta) minhaConta.style.display = "none";
      if (register) register.style.display = "none";
      if (login) login.style.display = "block";
    }
  }

  // Chamar a função de verificação inicial
  fetchUserData();

  // Logout
  document
    .getElementById("logoutButton")
    ?.addEventListener("click", async function (event) {
      event.preventDefault();

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "logout" }),
          credentials: "include", // Necessário para enviar cookies
        });

        const data = await response.json();

        if (data.success) {
          // Redirecionar para a página de login após logout
          window.location.href = "/germoplasma/home/pages-login.html";
        } else {
          alert("Erro ao realizar o logout. Tente novamente.");
        }
      } catch (error) {
        console.error("Erro ao realizar o logout:", error);
      }
    });

  // Renderizar tabela de itens
  let currentIndex = 0;
  let itemsPerPage = 20;
  let allData = [];

  function renderItems() {
    const tbody = document.getElementById("germoplasma_cafe");
    tbody.innerHTML = "";

    const itemsToShow = allData.slice(0, currentIndex + itemsPerPage);
    itemsToShow.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.numero_acesso}</td>
        <td>${item.designacao_material}</td>
        <td>${item.local_coleta}</td>
        <td>${item.proprietario}</td>
        <td>${item.municipio_estado}</td>
        <td>${item.idade_lavoura}</td>
        <td>${item.data_coleta}</td>
        <td>${item.coletor}</td>
      `;
      tbody.appendChild(row);
    });
  }

  // Carregar dados iniciais
  fetch("https://www.epamig.tech/germoplasma/germoplasma_cafe.php")
    .then((response) => response.json())
    .then((data) => {
      allData = data;
      renderItems();
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });

  document.getElementById("loadMore").addEventListener("click", function () {
    currentIndex += itemsPerPage;
    renderItems();
  });

  document.getElementById("loadAll").addEventListener("click", function () {
    currentIndex = allData.length;
    renderItems();
  });
});
