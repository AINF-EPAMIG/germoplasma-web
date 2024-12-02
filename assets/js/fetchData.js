
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('fetch-data-btn').addEventListener('click', fetchData);
  });
  
  async function fetchData() {
    console.log('Fetching data...');
    
    try {
      const response = await fetch('https://www.epamig.tech/germoplasma/germoplasma_cafe.php');
      console.log('Response received');
      const data = await response.json();
      console.log('Data:', data);
      
      const tbody = document.getElementById('germoplasma_cafe');
      if (tbody) {
        tbody.innerHTML = '';
  
        data.forEach(item => {
          const row = document.createElement('tr');
  
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
      } else {
        console.error('Element with id "germoplasma_cafe" not found');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }