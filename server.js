const express = require('express');
const path = require('path');
const getImages = require('./api/images');

const app = express();
const PORT = process.env.PORT || 3000;

// API endpoint for getting images - MUST come before static files
app.get('/api/images', getImages);

// Serve static files from the current directory
app.use(express.static(__dirname));

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle 404 - redirect to home
app.get('*', (req, res) => {
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to view the portfolio`);
});