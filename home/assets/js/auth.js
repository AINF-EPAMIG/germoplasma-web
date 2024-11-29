document.addEventListener("DOMContentLoaded", function () {
    const url = "https://www.epamig.tech/germoplasma/usuarios.php";
  
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
          // Atualizar os dados do usuário no menu
          document.getElementById("userName").textContent = data.data.nome;
          document.getElementById("dropdownUserName").textContent =
            data.data.nome;
          document.getElementById("dropdownUserRole").textContent =
            data.data.role || "User";
  
          // Exibir botão de adicionar item, caso aplicável
          const addItemButton = document.getElementById("addItemButton");
          if (addItemButton) addItemButton.style.display = "block";
        } else {
          console.log("Usuário não autenticado ou sessão expirada.");
          // Opcional: redirecionar para login ou exibir mensagem
          // window.location.href = './pages-login.html';
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      }
    }
  
    // Chamar a função de verificação inicial
    fetchUserData();
  
    // Atualizar dinamicamente os dados do usuário a cada 10 segundos
    setInterval(fetchUserData, 10000); // 10000ms = 10 segundos
  
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
            window.location.href = "./pages-login.html";
          } else {
            alert("Erro ao realizar o logout. Tente novamente.");
          }
        } catch (error) {
          console.error("Erro ao realizar o logout:", error);
        }
      });
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
