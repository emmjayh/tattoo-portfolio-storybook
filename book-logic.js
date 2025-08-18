// Real Book Page Flip Logic
class RealBookGallery {
    constructor() {
        this.currentSpread = 0; // Current spread index (0 = cover, 1 = pages 2-3, 2 = pages 4-5, etc.)
        this.totalPages = 18;
        this.isAnimating = false;
        this.hoverTimeout = null;
        this.hoverDelay = 1000;
        this.pages = [];
        this.imageCache = new Map();
        
        this.init();
    }
    
    async init() {
        // Cache DOM elements
        this.leftPage = document.getElementById('leftPage');
        this.rightPage = document.getElementById('rightPage');
        this.flippingPage = document.getElementById('flippingPage');
        this.hoverLeft = document.getElementById('hoverLeft');
        this.hoverRight = document.getElementById('hoverRight');
        this.pageCounter = document.getElementById('currentPageNum');
        this.book = document.getElementById('book');
        
        // Load images from server
        await this.loadImagesFromServer();
        
        // Load pages with proper book structure
        this.loadPages();
        
        // Show initial spread
        this.updateSpread();
        
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
    
    loadPages() {
        // In a real book:
        // Page 1 (right side) - Cover
        // Page 2 (back of page 1, left side) - Inside cover or first content
        // Page 3 (right side) - Content
        // Page 4 (back of page 3, left side) - Content
        // etc.
        
        this.pages = [];
        
        // Page 1 - Cover (RIGHT page when closed)
        this.pages.push({
            pageNum: 1,
            side: 'right',
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
        
        // Page 2 - Inside cover (back of page 1, LEFT page when open)
        this.pages.push({
            pageNum: 2,
            side: 'left',
            content: `
                <div class="page-inner">
                    <h2>About the Artist</h2>
                    <p>Creating meaningful tattoos since 2010</p>
                </div>
            `
        });
        
        // Load gallery pages from templates
        const templates = document.querySelectorAll('.page-template');
        let pageNum = 3;
        
        templates.forEach(template => {
            if (template.dataset.page === 'contact') {
                return; // Skip contact for now
            }
            
            const img = template.querySelector('img');
            const h3 = template.querySelector('h3');
            const p = template.querySelector('p');
            
            this.pages.push({
                pageNum: pageNum,
                side: pageNum % 2 === 1 ? 'right' : 'left',
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
        
        // Add contact as last page
        const contactTemplate = document.querySelector('.page-template[data-page="contact"]');
        if (contactTemplate) {
            this.pages.push({
                pageNum: pageNum,
                side: pageNum % 2 === 1 ? 'right' : 'left',
                content: contactTemplate.innerHTML
            });
            pageNum++;
        }
        
        // Add blank page if we have odd number of pages
        if (this.pages.length % 2 !== 0) {
            this.pages.push({
                pageNum: pageNum,
                side: 'left',
                content: '<div class="blank-page"></div>'
            });
        }
        
        this.totalPages = this.pages.length;
    }
    
    updateSpread() {
        // Calculate which pages to show based on spread index
        // Spread 0: [blank, page 1]
        // Spread 1: [page 2, page 3]
        // Spread 2: [page 4, page 5]
        // etc.
        
        let leftPageNum, rightPageNum;
        
        if (this.currentSpread === 0) {
            // Cover spread
            leftPageNum = null; // blank
            rightPageNum = 1;
        } else {
            // Regular spread
            leftPageNum = this.currentSpread * 2;
            rightPageNum = this.currentSpread * 2 + 1;
        }
        
        // Update left page
        if (leftPageNum && leftPageNum <= this.totalPages) {
            const page = this.pages[leftPageNum - 1];
            this.leftPage.innerHTML = `<div class="page-inner" style="background: #fdfdf8;">${page.content}</div>`;
            this.leftPage.style.visibility = 'visible';
            this.leftPage.style.opacity = '1';
        } else {
            this.leftPage.innerHTML = '<div class="page-inner blank-page" style="background: #fdfdf8;"></div>';
            this.leftPage.style.visibility = 'visible';
            this.leftPage.style.opacity = '1';
        }
        
        // Update right page
        if (rightPageNum && rightPageNum <= this.totalPages) {
            const page = this.pages[rightPageNum - 1];
            this.rightPage.innerHTML = `<div class="page-inner" style="background: #fdfdf8;">${page.content}</div>`;
            this.rightPage.style.visibility = 'visible';
            this.rightPage.style.opacity = '1';
        } else {
            this.rightPage.innerHTML = '<div class="page-inner blank-page" style="background: #fdfdf8;"></div>';
            this.rightPage.style.visibility = 'visible';
            this.rightPage.style.opacity = '1';
        }
        
        this.updateCounter();
    }
    
    turnPage(direction) {
        if (this.isAnimating) return;
        
        const maxSpreads = Math.ceil(this.totalPages / 2);
        
        if (direction === 'prev' && this.currentSpread === 0) return;
        if (direction === 'next' && this.currentSpread >= maxSpreads - 1) return;
        
        this.isAnimating = true;
        
        if (direction === 'next') {
            // Turning page forward - right page flips to left
            // We're flipping the current right page, which has the next page on its back
            
            const currentRightPageNum = this.currentSpread === 0 ? 1 : this.currentSpread * 2 + 1;
            const backOfRightPageNum = currentRightPageNum + 1; // The page on the back
            
            // Get current right page content (front of flipping page)
            const currentRightContent = this.rightPage.innerHTML;
            
            // Get back page content
            let backContent = '';
            if (backOfRightPageNum <= this.totalPages) {
                const backPage = this.pages[backOfRightPageNum - 1];
                backContent = `<div class="page-inner" style="background: #f0f0e8;">${backPage.content}</div>`;
            } else {
                backContent = '<div class="page-inner blank-page" style="background: #f0f0e8;"></div>';
            }
            
            // Setup flipping page
            this.flippingPage.innerHTML = '';
            
            // Front side (current right page)
            const frontDiv = document.createElement('div');
            frontDiv.innerHTML = currentRightContent;
            this.flippingPage.appendChild(frontDiv.firstElementChild);
            
            // Back side (next even page)
            const backDiv = document.createElement('div');
            backDiv.className = 'page-back-side';
            backDiv.innerHTML = backContent;
            this.flippingPage.appendChild(backDiv);
            
            // Position and show flipping page
            this.flippingPage.style.display = 'block';
            this.flippingPage.style.right = '0';
            this.flippingPage.style.left = 'auto';
            this.flippingPage.style.width = '50%';
            this.flippingPage.style.transformOrigin = 'left center';
            this.flippingPage.style.transform = 'rotateY(0deg)';
            
            // Hide right page during flip
            this.rightPage.style.opacity = '0';
            
            // Animate flip
            requestAnimationFrame(() => {
                this.flippingPage.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                this.flippingPage.style.transform = 'rotateY(-180deg)';
                
                setTimeout(() => {
                    this.currentSpread++;
                    this.updateSpread();
                    
                    this.flippingPage.style.display = 'none';
                    this.flippingPage.style.transform = '';
                    this.flippingPage.style.transition = '';
                    
                    this.isAnimating = false;
                }, 800);
            });
            
        } else {
            // Turning page backward - left page flips to right
            // We're flipping the current left page back to the right
            
            const currentLeftPageNum = this.currentSpread === 1 ? 2 : this.currentSpread * 2;
            const backOfLeftPageNum = currentLeftPageNum - 1; // The page on the back
            
            // Get current left page content (front of flipping page)
            const currentLeftContent = this.leftPage.innerHTML;
            
            // Get back page content
            let backContent = '';
            if (backOfLeftPageNum > 0 && backOfLeftPageNum <= this.totalPages) {
                const backPage = this.pages[backOfLeftPageNum - 1];
                backContent = `<div class="page-inner" style="background: #f0f0e8;">${backPage.content}</div>`;
            } else {
                backContent = '<div class="page-inner blank-page" style="background: #f0f0e8;"></div>';
            }
            
            // Setup flipping page
            this.flippingPage.innerHTML = '';
            
            // Front side (current left page)
            const frontDiv = document.createElement('div');
            frontDiv.innerHTML = currentLeftContent;
            this.flippingPage.appendChild(frontDiv.firstElementChild);
            
            // Back side (previous odd page)
            const backDiv = document.createElement('div');
            backDiv.className = 'page-back-side';
            backDiv.innerHTML = backContent;
            this.flippingPage.appendChild(backDiv);
            
            // Position and show flipping page
            this.flippingPage.style.display = 'block';
            this.flippingPage.style.left = '0';
            this.flippingPage.style.right = 'auto';
            this.flippingPage.style.width = '50%';
            this.flippingPage.style.transformOrigin = 'right center';
            this.flippingPage.style.transform = 'rotateY(0deg)';
            
            // Hide left page during flip
            this.leftPage.style.opacity = '0';
            
            // Animate flip
            requestAnimationFrame(() => {
                this.flippingPage.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                this.flippingPage.style.transform = 'rotateY(180deg)';
                
                setTimeout(() => {
                    this.currentSpread--;
                    this.updateSpread();
                    
                    this.flippingPage.style.display = 'none';
                    this.flippingPage.style.transform = '';
                    this.flippingPage.style.transition = '';
                    
                    this.isAnimating = false;
                }, 800);
            });
        }
    }
    
    updateCounter() {
        if (this.currentSpread === 0) {
            this.pageCounter.textContent = 'Cover';
        } else {
            const leftNum = this.currentSpread * 2;
            const rightNum = this.currentSpread * 2 + 1;
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
        
        // Touch support
        this.addTouchSupport();
        
        // Image expansion
        this.setupImageExpansion();
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
    
    setupImageExpansion() {
        const overlay = document.createElement('div');
        overlay.className = 'image-overlay';
        document.body.appendChild(overlay);
        
        let hoverTimeout = null;
        let currentImage = null;
        
        const expandImage = (img) => {
            if (this.isAnimating) return;
            
            const clone = img.cloneNode(true);
            overlay.innerHTML = '';
            overlay.appendChild(clone);
            overlay.classList.add('active');
            currentImage = img;
            this.imageExpanded = true;
        };
        
        const closeImage = () => {
            overlay.classList.remove('active');
            currentImage = null;
            this.imageExpanded = false;
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
                hoverTimeout = null;
            }
        };
        
        document.addEventListener('mouseover', (e) => {
            if (e.target.matches('.gallery-content img')) {
                if (hoverTimeout) clearTimeout(hoverTimeout);
                
                hoverTimeout = setTimeout(() => {
                    expandImage(e.target);
                }, 500);
            }
        });
        
        document.addEventListener('mouseout', (e) => {
            if (e.target.matches('.gallery-content img') && !currentImage) {
                if (hoverTimeout) {
                    clearTimeout(hoverTimeout);
                    hoverTimeout = null;
                }
            }
        });
        
        overlay.addEventListener('click', closeImage);
        overlay.addEventListener('mouseleave', closeImage);
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && currentImage) {
                closeImage();
            }
        });
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

// Initialize immediately
const gallery = new RealBookGallery();

// Add blank page style
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .blank-page {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ddd;
            font-style: italic;
        }
        
        .flipping-page {
            background: #fdfdf8;
            backface-visibility: visible;
            transform-style: preserve-3d;
        }
        
        .flipping-page .page-inner {
            backface-visibility: hidden;
        }
        
        .page-back-side {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #f0f0e8;
            transform: rotateY(180deg);
            backface-visibility: hidden;
            padding: 80px;
        }
    </style>
`);