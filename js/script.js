
document.addEventListener('DOMContentLoaded', () => {

    /* --- Music Control --- */
    const musicToggle = document.getElementById('music-toggle');
    const music = new Audio('assets/Billy-Simpson-Be-My-Wife-(CeeNaija.com).mp3');
    music.loop = true;
    music.volume = 0.5; // Start at 50% volume for a gentle experience

    let isPlaying = false;

    musicToggle.addEventListener('click', () => {
        if (!isPlaying) {
            music.play().then(() => {
                musicToggle.querySelector('.text').textContent = "Music Playing 🎶";
                musicToggle.classList.add('playing');
                isPlaying = true;
            }).catch(e => {
                console.error("Audio playback failed:", e);
                alert("Please interact with the page first needed for audio playback.");
            });
        } else {
            music.pause();
            musicToggle.querySelector('.text').textContent = "Play Music";
            musicToggle.classList.remove('playing');
            isPlaying = false;
        }
    });

    /* --- Scroll Reveal Animation --- */
    const observerOptions = {
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });

    /* --- Envelope Interaction --- */
    const envelope = document.getElementById('envelope');
    const overlay = document.getElementById('letter-overlay');
    const closeOverlayBtn = document.getElementById('close-overlay');

    envelope.addEventListener('click', (e) => {
        if (!envelope.classList.contains('open')) {
            envelope.classList.add('open');
            launchConfetti();

            // Wait for flap animation then show overlay
            setTimeout(() => {
                overlay.classList.add('active');
            }, 600);
        }
    });

    closeOverlayBtn.addEventListener('click', () => {
        overlay.classList.remove('active');
        // Wait for overlay to fade out before closing envelope
        setTimeout(() => {
            envelope.classList.remove('open');
        }, 500);
    });

    /* --- Confetti Effect --- */
    // Simple confetti implementation
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    const colors = ['#FFD1DC', '#E6E6FA', '#F5DEB3', '#FFB7C5'];

    class Particle {
        constructor(isSustain = false) {
            this.x = Math.random() * canvas.width;
            // If sustain, spawn just above screen. If blast (initial), scatter vertically off-screen to on-screen for immediate effect
            this.y = isSustain ? -20 : Math.random() * canvas.height - canvas.height;
            this.size = Math.random() * 8 + 5;
            this.speedY = Math.random() * 3 + 2; // Slightly faster
            this.speedX = Math.random() * 2 - 1;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.rotation = Math.random() * 360;
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            this.rotation += 2;
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation * Math.PI / 180);
            ctx.fillStyle = this.color;
            // Draw heart shape approximation or square
            ctx.fillRect(0, 0, this.size, this.size);
            ctx.restore();
        }
    }

    function initConfetti() {
        // Blast on load
        for (let i = 0; i < 700; i++) {
            particles.push(new Particle());
        }
        animateConfetti();
    }

    function animateConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p, index) => {
            p.update();
            p.draw();
            if (p.y > canvas.height) {
                particles.splice(index, 1);
            }
        });

        // Sustain low density
        while (particles.length < 30) {
            particles.push(new Particle(true));
        }

        requestAnimationFrame(animateConfetti);
    }

    function launchConfetti() {
        for (let i = 0; i < 100; i++) { // Smaller blast on interaction
            particles.push(new Particle());
        }
    }

    // Trigger on load
    initConfetti();

    // Responsive Canvas
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    // Smooth Scroll Helper
    window.scrollToSection = function (id) {
        document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
    }

    // 3D Tilt Effect for Photo Cards
    document.querySelectorAll('.photo-card, .memory-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
    /* --- Relationship Timer --- */
    let startDate = new Date('2021-07-07T16:00:00');

    window.setRelationshipDate = (val) => {
        if (val) {
            startDate = new Date(val);
            updateTimer();
        }
    };

    function updateTimer() {
        const now = new Date();

        let years = now.getFullYear() - startDate.getFullYear();
        let months = now.getMonth() - startDate.getMonth();
        let days = now.getDate() - startDate.getDate();
        let hours = now.getHours() - startDate.getHours();
        let minutes = now.getMinutes() - startDate.getMinutes();
        let seconds = now.getSeconds() - startDate.getSeconds();

        // Adjust for negative values
        if (seconds < 0) { seconds += 60; minutes--; }
        if (minutes < 0) { minutes += 60; hours--; }
        if (hours < 0) { hours += 24; days--; }
        if (days < 0) {
            const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
            days += prevMonth.getDate();
            months--;
        }
        if (months < 0) { months += 12; years--; }

        // Formatting Helper
        const format = (n) => n < 10 ? '0' + n : n;

        if (document.getElementById('years')) {
            document.getElementById('years').innerText = format(years);
            document.getElementById('months').innerText = format(months);
            document.getElementById('days').innerText = format(days);
            document.getElementById('hours').innerText = format(hours);
            document.getElementById('minutes').innerText = format(minutes);
            document.getElementById('seconds').innerText = format(seconds);
        }
    }

    // Update immediately and then every second
    updateTimer();
    setInterval(updateTimer, 1000);

    /* --- Lightbox Logic --- */
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeLightbox = document.querySelector('.close-lightbox');

    document.querySelectorAll('.polaroid-item').forEach(item => {
        item.addEventListener('click', () => {
            const imgSrc = item.querySelector('img').src;
            const caption = item.getAttribute('data-caption');

            lightboxImg.src = imgSrc;
            lightboxCaption.textContent = caption;
            lightbox.classList.add('active');
        });
    });

    closeLightbox.addEventListener('click', () => {
        lightbox.classList.remove('active');
    });

    // Close on background click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.classList.remove('active');
        }
    });

    /* --- Cinematic Love Letter Entry --- */
    const letterSection = document.querySelector('.letter-section');
    const envelopeContainer = document.querySelector('.envelope-container');
    const clickHint = document.querySelector('.click-hint');

    // Remove opacity temporarily if JS fails (failsafe) - actually better to just run logic
    // but here is the observer:
    if (letterSection) {
        const cinematicObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // 1. Trigger Entrance
                    letterSection.classList.add('cinematic-active');

                    // 2. Schedule Idle Animations
                    setTimeout(() => {
                        if (envelopeContainer) envelopeContainer.classList.add('idle-active');
                        if (clickHint) clickHint.classList.add('idle');
                    }, 2500);

                    observer.unobserve(entry.target); // Run once
                }
            });
        }, { threshold: 0.2 });

        cinematicObserver.observe(letterSection);
    }

    /* --- Cinematic Promise Scroll --- */
    const promiseSection = document.querySelector('.promise-section');
    if (promiseSection) {
        const promiseObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Slight delay to ensure user has stopped scrolling roughly
                    setTimeout(() => {
                        promiseSection.classList.add('active');
                    }, 200);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 }); // Wait until 30% visible
        promiseObserver.observe(promiseSection);

        // Failsafe specific for the scroll paper logic
        // Check if element is in viewport if observer fails
        setInterval(() => {
            if (!promiseSection.classList.contains('active')) {
                const rect = promiseSection.getBoundingClientRect();
                // If top is in viewport
                if (rect.top < window.innerHeight * 0.7 && rect.bottom > 0) {
                    promiseSection.classList.add('active');
                }
            }
        }, 1000);
    }

});
