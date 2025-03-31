function getRandomRows(data, count) {
    const shuffled = [...data].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

document.addEventListener('DOMContentLoaded', function() {
    const boqContent = document.getElementById('boqContent');
    const rowLimitToggle = document.getElementById('rowLimitToggle');
    const themeToggle = document.getElementById('themeToggle');
    
    // Set default state for checkbox
    rowLimitToggle.checked = true;

    // Row limit toggling function
    function toggleRowLimit() {
        if (window.boqData) {
            // Toggle the checkbox state
            rowLimitToggle.checked = !rowLimitToggle.checked;
            
            // Update the data display
            const dataToShow = rowLimitToggle.checked ? getRandomRows(window.boqData, 50) : window.boqData;
            const headers = Object.keys(window.boqData[0] || {});
            const columnWidths = ['50%', '10%', '10%', '15%', '15%'];
            const table = createTable(dataToShow, headers, columnWidths);
            boqContent.innerHTML = table.outerHTML;
            boqContent.style.display = 'block';
            
            // Don't display row count information
            
            initSearch();
        }
    }

    // Add keyboard shortcut (Ctrl+Shift+R) for row limit toggling
    document.addEventListener('keydown', function(e) {
        // Check for Ctrl+Shift+R (keyCode 82 is 'R')
        if (e.ctrlKey && e.shiftKey && e.keyCode === 82) {
            e.preventDefault(); // Prevent default browser behavior
            toggleRowLimit();
        }
    });

    // Theme toggling function
    function toggleTheme() {
        const isDarkTheme = document.body.classList.contains('dark-theme');
        if (isDarkTheme) {
            document.body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
            if (themeToggle) themeToggle.checked = false;
        } else {
            document.body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
            if (themeToggle) themeToggle.checked = true;
        }
    }

    // Add keyboard shortcut (Ctrl+Shift+D) for theme toggling
    document.addEventListener('keydown', function(e) {
        // Check for Ctrl+Shift+D (keyCode 68 is 'D')
        if (e.ctrlKey && e.shiftKey && e.keyCode === 68) {
            e.preventDefault(); // Prevent default browser behavior
            toggleTheme();
        }
    });

    // Theme toggle checkbox (if it exists)
    if (themeToggle) {
        themeToggle.addEventListener('change', function() {
            if (this.checked) {
                document.body.classList.add('dark-theme');
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.classList.remove('dark-theme');
                localStorage.setItem('theme', 'light');
            }
        });
    }

    // Load saved theme preference or set light theme as default
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        if (themeToggle) themeToggle.checked = true;
    } else {
        // Default to light theme if no preference or light theme is saved
        document.body.classList.remove('dark-theme');
        if (themeToggle) themeToggle.checked = false;
        if (!savedTheme) {
            localStorage.setItem('theme', 'light');
        }
    }

    // Setup resizable containers
    setupResizableContainers();

    rowLimitToggle.addEventListener('change', function() {
        if (window.boqData) {
            const dataToShow = this.checked ? getRandomRows(window.boqData, 50) : window.boqData;
            const headers = Object.keys(window.boqData[0] || {});
            const columnWidths = ['50%', '10%', '10%', '15%', '15%'];
            const table = createTable(dataToShow, headers, columnWidths);
            boqContent.innerHTML = table.outerHTML;
            boqContent.style.display = 'block';
            
            // Don't display row count information
            
            initSearch();
        }
    });

    // Make functions available globally
    window.createTable = createTable;
    window.getRandomRows = getRandomRows;

    fetch('boq_clean.xlsx')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.arrayBuffer();
        })
        .then(buffer => {
            const workbook = XLSX.read(buffer, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            let jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Convert jsonData to desired format with headers
            const headers = jsonData[0];
            jsonData = jsonData.slice(1);

            const data = jsonData.map(row => {
                const rowData = {};
                headers.forEach((header, index) => {
                    rowData[header || `column${index + 1}`] = row[index];
                });
                return rowData;
            });

            window.boqData = data;

            // Update the row count display
            const dataRowCount = document.getElementById('dataRowCount');
            if (dataRowCount) {
                dataRowCount.textContent = `Total Rows: ${data.length}`;
            }

            // Define column widths dynamically with the first column set to 50%
            const columnWidths = headers.map((header, index) => {
                if (index === 0) return '50%'; // First column gets 50% of the width
                return `${50 / (headers.length - 1)}%`; // Distribute remaining 50% among other columns
            });

            // Log data loading success
            console.log(`Data loaded: ${data.length} rows`);
            
            // Apply initial filtering based on checkbox state
            const dataToShow = rowLimitToggle.checked ? getRandomRows(data, 50) : data;
            
            // Create and display the table with column widths
            const table = createTable(dataToShow, headers, columnWidths);
            boqContent.innerHTML = '';  // Clear any existing content
            boqContent.appendChild(table);
            boqContent.style.display = 'block';

            // Initialize search after data is loaded
            if (window.initializeSearch) {
                window.initializeSearch(data);
            }
        })
        .catch(error => {
            console.error('Error loading Excel file:', error);
            boqContent.innerHTML = `<p>Error loading data: ${error.message}</p>`;
            boqContent.style.display = 'block';
        });

    function createTable(data, headers, columnWidths = []) {
        // Create a container for both tables
        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-container';
        
        // Create header table
        const headerTable = document.createElement('table');
        headerTable.className = 'header-table';
        const headerThead = document.createElement('thead');
        
        // Create header row
        const headerRow = document.createElement('tr');
        headers.forEach((headerText, index) => {
            const th = document.createElement('th');
            th.textContent = headerText;
            if (columnWidths[index]) {
                th.style.width = columnWidths[index];
            }
            headerRow.appendChild(th);
        });
        headerThead.appendChild(headerRow);
        headerTable.appendChild(headerThead);
        
        // Create a scrollable container for data table
        const dataTableContainer = document.createElement('div');
        dataTableContainer.className = 'data-table-container';
        
        // Create data table
        const dataTable = document.createElement('table');
        dataTable.className = 'data-table';
        const dataTbody = document.createElement('tbody');
        
        // Create data rows
        data.forEach(rowData => {
            const row = document.createElement('tr');
            
            headers.forEach((headerText, index) => {
                const td = document.createElement('td');
                const cellContent = rowData[headerText] || '';
                
                // Center-align text for columns 2, 3, and 6 (index 1, 2, and 5)
                if (index === 1 || index === 2 || index === 5) {
                    td.style.textAlign = 'center';
                }

                // Right-align numbers in columns 4 and 5 (index 3 and 4)
                if ((index === 3 || index === 4) && !isNaN(parseFloat(cellContent))) {
                    td.style.textAlign = 'right';
                }

                // Style "Data Date" column (if it exists)
                if (headerText.toLowerCase() === 'year' || headerText.toLowerCase() === 'data date') {
                    td.style.color = '#555'; // Dark gray color for "Data Date"
                }

                td.textContent = cellContent;
                if (columnWidths[index]) {
                    td.style.width = columnWidths[index];
                }
                row.appendChild(td);
            });

            dataTbody.appendChild(row);
        });
        dataTable.appendChild(dataTbody);
        dataTableContainer.appendChild(dataTable);
        
        // Add both tables to container
        tableContainer.appendChild(headerTable);
        tableContainer.appendChild(dataTableContainer);
        
        return tableContainer;
    }

    function initSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('keyup', function() {
                const query = searchInput.value.toLowerCase();
                const filteredData = window.boqData.filter(row => {
                    return Object.values(row).some(value => 
                        value && value.toString().toLowerCase().includes(query)
                    );
                });

                const headers = Object.keys(window.boqData[0] || {});
                const columnWidths = ['50%', '10%', '10%', '15%', '15%']; // Adjust as needed

                // Create and display the filtered table
                const table = createTable(filteredData, headers, columnWidths);
                boqContent.innerHTML = ''; // Clear existing content
                boqContent.appendChild(table);
                boqContent.style.display = 'block';

                // Add tooltips for "year" column in filtered rows
                filteredData.forEach((rowData, index) => {
                    const row = boqContent.querySelectorAll('tr')[index + 1]; // Skip header row
                    if (rowData['year']) {
                        row.setAttribute('title', `Data date: ${rowData['year']}`);
                    }
                });
            });

            // Trigger a search event to initialize the table with the current input
            const event = new Event('keyup');
            searchInput.dispatchEvent(event);
        }
    }

    function setupResizableContainers() {
        // Setup horizontal resizer for table width
        const tableResizer = document.getElementById('tableResizer');
        const tableContainer = document.getElementById('tableContainer');
        
        if (tableResizer && tableContainer) {
            let isResizing = false;
            let startX, startWidth;
            
            tableResizer.addEventListener('mousedown', function(e) {
                isResizing = true;
                startX = e.clientX;
                startWidth = parseInt(document.defaultView.getComputedStyle(tableContainer).width, 10);
                
                document.documentElement.classList.add('resizing');
                
                e.preventDefault();
            });
            
            document.addEventListener('mousemove', function(e) {
                if (!isResizing) return;
                
                const width = startWidth + (e.clientX - startX);
                tableContainer.style.width = `${width}px`;
            });
            
            document.addEventListener('mouseup', function() {
                if (isResizing) {
                    isResizing = false;
                    document.documentElement.classList.remove('resizing');
                }
            });
        }
        
        // Setup vertical resizer for sidebar height
        const sidebarResizer = document.getElementById('sidebarResizer');
        const sidebar = document.getElementById('sidebar');
        
        if (sidebarResizer && sidebar) {
            let isResizing = false;
            let startY, startHeight;
            
            sidebarResizer.addEventListener('mousedown', function(e) {
                isResizing = true;
                startY = e.clientY;
                startHeight = parseInt(document.defaultView.getComputedStyle(sidebar).height, 10);
                
                document.documentElement.classList.add('resizing');
                
                e.preventDefault();
            });
            
            document.addEventListener('mousemove', function(e) {
                if (!isResizing) return;
                
                const height = startHeight + (e.clientY - startY);
                sidebar.style.height = `${height}px`;
            });
            
            document.addEventListener('mouseup', function() {
                if (isResizing) {
                    isResizing = false;
                    document.documentElement.classList.remove('resizing');
                }
            });
        }
    }
});
