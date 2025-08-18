// Book Spread View - Proper left/right page display
class BookSpread {
    constructor() {
        this.currentSpread = 0; // Which spread (pair of pages) we're viewing
        this.pages = [];
        this.isAnimating = false;
        this.hoverTimeout = null;
        this.hoverDelay = 1000;
        
        this.init();
    }
    
    async init() {
        // Get DOM elements
        this.book = document.getElementById('book');
        this.pageCounter = document.getElementById('currentPageNum');
        this.hoverLeft = document.getElementById('hoverLeft');
        this.hoverRight = document.getElementById('hoverRight');
        
        // Load content
        await this.loadImagesFromServer();
        this.loadPageContent();
        
        // Setup book structure
        this.setupBook();
        
        // Show initial spread
        this.showSpread(0);
        
        // Bind events
        this.bindEvents();
    }
    
    async loadImagesFromServer() {
        try {
            const response = await fetch('/api/images');
            const data = await response.json();
            
            if (data.images && data.images.length > 0) {
                const hiddenContent = document.getElementById('hidden-content');
                const contactTemplate = hiddenContent.querySelector('[data-page="contact"]');
                
                hiddenContent.innerHTML = '';
                
                data.images.forEach((image) => {
                    const template = document.createElement('div');
                    template.className = 'page-template gallery-template';
                    template.setAttribute('data-page', 'gallery');
                    template.innerHTML = `
                        <img src="${image.path}" alt="${image.displayName}">
                        <h3>${image.displayName}</h3>
                        <p></p>
                    `;
                    hiddenContent.appendChild(template);
                });
                
                if (contactTemplate) {
                    hiddenContent.appendChild(contactTemplate);
                }
            }
        } catch (error) {
            console.warn('Failed to load images from server:', error);
        }
    }
    
    loadPageContent() {
        this.pages = [];
        
        // Blank left page for cover
        this.pages.push({
            content: '<div class="blank-page"></div>'
        });
        
        // Cover page (right side)
        this.pages.push({
            content: `
                <div class="page-content" style="padding: 80px; text-align: center;">
                    <h1 class="portfolio-title">Ink Stories</h1>
                    <p class="portfolio-subtitle">Tattoo Artistry Portfolio</p>
                    <p class="instruction">← Hover over the page edges to turn →</p>
                </div>
            `
        });
        
        // Gallery pages
        const templates = document.querySelectorAll('.page-template');
        templates.forEach(template => {
            const img = template.querySelector('img');
            const h3 = template.querySelector('h3');
            const p = template.querySelector('p');
            
            this.pages.push({
                content: `
                    <div class="gallery-content" style="padding: 80px;">
                        ${img ? img.outerHTML : ''}
                        <div class="gallery-info">
                            <h3>${h3 ? h3.textContent : ''}</h3>
                            <p>${p ? p.textContent : ''}</p>
                        </div>
                    </div>
                `
            });
        });
        
        // Ensure even number of pages
        if (this.pages.length % 2 !== 0) {
            this.pages.push({
                content: '<div class="blank-page"></div>'
            });
        }
    }
    
    setupBook() {
        // Clear book
        this.book.innerHTML = '';
        
        // Create left page
        this.leftPage = document.createElement('div');
        this.leftPage.style.cssText = `
            position: absolute;
            left: 0;
            width: 50%;
            height: 100%;
            background: #fdfdf8;
            z-index: 10;
            overflow: hidden;
        `;
        this.book.appendChild(this.leftPage);
        
        // Create right page (this will flip)
        this.rightPage = document.createElement('div');
        this.rightPage.style.cssText = `
            position: absolute;
            right: 0;
            width: 50%;
            height: 100%;
            transform-origin: left center;
            transform-style: preserve-3d;
            z-index: 20;
        `;
        this.book.appendChild(this.rightPage);
        
        // Right page front
        this.rightPageFront = document.createElement('div');
        this.rightPageFront.style.cssText = `
            position: absolute;
            width: 100%;
            height: 100%;
            background: #fdfdf8;
            backface-visibility: hidden;
            overflow: hidden;
        `;
        this.rightPage.appendChild(this.rightPageFront);
        
        // Right page back
        this.rightPageBack = document.createElement('div');
        this.rightPageBack.style.cssText = `
            position: absolute;
            width: 100%;
            height: 100%;
            background: #f0f0e8;
            backface-visibility: hidden;
            transform: rotateY(180deg);
            overflow: hidden;
        `;
        this.rightPage.appendChild(this.rightPageBack);
        
        // Hidden next right page (revealed after flip)
        this.nextRightPage = document.createElement('div');
        this.nextRightPage.style.cssText = `
            position: absolute;
            right: 0;
            width: 50%;
            height: 100%;
            background: #fdfdf8;
            z-index: 5;
            overflow: hidden;
        `;
        this.book.appendChild(this.nextRightPage);
        
        // Add hover zones
        this.book.appendChild(this.hoverLeft);
        this.book.appendChild(this.hoverRight);
    }
    
    showSpread(spreadIndex) {
        const leftIndex = spreadIndex * 2;
        const rightIndex = spreadIndex * 2 + 1;
        const nextLeftIndex = (spreadIndex + 1) * 2;
        const nextRightIndex = (spreadIndex + 1) * 2 + 1;
        
        // Set left page
        this.leftPage.innerHTML = leftIndex < this.pages.length 
            ? this.pages[leftIndex].content 
            : '<div class="blank-page"></div>';
        
        // Set right page front
        this.rightPageFront.innerHTML = rightIndex < this.pages.length
            ? this.pages[rightIndex].content
            : '<div class="blank-page"></div>';
        
        // Set right page back (next left page)
        this.rightPageBack.innerHTML = nextLeftIndex < this.pages.length
            ? this.pages[nextLeftIndex].content
            : '<div class="blank-page"></div>';
        
        // Set hidden next right page
        this.nextRightPage.innerHTML = nextRightIndex < this.pages.length
            ? this.pages[nextRightIndex].content
            : '<div class="blank-page"></div>';
        
        this.updateCounter();
    }
    
    turnPage(direction) {
        if (this.isAnimating) return;
        
        const maxSpreads = Math.ceil(this.pages.length / 2);
        
        if (direction === 'next' && this.currentSpread >= maxSpreads - 1) return;
        if (direction === 'prev' && this.currentSpread <= 0) return;
        
        this.isAnimating = true;
        
        if (direction === 'next') {
            // Flip right page to left
            this.rightPage.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            this.rightPage.style.transform = 'rotateY(-180deg)';
            
            setTimeout(() => {
                // Update spread
                this.currentSpread++;
                
                // Reset and update pages
                this.rightPage.style.transition = 'none';
                this.rightPage.style.transform = 'rotateY(0deg)';
                this.showSpread(this.currentSpread);
                
                this.isAnimating = false;
            }, 800);
            
        } else {
            // For going back, we need to flip from left
            // Create a temporary flip element
            const flipPage = document.createElement('div');
            flipPage.style.cssText = `
                position: absolute;
                left: 0;
                width: 50%;
                height: 100%;
                transform-origin: right center;
                transform-style: preserve-3d;
                z-index: 30;
            `;
            
            // Get previous pages
            const prevLeftIndex = (this.currentSpread - 1) * 2;
            const prevRightIndex = (this.currentSpread - 1) * 2 + 1;
            
            // Front (current left)
            const flipFront = document.createElement('div');
            flipFront.style.cssText = `
                position: absolute;
                width: 100%;
                height: 100%;
                background: #fdfdf8;
                backface-visibility: hidden;
            `;
            flipFront.innerHTML = this.leftPage.innerHTML;
            flipPage.appendChild(flipFront);
            
            // Back (previous right)
            const flipBack = document.createElement('div');
            flipBack.style.cssText = `
                position: absolute;
                width: 100%;
                height: 100%;
                background: #f0f0e8;
                backface-visibility: hidden;
                transform: rotateY(180deg);
            `;
            flipBack.innerHTML = prevRightIndex >= 0 && prevRightIndex < this.pages.length
                ? this.pages[prevRightIndex].content
                : '<div class="blank-page"></div>';
            flipPage.appendChild(flipBack);
            
            this.book.appendChild(flipPage);
            
            // Update underlying pages first
            this.currentSpread--;
            this.showSpread(this.currentSpread);
            
            // Animate flip
            requestAnimationFrame(() => {
                flipPage.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                flipPage.style.transform = 'rotateY(180deg)';
                
                setTimeout(() => {
                    this.book.removeChild(flipPage);
                    this.isAnimating = false;
                }, 800);
            });
        }
    }
    
    updateCounter() {
        const leftNum = this.currentSpread * 2 + 1;
        const rightNum = this.currentSpread * 2 + 2;
        
        if (this.currentSpread === 0) {
            this.pageCounter.textContent = 'Cover';
        } else {
            this.pageCounter.textContent = `Pages ${leftNum}-${rightNum}`;
        }
    }
    
    bindEvents() {
        // Hover with delay
        this.hoverLeft.addEventListener('mouseenter', () => this.startHoverTimer('prev'));
        this.hoverLeft.addEventListener('mouseleave', () => this.cancelHoverTimer());
        
        this.hoverRight.addEventListener('mouseenter', () => this.startHoverTimer('next'));
        this.hoverRight.addEventListener('mouseleave', () => this.cancelHoverTimer());
        
        // Click for instant flip
        this.hoverLeft.addEventListener('click', () => this.turnPage('prev'));
        this.hoverRight.addEventListener('click', () => this.turnPage('next'));
        
        // Keyboard
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.turnPage('prev');
            if (e.key === 'ArrowRight') this.turnPage('next');
        });
    }
    
    startHoverTimer(direction) {
        this.cancelHoverTimer();
        
        if (direction === 'prev') {
            this.hoverLeft.style.background = 'linear-gradient(to right, rgba(214, 2, 112, 0.08), transparent)';
        } else {
            this.hoverRight.style.background = 'linear-gradient(to left, rgba(155, 79, 150, 0.08), transparent)';
        }
        
        this.hoverTimeout = setTimeout(() => {
            this.turnPage(direction);
        }, this.hoverDelay);
    }
    
    cancelHoverTimer() {
        if (this.hoverTimeout) {
            clearTimeout(this.hoverTimeout);
            this.hoverTimeout = null;
        }
        
        this.hoverLeft.style.background = '';
        this.hoverRight.style.background = '';
    }
}

// Initialize
const gallery = new BookSpread();