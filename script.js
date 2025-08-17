// Simple Book Gallery
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
        this.currentPageEl = document.getElementById('currentPage');
        this.hoverLeft = document.getElementById('hoverLeft');
        this.hoverRight = document.getElementById('hoverRight');
        this.leftStack = document.getElementById('leftStack');
        this.rightStack = document.getElementById('rightStack');
        this.pageCounter = document.getElementById('currentPageNum');
        this.book = document.getElementById('book');
        
        // Load page content
        this.loadPages();
        
        // Initialize stacks
        this.updateStacks();
        
        // Bind events
        this.bindEvents();
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
        
        const oldPage = this.currentPageEl;
        const newPage = document.createElement('div');
        newPage.className = 'page';
        newPage.style.visibility = 'hidden';
        
        if (direction === 'next') {
            this.currentPage++;
            
            // Set new page content
            newPage.innerHTML = `<div class="page-inner">${this.pages[this.currentPage].content}</div>`;
            this.book.appendChild(newPage);
            
            // Animate old page flipping away
            oldPage.classList.add('page-flip-right');
            
            setTimeout(() => {
                newPage.style.visibility = 'visible';
                newPage.classList.add('page-flip-left');
                
                setTimeout(() => {
                    oldPage.remove();
                    newPage.classList.remove('page-flip-left');
                    newPage.id = 'currentPage';
                    this.currentPageEl = newPage;
                    this.isAnimating = false;
                    this.updateStacks();
                    this.updateCounter();
                }, 800);
            }, 100);
            
        } else {
            this.currentPage--;
            
            // Set new page content
            newPage.innerHTML = `<div class="page-inner">${this.pages[this.currentPage].content}</div>`;
            newPage.style.transform = 'rotateY(-180deg)';
            this.book.appendChild(newPage);
            
            setTimeout(() => {
                newPage.style.visibility = 'visible';
                newPage.classList.add('page-flip-left');
                oldPage.style.zIndex = '5';
                
                setTimeout(() => {
                    oldPage.remove();
                    newPage.classList.remove('page-flip-left');
                    newPage.id = 'currentPage';
                    newPage.style.transform = '';
                    newPage.style.zIndex = '';
                    this.currentPageEl = newPage;
                    this.isAnimating = false;
                    this.updateStacks();
                    this.updateCounter();
                }, 800);
            }, 100);
        }
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
    </style>
`);