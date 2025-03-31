document.addEventListener('DOMContentLoaded', function () {
    fetch('boq_clean.xlsx')
        .then(response => response.arrayBuffer())
        .then(buffer => {
            const data = new Uint8Array(buffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

            // Create table
            const table = document.createElement('table');
            table.className = 'data-table';
            table.id = 'boqTable';
            
            // Add headers
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            jsonData[0].forEach(header => {
                const th = document.createElement('th');
                th.textContent = header;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            // Add data rows
            const tbody = document.createElement('tbody');
            for (let i = 1; i < jsonData.length; i++) {
                const row = document.createElement('tr');
                jsonData[i].forEach((cell, index) => {
                    const td = document.createElement('td');
                    td.textContent = cell;
                    if (jsonData[0][index]) {
                        td.setAttribute('data-header', jsonData[0][index]);
                    }
                    row.appendChild(td);
                });
                tbody.appendChild(row);
            }
            table.appendChild(tbody);

            // Add table to page
            const container = document.getElementById('boqContent');
            if (container) {
                container.appendChild(table);
                // Initialize search with table data
                const rows = table.getElementsByTagName('tr');
                const tableData = [];
                for (let i = 1; i < rows.length; i++) { // Skip header row
                    const cells = rows[i].getElementsByTagName('td');
                    if (cells.length > 0) {
                        tableData.push({
                            '0': cells[0].textContent || cells[0].innerText
                        });
                    }
                }
                initSearch(tableData);
            } else {
                console.error('Could not find boqContent container');
            }
        });
});
