document.addEventListener("DOMContentLoaded", function () {
  const url = "https://www.epamig.tech/germoplasma/usuarios.php";

  // Selecionar os itens do menu
  const minhaConta = document.getElementById("minhaConta");
  const register = document.getElementById("register");
  const login = document.getElementById("login");

  // Botões
  const addItemButton = document.getElementById("addItemButton");
  const removeSelected = document.getElementById("removeSelected");

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
    if (removeSelected) removeSelected.style.display = "none";
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
        // Exibe itens do menu para usuários autenticados
        if (minhaConta) minhaConta.style.display = "block";
        if (register) register.style.display = "block";
        if (login) login.style.display = "none";
        if (addItemButton) addItemButton.style.display = "block";
        if (removeSelected) removeSelected.style.display = "block";
      } else {
        // Exibe apenas "Login" para usuários não autenticados
        hideMenuItems();
        if (login) login.style.display = "block";
      }
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
      hideMenuItems();
      if (login) login.style.display = "block";
    }
  }

  // Chama a função de verificação inicial
  fetchUserData();

  // Verifica o status do usuário a cada 2 segundos
  setInterval(fetchUserData, 2000);

  // Renderiza os itens da tabela
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
        <td><input type="checkbox" class="select-item" /></td>
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

    // Adiciona evento para selecionar/desmarcar todos os checkboxes
    const selectAll = document.getElementById("selectAll");
    if (selectAll) {
      selectAll.addEventListener("change", function () {
        const checkboxes = document.querySelectorAll(".select-item");
        checkboxes.forEach((checkbox) => {
          checkbox.checked = this.checked;
        });
      });
    }
  }

  // Remove itens selecionados
  async function removeSelectedItems() {
    const selectedItems = Array.from(
      document.querySelectorAll(".select-item:checked")
    ).map((checkbox) => {
      const row = checkbox.closest("tr");
      return {
        numero_acesso: row.cells[1].textContent.trim(),
        designacao_material: row.cells[2].textContent.trim(),
        local_coleta: row.cells[3].textContent.trim(),
        proprietario: row.cells[4].textContent.trim(),
      };
    });

    if (selectedItems.length === 0) {
      alert("Nenhum item selecionado.");
      return;
    }

    if (!confirm(`Deseja remover ${selectedItems.length} itens selecionados?`)) {
      return;
    }

    try {
      const response = await fetch(
        "https://www.epamig.tech/germoplasma/delete_item.php",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ items: selectedItems }),
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Itens removidos com sucesso.");
        // Atualiza a tabela removendo as linhas excluídas
        allData = allData.filter(
          (item) =>
            !selectedItems.some(
              (selected) =>
                selected.numero_acesso === item.numero_acesso &&
                selected.designacao_material === item.designacao_material &&
                selected.local_coleta === item.local_coleta &&
                selected.proprietario === item.proprietario
            )
        );
        renderItems();
      } else {
        console.error("Erro ao remover itens:", data.message);
        alert(`Erro: ${data.message}`);
      }
    } catch (error) {
      console.error("Erro ao remover itens:", error);
      alert("Erro ao tentar remover os itens.");
    }
  }

  // Carregar dados iniciais
  fetch("https://www.epamig.tech/germoplasma/germoplasma_cafe.php")
    .then((response) => response.json())
    .then((data) => {
      allData = data;
      renderItems();
    })
    .catch((error) => {
      console.error("Erro ao buscar dados:", error);
    });

  // Eventos de botão
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

  if (removeSelected) {
    removeSelected.addEventListener("click", removeSelectedItems);
  }


  // Formulário de adicionar item

  const addItemForm = document.getElementById("addItemForm");
  const addItemSubmit = document.getElementById("addItemSubmit");

  // Função para adicionar novo item
  async function addItem(event) {
    event.preventDefault(); // Evita o comportamento padrão do formulário
    addItemSubmit.disabled = true; // Desabilita o botão para evitar envios múltiplos

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

      const data = await response.json();

      if (data.success) {
        allData.push(newItem); // Adiciona o item à lista local
        addItemModal.hide(); // Fecha o modal
        addItemForm.reset(); // Limpa o formulário
      } else {
        alert(`Erro: ${data.message}`);
      }
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
      alert("Erro ao tentar adicionar o item. Tente novamente.");
    } finally {
      addItemSubmit.disabled = false; // Reabilita o botão
    }
  }

  // Adiciona o evento de submissão ao formulário
  if (addItemForm) {
    addItemForm.addEventListener("submit", addItem);
  }
});
