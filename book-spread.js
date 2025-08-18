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
        try {
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
        } catch (error) {
            console.error('Error initializing book:', error);
        }
    }
    
    async loadImagesFromServer() {
        try {
            const response = await fetch('/api/images');
            const data = await response.json();
            
            if (data.images && data.images.length > 0) {
                const hiddenContent = document.getElementById('hidden-content');
                // Save contact template before clearing
                const contactTemplate = hiddenContent.querySelector('[data-page="contact"]');
                const savedContactHTML = contactTemplate ? contactTemplate.outerHTML : null;
                
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
                
                // Re-add contact template if it existed
                if (savedContactHTML) {
                    const div = document.createElement('div');
                    div.innerHTML = savedContactHTML;
                    hiddenContent.appendChild(div.firstChild);
                }
            }
        } catch (error) {
            console.warn('Failed to load images from server:', error);
        }
    }
    
    loadPageContent() {
        this.pages = [];
        
        // Page 0: Left side of cover with Carla Portfolio title
        this.pages.push({
            content: `
                <div class="cover-left-page" style="
                    padding: 60px;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    background: linear-gradient(135deg, rgba(214,2,112,0.02), rgba(155,79,150,0.02));
                ">
                    <h1 class="portfolio-title" style="
                        font-size: 5rem;
                        font-weight: 300;
                        letter-spacing: 10px;
                        background: linear-gradient(135deg, #d60270 0%, #9b4f96 50%, #0038a8 100%);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        background-clip: text;
                        margin-bottom: 30px;
                        text-transform: uppercase;
                        text-shadow: 0 0 40px rgba(214, 2, 112, 0.3);
                    ">Carla<br>Portfolio</h1>
                    <p style="
                        font-size: 1.4rem;
                        color: #666;
                        font-style: italic;
                        margin-bottom: 20px;
                    ">Tattoo Artistry & Design</p>
                    <div style="
                        width: 100px;
                        height: 2px;
                        background: linear-gradient(90deg, #d60270, #9b4f96, #0038a8);
                        margin: 30px auto;
                    "></div>
                    <p style="
                        font-size: 1rem;
                        color: #999;
                        margin-top: 20px;
                    ">Turn the page to explore →</p>
                </div>
            `
        });
        
        // Create thumbnail gallery and get most recent image
        const allTemplates = document.querySelectorAll('.page-template');
        console.log('Found templates:', allTemplates.length);
        let thumbnailsHtml = '';
        let mostRecentImage = null;
        
        allTemplates.forEach((template, index) => {
            const img = template.querySelector('img');
            if (img && template.dataset.page !== 'contact') {
                // First image is the most recent (they're sorted by number)
                if (!mostRecentImage) {
                    mostRecentImage = {
                        src: img.src,
                        alt: img.alt,
                        title: template.querySelector('h3')?.textContent || ''
                    };
                }
                thumbnailsHtml += `
                    <div class="cover-thumbnail" data-page="${index + 2}">
                        <img src="${img.src}" alt="${img.alt}">
                    </div>
                `;
            }
        });
        
        // Page 1: Right side of cover with gallery
        this.pages.push({
            content: `
                <div class="cover-page" style="padding: 40px; height: 100%; display: flex; flex-direction: column;">
                    <div class="cover-header" style="text-align: center; margin-bottom: 20px;">
                        <h2 style="
                            font-size: 2rem;
                            font-weight: 300;
                            color: #333;
                            margin-bottom: 15px;
                            text-transform: uppercase;
                            letter-spacing: 3px;
                        ">Most Recent Showpiece</h2>
                        ${mostRecentImage ? `
                            <div style="
                                margin-bottom: 20px;
                                padding: 15px;
                                background: linear-gradient(135deg, rgba(214,2,112,0.05), rgba(155,79,150,0.05));
                                border-radius: 10px;
                                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                            ">
                                <img src="${mostRecentImage.src}" alt="${mostRecentImage.alt}" style="
                                    width: 100%;
                                    max-height: 250px;
                                    object-fit: contain;
                                    border-radius: 8px;
                                    margin-bottom: 10px;
                                ">
                                <p style="
                                    text-align: center;
                                    color: #666;
                                    font-size: 1.1rem;
                                    font-style: italic;
                                ">${mostRecentImage.title}</p>
                            </div>
                        ` : ''}
                    </div>
                    
                    <h3 style="
                        text-align: center;
                        font-size: 1.2rem;
                        color: #666;
                        margin-bottom: 15px;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                    ">Gallery Collection</h3>
                    
                    <div class="thumbnail-container" style="
                        flex: 1;
                        overflow-y: auto;
                        overflow-x: hidden;
                        padding: 20px 10px;
                        background: linear-gradient(to bottom, rgba(255,255,255,0.5), rgba(240,240,240,0.3));
                        border-radius: 10px;
                        box-shadow: inset 0 2px 10px rgba(0,0,0,0.1);
                    ">
                        <div class="thumbnail-grid" style="
                            display: grid;
                            grid-template-columns: repeat(3, 1fr);
                            gap: 15px;
                            padding-right: 10px;
                        ">
                            ${thumbnailsHtml}
                        </div>
                    </div>
                    
                    <style>
                        .thumbnail-container::-webkit-scrollbar {
                            width: 8px;
                        }
                        .thumbnail-container::-webkit-scrollbar-track {
                            background: rgba(0,0,0,0.05);
                            border-radius: 4px;
                        }
                        .thumbnail-container::-webkit-scrollbar-thumb {
                            background: linear-gradient(135deg, #d60270, #9b4f96);
                            border-radius: 4px;
                        }
                        .thumbnail-container::-webkit-scrollbar-thumb:hover {
                            background: linear-gradient(135deg, #9b4f96, #0038a8);
                        }
                        .cover-thumbnail {
                            aspect-ratio: 1;
                            overflow: hidden;
                            border-radius: 8px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                            background: #fff;
                        }
                        .cover-thumbnail:hover {
                            transform: scale(1.1);
                            box-shadow: 0 4px 15px rgba(214, 2, 112, 0.4);
                            z-index: 10;
                        }
                        .cover-thumbnail img {
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                            transition: transform 0.3s ease;
                        }
                        .cover-thumbnail:hover img {
                            transform: scale(1.1);
                        }
                    </style>
                </div>
            `
        });
        
        // Gallery pages
        allTemplates.forEach(template => {
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
        
        // Hidden previous left page (for backward flips)
        this.prevLeftPage = document.createElement('div');
        this.prevLeftPage.style.cssText = `
            position: absolute;
            left: 0;
            width: 50%;
            height: 100%;
            background: #fdfdf8;
            z-index: 8;
            overflow: hidden;
        `;
        this.book.appendChild(this.prevLeftPage);
        
        // Create left page (this will flip for backward)
        this.leftPage = document.createElement('div');
        this.leftPage.style.cssText = `
            position: absolute;
            left: 0;
            width: 50%;
            height: 100%;
            transform-origin: right center;
            transform-style: preserve-3d;
            z-index: 15;
            overflow: hidden;
        `;
        this.book.appendChild(this.leftPage);
        
        // Left page front
        this.leftPageFront = document.createElement('div');
        this.leftPageFront.style.cssText = `
            position: absolute;
            width: 100%;
            height: 100%;
            background: #fdfdf8;
            backface-visibility: hidden;
            overflow: hidden;
        `;
        this.leftPage.appendChild(this.leftPageFront);
        
        // Left page back
        this.leftPageBack = document.createElement('div');
        this.leftPageBack.style.cssText = `
            position: absolute;
            width: 100%;
            height: 100%;
            background: #f0f0e8;
            backface-visibility: hidden;
            transform: rotateY(180deg);
            overflow: hidden;
        `;
        this.leftPage.appendChild(this.leftPageBack);
        
        // Create right page (this will flip for forward)
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
        
        // Hidden next right page (revealed after forward flip)
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
        const prevLeftIndex = (spreadIndex - 1) * 2;
        const prevRightIndex = (spreadIndex - 1) * 2 + 1;
        
        // Always show both pages
        this.leftPage.style.display = 'block';
        this.prevLeftPage.style.display = 'block';
        
        // Set previous left page (for backward flip)
        this.prevLeftPage.innerHTML = prevLeftIndex >= 0 && prevLeftIndex < this.pages.length
            ? this.pages[prevLeftIndex].content
            : '<div class="blank-page"></div>';
        
        // Set left page front (current left page)
        this.leftPageFront.innerHTML = leftIndex < this.pages.length 
            ? this.pages[leftIndex].content 
            : '<div class="blank-page"></div>';
        
        // Set left page back (previous right page - what becomes visible when flipping backward)
        this.leftPageBack.innerHTML = prevRightIndex >= 0 && prevRightIndex < this.pages.length
            ? this.pages[prevRightIndex].content
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
            // Backward flip - flip left page to right
            this.leftPage.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            this.leftPage.style.transform = 'rotateY(180deg)';
            
            setTimeout(() => {
                // Update spread
                this.currentSpread--;
                
                // Reset and update pages
                this.leftPage.style.transition = 'none';
                this.leftPage.style.transform = 'rotateY(0deg)';
                this.showSpread(this.currentSpread);
                
                this.isAnimating = false;
            }, 800);
        }
    }
    
    jumpToSpread(targetSpread) {
        if (this.isAnimating) return;
        
        const maxSpreads = Math.ceil(this.pages.length / 2);
        if (targetSpread < 0 || targetSpread >= maxSpreads) return;
        
        // If we're already at the target spread, do nothing
        if (targetSpread === this.currentSpread) return;
        
        // Animate a quick page flip effect
        this.isAnimating = true;
        
        // Determine direction for visual feedback
        if (targetSpread > this.currentSpread) {
            // Going forward - quick flip animation
            this.rightPage.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            this.rightPage.style.transform = 'rotateY(-90deg)';
            
            setTimeout(() => {
                this.currentSpread = targetSpread;
                this.rightPage.style.transition = 'none';
                this.rightPage.style.transform = 'rotateY(0deg)';
                this.showSpread(this.currentSpread);
                
                // Animate the page settling
                this.rightPage.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                this.rightPage.style.transform = 'rotateY(0deg)';
                
                setTimeout(() => {
                    this.rightPage.style.transition = 'none';
                    this.isAnimating = false;
                }, 300);
            }, 400);
        } else {
            // Going backward - quick flip animation
            this.leftPage.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            this.leftPage.style.transform = 'rotateY(90deg)';
            
            setTimeout(() => {
                this.currentSpread = targetSpread;
                this.leftPage.style.transition = 'none';
                this.leftPage.style.transform = 'rotateY(0deg)';
                this.showSpread(this.currentSpread);
                
                // Animate the page settling
                this.leftPage.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                this.leftPage.style.transform = 'rotateY(0deg)';
                
                setTimeout(() => {
                    this.leftPage.style.transition = 'none';
                    this.isAnimating = false;
                }, 300);
            }, 400);
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
            if (e.key === 'Escape' && this.expandedImage) {
                this.closeExpandedImage();
            }
        });
        
        // Thumbnail clicks on cover page
        document.addEventListener('click', (e) => {
            const thumbnail = e.target.closest('.cover-thumbnail');
            if (thumbnail) {
                const targetPage = parseInt(thumbnail.dataset.page);
                if (targetPage) {
                    // Calculate which spread contains this page
                    const targetSpread = Math.floor(targetPage / 2);
                    this.jumpToSpread(targetSpread);
                }
            }
        });
        
        // Image expansion on hover
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
        // Create overlay for expanded images
        this.imageOverlay = document.createElement('div');
        this.imageOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: none;
            z-index: 10000;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(this.imageOverlay);
        
        // Handle image hover events using delegation
        document.addEventListener('mouseover', (e) => {
            // Check if hovering over a gallery image (not thumbnails or cover images)
            const img = e.target;
            if (img.tagName === 'IMG' && 
                img.closest('.gallery-content') && 
                !img.closest('.cover-thumbnail')) {
                this.expandImage(img);
            }
        });
        
        // Close on overlay click
        this.imageOverlay.addEventListener('click', () => {
            this.closeExpandedImage();
        });
    }
    
    expandImage(img) {
        if (this.expandedImage) return;
        
        // Create expanded image
        this.expandedImage = document.createElement('img');
        this.expandedImage.src = img.src;
        this.expandedImage.alt = img.alt;
        this.expandedImage.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.8);
            max-width: 90%;
            max-height: 90%;
            border-radius: 10px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            transition: transform 0.3s ease;
            z-index: 10001;
            cursor: pointer;
        `;
        
        // Show overlay and image
        this.imageOverlay.style.display = 'block';
        document.body.appendChild(this.expandedImage);
        
        // Trigger animation
        requestAnimationFrame(() => {
            this.imageOverlay.style.opacity = '1';
            this.expandedImage.style.transform = 'translate(-50%, -50%) scale(1)';
        });
        
        // Handle mouse leave to close
        this.expandedImage.addEventListener('mouseleave', () => {
            this.closeExpandedImage();
        });
    }
    
    closeExpandedImage() {
        if (!this.expandedImage) return;
        
        // Animate out
        this.imageOverlay.style.opacity = '0';
        this.expandedImage.style.transform = 'translate(-50%, -50%) scale(0.8)';
        
        // Remove after animation
        setTimeout(() => {
            this.imageOverlay.style.display = 'none';
            if (this.expandedImage) {
                this.expandedImage.remove();
                this.expandedImage = null;
            }
        }, 300);
    }
}

// Initialize
const gallery = new BookSpread();