// Gallery State Management
class TattooGallery {
    constructor() {
        this.currentPage = 1;
        this.totalPages = 6;
        this.isAnimating = false;
        this.hoverTimeout = null;
        this.hoverDelay = 1500; // 1.5 seconds hover delay
        
        this.init();
    }
    
    init() {
        // Cache DOM elements
        this.pages = document.querySelectorAll('.page');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.hoverPrev = document.getElementById('hoverPrev');
        this.hoverNext = document.getElementById('hoverNext');
        this.currentPageDisplay = document.getElementById('currentPage');
        this.totalPagesDisplay = document.getElementById('totalPages');
        
        // Set initial state
        this.totalPagesDisplay.textContent = this.totalPages;
        this.updatePageDisplay();
        
        // Bind events
        this.bindEvents();
    }
    
    bindEvents() {
        // Arrow button clicks
        this.prevBtn.addEventListener('click', () => this.previousPage());
        this.nextBtn.addEventListener('click', () => this.nextPage());
        
        // Hover zones with delay
        this.hoverPrev.addEventListener('mouseenter', () => this.startHoverTimer('prev'));
        this.hoverPrev.addEventListener('mouseleave', () => this.cancelHoverTimer());
        
        this.hoverNext.addEventListener('mouseenter', () => this.startHoverTimer('next'));
        this.hoverNext.addEventListener('mouseleave', () => this.cancelHoverTimer());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Touch/swipe support for mobile
        this.addTouchSupport();
    }
    
    startHoverTimer(direction) {
        // Clear any existing timer
        this.cancelHoverTimer();
        
        // Visual feedback - show hover effect immediately
        if (direction === 'prev') {
            this.hoverPrev.style.opacity = '1';
        } else {
            this.hoverNext.style.opacity = '1';
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
        
        // Hide hover effects
        this.hoverPrev.style.opacity = '';
        this.hoverNext.style.opacity = '';
    }
    
    previousPage() {
        if (this.isAnimating || this.currentPage === 1) return;
        
        this.isAnimating = true;
        const currentPageEl = this.pages[this.currentPage - 1];
        const prevPageEl = this.pages[this.currentPage - 2];
        
        // Animate page flip
        currentPageEl.classList.add('flipping-out');
        currentPageEl.classList.remove('active');
        
        setTimeout(() => {
            currentPageEl.classList.remove('flipping-out');
            prevPageEl.classList.add('flipping-in', 'active');
            
            setTimeout(() => {
                prevPageEl.classList.remove('flipping-in');
                this.isAnimating = false;
            }, 800);
        }, 100);
        
        this.currentPage--;
        this.updatePageDisplay();
        this.updateButtonStates();
    }
    
    nextPage() {
        if (this.isAnimating || this.currentPage === this.totalPages) return;
        
        this.isAnimating = true;
        const currentPageEl = this.pages[this.currentPage - 1];
        const nextPageEl = this.pages[this.currentPage];
        
        // Animate page flip
        currentPageEl.classList.add('flipping-out');
        currentPageEl.classList.remove('active');
        
        setTimeout(() => {
            currentPageEl.classList.remove('flipping-out');
            nextPageEl.classList.add('flipping-in', 'active');
            
            setTimeout(() => {
                nextPageEl.classList.remove('flipping-in');
                this.isAnimating = false;
            }, 800);
        }, 100);
        
        this.currentPage++;
        this.updatePageDisplay();
        this.updateButtonStates();
    }
    
    goToPage(pageNumber) {
        if (this.isAnimating || pageNumber === this.currentPage) return;
        if (pageNumber < 1 || pageNumber > this.totalPages) return;
        
        this.isAnimating = true;
        const currentPageEl = this.pages[this.currentPage - 1];
        const targetPageEl = this.pages[pageNumber - 1];
        
        // Hide current page
        currentPageEl.classList.add('flipping-out');
        currentPageEl.classList.remove('active');
        
        setTimeout(() => {
            currentPageEl.classList.remove('flipping-out');
            targetPageEl.classList.add('flipping-in', 'active');
            
            setTimeout(() => {
                targetPageEl.classList.remove('flipping-in');
                this.isAnimating = false;
            }, 800);
        }, 100);
        
        this.currentPage = pageNumber;
        this.updatePageDisplay();
        this.updateButtonStates();
    }
    
    updatePageDisplay() {
        this.currentPageDisplay.textContent = this.currentPage;
    }
    
    updateButtonStates() {
        // Disable/enable navigation based on current page
        this.prevBtn.style.opacity = this.currentPage === 1 ? '0.3' : '1';
        this.prevBtn.style.pointerEvents = this.currentPage === 1 ? 'none' : 'auto';
        
        this.nextBtn.style.opacity = this.currentPage === this.totalPages ? '0.3' : '1';
        this.nextBtn.style.pointerEvents = this.currentPage === this.totalPages ? 'none' : 'auto';
    }
    
    handleKeyboard(e) {
        if (e.key === 'ArrowLeft') {
            this.previousPage();
        } else if (e.key === 'ArrowRight') {
            this.nextPage();
        } else if (e.key >= '1' && e.key <= '6') {
            this.goToPage(parseInt(e.key));
        }
    }
    
    addTouchSupport() {
        let touchStartX = 0;
        let touchEndX = 0;
        
        const bookContainer = document.getElementById('bookContainer');
        
        bookContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        bookContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        });
        
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

// Initialize gallery when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const gallery = new TattooGallery();
    
    // Add smooth loading animation
    setTimeout(() => {
        document.querySelector('.portfolio-container').style.opacity = '1';
    }, 100);
});

// Add CSS for smooth loading
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .portfolio-container {
            opacity: 0;
            transition: opacity 1s ease-in;
        }
    </style>
`);