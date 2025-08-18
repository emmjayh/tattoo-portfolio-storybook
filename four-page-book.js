// Four-Page Book System - All pages pre-rendered
class FourPageBook {
    constructor() {
        this.currentSpread = 0;
        this.totalPages = 18;
        this.isAnimating = false;
        this.hoverTimeout = null;
        this.hoverDelay = 1000;
        this.pages = [];
        
        this.init();
    }
    
    async init() {
        // Cache DOM elements
        this.book = document.getElementById('book');
        this.pageCounter = document.getElementById('currentPageNum');
        this.hoverLeft = document.getElementById('hoverLeft');
        this.hoverRight = document.getElementById('hoverRight');
        
        // Create the 4 page structure
        this.createPageStructure();
        
        // Load content
        await this.loadImagesFromServer();
        this.loadPages();
        
        // Initialize pages
        this.updateAllPages();
        
        // Bind events
        this.bindEvents();
    }
    
    createPageStructure() {
        // Clear book content
        this.book.innerHTML = '';
        
        // Create 4 pages:
        // Page 1: Left visible page
        this.leftPage = document.createElement('div');
        this.leftPage.className = 'page left-page';
        this.leftPage.style.cssText = 'position: absolute; left: 0; width: 50%; height: 100%; background: #fdfdf8; z-index: 10;';
        this.book.appendChild(this.leftPage);
        
        // Page 2: Right visible page (will flip)
        this.rightPage = document.createElement('div');
        this.rightPage.className = 'page right-page flippable';
        this.rightPage.style.cssText = 'position: absolute; right: 0; width: 50%; height: 100%; background: #fdfdf8; transform-origin: left center; transform-style: preserve-3d; z-index: 20; transition: none;';
        this.book.appendChild(this.rightPage);
        
        // Front of right page
        this.rightPageFront = document.createElement('div');
        this.rightPageFront.style.cssText = 'position: absolute; width: 100%; height: 100%; background: #fdfdf8; backface-visibility: hidden;';
        this.rightPage.appendChild(this.rightPageFront);
        
        // Back of right page (shows page 3 content when flipped)
        this.rightPageBack = document.createElement('div');
        this.rightPageBack.style.cssText = 'position: absolute; width: 100%; height: 100%; background: #f0f0e8; backface-visibility: hidden; transform: rotateY(180deg);';
        this.rightPage.appendChild(this.rightPageBack);
        
        // Page 3: Hidden behind right page (revealed when right flips)
        this.behindRightPage = document.createElement('div');
        this.behindRightPage.className = 'page behind-right';
        this.behindRightPage.style.cssText = 'position: absolute; right: 0; width: 50%; height: 100%; background: #fdfdf8; z-index: 5;';
        this.book.appendChild(this.behindRightPage);
        
        // Page 4: Hidden behind left page (for backward flips)
        this.behindLeftPage = document.createElement('div');
        this.behindLeftPage.className = 'page behind-left';
        this.behindLeftPage.style.cssText = 'position: absolute; left: 0; width: 50%; height: 100%; background: #fdfdf8; z-index: 5;';
        this.book.appendChild(this.behindLeftPage);
        
        // Add hover zones
        this.book.appendChild(this.hoverLeft);
        this.book.appendChild(this.hoverRight);
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
    
    loadPages() {
        this.pages = [];
        
        // Cover page
        this.pages.push({
            pageNum: 1,
            content: `
                <div class="page-inner" style="background: #fdfdf8; padding: 80px;">
                    <div class="page-header">
                        <h1 class="portfolio-title">Ink Stories</h1>
                        <p class="portfolio-subtitle">Tattoo Artistry Portfolio</p>
                    </div>
                    <div class="welcome-content">
                        <p>Welcome to my collection of body art.</p>
                        <p>Each piece tells a unique story, crafted with passion and precision.</p>
                        <p class="instruction">← Hover over the page edges to turn →</p>
                    </div>
                </div>
            `
        });
        
        // Gallery pages from templates
        const templates = document.querySelectorAll('.page-template');
        let pageNum = 2;
        
        templates.forEach(template => {
            if (template.dataset.page === 'contact') {
                return;
            }
            
            const img = template.querySelector('img');
            const h3 = template.querySelector('h3');
            const p = template.querySelector('p');
            
            this.pages.push({
                pageNum: pageNum,
                content: `
                    <div class="page-inner" style="background: #fdfdf8; padding: 80px;">
                        <div class="gallery-content">
                            ${img ? img.outerHTML : ''}
                            <div class="gallery-info">
                                <h3>${h3 ? h3.textContent : ''}</h3>
                                <p>${p ? p.textContent : ''}</p>
                            </div>
                        </div>
                    </div>
                `
            });
            pageNum++;
        });
        
        // Contact page
        const contactTemplate = document.querySelector('.page-template[data-page="contact"]');
        if (contactTemplate) {
            this.pages.push({
                pageNum: pageNum,
                content: `<div class="page-inner" style="background: #fdfdf8; padding: 80px;">${contactTemplate.innerHTML}</div>`
            });
        }
        
        // Add blank pages if needed
        while (this.pages.length < 4) {
            this.pages.push({
                pageNum: this.pages.length + 1,
                content: '<div class="page-inner blank-page" style="background: #fdfdf8;"></div>'
            });
        }
        
        this.totalPages = this.pages.length;
    }
    
    updateAllPages() {
        // Calculate which 4 pages we need
        const spread = this.currentSpread;
        const leftIndex = spread * 2;
        const rightIndex = spread * 2 + 1;
        const nextLeftIndex = (spread + 1) * 2;  // This is page 3 (next left page)
        const nextRightIndex = (spread + 1) * 2 + 1;  // This is page 4 (next right page)
        const prevRightIndex = Math.max(0, (spread - 1) * 2 + 1);
        
        // Update left page (Page 1)
        this.leftPage.innerHTML = leftIndex < this.pages.length && leftIndex >= 0
            ? this.pages[leftIndex].content
            : '<div class="page-inner blank-page" style="background: #fdfdf8;"></div>';
        
        // Update right page front (Page 2 front)
        this.rightPageFront.innerHTML = rightIndex < this.pages.length
            ? this.pages[rightIndex].content
            : '<div class="page-inner blank-page" style="background: #fdfdf8;"></div>';
        
        // Update right page back (shows page 3 when flipped)
        this.rightPageBack.innerHTML = nextLeftIndex < this.pages.length
            ? this.pages[nextLeftIndex].content
            : '<div class="page-inner blank-page" style="background: #f0f0e8;"></div>';
        
        // Update behind-right page (Page 3 - revealed when right flips)
        this.behindRightPage.innerHTML = nextLeftIndex < this.pages.length
            ? this.pages[nextLeftIndex].content
            : '<div class="page-inner blank-page" style="background: #fdfdf8;"></div>';
        
        // Update behind-left page (for backward flips - previous right page)
        this.behindLeftPage.innerHTML = prevRightIndex >= 0
            ? this.pages[prevRightIndex].content
            : '<div class="page-inner blank-page" style="background: #fdfdf8;"></div>';
        
        this.updateCounter();
    }
    
    turnPage(direction) {
        if (this.isAnimating) return;
        
        const maxSpreads = Math.ceil(this.totalPages / 2);
        
        if (direction === 'prev' && this.currentSpread === 0) return;
        if (direction === 'next' && this.currentSpread >= maxSpreads - 1) return;
        
        this.isAnimating = true;
        
        if (direction === 'next') {
            // Update spread FIRST
            this.currentSpread++;
            
            // Update all 4 pages BEFORE animation starts
            this.updateAllPages();
            
            // Now the behind-right page has the correct content
            // Flip the OLD right page (which is now on top)
            // We need to temporarily show the old content on the flipping page
            const oldRightIndex = (this.currentSpread - 1) * 2 + 1;
            const oldRightContent = oldRightIndex < this.pages.length 
                ? this.pages[oldRightIndex].content 
                : '<div class="page-inner blank-page" style="background: #fdfdf8;"></div>';
            
            // Set the right page to show the OLD content for flipping
            this.rightPageFront.innerHTML = oldRightContent;
            
            // Forward flip - flip the right page to the left
            this.rightPage.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            this.rightPage.style.transform = 'rotateY(-180deg)';
            
            setTimeout(() => {
                // After flip completes, reset for next flip
                this.rightPage.style.transition = 'none';
                this.rightPage.style.transform = 'rotateY(0deg)';
                // Update to show current content
                this.updateAllPages();
                this.isAnimating = false;
            }, 800);
            
        } else {
            // Backward flip
            // Get the old left content before updating
            const oldLeftIndex = this.currentSpread * 2;
            const oldLeftContent = oldLeftIndex < this.pages.length 
                ? this.pages[oldLeftIndex].content 
                : '<div class="page-inner blank-page" style="background: #fdfdf8;"></div>';
            
            // Update spread
            this.currentSpread--;
            
            // Update all pages BEFORE animation
            this.updateAllPages();
            
            // Create flipping element for the old left page
            const leftFlip = document.createElement('div');
            leftFlip.className = 'page left-flip';
            leftFlip.style.cssText = 'position: absolute; left: 0; width: 50%; height: 100%; transform-origin: right center; transform-style: preserve-3d; z-index: 30; transform: rotateY(0deg);';
            
            // Front of left flip (OLD left content)
            const leftFlipFront = document.createElement('div');
            leftFlipFront.style.cssText = 'position: absolute; width: 100%; height: 100%; background: #fdfdf8; backface-visibility: hidden;';
            leftFlipFront.innerHTML = oldLeftContent;
            leftFlip.appendChild(leftFlipFront);
            
            // Back of left flip (new right page that will be revealed)
            const newRightIndex = this.currentSpread * 2 + 1;
            const newRightContent = newRightIndex < this.pages.length
                ? this.pages[newRightIndex].content
                : '<div class="page-inner blank-page" style="background: #f0f0e8;"></div>';
            
            const leftFlipBack = document.createElement('div');
            leftFlipBack.style.cssText = 'position: absolute; width: 100%; height: 100%; background: #f0f0e8; backface-visibility: hidden; transform: rotateY(180deg);';
            leftFlipBack.innerHTML = newRightContent;
            leftFlip.appendChild(leftFlipBack);
            
            this.book.appendChild(leftFlip);
            
            // Animate
            requestAnimationFrame(() => {
                leftFlip.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                leftFlip.style.transform = 'rotateY(180deg)';
                
                setTimeout(() => {
                    // After flip completes, remove the flip element
                    this.book.removeChild(leftFlip);
                    this.isAnimating = false;
                }, 800);
            });
        }
    }
    
    updateCounter() {
        if (this.currentSpread === 0) {
            this.pageCounter.textContent = 'Cover';
        } else {
            const leftNum = this.currentSpread * 2 + 1;
            const rightNum = this.currentSpread * 2 + 2;
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
const gallery = new FourPageBook();