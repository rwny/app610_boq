let fuse;

// Initialize Fuse.js when table is loaded
function initSearch(tableData) {
  const options = {
    threshold: 0.5,
    keys: ['0', '1', '2', '3', '4', '5'] // Search all columns
  };
  fuse = new Fuse(tableData, options);
}

function searchTable() {
  const input = document.getElementById('searchInput');
  const searchTerm = input.value;
  const table = document.getElementById('boqTable');
  if (!table) return; // Exit if table doesn't exist
  
  const rows = table.getElementsByTagName('tr');
  if (!rows || rows.length === 0) return;

  if (!searchTerm) {
    // Show all rows if search is empty
    for (let i = 0; i < rows.length; i++) {
      rows[i].style.display = "";
    }
    return;
  }

  // Get all table data for Fuse
  const tableData = [];
  for (let i = 1; i < rows.length; i++) { // Skip header row
    const cells = rows[i].getElementsByTagName('td');
    if (cells.length > 0) {
    const rowData = {};
    for (let j = 0; j < cells.length; j++) {
      if (cells[j]) {
        rowData[j.toString()] = cells[j].textContent || cells[j].innerText;
      }
    }
    tableData.push(rowData);
  }
}

// Add ESC key functionality to clear search
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const input = document.getElementById('searchInput');
    if (input) {
      input.value = '';
      searchTable(); // This will clear highlights and show all rows
    }
  }
});

  // Initialize Fuse if not already done
  if (!fuse) {
    initSearch(tableData);
  }

  // Perform fuzzy search
  const results = fuse.search(searchTerm);

  // First remove any existing highlights
  document.querySelectorAll('.highlight').forEach(el => {
    const parent = el.parentNode;
    parent.replaceChild(document.createTextNode(el.textContent), el);
    parent.normalize();
  });

  // Hide/show rows and highlight matches
  const resultIndices = new Set(results.map(r => r.refIndex));
  for (let i = 1; i < rows.length; i++) { // Skip header row
    const row = rows[i];
    row.style.display = resultIndices.has(i-1) ? "" : "none";
    
    if (resultIndices.has(i-1)) {
      const cells = row.getElementsByTagName('td');
      for (let j = 0; j < cells.length; j++) {
        const cell = cells[j];
        const text = cell.textContent || cell.innerText;
        if (text.toLowerCase().includes(searchTerm.toLowerCase())) {
          const regex = new RegExp(searchTerm, 'gi');
          cell.innerHTML = text.replace(regex, match => 
            `<span class="highlight">${match}</span>`
          );
        }
      }
    }
  }
}
