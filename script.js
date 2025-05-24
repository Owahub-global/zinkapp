  // Function to for sales countdown
  
    function saveCountdown(d, h, m, s) {
        const endTime = new Date();
        endTime.setDate(endTime.getDate() + d);
        endTime.setHours(endTime.getHours() + h);
        endTime.setMinutes(endTime.getMinutes() + m);
        endTime.setSeconds(endTime.getSeconds() + s);
        localStorage.setItem('countdownEnd', endTime.getTime());
    }

    // Function to load countdown state from localStorage
    function loadCountdown() {
        const storedEnd = localStorage.getItem('countdownEnd');
        if (!storedEnd) return null;
        
        const now = new Date().getTime();
        const remaining = Math.max(0, storedEnd - now);
        
        if (remaining <= 0) return null;
        
        const seconds = Math.floor((remaining / 1000) % 60);
        const minutes = Math.floor((remaining / (1000 * 60)) % 60);
        const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
        const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
        
        return { days, hours, minutes, seconds };
    }

    // Function to update the countdown display
    function updateCountdown(d, h, m, s) {
        document.getElementById('countdown').textContent = 
            `${d} : ${h}h : ${m}m : ${s}s`;
    }

    // Function to start the countdown
    function startCountdown() {
        // Try to load saved countdown
        let saved = loadCountdown();
        
        // If no saved countdown or it's expired, start a new one
        if (!saved) {
            saved = {
                days: 20,
                hours: 18,
                minutes: 30,
                seconds: 12
            };
            saveCountdown(saved.days, saved.hours, saved.minutes, saved.seconds);
        }

        let { days, hours, minutes, seconds } = saved;
        
        const countdownInterval = setInterval(() => {
            seconds--;
            
            if (seconds < 0) {
                seconds = 59;
                minutes--;
            }
            
            if (minutes < 0) {
                minutes = 59;
                hours--;
            }
            
            if (hours < 0) {
                hours = 23;
                days--;
            }
            
            // Save current state every second
            saveCountdown(days, hours, minutes, seconds);
            
            // When countdown reaches zero
            if (days <= 0 && hours <= 0 && minutes <= 0 && seconds <= 0) {
                clearInterval(countdownInterval);
                localStorage.removeItem('countdownEnd');
                updateCountdown(0, 0, 0, 0);
                return;
            }
            
            updateCountdown(days, hours, minutes, seconds);
        }, 1000);
    }

    // Start the countdown when the page loads
    document.addEventListener('DOMContentLoaded', () => {
        startCountdown();
        
       

        
    });

// Amount raised

   document.addEventListener('DOMContentLoaded', function() {
    const targetAmount = 1508102.61;
    const duration = 10000; // 8 seconds total animation
    const counterElement = document.getElementById('raisedAmount');
    const progressBar = document.getElementById('progressBar');
    
    // Smooth counting animation
    let startTime = null;
    
    function animateCounter(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Calculate current value (ease-out effect)
      const currentAmount = Math.floor(progress * targetAmount);
      
      // Update display
      counterElement.textContent = currentAmount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      
      // Update progress bar (20% max)
      progressBar.style.width = `${Math.min(progress * 100, 20)}%`;
      
      // Continue until target reached
      if (progress < 1) {
        requestAnimationFrame(animateCounter);
      } else {
        // Final update to exact target
        counterElement.textContent = targetAmount.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
        progressBar.style.width = '20%';
      }
    }
    
    // Start animation when component is in view
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        requestAnimationFrame(animateCounter);
        observer.unobserve(entries[0].target);
      }
    }, { threshold: 0.5 });
    
    observer.observe(document.querySelector('.card'));
  });