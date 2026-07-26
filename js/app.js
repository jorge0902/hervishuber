document.addEventListener('DOMContentLoaded', () => {
    // Header scroll effect
    const header = document.getElementById('main-header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) {
                header.classList.add('shadow-md');
                if (header.classList.contains('bg-uber-black')) {
                    header.classList.add('bg-uber-black/95', 'backdrop-blur-md');
                } else if (header.classList.contains('bg-white')) {
                    header.classList.add('bg-white/95', 'backdrop-blur-md');
                }
            } else {
                header.classList.remove('shadow-md', 'bg-uber-black/95', 'bg-white/95', 'backdrop-blur-md');
            }
        });
    }

    // Ride options selection logic
    const rideOptions = document.querySelectorAll('.ride-option');
    if (rideOptions.length > 0) {
        rideOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Remove selection from all
                rideOptions.forEach(opt => {
                    opt.classList.remove('border-uber-black', 'bg-uber-gray');
                    opt.classList.add('border-transparent');
                });
                
                // Add selection to clicked
                option.classList.remove('border-transparent');
                option.classList.add('border-uber-black', 'bg-uber-gray');
            });
        });
    }

    // Panel slide-in animation
    const panel = document.getElementById('sliding-panel');
    if (panel) {
        panel.style.transform = 'translateX(-100%)';
        panel.style.opacity = '0';
        setTimeout(() => {
            panel.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
            panel.style.transform = 'translateX(0)';
            panel.style.opacity = '1';
        }, 100);
    }
});
