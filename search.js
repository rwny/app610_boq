// Import createTable function from boq_loader.js
const createTable = window.createTable || function(data, headers, columnWidths = []) {
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    // Create table headers
    const headerRow = document.createElement('tr');
    headers.forEach((headerText, index) => {
        const th = document.createElement('th');
        th.textContent = headerText;
        if (columnWidths[index]) {
            th.style.width = columnWidths[index];
        }
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table rows
    data.forEach(rowData => {
        const row = document.createElement('tr');
        
        // Check if columns 2-5 are empty
        let isEmpty = true;
        for (let i = 1; i < headers.length; i++) {
            if (rowData[headers[i]]) {
                isEmpty = false;
                break;
            }
        }
        
        if (!isEmpty) {
            headers.forEach((headerText, index) => {
                const td = document.createElement('td');
                td.textContent = rowData[headerText] || '';
                if (columnWidths[index]) {
                    td.style.width = columnWidths[index];
                }
                row.appendChild(td);
            });
            tbody.appendChild(row);
        }
    });
    table.appendChild(tbody);

    return table;
};

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    let fuseInstance;

    // Initialize the search functionality
    function initializeSearch(data) {
        if (!data || data.length === 0) {
            console.error("No data available for search");
            return;
        }

        // Configure Fuse.js options
        const options = {
            keys: Object.keys(data[0]),
            threshold: 0.3,  // Lower threshold for more exact matching
            includeScore: true,
            includeMatches: true, // Include match info for highlighting
            shouldSort: true
        };

        // Create Fuse instance
        fuseInstance = new Fuse(data, options);
    }

    // Perform search and update table
    function performSearch(query) {
        if (!window.boqData) {
            console.error("Search data not initialized");
            return;
        }

        const boqContent = document.getElementById('boqContent');
        
        // If no query, show all data or random rows based on the toggle
        if (!query) {
            const rowLimitToggle = document.getElementById('rowLimitToggle');
            const dataToShow = rowLimitToggle && rowLimitToggle.checked ? 
                window.getRandomRows(window.boqData, 50) : window.boqData;
            
            // Use the global createTable function
            if (window.createTable) {
                const headers = Object.keys(window.boqData[0] || {});
                const columnWidths = ['50%', '10%', '10%', '15%', '15%'];
                const table = window.createTable(dataToShow, headers, columnWidths);
                boqContent.innerHTML = table.outerHTML;
                boqContent.style.display = 'block';
            } else {
                boqContent.innerHTML = '<p>Table rendering function not available</p>';
            }
            return;
        }

        // Use Fuse.js for searching
        const results = fuseInstance.search(query);
        
        // Update row count display with search results count
        const dataRowCount = document.getElementById('dataRowCount');
        if (dataRowCount) {
            dataRowCount.textContent = `Rows: ${results.length} of ${window.boqData.length}`;
        }
        
        if (results.length === 0) {
            boqContent.innerHTML = '<p>No matching results found.</p>';
            return;
        }
        
        // Display results with highlighting
        displayHighlightedResults(results, query);
    }
    
    // Display search results with highlighting
    function displayHighlightedResults(results, query) {
        const boqContent = document.getElementById('boqContent');
        
        if (results.length === 0) {
            boqContent.innerHTML = '<p>No matching results found.</p>';
            return;
        }
        
        // Create container for both tables
        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-container';
        
        const headers = Object.keys(window.boqData[0] || {});
        const columnWidths = ['50%', '10%', '10%', '15%', '15%'];
        
        // Create header table (fixed)
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
        
        // Create data table (scrollable)
        const dataTableContainer = document.createElement('div');
        dataTableContainer.className = 'data-table-container';
        
        const dataTable = document.createElement('table');
        dataTable.className = 'data-table';
        const dataTbody = document.createElement('tbody');
        
        // Process each result
        results.forEach(result => {
            const row = document.createElement('tr');
            const item = result.item;
            const matches = result.matches || [];
            
            headers.forEach((headerText, index) => {
                const td = document.createElement('td');
                let content = item[headerText] || '';
                
                // Find if this cell has matches
                const cellMatch = matches.find(m => m.key === headerText);
                
                if (cellMatch && cellMatch.indices.length > 0) {
                    // Convert content to string if it's not already
                    content = content.toString();
                    
                    // Sort indices to process from end to start to avoid position shifts
                    const indices = [...cellMatch.indices].sort((a, b) => b[0] - a[0]);
                    
                    // Replace matched parts with highlighted spans
                    indices.forEach(([start, end]) => {
                        const matchedText = content.substring(start, end + 1);
                        const replacement = `<mark>${matchedText}</mark>`;
                        content = 
                            content.substring(0, start) + 
                            replacement + 
                            content.substring(end + 1);
                    });
                    
                    // Apply HTML content (with highlighting)
                    td.innerHTML = content;
                } else {
                    // Basic text highlighting for exact matches
                    if (typeof content === 'string' && query && content.toLowerCase().includes(query.toLowerCase())) {
                        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                        content = content.replace(regex, '<mark>$1</mark>');
                        td.innerHTML = content;
                    } else {
                        td.textContent = content;
                    }
                }
                
                // Right-align numbers in columns 4 and 5
                if ((index === 3 || index === 4) && !isNaN(parseFloat(item[headerText]))) {
                    td.style.textAlign = 'right';
                }
                
                // Make 6th column (index 5) date text gray
                if (index === 5) {
                    td.style.color = '#777';
                }
                
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
        
        boqContent.innerHTML = '';
        boqContent.appendChild(tableContainer);
        boqContent.style.display = 'block';
    }

    // Make necessary functions available globally
    window.initializeSearch = initializeSearch;
    window.performSearch = performSearch;

    // Event listener for search input
    if (searchInput) {
        searchInput.addEventListener('keyup', function() {
            const query = this.value.trim();
            performSearch(query);
        });
    }

    // Initialize search when data is loaded
    if (window.boqData) {
        initializeSearch(window.boqData);
    } else {
        // If data isn't loaded yet, wait for it
        const checkInterval = setInterval(function() {
            if (window.boqData) {
                initializeSearch(window.boqData);
                clearInterval(checkInterval);
            }
        }, 100);
    }
});
