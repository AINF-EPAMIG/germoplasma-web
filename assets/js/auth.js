document.addEventListener("DOMContentLoaded", function () {
  const url = "https://www.epamig.tech/germoplasma/usuarios.php";

  // Selecionar os itens do menu
  const minhaConta = document.getElementById("minhaConta");
  const register = document.getElementById("register");
  const login = document.getElementById("login");

  // Botão adicionar +
  const addItemButton = document.getElementById("addItemButton");

  // Selecionar o modal
  const addItemModal = new bootstrap.Modal(
    document.getElementById("addItemModal")
  );

  // Ocultar itens do menu inicialmente
  function hideMenuItems() {
    if (minhaConta) minhaConta.style.display = "none";
    if (register) register.style.display = "none";
    if (login) login.style.display = "none";
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
        if (addItemButton) addItemButton.style.display = "block";
      } else {
        // Usuário não logado: exibe "Login", oculta outros itens
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

  // Verificador contínuo a cada 2 segundos
  setInterval(fetchUserData, 2000);

  // Lógica de Login
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
      event.preventDefault(); // Impede o envio padrão do formulário

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      const loginError = document.getElementById("loginError");

      if (loginError) loginError.style.display = "none";

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "login",
            email: email,
            password: password,
          }),
          credentials: "include",
        });

        const data = await response.json();
        console.log(data); // Verifique o formato no console

        if (data.success) {
          console.log("Login realizado com sucesso");
          window.location.href = "/dashboard";
        } else if (loginError) {
          loginError.textContent = data.message || "Erro ao realizar login.";
          loginError.style.display = "block";
        }
      } catch (error) {
        console.error("Erro na requisição de login:", error);
        if (loginError) {
          loginError.textContent = "Erro ao conectar ao servidor.";
          loginError.style.display = "block";
        }
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

// Adiciona itens

const addItemForm = document.getElementById("addItemForm");
const submitButton = document.getElementById("addItemSubmit");

if (addItemForm && !addItemForm.dataset.listenerAdded) {
  addItemForm.addEventListener("submit", async function (event) {
    event.preventDefault(); // Evita o comportamento padrão do formulário
    submitButton.disabled = true; // Desabilita o botão para evitar múltiplos envios

    // Captura os dados do formulário
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

    // Log para verificar os dados enviados
    console.log("Dados a serem enviados:", newItem);

    try {
      // Envia os dados para o backend
      const response = await fetch("https://www.epamig.tech/germoplasma/add_item.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newItem),
        credentials: "include",
      });

      // Trata a resposta do backend
      const data = await response.json();
      if (data.success) {
        console.log("Item adicionado com sucesso.");
        // Atualiza a interface dinamicamente, se necessário
        location.reload(); // Recarrega a página (se necessário)
      } else {
        console.error(`Erro ao adicionar item: ${data.message}`);
        alert(`Erro: ${data.message}`);
      }
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
      alert("Ocorreu um erro ao adicionar o item. Tente novamente.");
    } finally {
      // Reabilita o botão após o processamento
      submitButton.disabled = false;
    }
  });

  // Marca o formulário para evitar múltiplas associações do evento
  addItemForm.dataset.listenerAdded = true;
}

});
