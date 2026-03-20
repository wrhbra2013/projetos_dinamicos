const Performance = {
    init() {
        this.lazyLoad();
        this.optimizeScroll();
        this.optimizeResize();
    },

    lazyLoad() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const el = entry.target;
                        if (el.dataset.src) {
                            el.src = el.dataset.src;
                            observer.unobserve(el);
                        }
                    }
                });
            });

            document.querySelectorAll('[data-src]').forEach(img => {
                observer.observe(img);
            });
        }
    },

    optimizeScroll() {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.onScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
    },

    optimizeResize() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.onResize();
            }, 150);
        });
    },

    onScroll() {
        // Callback for scroll optimization
    },

    onResize() {
        // Callback for resize optimization
    },

    measure(fn, label) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        console.log(`${label}: ${(end - start).toFixed(2)}ms`);
        return result;
    }
};

document.addEventListener('DOMContentLoaded', () => Performance.init());