# Tattoo Portfolio - Storybook Gallery

A beautiful, interactive tattoo portfolio website featuring a storybook-style gallery with page-flipping animations.

## Features

- 📖 **Storybook Gallery**: Realistic page-flip animations with 3D transforms
- 🎮 **Multiple Navigation Options**: Arrows, hover zones, keyboard, and touch/swipe support
- ⏱️ **Smart Hover Delay**: 1.5-second hover delay prevents accidental page flips
- 📱 **Fully Responsive**: Works perfectly on desktop, tablet, and mobile devices
- 🎨 **Elegant Design**: Gold accents with dark theme for a premium look

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open your browser and visit `http://localhost:3000`

## Deployment

### Deploy to Railway

1. Fork or push this repository to your GitHub account

2. Visit [Railway](https://railway.app) and sign in with GitHub

3. Click "New Project" → "Deploy from GitHub repo"

4. Select this repository

5. Railway will automatically detect the Node.js app and deploy it

6. Once deployed, Railway will provide you with a URL for your live site

### Alternative: Deploy with Railway CLI

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login to Railway:
```bash
railway login
```

3. Initialize and deploy:
```bash
railway link
railway up
```

## Customization

### Adding Your Own Images

Replace the placeholder images in `index.html` with your actual tattoo portfolio images:

```html
<img src="your-image-url-here.jpg" alt="Tattoo description">
```

### Modifying Styles

- Colors and theme: Edit `styles.css`
- Animation timing: Adjust transition durations in CSS
- Hover delay: Change `hoverDelay` value in `script.js` (default: 1500ms)

### Adding More Pages

1. Add new page divs in `index.html` following the existing pattern
2. Update `totalPages` in `script.js`
3. Add your content to each new page

## Technologies Used

- HTML5
- CSS3 (with 3D transforms and animations)
- Vanilla JavaScript
- Express.js (for serving static files)

## Navigation Controls

- **Arrow Buttons**: Click to flip pages instantly
- **Hover Zones**: Hover on left/right sides for 1.5 seconds
- **Keyboard**: Use arrow keys or press 1-6 for specific pages
- **Touch**: Swipe left/right on mobile devices

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT License - feel free to use this for your portfolio!

## Support

For issues or questions, please open an issue on GitHub.