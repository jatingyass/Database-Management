const tableList = document.getElementById('tableList');
const tableForm = document.getElementById('tableForm');
const dataViewer = document.getElementById('dataViewer');
const dataContent = document.getElementById('dataContent');
const formContainer = document.getElementById('formContainer');



// Open the form to create a new table
const openFormBtn = document.getElementById('openFormBtn');

openFormBtn.addEventListener('click', () => {
    const formContainer = document.getElementById('formContainer');
    formContainer.classList.toggle('open'); // Toggle form visibility
});


// Add more fields for table creation
const addFieldBtn = document.getElementById('addFieldBtn');
const fieldsContainer = document.getElementById('fieldsContainer');

addFieldBtn.addEventListener('click', () => {
    const fieldCount = fieldsContainer.querySelectorAll('.row').length;
    const newFieldRow = document.createElement('div');
    newFieldRow.className = 'row mb-2';
    newFieldRow.innerHTML = `
        <div class="col">
            <input type="text" class="form-control" name="fields[${fieldCount}][name]" placeholder="Column Name" required>
        </div>
        <div class="col">
            <select class="form-control" name="fields[${fieldCount}][type]" required>
                <option value="VARCHAR(255)">VARCHAR(255)</option>
                <option value="INT">INT</option>
                <option value="DATE">DATE</option>
            </select>
        </div>
    `;
    fieldsContainer.appendChild(newFieldRow);
});


// Fetch tables on load
fetch('/get-tables')
    .then(res => res.json())
    .then(tables => {
        tables.forEach(table => {
            const listItem = document.createElement('li');
            listItem.textContent = table;
            listItem.className = 'list-group-item';
            listItem.onclick = () => loadTableData(table);
            tableList.appendChild(listItem);
        });
    });

// Load table data
function loadTableData(tableName) {
    fetch(`/get-data/${tableName}`)
        .then(res => res.json())
        .then(data => {
            let html = `<table class="table table-striped"><thead><tr>`;
            if (data.length > 0) {
                Object.keys(data[0]).forEach(key => {
                    html += `<th>${key}</th>`;
                });
                html += `<th>Actions</th></tr></thead><tbody>`;
                data.forEach(row => {
                    html += `<tr>`;
                    Object.values(row).forEach(value => {
                        html += `<td>${value}</td>`;
                    });
                    html += `<td><button onclick="deleteRow('${tableName}', ${row.id})" class="btn btn-danger">Delete</button></td></tr>`;
                });
                html += `</tbody></table>`;
            } else {
                html = '<p>No data available</p>';
            }
            dataContent.innerHTML = html;
        });
}

// Delete a row
function deleteRow(tableName, id) {
    fetch(`/delete-data/${tableName}/${id}`, { method: 'DELETE' })
        .then(res => res.text())
        .then(() => loadTableData(tableName));
}

// Create a new table
// tableForm.addEventListener('submit', e => {
//     e.preventDefault();
//     const formData = new FormData(tableForm);
//     const tableName = formData.get('tableName');
//     const fields = Array.from(formData.entries())
//         .filter(entry => entry[0].startsWith('fields'))
//         .map(entry => ({
//             name: entry[1],
//             type: formData.get(entry[0].replace('[name]', '[type]')),
//         }));

//     fetch('/create-table', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ tableName, fields }),
//     }).then(() => location.reload());
// });


tableForm.addEventListener('submit', e => {
    e.preventDefault();
    const formData = new FormData(tableForm);
    const tableName = formData.get('tableName');
    const fields = Array.from(formData.entries())
        .filter(entry => entry[0].startsWith('fields'))
        .map(entry => ({
            name: entry[1],
            type: formData.get(entry[0].replace('[name]', '[type]')),
        }));

    fetch('/create-table', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName, fields }),
    }).then(() => location.reload());
});

