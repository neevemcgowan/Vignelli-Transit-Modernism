/**
 * Vignelli Transit Modernism - Navigation JavaScript
 * Handles mobile navigation toggle and accessibility
 */

document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Mobile navigation toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            const isOpen = navMenu.classList.contains('nav-menu--open');
            
            // Toggle menu visibility
            navMenu.classList.toggle('nav-menu--open');
            
            // Update ARIA attributes for accessibility
            navToggle.setAttribute('aria-expanded', !isOpen);
            
            // Toggle hamburger animation
            navToggle.classList.toggle('nav-toggle--open');
        });
        
        // Close mobile menu when clicking nav links
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('nav-menu--open');
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.classList.remove('nav-toggle--open');
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInsideNav = navToggle.contains(event.target) || navMenu.contains(event.target);
            
            if (!isClickInsideNav && navMenu.classList.contains('nav-menu--open')) {
                navMenu.classList.remove('nav-menu--open');
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.classList.remove('nav-toggle--open');
            }
        });
    }
    
    // Route Bar Interactions
    const routeBarSegments = document.querySelectorAll('.route-bar-segment');
    const routeLines = document.querySelectorAll('.route-line');
    
    // Route bar segment click handlers
    routeBarSegments.forEach((segment, index) => {
        segment.addEventListener('click', function() {
            highlightRouteLineByIndex(index);
        });
        
        // Add keyboard support
        segment.setAttribute('tabindex', '0');
        segment.setAttribute('role', 'button');
        
        segment.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                highlightRouteLineByIndex(index);
            }
        });
    });
    
    // Route line interactions
    routeLines.forEach((line, index) => {
        line.addEventListener('click', function() {
            highlightRouteBarSegment(index);
        });
        
        line.setAttribute('tabindex', '0');
        line.setAttribute('role', 'button');
        
        line.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                highlightRouteBarSegment(index);
            }
        });
    });
    
    function highlightRouteLineByIndex(index) {
        // Remove previous highlights
        routeLines.forEach(line => line.classList.remove('route-line--active'));
        
        // Highlight corresponding route line
        if (routeLines[index]) {
            routeLines[index].classList.add('route-line--active');
            routeLines[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        
        // Provide audio feedback for screen readers
        announceRouteSelection(index);
    }
    
    function highlightRouteBarSegment(index) {
        // Remove previous highlights
        routeBarSegments.forEach(segment => segment.classList.remove('route-bar-segment--active'));
        
        // Highlight corresponding route bar segment
        if (routeBarSegments[index]) {
            routeBarSegments[index].classList.add('route-bar-segment--active');
        }
        
        announceRouteSelection(index);
    }
    
    function announceRouteSelection(index) {
        const routeNames = ['Vignelli Route', 'Aicher Route', 'Kinneir Route', 'Wyman Route', 'Beck Route'];
        const announcement = `Selected: ${routeNames[index] || 'Route'}`;
        
        // Create temporary screen reader announcement
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.style.position = 'absolute';
        announcer.style.left = '-10000px';
        announcer.style.width = '1px';
        announcer.style.height = '1px';
        announcer.style.overflow = 'hidden';
        
        document.body.appendChild(announcer);
        announcer.textContent = announcement;
        
        setTimeout(() => {
            document.body.removeChild(announcer);
        }, 1000);
    }
    
    // Handle navigation highlighting based on scroll position
    function updateActiveNav() {
        const sections = ['home', 'overview', 'evolution', 'principles', 'influence', 'visuals'];
        const currentSection = getCurrentSection();
        
        navLinks.forEach(link => {
            link.removeAttribute('aria-current');
            
            const href = link.getAttribute('href');
            if (href === `#${currentSection}`) {
                link.setAttribute('aria-current', 'page');
            }
        });
    }
    
    function getCurrentSection() {
        const sections = ['home', 'overview', 'evolution', 'principles', 'influence', 'visuals'];
        const navHeight = document.querySelector('.main-nav').offsetHeight;
        const scrollPosition = window.scrollY + navHeight + 50; // Reduced offset for more accurate detection
        const windowBottom = scrollPosition + window.innerHeight;
        
        // Special case: if we're near the bottom of the page, prioritize the last section
        if (windowBottom >= document.documentElement.scrollHeight - 100) {
            const lastSection = document.getElementById('visuals');
            if (lastSection) {
                return 'visuals';
            }
        }
        
        // Find the section that best matches current scroll position
        let currentSection = 'home';
        let closestDistance = Infinity;
        
        for (let i = 0; i < sections.length; i++) {
            const element = document.getElementById(sections[i]);
            if (element) {
                const sectionTop = element.offsetTop;
                const sectionBottom = sectionTop + element.offsetHeight;
                
                // Check if scroll position is within this section
                if (scrollPosition >= sectionTop - 50 && scrollPosition < sectionBottom + 50) {
                    const distance = Math.abs(scrollPosition - sectionTop);
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        currentSection = sections[i];
                    }
                }
            }
        }
        
        return currentSection;
    }
    
    // Update active navigation on scroll
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        // Throttle scroll events for performance
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        
        scrollTimeout = setTimeout(updateActiveNav, 10);
    });
    
    // Initial call to set correct active state
    updateActiveNav();
    
    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                // Immediately set active state for clicked link
                navLinks.forEach(navLink => {
                    navLink.removeAttribute('aria-current');
                });
                this.setAttribute('aria-current', 'page');
                
                if (targetElement) {
                    // Special handling for home section - scroll to very top
                    let targetPosition;
                    if (targetId === 'home') {
                        targetPosition = 0;
                    } else {
                        // For other sections, account for fixed navigation height
                        const navHeight = document.querySelector('.main-nav').offsetHeight;
                        targetPosition = targetElement.offsetTop - navHeight;
                    }
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Keyboard navigation support
    navLinks.forEach((link, index) => {
        link.addEventListener('keydown', function(e) {
            let newIndex;
            
            switch(e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                    e.preventDefault();
                    newIndex = (index + 1) % navLinks.length;
                    navLinks[newIndex].focus();
                    break;
                    
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    newIndex = index === 0 ? navLinks.length - 1 : index - 1;
                    navLinks[newIndex].focus();
                    break;
                    
                case 'Home':
                    e.preventDefault();
                    navLinks[0].focus();
                    break;
                    
                case 'End':
                    e.preventDefault();
                    navLinks[navLinks.length - 1].focus();
                    break;
            }
        });
    });
});

/**
 * Image Carousel Functionality
 * Transit-style image gallery with navigation controls
 */
document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.querySelector('.image-carousel');
    if (!carousel) return;

    const track = carousel.querySelector('.carousel-track');
    const slides = carousel.querySelectorAll('.carousel-slide');
    const prevBtn = carousel.querySelector('.carousel-btn--prev');
    const nextBtn = carousel.querySelector('.carousel-btn--next');
    const indicators = carousel.querySelectorAll('.indicator');

    let currentSlide = 0;
    const totalSlides = slides.length;

    // Initialize carousel
    function initCarousel() {
        updateCarousel();
        updateIndicators();
    }

    // Update carousel position
    function updateCarousel() {
        const translateX = -currentSlide * 100;
        track.style.transform = `translateX(${translateX}%)`;
    }

    // Update indicator states
    function updateIndicators() {
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentSlide);
        });
    }

    // Go to next slide
    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateCarousel();
        updateIndicators();
    }

    // Go to previous slide
    function prevSlide() {
        currentSlide = currentSlide === 0 ? totalSlides - 1 : currentSlide - 1;
        updateCarousel();
        updateIndicators();
    }

    // Go to specific slide
    function goToSlide(slideIndex) {
        currentSlide = slideIndex;
        updateCarousel();
        updateIndicators();
    }

    // Event listeners
    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', prevSlide);
    }

    // Indicator clicks
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            goToSlide(index);
        });
    });

    // Keyboard navigation
    carousel.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                prevSlide();
                break;
            case 'ArrowRight':
                e.preventDefault();
                nextSlide();
                break;
        }
    });

    // Touch/swipe support
    let startX = 0;
    let endX = 0;

    carousel.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
    });

    carousel.addEventListener('touchend', function(e) {
        endX = e.changedTouches[0].clientX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = startX - endX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextSlide(); // Swipe left - next slide
            } else {
                prevSlide(); // Swipe right - previous slide
            }
        }
    }

    // Auto-play (optional)
    let autoplayInterval;
    
    function startAutoplay() {
        autoplayInterval = setInterval(nextSlide, 5000); // 5 seconds
    }

    function stopAutoplay() {
        clearInterval(autoplayInterval);
    }

    // Pause autoplay on hover
    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);

    // Initialize the carousel
    initCarousel();
    startAutoplay();
});
