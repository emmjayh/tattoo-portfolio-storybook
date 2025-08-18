// Book Spread View - Proper left/right page display
class BookSpread {
    constructor() {
        this.currentSpread = 0; // Which spread (pair of pages) we're viewing
        this.currentPage = 0; // For mobile single-page view
        this.pages = [];
        this.isAnimating = false;
        this.hoverTimeout = null;
        this.hoverDelay = 1000;
        
        // Better device detection - tablets show two pages, phones show one
        this.updateDeviceType();
        
        // Debounced resize handler for better performance
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const wasMobile = this.isMobile;
                this.updateDeviceType();
                
                if (wasMobile !== this.isMobile) {
                    // Recalculate position when switching between mobile/desktop
                    if (this.isMobile) {
                        this.currentPage = this.currentSpread * 2;
                    } else {
                        this.currentSpread = Math.floor(this.currentPage / 2);
                    }
                    // Rebuild book structure for new layout
                    this.setupBook();
                    this.showCurrent();
                    this.updateNavigationArrows();
                }
            }, 250);
        });
        
        this.init();
    }
    
    updateDeviceType() {
        const width = window.innerWidth;
        // Phones under 768px show single page, tablets and up show spreads
        this.isMobile = width <= 768;
        this.isTablet = width > 768 && width <= 1024;
        this.isDesktop = width > 1024;
    }
    
    updateNavigationArrows() {
        // Remove existing arrows
        document.querySelectorAll('.nav-arrow').forEach(arrow => arrow.remove());
        
        // Re-add arrows based on current view
        this.showCurrent();
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
            
            // Show initial page/spread
            this.showCurrent();
            
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
        
        // Page 0: Left side of cover with frontpage image
        this.pages.push({
            content: `
                <div class="cover-left-page" style="
                    height: 100%;
                    position: relative;
                    overflow: hidden;
                ">
                    <img src="images/0_Frontpage.png" alt="Carla Portfolio - Tattoo Artistry & Design Cover" style="
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        position: absolute;
                        top: 0;
                        left: 0;
                        z-index: 1;
                    ">
                    <div style="
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        padding: 20px 25px;
                        background: linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.5) 70%, transparent);
                        z-index: 2;
                    ">
                        <p style="
                            color: rgba(255,255,255,1);
                            font-size: 1.2rem;
                            font-weight: 300;
                            letter-spacing: 2px;
                            margin: 0;
                            text-align: center;
                            text-shadow: 2px 2px 6px rgba(0,0,0,1);
                            text-transform: uppercase;
                        ">BBUNNY Designs - Tattoo Artistry</p>
                    </div>
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
            width: ${this.isMobile ? '0' : '50%'};
            height: 100%;
            background: #fdfdf8;
            z-index: 8;
            overflow: hidden;
            display: ${this.isMobile ? 'none' : 'block'};
        `;
        this.book.appendChild(this.prevLeftPage);
        
        // Create left page (this will flip for backward)
        this.leftPage = document.createElement('div');
        this.leftPage.style.cssText = `
            position: absolute;
            left: 0;
            width: ${this.isMobile ? '0' : '50%'};
            height: 100%;
            transform-origin: right center;
            transform-style: preserve-3d;
            z-index: 15;
            overflow: hidden;
            display: ${this.isMobile ? 'none' : 'block'};
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
            ${this.isMobile ? 'left: 0' : 'right: 0'};
            width: ${this.isMobile ? '100%' : '50%'};
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
            ${this.isMobile ? 'left: 0' : 'right: 0'};
            width: ${this.isMobile ? '100%' : '50%'};
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
    
    showCurrent() {
        if (this.isMobile) {
            this.showSinglePage(this.currentPage);
        } else {
            this.showSpread(this.currentSpread);
        }
    }
    
    showSinglePage(pageIndex) {
        // For mobile - show only one page
        if (pageIndex < 0 || pageIndex >= this.pages.length) return;
        
        // On mobile, we only use the right page
        this.rightPageFront.innerHTML = this.pages[pageIndex].content;
        
        // Add navigation arrow for mobile (except page 0 and last page)
        if (pageIndex > 0 && pageIndex < this.pages.length - 1) {
            this.addNavigationArrow(this.rightPageFront, 'next');
        }
        
        // Set next page for animation
        if (pageIndex + 1 < this.pages.length) {
            this.rightPageBack.innerHTML = this.pages[pageIndex + 1].content;
            this.nextRightPage.innerHTML = this.pages[pageIndex + 1].content;
        } else {
            this.rightPageBack.innerHTML = '<div class="blank-page"></div>';
            this.nextRightPage.innerHTML = '<div class="blank-page"></div>';
        }
        
        this.updateCounter();
    }
    
    showSpread(spreadIndex) {
        const leftIndex = spreadIndex * 2;
        const rightIndex = spreadIndex * 2 + 1;
        const nextLeftIndex = (spreadIndex + 1) * 2;
        const nextRightIndex = (spreadIndex + 1) * 2 + 1;
        const prevLeftIndex = (spreadIndex - 1) * 2;
        const prevRightIndex = (spreadIndex - 1) * 2 + 1;
        
        
        // Hide left page on mobile, show both on desktop
        if (this.isMobile) {
            this.leftPage.style.display = 'none';
            this.prevLeftPage.style.display = 'none';
        } else {
            this.leftPage.style.display = 'block';
            this.prevLeftPage.style.display = 'block';
        }
        
        // Set previous left page (what's underneath when we flip backward)
        this.prevLeftPage.innerHTML = prevLeftIndex >= 0 && prevLeftIndex < this.pages.length
            ? this.pages[prevLeftIndex].content
            : '<div class="blank-page"></div>';
        
        // Set left page front (current left page)
        this.leftPageFront.innerHTML = leftIndex < this.pages.length 
            ? this.pages[leftIndex].content 
            : '<div class="blank-page"></div>';
        
        // Add navigation arrow to left page (if not page 0)
        if (leftIndex > 0 && leftIndex < this.pages.length) {
            this.addNavigationArrow(this.leftPageFront, 'prev');
        }
        
        // Set left page back (shows the previous LEFT page when flipping backward)
        // When the left page flips to the right, we see the previous left page on its back
        this.leftPageBack.innerHTML = prevLeftIndex >= 0 && prevLeftIndex < this.pages.length
            ? this.pages[prevLeftIndex].content
            : '<div class="blank-page"></div>';
        
        // Set right page front
        this.rightPageFront.innerHTML = rightIndex < this.pages.length
            ? this.pages[rightIndex].content
            : '<div class="blank-page"></div>';
        
        // Add navigation arrow to right page (if not last page)
        if (rightIndex > 0 && rightIndex < this.pages.length - 1) {
            this.addNavigationArrow(this.rightPageFront, 'next');
        }
        
        // Set right page back (next left page - becomes new left page when flipping forward)
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
        
        if (this.isMobile) {
            // Mobile: flip one page at a time
            if (direction === 'next' && this.currentPage >= this.pages.length - 1) return;
            if (direction === 'prev' && this.currentPage <= 0) return;
            
            this.isAnimating = true;
            
            if (direction === 'next') {
                // Simple fade transition for mobile
                this.rightPage.style.opacity = '0';
                
                setTimeout(() => {
                    this.currentPage++;
                    this.showSinglePage(this.currentPage);
                    this.rightPage.style.opacity = '1';
                    this.isAnimating = false;
                }, 300);
            } else {
                // Previous page
                this.rightPage.style.opacity = '0';
                
                setTimeout(() => {
                    this.currentPage--;
                    this.showSinglePage(this.currentPage);
                    this.rightPage.style.opacity = '1';
                    this.isAnimating = false;
                }, 300);
            }
        } else {
            // Desktop: flip spreads (2 pages at a time)
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
                // First, set the left page back to show the previous left page
                const prevSpreadLeftIndex = (this.currentSpread - 1) * 2;
                if (prevSpreadLeftIndex >= 0 && prevSpreadLeftIndex < this.pages.length) {
                    this.leftPageBack.innerHTML = this.pages[prevSpreadLeftIndex].content;
                }
                
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
    }
    
    jumpToSpread(targetSpread) {
        if (this.isAnimating) return;
        
        if (this.isMobile) {
            // On mobile, jump to the specific page
            const targetPage = targetSpread;
            if (targetPage < 0 || targetPage >= this.pages.length) return;
            if (targetPage === this.currentPage) return;
            
            this.isAnimating = true;
            this.rightPage.style.opacity = '0';
            
            setTimeout(() => {
                this.currentPage = targetPage;
                this.showSinglePage(this.currentPage);
                this.rightPage.style.opacity = '1';
                this.isAnimating = false;
            }, 300);
            return;
        }
        
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
    
    addNavigationArrow(pageElement, direction) {
        const arrow = document.createElement('div');
        arrow.className = `nav-arrow nav-arrow-${direction}`;
        
        // Responsive sizing based on device type
        const isMobileDevice = window.innerWidth <= 480;
        const isSmallTablet = window.innerWidth <= 768;
        
        const arrowSize = isMobileDevice ? '35px' : isSmallTablet ? '40px' : '50px';
        const arrowPosition = isMobileDevice ? '15px' : isSmallTablet ? '20px' : '30px';
        const iconSize = isMobileDevice ? '20' : isSmallTablet ? '24' : '30';
        
        arrow.style.cssText = `
            position: absolute;
            ${direction === 'next' ? `right: ${arrowPosition}` : `left: ${arrowPosition}`};
            top: 50%;
            transform: translateY(-50%);
            width: ${arrowSize};
            height: ${arrowSize};
            cursor: pointer;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(214, 2, 112, 0.15);
            border: 2px solid rgba(214, 2, 112, 0.3);
            border-radius: 50%;
            transition: all 0.3s ease;
            animation: pulse 2s infinite;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        `;
        
        arrow.innerHTML = `
            <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="${direction === 'next' 
                    ? 'M9 6L15 12L9 18' 
                    : 'M15 6L9 12L15 18'}" 
                stroke="#d60270" 
                stroke-width="${isMobileDevice ? '2' : '3'}" 
                stroke-linecap="round" 
                stroke-linejoin="round"/>
            </svg>
        `;
        
        // Add hover effect inline
        arrow.addEventListener('mouseenter', () => {
            arrow.style.background = 'rgba(214, 2, 112, 0.25)';
            arrow.style.borderColor = 'rgba(214, 2, 112, 0.5)';
            arrow.style.transform = 'translateY(-50%) scale(1.15)';
            arrow.style.boxShadow = '0 6px 20px rgba(214, 2, 112, 0.3)';
        });
        
        arrow.addEventListener('mouseleave', () => {
            arrow.style.background = 'rgba(214, 2, 112, 0.15)';
            arrow.style.borderColor = 'rgba(214, 2, 112, 0.3)';
            arrow.style.transform = 'translateY(-50%) scale(1)';
            arrow.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
        });
        
        // Add click handler
        arrow.addEventListener('click', (e) => {
            e.stopPropagation();
            this.turnPage(direction);
        });
        
        pageElement.appendChild(arrow);
        
        // Add pulse animation style if not already added
        if (!document.getElementById('nav-arrow-styles')) {
            const style = document.createElement('style');
            style.id = 'nav-arrow-styles';
            style.textContent = `
                @keyframes pulse {
                    0%, 100% { 
                        opacity: 0.8;
                        box-shadow: 0 4px 12px rgba(214, 2, 112, 0.2);
                    }
                    50% { 
                        opacity: 1;
                        box-shadow: 0 6px 20px rgba(214, 2, 112, 0.4);
                    }
                }
                .nav-arrow:hover {
                    animation: none;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    updateCounter() {
        if (this.isMobile) {
            // Mobile shows single page number
            if (this.currentPage === 0 || this.currentPage === 1) {
                this.pageCounter.textContent = 'Cover';
            } else {
                this.pageCounter.textContent = `Page ${this.currentPage + 1} of ${this.pages.length}`;
            }
        } else {
            // Desktop shows spread numbers
            const leftNum = this.currentSpread * 2 + 1;
            const rightNum = this.currentSpread * 2 + 2;
            
            if (this.currentSpread === 0) {
                this.pageCounter.textContent = 'Cover';
            } else {
                this.pageCounter.textContent = `Pages ${leftNum}-${rightNum}`;
            }
        }
    }
    
    bindEvents() {
        // Click only - no hover effect
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
        
        // Track hover timeout for image expansion
        this.imageHoverTimeout = null;
        this.currentHoveredImage = null;
        
        // Handle image hover events using delegation
        document.addEventListener('mouseover', (e) => {
            // Check if hovering over a gallery image (not thumbnails or cover images)
            const img = e.target;
            if (img.tagName === 'IMG' && 
                img.closest('.gallery-content') && 
                !img.closest('.cover-thumbnail')) {
                // Clear any existing timeout
                if (this.imageHoverTimeout) {
                    clearTimeout(this.imageHoverTimeout);
                }
                this.currentHoveredImage = img;
                // Set 1 second delay before expanding
                this.imageHoverTimeout = setTimeout(() => {
                    if (this.currentHoveredImage === img) {
                        this.expandImage(img);
                    }
                }, 1000);
            }
        });
        
        // Cancel expansion on mouse leave
        document.addEventListener('mouseout', (e) => {
            const img = e.target;
            if (img.tagName === 'IMG' && 
                img.closest('.gallery-content') && 
                !img.closest('.cover-thumbnail')) {
                if (this.imageHoverTimeout) {
                    clearTimeout(this.imageHoverTimeout);
                    this.imageHoverTimeout = null;
                }
                if (this.currentHoveredImage === img) {
                    this.currentHoveredImage = null;
                }
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