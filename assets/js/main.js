/* Stock Market Wolf Clone - Main JavaScript */
/* Performance-optimized version with requestAnimationFrame and consolidated observers */

document.addEventListener('DOMContentLoaded', function() {
    
    // Performance optimization utilities
    const performanceUtils = {
        rafId: null,
        isScrolling: false,
        
        // Throttle function using requestAnimationFrame
        rafThrottle(callback) {
            if (this.rafId) return;
            this.rafId = requestAnimationFrame(() => {
                callback();
                this.rafId = null;
            });
        },
        
        // Add will-change hints for better performance
        addWillChange(element, properties = 'transform') {
            element.style.willChange = properties;
        },
        
        // Remove will-change hints when animation is done
        removeWillChange(element) {
            element.style.willChange = 'auto';
        }
    };

    // Ripple effect object pool for better performance
    const ripplePool = {
        pool: [],
        maxSize: 10,
        
        get() {
            if (this.pool.length > 0) {
                return this.pool.pop();
            }
            return document.createElement('span');
        },
        
        release(ripple) {
            if (this.pool.length < this.maxSize) {
                // Clean up the ripple
                ripple.className = '';
                ripple.style.cssText = '';
                ripple.remove();
                this.pool.push(ripple);
            }
        }
    };

    // Consolidated intersection observer system
    const observerManager = {
        observers: new Map(),
        
        create(name, callback, options = {}) {
            const defaultOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };
            const mergedOptions = { ...defaultOptions, ...options };
            
            const observer = new IntersectionObserver(callback, mergedOptions);
            this.observers.set(name, observer);
            return observer;
        },
        
        get(name) {
            return this.observers.get(name);
        },
        
        cleanup() {
            this.observers.forEach(observer => observer.disconnect());
            this.observers.clear();
        }
    };

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

    // Optimized scroll animations with consolidated observer
    function initScrollAnimations() {
        const callback = function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!entry.target.classList.contains('animate-on-scroll')) {
                        performanceUtils.addWillChange(entry.target);
                        entry.target.classList.add('animate-on-scroll');
                        
                        // Remove will-change after animation completes
                        setTimeout(() => {
                            performanceUtils.removeWillChange(entry.target);
                        }, 600);
                    }
                }
            });
        };

        const observer = observerManager.create('scrollAnimations', callback, {
            threshold: 0.15,
            rootMargin: '0px 0px -100px 0px'
        });

        // Observe all sections and cards
        const animatedElements = document.querySelectorAll(
            '.hero-content, .timeline-item, .feature-card, .testimonial-card, .pricing-card, .callout-content, .pain-point-card, .unlock-card'
        );
        
        animatedElements.forEach(el => {
            // Ensure elements are visible by default
            el.style.opacity = '1';
            el.style.transform = 'translate3d(0, 0, 0)';
            observer.observe(el);
        });
    }

    // Optimized button interactions with ripple pooling
    function initButtonEffects() {
        const buttons = document.querySelectorAll('.cta-button, .pricing-button');
        
        buttons.forEach(button => {
            // Prepare button for ripple effects
            button.style.position = 'relative';
            button.style.overflow = 'hidden';
            
            button.addEventListener('click', function(e) {
                const ripple = ripplePool.get();
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
                    will-change: transform, opacity;
                `;
                
                this.appendChild(ripple);
                
                setTimeout(() => {
                    ripplePool.release(ripple);
                }, 600);
            });
        });
    }

    // Optimized timeline animations with consolidated observer
    function initTimelineAnimations() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        
        const callback = function(entries) {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    performanceUtils.addWillChange(entry.target, 'transform, opacity');
                    
                    // Use requestAnimationFrame for smooth animations
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            entry.target.style.opacity = '1';
                            entry.target.style.transform = 'translate3d(0, 0, 0)';
                        }, index * 100); // Reduced stagger for better performance
                    });
                    
                    // Clean up after animation
                    setTimeout(() => {
                        performanceUtils.removeWillChange(entry.target);
                        timelineObserver.unobserve(entry.target);
                    }, (index * 100) + 600);
                }
            });
        };
        
        const timelineObserver = observerManager.create('timeline', callback, { threshold: 0.3 });
        
        timelineItems.forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translate3d(0, 50px, 0)';
            item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            timelineObserver.observe(item);
        });
    }

    // Enhanced video functionality with cover image click interaction
    function initVideoEnhancements() {
        const videos = document.querySelectorAll('video');
        const videoWrappers = document.querySelectorAll('.video-wrapper');
        
        // Initialize legacy video wrappers (existing functionality)
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
        
        // Initialize new video cover click functionality
        initVideoCoverInteraction();
        
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

    // New video cover interaction functionality
    function initVideoCoverInteraction() {
        const videoCoverWrapper = document.querySelector('.video-cover-wrapper');
        const videoPlayerWrapper = document.getElementById('video-player-wrapper');
        const videoCoverImage = document.getElementById('video-cover-image');
        const mainVideoPlayer = document.getElementById('main-video-player');
        
        if (!videoCoverWrapper || !videoPlayerWrapper || !videoCoverImage || !mainVideoPlayer) {
            return;
        }
        
        // Add ripple effect function
        function createRippleEffect(e, element) {
            const ripple = ripplePool.get();
            const rect = element.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height) * 0.6;
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.className = 'video-cover-ripple';
            ripple.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
            `;
            
            element.appendChild(ripple);
            setTimeout(() => ripplePool.release(ripple), 600);
        }
        
        // Log video source on page load
        const videoSources = mainVideoPlayer.querySelectorAll('source');
        videoSources.forEach((source, index) => {
            console.log(`Video source ${index}:`, source.src);
            console.log(`Video source type ${index}:`, source.type);
            
            // Test if source is accessible
            fetch(source.src)
                .then(response => {
                    console.log(`Source ${index} fetch response:`, response.status, response.statusText);
                    if (response.ok) {
                        console.log(`Source ${index} is accessible`);
                    } else {
                        console.error(`Source ${index} is not accessible:`, response.status);
                    }
                })
                .catch(error => {
                    console.error(`Error fetching source ${index}:`, error);
                });
        });
        
        // Video cover click handler with seamless positioning transition
        videoCoverWrapper.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Video cover clicked');
            
            // Prevent multiple clicks during animation
            if (this.classList.contains('animating')) return;
            
            // Mark as animating
            this.classList.add('animating');
            const videoContainer = this.closest('.video-container');
            if (videoContainer) videoContainer.classList.add('animating');
            
            // Create ripple effect
            createRippleEffect(e, this);
            
            // Use requestAnimationFrame for smooth animations
            performanceUtils.rafThrottle(() => {
                // Add will-change hints for better performance
                performanceUtils.addWillChange(videoCoverWrapper, 'opacity, transform');
                performanceUtils.addWillChange(videoPlayerWrapper, 'opacity, transform');
                
                // Prepare video player for seamless transition
                videoPlayerWrapper.style.display = 'block';
                videoPlayerWrapper.style.opacity = '0';
                videoPlayerWrapper.style.transform = 'translateY(0)';
                
                // Simultaneously fade out cover and fade in video for seamless transition
                setTimeout(() => {
                    // Hide cover image
                    videoCoverWrapper.style.opacity = '0';
                    videoCoverWrapper.style.transform = 'translateY(-10px)';
                    
                    // Show video player in exact same position
                    videoPlayerWrapper.style.opacity = '1';
                    videoPlayerWrapper.classList.add('show', 'animate-in');
                    
                    // Auto-play video immediately for seamless experience
                    if (mainVideoPlayer.paused) {
                        mainVideoPlayer.play().catch(error => {
                            console.log('Auto-play prevented by browser:', error);
                            
                            // Show play button overlay if autoplay fails
                            const playOverlay = document.createElement('div');
                            playOverlay.style.cssText = `
                                position: absolute;
                                top: 50%;
                                left: 50%;
                                transform: translate(-50%, -50%);
                                background: rgba(179, 155, 83, 0.9);
                                border-radius: 50%;
                                width: 80px;
                                height: 80px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                cursor: pointer;
                                z-index: 100;
                                transition: all 0.3s ease;
                            `;
                            playOverlay.innerHTML = `
                                <svg width="32" height="32" viewBox="0 0 32 32" fill="white">
                                    <path d="M8 6l20 10L8 26V6z"/>
                                </svg>
                            `;
                            
                            playOverlay.addEventListener('click', () => {
                                mainVideoPlayer.play();
                                playOverlay.remove();
                            });
                            
                            videoPlayerWrapper.appendChild(playOverlay);
                        });
                    }
                }, 50); // Very quick transition for seamless effect
                
                // Clean up will-change hints and animation states
                setTimeout(() => {
                    performanceUtils.removeWillChange(videoCoverWrapper);
                    performanceUtils.removeWillChange(videoPlayerWrapper);
                    videoCoverWrapper.classList.remove('animating');
                    videoCoverWrapper.classList.add('hidden');
                    if (videoContainer) videoContainer.classList.remove('animating');
                }, 400);
            });
        });
        
        // Video event handlers for enhanced UX
        mainVideoPlayer.addEventListener('play', function() {
            // Ensure other videos are paused
            const otherVideos = document.querySelectorAll('video:not(#main-video-player)');
            otherVideos.forEach(video => {
                if (!video.paused) {
                    video.pause();
                }
            });
        });
        
        mainVideoPlayer.addEventListener('ended', function() {
            // Optional: Show cover image again when video ends
            // Uncomment if you want this behavior
            /*
            performanceUtils.rafThrottle(() => {
                videoPlayerWrapper.classList.remove('show', 'animate-in');
                videoPlayerWrapper.style.display = 'none';
                videoCoverWrapper.classList.remove('animate-out');
            });
            */
        });
        
        // Enhanced error handling for video loading
        mainVideoPlayer.addEventListener('error', function(e) {
            console.error('Video loading error:', e);
            console.error('Video error code:', e.target.error.code);
            console.error('Video error message:', e.target.error.message);
            
            // Log video source information
            const sources = mainVideoPlayer.querySelectorAll('source');
            sources.forEach((source, index) => {
                console.error(`Source ${index}:`, source.src);
                console.error(`Source type ${index}:`, source.type);
            });
            
            const videoContainer = this.closest('.video-container');
            
            // Show user-friendly error message
            const errorMessage = document.createElement('div');
            errorMessage.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 20px;
                border-radius: 10px;
                text-align: center;
                z-index: 100;
                font-family: Arial, sans-serif;
            `;
            errorMessage.innerHTML = `
                <p>Unable to load video</p>
                <small>Please check your internet connection and try again</small>
            `;
            
            if (videoContainer) {
                videoContainer.appendChild(errorMessage);
                
                // Remove error message after 5 seconds
                setTimeout(() => {
                    if (errorMessage.parentNode) {
                        errorMessage.parentNode.removeChild(errorMessage);
                    }
                }, 5000);
            }
        });
        
        // Loading state management
        mainVideoPlayer.addEventListener('loadstart', function() {
            console.log('Video load started');
            this.style.filter = 'brightness(0.8)';
        });
        
        mainVideoPlayer.addEventListener('loadeddata', function() {
            console.log('Video data loaded successfully');
        });
        
        mainVideoPlayer.addEventListener('canplay', function() {
            console.log('Video can play');
            this.style.filter = 'brightness(1)';
        });
        
        mainVideoPlayer.addEventListener('canplaythrough', function() {
            console.log('Video can play through');
        });
        
        mainVideoPlayer.addEventListener('canplay', function() {
            this.style.filter = 'brightness(1)';
        });
        
        // Keyboard accessibility
        videoCoverWrapper.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
        
        // Add ARIA attributes for accessibility
        videoCoverWrapper.setAttribute('role', 'button');
        videoCoverWrapper.setAttribute('aria-label', 'Play video');
        videoCoverWrapper.setAttribute('tabindex', '0');
    }

    // Optimized unlock card animations with consolidated observer and pooled ripples
    function initUnlockCardEffects() {
        const unlockCards = document.querySelectorAll('.unlock-card');
        
        if (unlockCards.length === 0) return;
        
        // Use consolidated observer system
        const callback = function(entries) {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    performanceUtils.addWillChange(entry.target, 'transform, opacity');
                    
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            entry.target.style.opacity = '1';
                            entry.target.style.transform = 'translate3d(0, 0, 0)';
                            entry.target.classList.add('animate-on-scroll');
                        }, index * 100); // Reduced stagger for smoother effect
                    });
                    
                    // Clean up after animation
                    setTimeout(() => {
                        performanceUtils.removeWillChange(entry.target);
                        unlockObserver.unobserve(entry.target);
                    }, (index * 100) + 800);
                }
            });
        };
        
        const unlockObserver = observerManager.create('unlockCards', callback, { threshold: 0.2 });
        
        unlockCards.forEach((card, index) => {
            // Initial state for animation
            card.style.opacity = '0';
            card.style.transform = 'translate3d(0, 30px, 0)';
            card.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            
            // Observe for scroll animation
            unlockObserver.observe(card);
            
            // Enhanced hover effects for images with hardware acceleration
            const placeholderImage = card.querySelector('.placeholder-image');
            if (placeholderImage) {
                placeholderImage.style.transition = 'transform 0.3s ease, filter 0.3s ease';
                
                card.addEventListener('mouseenter', function() {
                    performanceUtils.addWillChange(placeholderImage, 'transform, filter');
                    placeholderImage.style.transform = 'scale3d(1.02, 1.02, 1)';
                    placeholderImage.style.filter = 'brightness(1.1)';
                });
                
                card.addEventListener('mouseleave', function() {
                    placeholderImage.style.transform = 'scale3d(1, 1, 1)';
                    placeholderImage.style.filter = 'brightness(1)';
                    
                    setTimeout(() => {
                        performanceUtils.removeWillChange(placeholderImage);
                    }, 300);
                });
            }
            
            // Optimized ripple effect with pooling
            card.addEventListener('click', function(e) {
                const ripple = ripplePool.get();
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
                    will-change: transform, opacity;
                `;
                
                this.appendChild(ripple);
                setTimeout(() => ripplePool.release(ripple), 800);
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

    // Optimized pricing card interactions with hardware acceleration
    function initPricingEffects() {
        const pricingCards = document.querySelectorAll('.pricing-card');
        
        pricingCards.forEach(card => {
            // Prepare card for GPU acceleration
            card.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
            
            card.addEventListener('mouseenter', function() {
                performanceUtils.addWillChange(this, 'transform, box-shadow');
                this.style.transform = 'translate3d(0, -10px, 0) scale(1.02)';
                this.style.boxShadow = '0px 20px 60px rgba(0,0,0,0.5)';
            });
            
            card.addEventListener('mouseleave', function() {
                if (this.classList.contains('featured')) {
                    this.style.transform = 'translate3d(0, -5px, 0) scale(1.05)';
                } else {
                    this.style.transform = 'translate3d(0, 0, 0) scale(1)';
                }
                this.style.boxShadow = '0px 0px 30px rgba(0,0,0,0.3)';
                
                // Remove will-change after transition
                setTimeout(() => {
                    performanceUtils.removeWillChange(this);
                }, 300);
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

    // Optimized parallax effect with requestAnimationFrame throttling
    function initParallaxEffect() {
        const hero = document.querySelector('.hero-section');
        
        if (!hero) return;
        
        // Add will-change hint for better performance
        performanceUtils.addWillChange(hero, 'transform');
        
        let ticking = false;
        
        function updateParallax() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            // Use transform3d for hardware acceleration
            hero.style.transform = `translate3d(0, ${rate}px, 0)`;
            ticking = false;
        }
        
        function onScroll() {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }
        
        window.addEventListener('scroll', onScroll, { passive: true });
        
        // Store cleanup function for later use
        window.parallaxCleanup = () => {
            window.removeEventListener('scroll', onScroll);
            performanceUtils.removeWillChange(hero);
        };
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
        
        // Initialize optimized animations that depend on observerManager
        animateUnlockTitle();
        initPainPointAnimations();
        
        // Add loaded class to body
        document.body.classList.add('loaded');
    }

    // Optimized unlock title animations using consolidated observer
    function animateUnlockTitle() {
        const title = document.querySelector('.unlock-title');
        const subtitle = document.querySelector('.unlock-subtitle');
        
        if (title && subtitle) {
            const callback = function(entries) {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        performanceUtils.addWillChange(subtitle, 'transform, opacity');
                        performanceUtils.addWillChange(title, 'transform, opacity');
                        
                        requestAnimationFrame(() => {
                            subtitle.style.opacity = '1';
                            subtitle.style.transform = 'translate3d(0, 0, 0)';
                            
                            setTimeout(() => {
                                title.style.opacity = '1';
                                title.style.transform = 'translate3d(0, 0, 0)';
                            }, 200);
                        });
                        
                        // Clean up after animations
                        setTimeout(() => {
                            performanceUtils.removeWillChange(subtitle);
                            performanceUtils.removeWillChange(title);
                        }, 800);
                    }
                });
            };
            
            const observer = observerManager.create('unlockTitle', callback, { threshold: 0.5 });
            
            // Set initial state with hardware acceleration
            subtitle.style.opacity = '0';
            subtitle.style.transform = 'translate3d(0, 20px, 0)';
            subtitle.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            
            title.style.opacity = '0';
            title.style.transform = 'translate3d(0, 20px, 0)';
            title.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            
            observer.observe(title);
        }
    }

    // Optimized pain point animations using consolidated observer
    function initPainPointAnimations() {
        const painPointCards = document.querySelectorAll('.pain-point-card');
        const title = document.querySelector('.pain-points-title');
        
        if (painPointCards.length > 0) {
            const cardCallback = function(entries) {
                entries.forEach((entry, index) => {
                    if (entry.isIntersecting && !entry.target.classList.contains('pain-point-animated')) {
                        performanceUtils.addWillChange(entry.target);
                        
                        requestAnimationFrame(() => {
                            setTimeout(() => {
                                entry.target.classList.add('animate-on-scroll', 'pain-point-animated');
                            }, index * 100);
                        });
                        
                        setTimeout(() => {
                            performanceUtils.removeWillChange(entry.target);
                        }, (index * 100) + 600);
                    }
                });
            };
            
            const cardObserver = observerManager.create('painPointCards', cardCallback, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });
            
            // Optimized hover effects for pain point cards
            painPointCards.forEach((card, index) => {
                card.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
                cardObserver.observe(card);
                
                card.addEventListener('mouseenter', () => {
                    performanceUtils.addWillChange(card, 'transform, box-shadow');
                    card.style.transform = 'translate3d(0, -5px, 0) scale(1.02)';
                    card.style.boxShadow = '0 25px 50px rgba(37, 99, 235, 0.4)';
                });
                
                card.addEventListener('mouseleave', () => {
                    card.style.transform = 'translate3d(0, 0, 0) scale(1)';
                    card.style.boxShadow = '0 20px 40px rgba(37, 99, 235, 0.3)';
                    
                    setTimeout(() => {
                        performanceUtils.removeWillChange(card);
                    }, 300);
                });
            });
        }
        
        // Pain point title animation
        if (title) {
            const titleCallback = function(entries) {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        performanceUtils.addWillChange(title, 'transform, opacity');
                        
                        requestAnimationFrame(() => {
                            title.style.opacity = '1';
                            title.style.transform = 'translate3d(0, 0, 0)';
                            title.classList.add('animate-title');
                        });
                        
                        setTimeout(() => {
                            performanceUtils.removeWillChange(title);
                        }, 800);
                    }
                });
            };
            
            const titleObserver = observerManager.create('painPointTitle', titleCallback, { threshold: 0.5 });
            
            // Set initial state
            title.style.opacity = '0';
            title.style.transform = 'translate3d(0, 30px, 0)';
            title.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            
            titleObserver.observe(title);
        }
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
