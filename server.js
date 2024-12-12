const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();

// Middleware for parsing form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public')); // Serve static files

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Replace with your MySQL username
    password: 'Jatin@1234', // Replace with your MySQL password
    database: 'my_database' // Replace with your database name
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database!');
});

// Endpoint to create table dynamically
app.post('/create-table', (req, res) => {
    const { tableName, fields } = req.body;

    // Generate SQL query from user input
    let query = `CREATE TABLE ${tableName} (`;
    fields.forEach((field, index) => {
        query += `${field.name} ${field.type}`;
        if (index < fields.length - 1) query += ', ';
    });
    query += ');';

    // Execute query
    db.query(query, (err) => {
        if (err) {
            console.error('Error creating table:', err);
            return res.status(500).send('Error creating table');
        }

        // Fetch all table names to return as response
        db.query('SHOW TABLES', (err, tables) => {
            if (err) {
                return res.status(500).send('Error fetching tables');
            }
            res.json(tables); // Send list of tables as response
        });
    });
});

// Endpoint to fetch table data and column names
app.get('/get-table-data', (req, res) => {
    const tableName = req.query.tableName; // Table name passed as a query parameter

    // Query to get column names and table data
    const query = `SELECT * FROM ${tableName}`;
    const columnQuery = `SHOW COLUMNS FROM ${tableName}`;

    db.query(columnQuery, (err, columns) => {
        if (err) {
            console.error('Error fetching columns:', err);
            return res.status(500).send('Error fetching columns');
        }

        db.query(query, (err, rows) => {
            if (err) {
                console.error('Error fetching table data:', err);
                return res.status(500).send('Error fetching table data');
            }

            res.json({ columns, rows });
        });
    });
});

// Endpoint to add a new row to a table
app.post('/add-row', (req, res) => {
    const { tableName, rowData } = req.body;

    // Generate placeholders for the query
    const columns = Object.keys(rowData).join(', ');
    const placeholders = Object.keys(rowData).map(() => '?').join(', ');

    const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;

    db.query(query, Object.values(rowData), (err, result) => {
        if (err) {
            console.error('Error adding row:', err);
            return res.status(500).send('Error adding row');
        }

        res.json({ message: 'Row added successfully', result });
    });
});

// Endpoint to delete a row by ID
app.delete('/delete-row', (req, res) => {
    const { tableName, rowId, idColumn } = req.body; // Expecting table name, row ID, and the name of the ID column

    const query = `DELETE FROM ${tableName} WHERE ${idColumn} = ?`;

    db.query(query, [rowId], (err, result) => {
        if (err) {
            console.error('Error deleting row:', err);
            return res.status(500).send('Error deleting row');
        }

        res.json({ message: 'Row deleted successfully', result });
    });
});




// Start the server
app.listen(3300, () => {
    console.log('Server is running on http://localhost:3300');
});
