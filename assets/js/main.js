document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;
  
  // Set default to dark mode for immersive sci-fi feel
  if (!localStorage.getItem('theme')) {
    localStorage.setItem('theme', 'dark');
  }

  if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    if (themeToggle) themeToggle.innerHTML = '<i class="fa-solid fa-sun text-warning"></i>';
  } else {
    body.classList.remove('dark-mode');
    if (themeToggle) themeToggle.innerHTML = '<i class="fa-solid fa-moon text-dark"></i>';
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', (e) => {
      e.preventDefault();
      body.classList.toggle('dark-mode');
      if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
        themeToggle.innerHTML = '<i class="fa-solid fa-sun text-warning"></i>';
      } else {
        localStorage.setItem('theme', 'light');
        themeToggle.innerHTML = '<i class="fa-solid fa-moon text-dark"></i>';
      }
    });
  }

  // RTL Toggle
  const rtlToggle = document.getElementById('rtl-toggle');
  const html = document.documentElement;

  if (localStorage.getItem('dir') === 'rtl') {
    html.setAttribute('dir', 'rtl');
  }

  if (rtlToggle) {
    rtlToggle.addEventListener('click', (e) => {
      e.preventDefault();
      if (html.getAttribute('dir') === 'rtl') {
        html.setAttribute('dir', 'ltr');
        localStorage.setItem('dir', 'ltr');
      } else {
        html.setAttribute('dir', 'rtl');
        localStorage.setItem('dir', 'rtl');
      }
    });
  }

  // Sticky Navbar
  const navbar = document.querySelector('.navbar-custom');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.style.padding = '0.5rem 0';
        navbar.style.boxShadow = '0 5px 25px rgba(0,0,0,0.3)';
        navbar.style.background = body.classList.contains('dark-mode') ? 'rgba(8, 11, 20, 0.95)' : 'rgba(248, 250, 252, 0.95)';
      } else {
        navbar.style.padding = '1rem 0';
        navbar.style.boxShadow = 'none';
        navbar.style.background = body.classList.contains('dark-mode') ? 'rgba(8, 11, 20, 0.8)' : 'rgba(248, 250, 252, 0.8)';
      }
    });
  }

  // Back to top scroll button
  const backToTopBtn = document.createElement('button');
  backToTopBtn.className = 'back-to-top';
  backToTopBtn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
  document.body.appendChild(backToTopBtn);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Animations disabled

  // Swiper Init (Featured Experiences & Testimonials)
  if (typeof Swiper !== 'undefined') {
    const gallerySwiper = new Swiper('.gallery-swiper', {
      slidesPerView: 1,
      spaceBetween: 25,
      loop: true,
      breakpoints: {
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 }
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      }
    });
  }

  // Multi-step Booking System UI Logic
  let currentStep = 1;
  const totalSteps = 5;
  const bookingModal = document.getElementById('bookingModal');
  
  if (bookingModal) {
    const nextBtns = bookingModal.querySelectorAll('.next-step');
    const prevBtns = bookingModal.querySelectorAll('.prev-step');
    const stepIndicators = bookingModal.querySelectorAll('.booking-step');
    const stepContents = bookingModal.querySelectorAll('.booking-step-content');
    
    let selectedExperience = 'Zombie Survival';
    let selectedTime = '12:00 PM';
    let experiencePrice = 45;
    
    // Selecting Experience
    const expOptions = bookingModal.querySelectorAll('.experience-option');
    expOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        expOptions.forEach(o => {
          o.style.borderColor = 'rgba(255,255,255,0.1)';
          o.style.boxShadow = 'none';
        });
        opt.style.borderColor = 'var(--secondary-color)';
        opt.style.boxShadow = '0 0 15px rgba(0, 229, 255, 0.3)';
        selectedExperience = opt.getAttribute('data-exp');
        
        // Update price based on experience
        if (selectedExperience === 'Zombie Survival' || selectedExperience === 'Multiplayer Battle Arena') {
          experiencePrice = 45;
        } else if (selectedExperience === 'Space Exploration') {
          experiencePrice = 60;
        } else if (selectedExperience === 'Racing Simulator') {
          experiencePrice = 30;
        } else {
          experiencePrice = 40;
        }
        updateSummary();
      });
    });
    
    // Selecting Time Slot
    const timeBtns = bookingModal.querySelectorAll('.time-slot-btn');
    timeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        timeBtns.forEach(b => {
          b.style.background = 'transparent';
          b.style.color = 'var(--theme-text)';
          b.classList.remove('active');
        });
        btn.style.background = 'var(--primary-color)';
        btn.style.color = '#fff';
        btn.classList.add('active');
        selectedTime = btn.getAttribute('data-time');
      });
    });
    
    // Update summary price
    function updateSummary() {
      const players = parseInt(document.getElementById('bookingParticipants').value) || 1;
      const total = players * experiencePrice;
      const summaryPriceEl = document.getElementById('summaryPrice');
      const summaryCountEl = document.getElementById('summaryCount');
      const summaryTotalEl = document.getElementById('summaryTotal');
      
      if (summaryPriceEl) summaryPriceEl.innerText = `$${experiencePrice}.00 / player`;
      if (summaryCountEl) summaryCountEl.innerText = players;
      if (summaryTotalEl) summaryTotalEl.innerText = `$${total}.00`;
    }
    
    const participantsInput = document.getElementById('bookingParticipants');
    if (participantsInput) {
      participantsInput.addEventListener('input', updateSummary);
    }
    
    // Navigation
    nextBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.id === 'submitPayment') {
          // Process booking confirmation page
          const date = document.getElementById('bookingDate').value || new Date().toISOString().split('T')[0];
          const station = document.getElementById('bookingStation').value;
          const randomID = 'VRN-' + Math.floor(1000 + Math.random() * 9000) + '-' + String.fromCharCode(65 + Math.floor(Math.random() * 26));
          
          const confirmIDEl = document.getElementById('confirmID');
          const confirmExpEl = document.getElementById('confirmExp');
          const confirmTimeEl = document.getElementById('confirmTime');
          const confirmStationEl = document.getElementById('confirmStation');
          
          if (confirmIDEl) confirmIDEl.innerText = randomID;
          if (confirmExpEl) confirmExpEl.innerText = selectedExperience;
          if (confirmTimeEl) confirmTimeEl.innerText = `${date} @ ${selectedTime}`;
          if (confirmStationEl) confirmStationEl.innerText = station;
        }
        
        if (currentStep < totalSteps) {
          goToStep(currentStep + 1);
        }
      });
    });
    
    prevBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (currentStep > 1) {
          goToStep(currentStep - 1);
        }
      });
    });
    
    function goToStep(step) {
      stepContents.forEach(content => content.classList.add('d-none'));
      const activeContent = document.getElementById(`step-${step}`);
      if (activeContent) activeContent.classList.remove('d-none');
      
      // Update step indicator
      stepIndicators.forEach((ind, idx) => {
        const num = ind.querySelector('.step-num');
        if (idx < step) {
          if (num) {
            num.style.backgroundColor = 'var(--primary-color)';
            num.style.color = '#fff';
          }
          ind.classList.add('active');
        } else {
          if (num) {
            num.style.backgroundColor = 'rgba(255,255,255,0.1)';
            num.style.color = 'var(--text-light)';
          }
          ind.classList.remove('active');
        }
      });
      
      currentStep = step;
    }
    
    // Reset modal on close
    bookingModal.addEventListener('hidden.bs.modal', () => {
      goToStep(1);
      const form = document.getElementById('bookingForm');
      if (form) form.reset();
      expOptions.forEach(o => {
        o.style.borderColor = 'rgba(255,255,255,0.1)';
        o.style.boxShadow = 'none';
      });
      timeBtns.forEach(b => {
        b.style.background = 'transparent';
        b.style.color = 'var(--theme-text)';
        b.classList.remove('active');
      });
    });
  }
});
