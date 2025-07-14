/* Stock Market Wolf Clone - Main JavaScript */
/* Extracted core functionality from original 70 JS files */

document.addEventListener('DOMContentLoaded', function() {
    
    // Smooth scrolling for anchor links
    function initSmoothScrolling() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Animate elements on scroll
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-on-scroll');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe all sections and cards
        const animatedElements = document.querySelectorAll(
            '.hero-content, .timeline-item, .feature-card, .testimonial-card, .pricing-card, .callout-content, .pain-point-card, .unlock-card'
        );
        
        animatedElements.forEach(el => {
            observer.observe(el);
        });
    }

    // Enhanced button interactions
    function initButtonEffects() {
        const buttons = document.querySelectorAll('.cta-button, .pricing-button');
        
        buttons.forEach(button => {
            // Add ripple effect on click
            button.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s linear;
                    pointer-events: none;
                `;
                
                this.style.position = 'relative';
                this.style.overflow = 'hidden';
                this.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
    }

    // Timeline animations
    function initTimelineAnimations() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        
        const timelineObserver = new IntersectionObserver(function(entries) {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 200);
                    timelineObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        
        timelineItems.forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(50px)';
            item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            timelineObserver.observe(item);
        });
    }

    // Video enhancements
    function initVideoEnhancements() {
        const videos = document.querySelectorAll('video');
        const videoWrappers = document.querySelectorAll('.video-wrapper');
        
        videoWrappers.forEach(wrapper => {
            const video = wrapper.querySelector('video');
            const overlay = wrapper.querySelector('.video-overlay');
            const playButton = wrapper.querySelector('.play-button');
            
            if (video && overlay) {
                // Click to play/pause
                wrapper.addEventListener('click', function(e) {
                    e.preventDefault();
                    if (video.paused) {
                        video.play();
                        wrapper.classList.add('playing');
                    } else {
                        video.pause();
                        wrapper.classList.remove('playing');
                    }
                });
                
                // Update overlay when video starts/ends
                video.addEventListener('play', function() {
                    wrapper.classList.add('playing');
                });
                
                video.addEventListener('pause', function() {
                    wrapper.classList.remove('playing');
                });
                
                video.addEventListener('ended', function() {
                    wrapper.classList.remove('playing');
                });
                
                // Ensure poster is visible initially
                video.addEventListener('loadeddata', function() {
                    if (video.currentTime === 0) {
                        wrapper.classList.remove('playing');
                    }
                });
            }
        });
        
        videos.forEach(video => {
            // Pause other videos when one starts playing
            video.addEventListener('play', function() {
                videos.forEach(otherVideo => {
                    if (otherVideo !== this && !otherVideo.paused) {
                        otherVideo.pause();
                    }
                });
            });
            
            // Add loading state
            video.addEventListener('loadstart', function() {
                this.style.opacity = '0.7';
            });
            
            video.addEventListener('canplay', function() {
                this.style.opacity = '1';
            });
            
            // Add smooth transitions
            video.style.transition = 'opacity 0.3s ease';
        });
    }

    // Unlock card animations and interactions
    function initUnlockCardEffects() {
        const unlockCards = document.querySelectorAll('.unlock-card');
        
        // Scroll-based reveal animations
        const unlockObserver = new IntersectionObserver(function(entries) {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                        entry.target.classList.add('animate-on-scroll');
                    }, index * 150); // Stagger the animations
                    unlockObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        
        unlockCards.forEach((card, index) => {
            // Initial state for animation
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            
            // Observe for scroll animation
            unlockObserver.observe(card);
            
            // Enhanced hover effects for images
            const placeholderImage = card.querySelector('.placeholder-image');
            if (placeholderImage) {
                card.addEventListener('mouseenter', function() {
                    placeholderImage.style.transform = 'scale(1.02)';
                    placeholderImage.style.filter = 'brightness(1.1)';
                });
                
                card.addEventListener('mouseleave', function() {
                    placeholderImage.style.transform = 'scale(1)';
                    placeholderImage.style.filter = 'brightness(1)';
                });
            }
            
            // Add ripple effect on card click
            card.addEventListener('click', function(e) {
                const ripple = document.createElement('div');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height) * 0.1;
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(37, 99, 235, 0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: cardRipple 0.8s ease-out;
                    pointer-events: none;
                    z-index: 10;
                `;
                
                this.appendChild(ripple);
                setTimeout(() => ripple.remove(), 800);
            });
        });
    }

    // Add card ripple animation CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes cardRipple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        .unlock-card {
            cursor: pointer;
        }
        
        .unlock-card:hover .placeholder-image {
            transition: transform 0.3s ease, filter 0.3s ease;
        }
        
        .placeholder-image {
            transition: transform 0.3s ease, filter 0.3s ease;
        }
    `;
    document.head.appendChild(style);

    // Pricing card interactions
    function initPricingEffects() {
        const pricingCards = document.querySelectorAll('.pricing-card');
        
        pricingCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-10px) scale(1.02)';
                this.style.boxShadow = '0px 20px 60px rgba(0,0,0,0.5)';
            });
            
            card.addEventListener('mouseleave', function() {
                if (this.classList.contains('featured')) {
                    this.style.transform = 'translateY(-5px) scale(1.05)';
                } else {
                    this.style.transform = 'translateY(0) scale(1)';
                }
                this.style.boxShadow = '0px 0px 30px rgba(0,0,0,0.3)';
            });
        });
    }

    // Form handling (if forms are added later)
    function initFormHandling() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Add your form submission logic here
                const submitButton = this.querySelector('button[type="submit"]');
                const originalText = submitButton.textContent;
                
                submitButton.textContent = 'Processing...';
                submitButton.disabled = true;
                
                // Simulate form submission
                setTimeout(() => {
                    submitButton.textContent = 'Success!';
                    setTimeout(() => {
                        submitButton.textContent = originalText;
                        submitButton.disabled = false;
                    }, 2000);
                }, 1000);
            });
        });
    }

    // Performance optimization: Lazy load images
    function initLazyLoading() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver(function(entries) {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.classList.add('fade-in');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            images.forEach(img => imageObserver.observe(img));
        }
    }

    // Add parallax effect to hero section
    function initParallaxEffect() {
        const hero = document.querySelector('.hero-section');
        
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            if (hero) {
                hero.style.transform = `translateY(${rate}px)`;
            }
        });
    }

    // Initialize all functionality
    function init() {
        initSmoothScrolling();
        initScrollAnimations();
        initButtonEffects();
        initTimelineAnimations();
        initVideoEnhancements();
        initUnlockCardEffects(); // Added unlock card animations
        initPricingEffects();
        initFormHandling();
        initLazyLoading();
        initParallaxEffect();
        
        // Add loaded class to body
        document.body.classList.add('loaded');
    }

    // Run initialization
    init();
    
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            // Recalculate any position-dependent elements
            console.log('Window resized, recalculating layouts...');
        }, 250);
    });
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .fade-in {
        animation: fadeIn 0.6s ease-in;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    body.loaded .hero-content {
        animation: fadeInUp 1s ease-out;
    }
    
    .pricing-card {
        transition: all 0.3s ease;
    }
    
    .feature-card:hover {
        animation: pulse 0.6s ease-in-out;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);

// Unlock Potential Section Animations
function initUnlockPotentialAnimations() {
    const unlockCards = document.querySelectorAll('.unlock-card');
    
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 200); // Stagger the animations
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Set initial state and observe cards
    unlockCards.forEach((card) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
    
    // Add hover sound effect (optional)
    unlockCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            // Optional: Add subtle scale effect on hover
            card.style.transform = 'translateY(-5px) scale(1.01)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add small delay to ensure CSS is loaded
    setTimeout(initUnlockPotentialAnimations, 100);
});

// Add smooth reveal animation for the unlock title
function animateUnlockTitle() {
    const title = document.querySelector('.unlock-title');
    const subtitle = document.querySelector('.unlock-subtitle');
    
    if (title && subtitle) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    subtitle.style.opacity = '1';
                    subtitle.style.transform = 'translateY(0)';
                    
                    setTimeout(() => {
                        title.style.opacity = '1';
                        title.style.transform = 'translateY(0)';
                    }, 200);
                }
            });
        }, { threshold: 0.5 });
        
        // Set initial state
        subtitle.style.opacity = '0';
        subtitle.style.transform = 'translateY(20px)';
        subtitle.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        title.style.opacity = '0';
        title.style.transform = 'translateY(20px)';
        title.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        observer.observe(title);
    }
}

// Add title animation
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(animateUnlockTitle, 150);
});



// Pain Point Cards Animation
function initPainPointAnimations() {
    const painPointCards = document.querySelectorAll('.pain-point-card');
    const painPointSection = document.querySelector('.pain-points-section');
    
    if (painPointCards.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                painPointCards.forEach((card, index) => {
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                        card.classList.add('animate-reveal');
                    }, index * 150); // Stagger effect
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    // Set initial state
    painPointCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        
        // Add enhanced hover effects
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px)';
            card.style.boxShadow = '0 25px 50px rgba(37, 99, 235, 0.4)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 20px 40px rgba(37, 99, 235, 0.3)';
        });
        
        // Add click ripple effect
        card.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(37, 99, 235, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
                z-index: 1;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    if (painPointSection) {
        observer.observe(painPointSection);
    }
}

// Pain Point Title Animation
function animatePainPointTitle() {
    const title = document.querySelector('.pain-points-title');
    
    if (title) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    title.style.opacity = '1';
                    title.style.transform = 'translateY(0)';
                    title.classList.add('animate-title');
                }
            });
        }, { threshold: 0.5 });
        
        // Set initial state
        title.style.opacity = '0';
        title.style.transform = 'translateY(30px)';
        title.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        
        observer.observe(title);
    }
}

// Initialize pain point animations
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initPainPointAnimations, 100);
    setTimeout(animatePainPointTitle, 50);
});
