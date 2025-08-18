const fs = require('fs');
const path = require('path');

// API endpoint to get all images from the images folder
function getImages(req, res) {
    const imagesDir = path.join(__dirname, '..', 'images');
    
    try {
        // Read all files from images directory
        const files = fs.readdirSync(imagesDir);
        
        // Filter for image files and sort by number prefix
        const imageFiles = files
            .filter(file => {
                const ext = path.extname(file).toLowerCase();
                return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
            })
            .sort((a, b) => {
                // Extract numbers from filenames for sorting
                const numA = parseInt(a.split('_')[0]) || 9999;
                const numB = parseInt(b.split('_')[0]) || 9999;
                return numA - numB;
            })
            .map(file => {
                // Remove number prefix and underscores for display name
                let displayName = file;
                
                // Remove number prefix (e.g., "1_" or "123_")
                displayName = displayName.replace(/^\d+_/, '');
                
                // Remove file extension
                displayName = displayName.replace(/\.[^/.]+$/, '');
                
                // Replace underscores with spaces
                displayName = displayName.replace(/_/g, ' ');
                
                return {
                    filename: file,
                    displayName: displayName,
                    path: `/images/${file}`
                };
            });
        
        res.json({ images: imageFiles });
    } catch (error) {
        console.error('Error reading images directory:', error);
        res.status(500).json({ error: 'Failed to load images' });
    }
}

module.exports = getImages;