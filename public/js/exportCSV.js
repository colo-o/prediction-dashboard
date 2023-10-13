document.querySelector("#export-button").addEventListener("click", function () {
  const table = document.querySelector("#eventsTable");
  let csv = [];
  let rows = table.querySelectorAll("tr");

  for (let i = 0; i < rows.length; i++) {
    let row = [],
      cols = rows[i].querySelectorAll("td, th");
    console.log(cols);

    for (let j = 0; j + 1 < cols.length; j++) {
      row.push(cols[j].innerText);
    }

    csv.push(row.join(","));
  }

  downloadCSV(csv.join("\n"));
});

function downloadCSV(csv) {
  let csvFile;
  let downloadLink;

  csvFile = new Blob([csv], { type: "text/csv" });
  downloadLink = document.createElement("a");

  downloadLink.download = "data.csv";
  downloadLink.href = window.URL.createObjectURL(csvFile);
  downloadLink.style.display = "none";

  document.body.appendChild(downloadLink);
  downloadLink.click();
}
