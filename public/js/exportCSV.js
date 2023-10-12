function bindExportFunctionality() {
    const btn = document.getElementById('exportToCSV');
    if (btn) {
        btn.addEventListener('click', function() {
            const table = document.getElementById('eventsTable');
            const rows = table.querySelectorAll('tr');
            let csv = [];

            for (let i = 0; i < rows.length; i++) {
                let row = [], cols = rows[i].querySelectorAll('td, th');

                // Exclude the last column (image column)
                for (let j = 0; j < cols.length - 1; j++) {
                    
                    // Process the Model Response column (assuming it's the 6th column)
                    if (j === 5) {
                        let lis = cols[j].querySelectorAll('ul > p');
                        let combinedText = Array.from(lis).map(p => p.innerText).join('/');
                        row.push(combinedText);
                    } else {
                        row.push(cols[j].innerText);
                    }
                }

                csv.push(row.join(','));
            }

            downloadCSV(csv.join('\n'), 'table-data.csv');
        });
    }
}

function downloadCSV(csv, filename) {
    let csvFile;
    let downloadLink;

    csvFile = new Blob([csv], {type: "text/csv"});

    downloadLink = document.createElement("a");
    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = "none";

    document.body.appendChild(downloadLink);
    downloadLink.click();
}

bindExportFunctionality();