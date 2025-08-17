// Book Gallery with Proper Page Spreads
class BookGallery {
    constructor() {
        this.currentSpread = 0; // Which spread we're viewing (0 = pages 1-2, 1 = pages 3-4, etc.)
        this.totalPages = 18; // Total individual pages (including cover and back)
        this.isAnimating = false;
        this.hoverTimeout = null;
        this.hoverDelay = 1000; // 1 second hover delay
        this.pages = [];
        
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
        
        // Bind events
        this.bindEvents();
    }
    
    loadPages() {
        // Page 1 - Cover (left side when closed, shows on right when first opened)
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
                <div class="page-number-display">1</div>
            `
        });
        
        // Page 2 - First gallery page
        const templates = document.querySelectorAll('.page-template');
        let pageNum = 2;
        
        templates.forEach(template => {
            if (template.dataset.page === 'contact') {
                // Contact page goes at the end
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
                    <div class="page-number-display">${pageNum}</div>
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
                    <div class="page-number-display">${pageNum}</div>
                `
            });
        }
        
        // Add blank pages if needed to make even number
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
        
        // Touch support
        this.addTouchSupport();
    }
    
    startHoverTimer(direction) {
        this.cancelHoverTimer();
        
        // Visual feedback
        if (direction === 'prev') {
            this.hoverLeft.style.background = 'linear-gradient(to right, rgba(212, 175, 55, 0.06), transparent)';
        } else {
            this.hoverRight.style.background = 'linear-gradient(to left, rgba(212, 175, 55, 0.06), transparent)';
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
            // Turning pages forward (flip right page over to left)
            this.currentSpread++;
            
            // Create two flipping elements for smooth animation
            // First: the current right page that will flip
            this.flippingPage.innerHTML = this.rightPage.innerHTML;
            this.flippingPage.style.display = 'block';
            this.flippingPage.style.right = '0';
            this.flippingPage.style.left = 'auto';
            this.flippingPage.style.width = '50%';
            this.flippingPage.style.transform = 'rotateY(0deg)';
            this.flippingPage.style.transformOrigin = 'left center';
            this.flippingPage.style.zIndex = '100';
            this.flippingPage.classList.add('right-page');
            
            // Update the pages underneath with new content immediately
            const nextLeftContent = this.pages[this.currentSpread * 2] ? this.pages[this.currentSpread * 2].content : '';
            const nextRightContent = this.pages[this.currentSpread * 2 + 1] ? this.pages[this.currentSpread * 2 + 1].content : '';
            
            // Set the new left page content (what the flipping page will become)
            this.leftPage.innerHTML = `<div class="page-inner">${nextLeftContent}</div>`;
            this.leftPage.style.visibility = 'visible';
            
            // Hide right page temporarily
            this.rightPage.style.visibility = 'hidden';
            
            // Animate the flip smoothly
            requestAnimationFrame(() => {
                this.flippingPage.style.transition = 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)';
                this.flippingPage.style.transform = 'rotateY(-180deg)';
                
                // When flip reaches halfway, update right page
                setTimeout(() => {
                    this.rightPage.innerHTML = `<div class="page-inner">${nextRightContent}</div>`;
                    this.rightPage.style.visibility = 'visible';
                }, 500);
                
                // Clean up after animation completes
                setTimeout(() => {
                    this.flippingPage.style.display = 'none';
                    this.flippingPage.style.transform = '';
                    this.flippingPage.style.transition = '';
                    this.flippingPage.classList.remove('right-page');
                    this.updateCounter();
                    this.isAnimating = false;
                }, 1000);
            });
            
        } else {
            // Turning pages backward (flip left page back to right)
            this.currentSpread--;
            
            // Set up the flipping page with current left content
            this.flippingPage.innerHTML = this.leftPage.innerHTML;
            this.flippingPage.style.display = 'block';
            this.flippingPage.style.left = '0';
            this.flippingPage.style.right = 'auto';
            this.flippingPage.style.width = '50%';
            this.flippingPage.style.transform = 'rotateY(-180deg)';
            this.flippingPage.style.transformOrigin = 'right center';
            this.flippingPage.style.zIndex = '100';
            this.flippingPage.classList.add('left-page');
            
            // Update the pages underneath with new content immediately
            const prevLeftContent = this.pages[this.currentSpread * 2] ? this.pages[this.currentSpread * 2].content : '';
            const prevRightContent = this.pages[this.currentSpread * 2 + 1] ? this.pages[this.currentSpread * 2 + 1].content : '';
            
            // Set the new right page content (what the flipping page will become)
            this.rightPage.innerHTML = `<div class="page-inner">${prevRightContent}</div>`;
            this.rightPage.style.visibility = 'visible';
            
            // Hide left page temporarily
            this.leftPage.style.visibility = 'hidden';
            
            // Animate the flip back smoothly
            requestAnimationFrame(() => {
                this.flippingPage.style.transition = 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)';
                this.flippingPage.style.transform = 'rotateY(0deg)';
                
                // When flip reaches halfway, update left page
                setTimeout(() => {
                    this.leftPage.innerHTML = `<div class="page-inner">${prevLeftContent}</div>`;
                    this.leftPage.style.visibility = 'visible';
                }, 500);
                
                // Clean up after animation completes
                setTimeout(() => {
                    this.flippingPage.style.display = 'none';
                    this.flippingPage.style.transform = '';
                    this.flippingPage.style.transition = '';
                    this.flippingPage.classList.remove('left-page');
                    this.updateCounter();
                    this.isAnimating = false;
                }, 1000);
            });
        }
    }
    
    updateSpread() {
        // Calculate which pages to show based on current spread
        const leftPageIndex = this.currentSpread * 2; // Odd pages: 1, 3, 5...
        const rightPageIndex = this.currentSpread * 2 + 1; // Even pages: 2, 4, 6...
        
        // Update left page
        if (leftPageIndex < this.pages.length) {
            this.leftPage.innerHTML = `<div class="page-inner">${this.pages[leftPageIndex].content}</div>`;
            this.leftPage.style.visibility = 'visible';
        } else {
            this.leftPage.innerHTML = '<div class="page-inner blank-page"></div>';
            this.leftPage.style.visibility = 'visible';
        }
        
        // Update right page
        if (rightPageIndex < this.pages.length) {
            this.rightPage.innerHTML = `<div class="page-inner">${this.pages[rightPageIndex].content}</div>`;
            this.rightPage.style.visibility = 'visible';
        } else {
            this.rightPage.innerHTML = '<div class="page-inner blank-page"></div>';
            this.rightPage.style.visibility = 'visible';
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

// Initialize when ready
document.addEventListener('DOMContentLoaded', () => {
    const gallery = new BookGallery();
    
    // Fade in animation
    setTimeout(() => {
        document.querySelector('.fullscreen-book').style.opacity = '1';
    }, 100);
});

// Add initial CSS
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .fullscreen-book {
            opacity: 0;
            transition: opacity 1s ease-in;
        }
        
        /* Page number display */
        .page-number-display {
            position: absolute;
            bottom: 40px;
            font-size: 0.9rem;
            color: #999;
            font-style: italic;
        }
        
        .left-page .page-number-display {
            left: 60px;
        }
        
        .right-page .page-number-display {
            right: 60px;
        }
        
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
    </style>
`);