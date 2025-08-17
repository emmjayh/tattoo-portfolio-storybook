// Book Gallery with Two-Page Spread
class BookGallery {
    constructor() {
        this.currentPage = 0;
        this.totalPages = 10; // Cover + 8 gallery + contact
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
        this.leftStack = document.getElementById('leftStack');
        this.rightStack = document.getElementById('rightStack');
        this.pageCounter = document.getElementById('currentPageNum');
        this.book = document.getElementById('book');
        
        // Load page content
        this.loadPages();
        
        // Initialize both pages with proper content
        this.initializePages();
        
        // Initialize stacks
        this.updateStacks();
        
        // Bind events
        this.bindEvents();
    }
    
    initializePages() {
        // Set up initial page content
        // Right page shows cover/first page
        this.rightPage.innerHTML = `<div class="page-inner">${this.pages[0].content}</div>`;
        // Left page is initially blank (no previous page)
        this.leftPage.innerHTML = '<div class="page-inner"></div>';
    }
    
    loadPages() {
        // Cover page
        this.pages.push({
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
        templates.forEach(template => {
            if (template.dataset.page === 'contact') {
                this.pages.push({
                    type: 'contact',
                    content: template.innerHTML
                });
            } else {
                const img = template.querySelector('img');
                const h3 = template.querySelector('h3');
                const p = template.querySelector('p');
                
                this.pages.push({
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
            }
        });
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
        
        if (direction === 'prev' && this.currentPage === 0) return;
        if (direction === 'next' && this.currentPage >= this.totalPages - 1) return;
        
        this.isAnimating = true;
        
        if (direction === 'next') {
            // Turning page forward
            this.currentPage++;
            
            // Set up the flipping page with current right content
            this.flippingPage.innerHTML = this.rightPage.innerHTML;
            this.flippingPage.style.display = 'block';
            this.flippingPage.style.right = '0';
            this.flippingPage.style.left = 'auto';
            this.flippingPage.style.width = '50%';
            this.flippingPage.style.transformOrigin = 'left center';
            this.flippingPage.classList.add('right-page');
            
            // Update right page with new content immediately but hidden
            this.rightPage.style.visibility = 'hidden';
            this.rightPage.innerHTML = `<div class="page-inner">${this.pages[this.currentPage].content}</div>`;
            
            // Animate the flip
            setTimeout(() => {
                this.flippingPage.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                this.flippingPage.style.transform = 'rotateY(-180deg)';
                
                setTimeout(() => {
                    // Update left page with the content that was just on the right
                    this.leftPage.innerHTML = `<div class="page-inner">${this.getLeftPageContent(this.currentPage)}</div>`;
                    this.rightPage.style.visibility = 'visible';
                    
                    // Clean up
                    this.flippingPage.style.display = 'none';
                    this.flippingPage.style.transform = '';
                    this.flippingPage.style.transition = '';
                    this.flippingPage.classList.remove('right-page');
                    
                    this.isAnimating = false;
                    this.updateStacks();
                    this.updateCounter();
                }, 800);
            }, 50);
            
        } else {
            // Turning page backward
            this.currentPage--;
            
            // Set up the flipping page with current left content
            this.flippingPage.innerHTML = this.leftPage.innerHTML;
            this.flippingPage.style.display = 'block';
            this.flippingPage.style.left = '0';
            this.flippingPage.style.right = 'auto';
            this.flippingPage.style.width = '50%';
            this.flippingPage.style.transform = 'rotateY(-180deg)';
            this.flippingPage.style.transformOrigin = 'right center';
            this.flippingPage.classList.add('left-page');
            
            // Update left page with previous content
            this.leftPage.style.visibility = 'hidden';
            this.leftPage.innerHTML = `<div class="page-inner">${this.getLeftPageContent(this.currentPage)}</div>`;
            
            // Animate the flip back
            setTimeout(() => {
                this.flippingPage.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                this.flippingPage.style.transform = 'rotateY(0deg)';
                
                setTimeout(() => {
                    // Update right page with previous content
                    this.rightPage.innerHTML = `<div class="page-inner">${this.pages[this.currentPage].content}</div>`;
                    this.leftPage.style.visibility = 'visible';
                    
                    // Clean up
                    this.flippingPage.style.display = 'none';
                    this.flippingPage.style.transform = '';
                    this.flippingPage.style.transition = '';
                    this.flippingPage.classList.remove('left-page');
                    
                    this.isAnimating = false;
                    this.updateStacks();
                    this.updateCounter();
                }, 800);
            }, 50);
        }
    }
    
    getLeftPageContent(pageNum) {
        // Return actual previous page content or blank for first page
        if (pageNum <= 0) {
            return ''; // Blank left page at beginning
        }
        
        // Show the previous page's actual content on the left
        const prevPage = this.pages[pageNum - 1];
        if (prevPage) {
            return prevPage.content;
        }
        return '';
    }
    
    updateStacks() {
        // Update left stack (pages read)
        const leftCount = Math.min(this.currentPage, 5);
        let leftHTML = '';
        for (let i = 0; i < leftCount; i++) {
            leftHTML += `<div class="stack-page" style="transform: translateZ(-${i * 3}px) translateX(-${i}px);"></div>`;
        }
        this.leftStack.innerHTML = leftHTML;
        
        // Update right stack (pages remaining)
        const rightCount = Math.min(this.totalPages - this.currentPage - 1, 8);
        let rightHTML = '';
        for (let i = 0; i < rightCount; i++) {
            rightHTML += `<div class="stack-page stack-${i + 1}"></div>`;
        }
        this.rightStack.innerHTML = rightHTML;
    }
    
    updateCounter() {
        if (this.currentPage === 0) {
            this.pageCounter.textContent = 'Cover';
        } else if (this.currentPage === this.totalPages - 1) {
            this.pageCounter.textContent = 'Contact';
        } else {
            this.pageCounter.textContent = `Page ${this.currentPage}`;
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
        
        /* Back page styling */
        .page-back {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        
        .back-page-design {
            text-align: center;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        
        .page-number-back {
            position: absolute;
            top: 40px;
            left: 40px;
            font-size: 0.9rem;
            color: #999;
            font-style: italic;
        }
        
        .decorative-pattern {
            width: 200px;
            height: 200px;
            border: 2px solid rgba(212, 175, 55, 0.1);
            border-radius: 50%;
            position: relative;
        }
        
        .decorative-pattern::before,
        .decorative-pattern::after {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            border: 1px solid rgba(212, 175, 55, 0.05);
            border-radius: 50%;
        }
        
        .decorative-pattern::before {
            transform: scale(0.8);
        }
        
        .decorative-pattern::after {
            transform: scale(0.6);
        }
    </style>
`);