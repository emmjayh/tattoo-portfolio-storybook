// Fullscreen Book Gallery
class FullscreenBookGallery {
    constructor() {
        this.currentSpread = 0; // 0 = cover, 1 = pages 2-3, 2 = pages 4-5, etc.
        this.totalSpreads = 5; // Cover + 4 spreads of content + contact
        this.isAnimating = false;
        this.hoverTimeout = null;
        this.hoverDelay = 1200; // 1.2 seconds hover delay
        this.pageData = [];
        
        this.init();
    }
    
    init() {
        // Cache DOM elements
        this.leftPage = document.getElementById('leftPage');
        this.rightPage = document.getElementById('rightPage');
        this.hoverLeft = document.getElementById('hoverLeft');
        this.hoverRight = document.getElementById('hoverRight');
        this.leftStack = document.getElementById('leftStack');
        this.rightStack = document.getElementById('rightStack');
        
        // Load page data
        this.loadPageData();
        
        // Update stack visualization
        this.updateStacks();
        
        // Bind events
        this.bindEvents();
    }
    
    loadPageData() {
        // Collect all page data from hidden pages
        const pages = document.querySelectorAll('.page-data');
        pages.forEach(page => {
            const pageNum = page.dataset.page;
            const img = page.querySelector('img');
            const h3 = page.querySelector('h3');
            const p = page.querySelector('p');
            
            if (pageNum === 'contact') {
                this.pageData.push({
                    type: 'contact',
                    content: page.querySelector('.contact-page').innerHTML
                });
            } else {
                this.pageData.push({
                    type: 'gallery',
                    img: img ? img.outerHTML : '',
                    title: h3 ? h3.textContent : '',
                    description: p ? p.textContent : '',
                    pageNum: pageNum
                });
            }
        });
    }
    
    bindEvents() {
        // Hover zones with delay
        this.hoverLeft.addEventListener('mouseenter', () => this.startHoverTimer('prev'));
        this.hoverLeft.addEventListener('mouseleave', () => this.cancelHoverTimer());
        
        this.hoverRight.addEventListener('mouseenter', () => this.startHoverTimer('next'));
        this.hoverRight.addEventListener('mouseleave', () => this.cancelHoverTimer());
        
        // Click for instant page turn
        this.hoverLeft.addEventListener('click', () => this.previousPage());
        this.hoverRight.addEventListener('click', () => this.nextPage());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Touch/swipe support
        this.addTouchSupport();
    }
    
    startHoverTimer(direction) {
        // Clear any existing timer
        this.cancelHoverTimer();
        
        // Visual feedback
        if (direction === 'prev') {
            this.hoverLeft.style.background = 'linear-gradient(to right, rgba(212, 175, 55, 0.08), transparent)';
        } else {
            this.hoverRight.style.background = 'linear-gradient(to left, rgba(212, 175, 55, 0.08), transparent)';
        }
        
        // Start timer for page flip
        this.hoverTimeout = setTimeout(() => {
            if (direction === 'prev') {
                this.previousPage();
            } else {
                this.nextPage();
            }
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
    
    previousPage() {
        if (this.isAnimating || this.currentSpread === 0) return;
        
        this.isAnimating = true;
        this.currentSpread--;
        
        // Animate right page turning back
        this.rightPage.classList.add('page-turning-back');
        
        setTimeout(() => {
            this.updatePageContent();
            this.rightPage.classList.remove('page-turning-back');
            
            // Update stacks
            this.updateStacks();
            
            setTimeout(() => {
                this.isAnimating = false;
            }, 100);
        }, 600);
    }
    
    nextPage() {
        if (this.isAnimating || this.currentSpread >= this.totalSpreads - 1) return;
        
        this.isAnimating = true;
        
        // Animate right page turning forward
        this.rightPage.classList.add('page-turning');
        
        setTimeout(() => {
            this.currentSpread++;
            this.updatePageContent();
            this.rightPage.classList.remove('page-turning');
            
            // Update stacks
            this.updateStacks();
            
            setTimeout(() => {
                this.isAnimating = false;
            }, 100);
        }, 600);
    }
    
    updatePageContent() {
        // Update left page
        if (this.currentSpread === 0) {
            // Cover page on left
            this.leftPage.innerHTML = `
                <div class="page-inner">
                    <div class="page-header">
                        <h1 class="portfolio-title">Ink Stories</h1>
                        <p class="portfolio-subtitle">Tattoo Artistry Portfolio</p>
                    </div>
                    <div class="welcome-content">
                        <p>Welcome to my collection of body art. Each piece tells a unique story, crafted with passion and precision.</p>
                        <p class="instruction">Hover over the page edges to turn →</p>
                    </div>
                    <div class="page-number">Cover</div>
                </div>
            `;
        } else {
            // Content pages on left (even numbers)
            const leftPageIndex = (this.currentSpread - 1) * 2;
            if (leftPageIndex < this.pageData.length) {
                const pageInfo = this.pageData[leftPageIndex];
                if (pageInfo.type === 'gallery') {
                    this.leftPage.innerHTML = `
                        <div class="page-inner">
                            <div class="page-content">
                                ${pageInfo.img}
                                <div class="page-info">
                                    <h3>${pageInfo.title}</h3>
                                    <p>${pageInfo.description}</p>
                                </div>
                            </div>
                            <div class="page-number">${leftPageIndex + 2}</div>
                        </div>
                    `;
                }
            }
        }
        
        // Update right page
        if (this.currentSpread === 0) {
            // First tattoo on right when showing cover
            const pageInfo = this.pageData[0];
            this.rightPage.innerHTML = `
                <div class="page-inner">
                    <div class="page-content">
                        ${pageInfo.img}
                        <div class="page-info">
                            <h3>${pageInfo.title}</h3>
                            <p>${pageInfo.description}</p>
                        </div>
                    </div>
                    <div class="page-number">1</div>
                </div>
            `;
        } else {
            // Content pages on right (odd numbers)
            const rightPageIndex = (this.currentSpread - 1) * 2 + 1;
            if (rightPageIndex < this.pageData.length) {
                const pageInfo = this.pageData[rightPageIndex];
                if (pageInfo.type === 'gallery') {
                    this.rightPage.innerHTML = `
                        <div class="page-inner">
                            <div class="page-content">
                                ${pageInfo.img}
                                <div class="page-info">
                                    <h3>${pageInfo.title}</h3>
                                    <p>${pageInfo.description}</p>
                                </div>
                            </div>
                            <div class="page-number">${rightPageIndex + 2}</div>
                        </div>
                    `;
                } else if (pageInfo.type === 'contact') {
                    this.rightPage.innerHTML = `
                        <div class="page-inner">
                            ${pageInfo.content}
                            <div class="page-number">Contact</div>
                        </div>
                    `;
                }
            }
        }
    }
    
    updateStacks() {
        // Update left stack (pages already read)
        const leftStackCount = Math.min(this.currentSpread, 5);
        const leftStackHTML = [];
        for (let i = 0; i < leftStackCount; i++) {
            leftStackHTML.push(`<div class="stack-page stack-${i + 1}"></div>`);
        }
        this.leftStack.innerHTML = leftStackHTML.join('');
        
        // Update right stack (pages remaining)
        const rightStackCount = Math.min(this.totalSpreads - this.currentSpread - 1, 8);
        const rightStackHTML = [];
        for (let i = 0; i < rightStackCount; i++) {
            rightStackHTML.push(`<div class="stack-page stack-${i + 1}"></div>`);
        }
        this.rightStack.innerHTML = rightStackHTML.join('');
    }
    
    handleKeyboard(e) {
        if (e.key === 'ArrowLeft') {
            this.previousPage();
        } else if (e.key === 'ArrowRight') {
            this.nextPage();
        }
    }
    
    addTouchSupport() {
        let touchStartX = 0;
        let touchEndX = 0;
        
        const bookContainer = document.getElementById('bookContainer');
        
        bookContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        bookContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });
        
        const handleSwipe = () => {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    // Swipe left - next page
                    this.nextPage();
                } else {
                    // Swipe right - previous page
                    this.previousPage();
                }
            }
        };
        
        this.handleSwipe = handleSwipe;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const gallery = new FullscreenBookGallery();
    
    // Add initial load animation
    setTimeout(() => {
        document.querySelector('.fullscreen-book').style.opacity = '1';
    }, 100);
});

// Add CSS for initial load
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .fullscreen-book {
            opacity: 0;
            transition: opacity 1.5s ease-in;
        }
    </style>
`);