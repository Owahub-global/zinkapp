

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