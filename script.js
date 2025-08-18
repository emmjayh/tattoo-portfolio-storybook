// Book Gallery with Proper Page Flipping
class BookGallery {
    constructor() {
        this.currentSpread = 0; // Which spread we're viewing (0 = pages 1-2, 1 = pages 3-4, etc.)
        this.totalPages = 18; // Total individual pages
        this.isAnimating = false;
        this.hoverTimeout = null;
        this.hoverDelay = 1000; // 1 second hover delay
        this.pages = [];
        this.preloadedContent = {}; // Smart content cache
        this.imageCache = new Map(); // Image preload cache
        this.renderedPages = new Map(); // Pre-rendered page HTML cache
        
        this.init();
    }
    
    init() {
        // Cache DOM elements
        this.leftPage = document.getElementById('leftPage');
        this.rightPage = document.getElementById('rightPage');
        this.flippingPage = document.getElementById('flippingPage');
        this.hoverLeft = document.getElementById('hoverLeft');
        this.hoverRight = document.getElementById('hoverRight');
        this.pageCounter = document.getElementById('currentPageNum');
        this.book = document.getElementById('book');
        
        // Load page content
        this.loadPages();
        
        // Initialize both pages with proper content
        this.updateSpread();
        
        // Pre-render all pages for instant switching
        this.prerenderAllPages();
        
        // Preload adjacent pages for smoother transitions
        this.preloadAdjacentPages();
        
        // Bind events
        this.bindEvents();
        
        // Preload images in background (non-blocking)
        this.preloadAllImages().catch(err => {
            console.warn('Image preload failed:', err);
        });
    }
    
    async preloadAllImages() {
        // Extract all image URLs from the templates
        const images = document.querySelectorAll('.page-template img');
        const imagePromises = [];
        
        images.forEach(img => {
            if (img.src) {
                const promise = new Promise((resolve, reject) => {
                    const newImg = new Image();
                    newImg.onload = () => {
                        this.imageCache.set(img.src, newImg);
                        resolve();
                    };
                    newImg.onerror = reject;
                    newImg.src = img.src;
                });
                imagePromises.push(promise);
            }
        });
        
        await Promise.all(imagePromises);
    }
    
    prerenderAllPages() {
        // Pre-render all pages and cache them
        this.pages.forEach((page, index) => {
            const pageElement = document.createElement('div');
            pageElement.className = 'page-inner';
            pageElement.style.background = '#fdfdf8';
            pageElement.innerHTML = page.content;
            this.renderedPages.set(index, pageElement.outerHTML);
        });
    }
    
    loadPages() {
        // Page 1 - Cover
        this.pages.push({
            pageNum: 1,
            type: 'cover',
            content: `
                <div class="page-header">
                    <h1 class="portfolio-title">Ink Stories</h1>
                    <p class="portfolio-subtitle">Tattoo Artistry Portfolio</p>
                </div>
                <div class="welcome-content">
                    <p>Welcome to my collection of body art.</p>
                    <p>Each piece tells a unique story, crafted with passion and precision.</p>
                    <p class="instruction">← Hover over the page edges to turn →</p>
                </div>
            `
        });
        
        // Gallery pages
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
                type: 'gallery',
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
            pageNum++;
        });
        
        // Add contact page
        const contactTemplate = document.querySelector('.page-template[data-page="contact"]');
        if (contactTemplate) {
            this.pages.push({
                pageNum: pageNum,
                type: 'contact',
                content: `
                    ${contactTemplate.innerHTML}
                `
            });
        }
        
        // Add blank pages if needed
        if (this.pages.length % 2 !== 0) {
            this.pages.push({
                pageNum: pageNum + 1,
                type: 'blank',
                content: `<div class="blank-page"></div>`
            });
        }
        
        this.totalPages = this.pages.length;
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
        
        // Scroll wheel support
        let scrollTimeout = null;
        this.book.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            // Debounce scroll events
            if (scrollTimeout) return;
            
            scrollTimeout = setTimeout(() => {
                scrollTimeout = null;
            }, 500);
            
            // Scroll down = next page, scroll up = previous page
            if (e.deltaY > 0) {
                this.turnPage('next');
            } else if (e.deltaY < 0) {
                this.turnPage('prev');
            }
        }, { passive: false });
        
        // Touch support
        this.addTouchSupport();
    }
    
    startHoverTimer(direction) {
        this.cancelHoverTimer();
        
        // Visual feedback
        if (direction === 'prev') {
            this.hoverLeft.style.background = 'linear-gradient(to right, rgba(214, 2, 112, 0.08), transparent)';
        } else {
            this.hoverRight.style.background = 'linear-gradient(to left, rgba(155, 79, 150, 0.08), transparent)';
        }
        
        // Start timer
        this.hoverTimeout = setTimeout(() => {
            this.turnPage(direction);
        }, this.hoverDelay);
    }
    
    cancelHoverTimer() {
        if (this.hoverTimeout) {
            clearTimeout(this.hoverTimeout);
            this.hoverTimeout = null;
        }
        
        // Remove visual feedback
        this.hoverLeft.style.background = '';
        this.hoverRight.style.background = '';
    }
    
    turnPage(direction) {
        if (this.isAnimating) return;
        
        const maxSpreads = Math.ceil(this.totalPages / 2);
        
        if (direction === 'prev' && this.currentSpread === 0) return;
        if (direction === 'next' && this.currentSpread >= maxSpreads - 1) return;
        
        this.isAnimating = true;
        
        if (direction === 'next') {
            // Forward flip: right page flips to left
            const nextLeftIndex = this.currentSpread * 2 + 2;
            const nextRightIndex = this.currentSpread * 2 + 3;
            const nextLeftContent = this.renderedPages.has(nextLeftIndex) 
                ? this.renderedPages.get(nextLeftIndex)
                : (this.pages[nextLeftIndex] ? `<div class="page-inner" style="background: #fdfdf8;">${this.pages[nextLeftIndex].content}</div>` : '<div class="page-inner" style="background: #fdfdf8;"></div>');
            const nextRightContent = this.renderedPages.has(nextRightIndex)
                ? this.renderedPages.get(nextRightIndex)
                : (this.pages[nextRightIndex] ? `<div class="page-inner" style="background: #fdfdf8;">${this.pages[nextRightIndex].content}</div>` : '<div class="page-inner" style="background: #fdfdf8;"></div>');
            
            // Store current right page content BEFORE any changes
            const currentRightHTML = this.rightPage.innerHTML;
            
            // Pre-update the underlying pages immediately (hidden)
            this.leftPage.innerHTML = nextLeftContent;
            this.rightPage.innerHTML = nextRightContent;
            this.leftPage.style.opacity = '0';
            this.rightPage.style.opacity = '0';
            
            // Clone the right page for flipping
            this.flippingPage.innerHTML = `
                ${currentRightHTML}
                <div class="page-back-side" style="background: #f0f0e8;">
                    ${nextLeftContent}
                </div>
            `;
            this.flippingPage.style.display = 'block';
            this.flippingPage.style.right = '0';
            this.flippingPage.style.left = 'auto';
            this.flippingPage.style.width = '50%';
            this.flippingPage.style.transform = 'rotateY(0deg)';
            this.flippingPage.style.transformOrigin = 'left center';
            this.flippingPage.style.zIndex = '100';
            this.flippingPage.style.backgroundColor = '#fdfdf8';
            this.flippingPage.classList.add('right-page');
            
            // Keep original right page visible but underneath
            this.rightPage.style.zIndex = '1';
            
            // Start the flip animation
            requestAnimationFrame(() => {
                this.flippingPage.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                this.flippingPage.style.transform = 'rotateY(-180deg)';
                
                // Show underlying pages halfway through
                setTimeout(() => {
                    this.currentSpread++;
                    this.leftPage.style.opacity = '1';
                    this.rightPage.style.opacity = '1';
                    this.rightPage.style.zIndex = '10';
                }, 400);
                
                // Clean up after animation
                setTimeout(() => {
                    this.leftPage.style.zIndex = '10';
                    this.rightPage.style.zIndex = '10';
                    this.flippingPage.style.display = 'none';
                    this.flippingPage.style.transform = '';
                    this.flippingPage.style.transition = '';
                    this.flippingPage.classList.remove('right-page');
                    this.updateCounter();
                    this.preloadAdjacentPages(); // Preload for next turn
                    this.isAnimating = false;
                }, 800);
            });
            
        } else {
            // Backward flip: left page flips from left to right
            const prevLeftIndex = this.currentSpread * 2 - 2;
            const prevRightIndex = this.currentSpread * 2 - 1;
            const prevLeftContent = this.renderedPages.has(prevLeftIndex)
                ? this.renderedPages.get(prevLeftIndex)
                : (this.pages[prevLeftIndex] ? `<div class="page-inner" style="background: #fdfdf8;">${this.pages[prevLeftIndex].content}</div>` : '<div class="page-inner" style="background: #fdfdf8;"></div>');
            const prevRightContent = this.renderedPages.has(prevRightIndex)
                ? this.renderedPages.get(prevRightIndex)
                : (this.pages[prevRightIndex] ? `<div class="page-inner" style="background: #fdfdf8;">${this.pages[prevRightIndex].content}</div>` : '<div class="page-inner" style="background: #fdfdf8;"></div>');
            
            // Store current left page content BEFORE any changes
            const currentLeftHTML = this.leftPage.innerHTML;
            
            // Pre-update the underlying pages immediately (hidden)
            this.leftPage.innerHTML = prevLeftContent;
            this.rightPage.innerHTML = prevRightContent;
            this.leftPage.style.opacity = '0';
            this.rightPage.style.opacity = '0';
            
            // Set up flipping page as the current left page, starting in normal position
            this.flippingPage.innerHTML = `
                ${currentLeftHTML}
                <div class="page-back-side" style="background: #f0f0e8;">
                    ${prevRightContent}
                </div>
            `;
            this.flippingPage.style.display = 'block';
            this.flippingPage.style.left = '0';
            this.flippingPage.style.right = 'auto';
            this.flippingPage.style.width = '50%';
            this.flippingPage.style.transform = 'rotateY(0deg)';
            this.flippingPage.style.transformOrigin = 'right center';
            this.flippingPage.style.zIndex = '100';
            this.flippingPage.style.backgroundColor = '#fdfdf8';
            this.flippingPage.classList.add('left-page');
            
            // Hide original left page
            this.leftPage.style.opacity = '0';
            
            // Animate the page flipping from left to right
            requestAnimationFrame(() => {
                this.flippingPage.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                this.flippingPage.style.transform = 'rotateY(180deg)';
                
                // Show underlying pages halfway through
                setTimeout(() => {
                    this.currentSpread--;
                    this.leftPage.style.opacity = '1';
                    this.rightPage.style.opacity = '1';
                }, 400);
                
                // Clean up after animation
                setTimeout(() => {
                    this.leftPage.style.zIndex = '10';
                    this.rightPage.style.zIndex = '10';
                    this.flippingPage.style.display = 'none';
                    this.flippingPage.style.transform = '';
                    this.flippingPage.style.transition = '';
                    this.flippingPage.classList.remove('left-page');
                    this.updateCounter();
                    this.preloadAdjacentPages(); // Preload for next turn
                    this.isAnimating = false;
                }, 800);
            });
        }
    }
    
    updateSpread() {
        // Calculate which pages to show
        const leftPageIndex = this.currentSpread * 2;
        const rightPageIndex = this.currentSpread * 2 + 1;
        
        // Update left page - use direct content if cache not ready
        if (leftPageIndex < this.pages.length) {
            const content = this.renderedPages.has(leftPageIndex) 
                ? this.renderedPages.get(leftPageIndex)
                : `<div class="page-inner" style="background: #fdfdf8;">${this.pages[leftPageIndex].content}</div>`;
            this.leftPage.innerHTML = content;
            this.leftPage.style.visibility = 'visible';
            this.leftPage.style.backgroundColor = '#fdfdf8';
            this.leftPage.style.opacity = '1';
            this.leftPage.style.zIndex = '10';
        } else {
            this.leftPage.innerHTML = '<div class="page-inner blank-page" style="background: #fdfdf8;"></div>';
            this.leftPage.style.visibility = 'visible';
            this.leftPage.style.backgroundColor = '#fdfdf8';
            this.leftPage.style.opacity = '1';
        }
        
        // Update right page - use direct content if cache not ready
        if (rightPageIndex < this.pages.length) {
            const content = this.renderedPages.has(rightPageIndex)
                ? this.renderedPages.get(rightPageIndex)
                : `<div class="page-inner" style="background: #fdfdf8;">${this.pages[rightPageIndex].content}</div>`;
            this.rightPage.innerHTML = content;
            this.rightPage.style.visibility = 'visible';
            this.rightPage.style.backgroundColor = '#fdfdf8';
            this.rightPage.style.opacity = '1';
            this.rightPage.style.zIndex = '10';
        } else {
            this.rightPage.innerHTML = '<div class="page-inner blank-page" style="background: #fdfdf8;"></div>';
            this.rightPage.style.visibility = 'visible';
            this.rightPage.style.backgroundColor = '#fdfdf8';
            this.rightPage.style.opacity = '1';
        }
        
        // Update page counter
        this.updateCounter();
    }
    
    updateCounter() {
        const leftPage = this.currentSpread * 2 + 1;
        const rightPage = this.currentSpread * 2 + 2;
        
        if (this.currentSpread === 0 && leftPage === 1) {
            this.pageCounter.textContent = 'Cover';
        } else {
            this.pageCounter.textContent = `Pages ${leftPage}-${rightPage}`;
        }
    }
    
    preloadAdjacentPages() {
        // Preload next and previous pages for smoother transitions
        const maxSpreads = Math.ceil(this.totalPages / 2);
        
        // Preload next spread
        if (this.currentSpread < maxSpreads - 1) {
            const nextLeftIndex = (this.currentSpread + 1) * 2;
            const nextRightIndex = (this.currentSpread + 1) * 2 + 1;
            
            if (this.pages[nextLeftIndex]) {
                this.preloadedContent[`left-${nextLeftIndex}`] = this.pages[nextLeftIndex].content;
            }
            if (this.pages[nextRightIndex]) {
                this.preloadedContent[`right-${nextRightIndex}`] = this.pages[nextRightIndex].content;
            }
        }
        
        // Preload previous spread
        if (this.currentSpread > 0) {
            const prevLeftIndex = (this.currentSpread - 1) * 2;
            const prevRightIndex = (this.currentSpread - 1) * 2 + 1;
            
            if (this.pages[prevLeftIndex]) {
                this.preloadedContent[`left-${prevLeftIndex}`] = this.pages[prevLeftIndex].content;
            }
            if (this.pages[prevRightIndex]) {
                this.preloadedContent[`right-${prevRightIndex}`] = this.pages[prevRightIndex].content;
            }
        }
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

// Initialize immediately when script loads
const gallery = new BookGallery();

// Add initial CSS
document.head.insertAdjacentHTML('beforeend', `
    <style>
        /* Blank page */
        .blank-page {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ddd;
            font-style: italic;
        }
        
        /* Ensure pages are opaque */
        .flipping-page {
            background: #fdfdf8;
        }
        
        .flipping-page .page-inner {
            backface-visibility: hidden;
        }
        
        .flipping-page .page-back-side {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #f0f0e8 0%, #e8e8e0 100%);
            transform: rotateY(180deg);
            backface-visibility: hidden;
            padding: 80px;
        }
    </style>
`);