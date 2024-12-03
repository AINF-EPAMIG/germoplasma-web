document.addEventListener("DOMContentLoaded", function () {
  const url = "https://www.epamig.tech/germoplasma/usuarios.php";

  // Selecionar os itens do menu
  const minhaConta = document.getElementById("minhaConta");
  const register = document.getElementById("register");
  const login = document.getElementById("login");
  const logout = document.getElementById("logout");

  // Botão adicionar +
  const addItemButton = document.getElementById("addItemButton");

  // Selecionar o modal
  const addItemModal = new bootstrap.Modal(document.getElementById("addItemModal"));

  // Ocultar itens do menu inicialmente
  function hideMenuItems() {
    if (minhaConta) minhaConta.style.display = "none";
    if (register) register.style.display = "none";
    if (login) login.style.display = "none";
    if (logout) logout.style.display = "none";
    if (addItemButton) addItemButton.style.display = "none";
  }

  hideMenuItems(); // Inicialmente esconde todos os itens

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
        // Usuário logado: exibe "Minha Conta", "Register", "Sair", e botão para adicionar mais itens, oculta "Login"
        if (minhaConta) minhaConta.style.display = "block";
        if (register) register.style.display = "block";
        if (login) login.style.display = "none";
        if (logout) logout.style.display = "block";
        if (addItemButton) addItemButton.style.display = "block";
      } else {
        // Usuário não logado: exibe "Login", oculta "Minha Conta", "Register", "Sair", e botão para adicionar mais itens
        hideMenuItems();
        if (login) login.style.display = "block";
      }
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
      hideMenuItems();
      if (login) login.style.display = "block";
    }
  }

  // Chamar a função de verificação inicial
  fetchUserData();

  // Verificador contínuo a cada 5 segundos
  setInterval(fetchUserData, 5000);

  // Lógica de Logout
  const logoutLink = document.getElementById("logout");

  if (logoutLink) {
    logoutLink.addEventListener("click", async function (event) {
      event.preventDefault(); // Impede a navegação padrão do link

      try {
        // Faz a requisição POST para realizar o logout
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "logout" }), // Envia a ação "logout"
          credentials: "include", // Inclui cookies na requisição
        });

        const text = await response.text(); // Lê a resposta como texto bruto
        console.log("Resposta do logout (bruta):", text);

        let data;
        try {
          data = JSON.parse(text); // Tenta converter para JSON
        } catch (error) {
          throw new Error("A resposta não está no formato JSON válido.");
        }

      } catch (error) {
        console.error("Erro ao realizar o logout:", error);
        alert("Ocorreu um erro ao tentar realizar o logout.");
      }
    });
  }

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

  if (addItemButton) {
    addItemButton.addEventListener("click", function () {
      addItemModal.show(); // Exibe o modal
    });
  }

  const addItemForm = document.getElementById("addItemForm");
  // Submissão do formulário para adicionar novo item
  if (addItemForm) {
    addItemForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      const newItem = {
        numero_acesso: document.getElementById("numero_acesso").value.trim(),
        designacao_material: document.getElementById("designacao_material").value.trim(),
        local_coleta: document.getElementById("local_coleta").value.trim(),
        proprietario: document.getElementById("proprietario").value.trim(),
        municipio_estado: document.getElementById("municipio_estado").value.trim(),
        idade_lavoura: document.getElementById("idade_lavoura").value.trim(),
        data_coleta: document.getElementById("data_coleta").value.trim(),
        coletor: document.getElementById("coletor").value.trim(),
      };

      try {
        const response = await fetch("https://www.epamig.tech/germoplasma/add_item.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newItem),
          credentials: "include",
        });

        const data = await response.json();
        if (data.success) {
          location.reload(); // Recarrega os itens
        } else {
          alert(`Erro ao adicionar item: ${data.message}`);
        }
      } catch (error) {
        console.error("Erro ao adicionar item:", error);
        alert("Ocorreu um erro ao adicionar o item.");
      }
    });
  }
});