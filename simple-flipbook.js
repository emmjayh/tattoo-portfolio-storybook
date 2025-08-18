// Simple Flipbook - Stack of double-sided pages
class SimpleFlipbook {
    constructor() {
        this.currentPage = 0;
        this.pages = [];
        this.pageElements = [];
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
        
        // Create the stack of pages
        this.createPageStack();
        
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
        // Load all page content into array
        this.pages = [];
        
        // Cover page
        this.pages.push({
            content: `
                <div class="page-content">
                    <h1 class="portfolio-title">Ink Stories</h1>
                    <p class="portfolio-subtitle">Tattoo Artistry Portfolio</p>
                    <p class="instruction">← Hover over the page edges to turn →</p>
                </div>
            `
        });
        
        // Gallery pages
        const templates = document.querySelectorAll('.page-template');
        templates.forEach(template => {
            if (template.dataset.page === 'contact') {
                this.pages.push({
                    content: template.innerHTML
                });
            } else {
                const img = template.querySelector('img');
                const h3 = template.querySelector('h3');
                const p = template.querySelector('p');
                
                this.pages.push({
                    content: `
                        <div class="gallery-content">
                            ${img ? img.outerHTML : ''}
                            <div class="gallery-info">
                                <h3>${h3 ? h3.textContent : ''}</h3>
                                <p>${p ? p.textContent : ''}</p>
                            </div>
                        </div>
                    `
                });
            }
        });
        
        // Make sure we have an even number of pages
        if (this.pages.length % 2 !== 0) {
            this.pages.push({
                content: '<div class="blank-page"></div>'
            });
        }
    }
    
    createPageStack() {
        // Clear the book
        this.book.innerHTML = '';
        this.pageElements = [];
        
        // Create pages as a stack (each piece of paper has 2 pages)
        for (let i = 0; i < this.pages.length; i += 2) {
            const pageElement = document.createElement('div');
            pageElement.className = 'stacked-page';
            pageElement.style.cssText = `
                position: absolute;
                width: 50%;
                height: 100%;
                right: 0;
                transform-origin: left center;
                transform-style: preserve-3d;
                transition: none;
                z-index: ${Math.floor(this.pages.length/2) - Math.floor(i/2)};
            `;
            
            // Front side (odd page number)
            const front = document.createElement('div');
            front.className = 'page-side front';
            front.style.cssText = `
                position: absolute;
                width: 100%;
                height: 100%;
                background: #fdfdf8;
                backface-visibility: hidden;
                padding: 80px;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            front.innerHTML = this.pages[i].content;
            pageElement.appendChild(front);
            
            // Back side (even page number)
            if (i + 1 < this.pages.length) {
                const back = document.createElement('div');
                back.className = 'page-side back';
                back.style.cssText = `
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    background: #f0f0e8;
                    backface-visibility: hidden;
                    transform: rotateY(180deg);
                    padding: 80px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                `;
                back.innerHTML = this.pages[i + 1].content;
                pageElement.appendChild(back);
            }
            
            this.book.appendChild(pageElement);
            this.pageElements.push(pageElement);
        }
        
        // Add hover zones on top
        this.book.appendChild(this.hoverLeft);
        this.book.appendChild(this.hoverRight);
        
        // Show only the top page initially
        this.updatePageVisibility();
    }
    
    updatePageVisibility() {
        // Calculate which piece of paper is on top
        const currentPaper = Math.floor(this.currentPage / 2);
        
        this.pageElements.forEach((page, index) => {
            if (index < currentPaper) {
                // These pages have been flipped - rotate them and move to left
                page.style.transform = 'rotateY(-180deg)';
                page.style.zIndex = index + 100; // Higher z-index for flipped pages
            } else if (index === currentPaper) {
                // This is the current visible page
                if (this.currentPage % 2 === 0) {
                    // Showing front
                    page.style.transform = 'rotateY(0deg)';
                } else {
                    // Showing back
                    page.style.transform = 'rotateY(-180deg)';
                }
                page.style.zIndex = 200; // Highest z-index for current page
            } else {
                // These pages are still in the stack
                page.style.transform = 'rotateY(0deg)';
                page.style.zIndex = this.pageElements.length - index;
            }
        });
        
        this.updateCounter();
    }
    
    turnPage(direction) {
        if (this.isAnimating) return;
        
        if (direction === 'next' && this.currentPage >= this.pages.length - 1) return;
        if (direction === 'prev' && this.currentPage <= 0) return;
        
        this.isAnimating = true;
        
        const currentPaper = Math.floor(this.currentPage / 2);
        const pageElement = this.pageElements[currentPaper];
        
        if (direction === 'next') {
            if (this.currentPage % 2 === 0) {
                // We're on a front page, flip to see the back
                pageElement.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                pageElement.style.transform = 'rotateY(-180deg)';
                
                setTimeout(() => {
                    this.currentPage++;
                    pageElement.style.transition = 'none';
                    this.updatePageVisibility();
                    this.isAnimating = false;
                }, 800);
            } else {
                // We're on a back page, need to reveal next paper
                // This means the current paper is fully flipped
                this.currentPage++;
                this.updatePageVisibility();
                this.isAnimating = false;
            }
        } else {
            // Previous page
            if (this.currentPage % 2 === 1) {
                // We're on a back page, flip to see the front
                pageElement.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                pageElement.style.transform = 'rotateY(0deg)';
                
                setTimeout(() => {
                    this.currentPage--;
                    pageElement.style.transition = 'none';
                    this.updatePageVisibility();
                    this.isAnimating = false;
                }, 800);
            } else if (this.currentPage > 0) {
                // We're on a front page, need to go to previous paper's back
                this.currentPage--;
                const prevPaper = Math.floor(this.currentPage / 2);
                const prevElement = this.pageElements[prevPaper];
                
                // Animate the previous paper back
                prevElement.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                prevElement.style.transform = 'rotateY(0deg)';
                
                setTimeout(() => {
                    prevElement.style.transition = 'none';
                    this.updatePageVisibility();
                    this.isAnimating = false;
                }, 800);
            }
        }
    }
    
    updateCounter() {
        this.pageCounter.textContent = `Page ${this.currentPage + 1} of ${this.pages.length}`;
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
        
        // Touch support
        this.addTouchSupport();
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
    
    addTouchSupport() {
        let touchStartX = 0;
        let touchEndX = 0;
        
        this.book.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        this.book.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    this.turnPage('next');
                } else {
                    this.turnPage('prev');
                }
            }
        }, { passive: true });
    }
}

// Initialize
const gallery = new SimpleFlipbook();