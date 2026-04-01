/* ═══════════════════════════════════════════════════════════
   IMAM DOULA — 3D PORTFOLIO WEBSITE
   Main JavaScript — Spline Integration, Scroll Animations
   ═══════════════════════════════════════════════════════════ */

const navbar = document.getElementById('navbar');

// ─── GSAP & Lenis Initialization ────────────────────────
gsap.registerPlugin(ScrollTrigger);

let lenis;
try {
  // TITANIC FIX: Disable Lenis on mobile devices to use native 120Hz smooth touch
  const isMobile = window.innerWidth <= 768;

  if (!isMobile) {
    lenis = new Lenis({
      lerp: 0.5, // ABSOLUTE-SPEED: 2x faster than snappy, near-native response
      duration: 0.4, // Instant stop
      smoothWheel: true,
      wheelMultiplier: 1.0, // Pure precision
      syncTouch: true,
    });
  }
} catch (error) {
  console.warn('Lenis startup skipped.', error);
}




if (lenis) {
  // Connect Lenis to GSAP Ticker for frame-perfect sync
  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  // Balanced lag smoothing for stability on older hardware
  gsap.ticker.lagSmoothing(1000, 16); 
}



if (lenis) {
  lenis.on('scroll', (e) => {
    // Update Navbar
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Velocity-based optimizations (Reduced frequency of class toggles)
    if (Math.abs(e.velocity) > 0.5) {
      document.body.classList.add('is-scrolling');
    } else {
      document.body.classList.remove('is-scrolling');
    }
  });
}


// ─── Preloader ───────────────────────────────────────────


const startTime = Date.now();
const MIN_PRELOADER_TIME = 1500; // Smart Eager Floor

const hidePreloader = () => {
  const preloader = document.getElementById('preloader');
  const elapsed = Date.now() - startTime;
  const remaining = Math.max(0, MIN_PRELOADER_TIME - elapsed);

  setTimeout(() => {
    if (preloader && !preloader.classList.contains('hidden')) {
      preloader.classList.add('hidden');
      // Ensure scroll is enabled if it was locked
      document.documentElement.classList.remove('lenis-stopped');
      document.body.style.overflow = ''; 
    }
  }, remaining);
};

// Hide on window load with a smart floor
window.addEventListener('load', hidePreloader);

// Emergency Fail-Safe: Force hide after 5s if load fails
setTimeout(hidePreloader, 5000);


// ─── Navbar Scroll Effect ────────────────────────────────
// Throttling helper removed - now handled by Lenis event loop



// ─── Mobile Nav Logic (The Overhaul) ────────────────────
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
const navClose = document.getElementById('navClose');
const navOverlay = document.getElementById('navOverlay');

const openNav = () => {
  navToggle.classList.add('active');
  navLinks.classList.add('open');
  navOverlay.classList.add('active');
  document.body.style.overflow = 'hidden'; // Prevent background scroll
};

const closeNav = () => {
  navToggle.classList.remove('active');
  navLinks.classList.remove('open');
  navOverlay.classList.remove('active');
  document.body.style.overflow = ''; // Restore scroll
};

navToggle.addEventListener('click', openNav);
navClose.addEventListener('click', closeNav);
navOverlay.addEventListener('click', closeNav);

// Close on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeNav);
});

// Gesture: Swipe Left to Close
let touchStartX = 0;
navLinks.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

navLinks.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
}, { passive: true });

// Navbar scroll effects are handled in the main Lenis loop at the top for better performance.

// Scroll to Close logic
let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
  if (navLinks.classList.contains('open')) {
    const currentScrollY = window.scrollY;
    if (Math.abs(currentScrollY - lastScrollY) > 20) {
      closeNav();
    }
  }
  lastScrollY = window.scrollY;
}, { passive: true });

// ─── Contact Form Handling (Web3Forms) ───────────────────
// ─── Contact Form Handling (Web3Forms) ───────────────────
const contactForm = document.getElementById('contactForm');
const formResult = document.getElementById('formResult');
const submitBtn = document.getElementById('submitBtn');

if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    console.log("Form submission started...");
    
    // UI state: Loading
    submitBtn.disabled = true;
    const btnSpan = submitBtn.querySelector('span');
    const originalBtnText = btnSpan.innerText;
    btnSpan.innerText = "Sending...";
    
    formResult.style.display = "block";
    formResult.innerHTML = "Sending your message...";
    formResult.classList.remove('success', 'error');

    const formData = new FormData(contactForm);
    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: json
    })
    .then(async (response) => {
      let result = await response.json();
      console.log("Web3Forms Response:", result);
      
      if (response.status == 200 || result.success) {
        formResult.innerHTML = "✨ Message sent successfully! I'll get back to you soon.";
        formResult.classList.add('success');
        contactForm.reset();
      } else {
        formResult.innerHTML = result.message || "Something went wrong. Please try again.";
        formResult.classList.add('error');
      }
    })
    .catch(error => {
      console.error("Submission Error:", error);
      formResult.innerHTML = "Network error. Please check your connection and try again.";
      formResult.classList.add('error');
    })
    .finally(() => {
      submitBtn.disabled = false;
      btnSpan.innerText = originalBtnText;
      
      // Auto-hide success message after 8 seconds, but keep errors visible
      if (formResult.classList.contains('success')) {
        setTimeout(() => {
          formResult.innerHTML = "";
          formResult.classList.remove('success');
        }, 8000);
      }
    });
  });
}

// ─── Smooth Scroll (Lenis handled) ───────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const target = anchor.getAttribute('href');
    if (target === '#') return;
    if (lenis) {
      lenis.scrollTo(target, { offset: -80 });
    } else {
      // Fallback for mobile where Lenis is disabled
      const element = document.querySelector(target);
      if (element) {
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  });
});


/* Reveals removed for instant content visibility */



// ─── Expandable Experience Cards ─────────────────────────
document.querySelectorAll('[data-expandable]').forEach(card => {
  card.addEventListener('click', () => {
    // Close other cards
    document.querySelectorAll('[data-expandable].expanded').forEach(other => {
      if (other !== card) other.classList.remove('expanded');
    });
    card.classList.toggle('expanded');
  });
});

// ─── Project Filter ──────────────────────────────────────
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active button
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    projectCards.forEach(card => {
      if (filter === 'all') {
        card.classList.remove('hidden-card');
        card.style.display = 'flex';
        setTimeout(() => card.style.opacity = '1', 10);
      } else {
        const tags = card.dataset.tags || '';
        if (tags.includes(filter)) {
          card.classList.remove('hidden-card');
          card.style.display = 'flex';
          setTimeout(() => card.style.opacity = '1', 10);
        } else {
          card.style.opacity = '0';
          setTimeout(() => {
            if (card.style.opacity === '0') card.classList.add('hidden-card');
          }, 400);
        }
      }
    });

  });
});

// ─── Active Nav Highlight ────────────────────────────────
const sections = document.querySelectorAll('section[id]');

const navHighlightObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.querySelectorAll('a').forEach(link => {
        link.classList.remove('active-link');
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active-link');
        }
      });
    }
  });
}, {
  threshold: 0.3,
  rootMargin: '-80px 0px -50% 0px'
});

sections.forEach(section => navHighlightObserver.observe(section));

// Clean Watermark Removal using MutationObserver
function observeSplineWatermark(viewer) {
  const removeLogo = (root) => {
    const logo = root.querySelector('#logo');
    if (logo) {
      logo.style.display = 'none';
      logo.style.opacity = '0';
      logo.style.visibility = 'hidden';
      return true;
    }
    return false;
  };

  const processShadowRoot = (sr) => {
    if (!sr) return;
    if (removeLogo(sr)) return;
    
    const observer = new MutationObserver(() => {
      if (removeLogo(sr)) observer.disconnect();
    });
    observer.observe(sr, { childList: true, subtree: true });
  };

  if (viewer.shadowRoot) {
    processShadowRoot(viewer.shadowRoot);
  } else {
    // Wait for shadowRoot to be created
    const rootObserver = new MutationObserver(() => {
      if (viewer.shadowRoot) {
        processShadowRoot(viewer.shadowRoot);
        rootObserver.disconnect();
      }
    });
    rootObserver.observe(viewer, { childList: true });
  }
}

// ─── Hardware-Based Quality Detection ──────────
const isLowEnd = (navigator.deviceMemory && navigator.deviceMemory < 4) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4);

// ─── Aggressive Spline Culling (Visibility Based) ──────── 
document.querySelectorAll('spline-viewer').forEach(viewer => {
  // Optimization for older computers: Lower pixel density
  if (isLowEnd) {
    viewer.setAttribute('render-config', JSON.stringify({ dpr: 1 }));
    console.log('Low-end device detected: Spline Quality throttled for stability.');
  }

  // Ensure we observe the watermark removal
  observeSplineWatermark(viewer);

  // Check if it's a fullscreen background (fixed)
  const parentStyle = window.getComputedStyle(viewer.parentElement);
  const isFixed = parentStyle.position === 'fixed';

  if (isFixed) {
    // Background models should ALWAYS be visible and never culled
    viewer.style.visibility = 'visible';
    viewer.style.opacity = '1';
    return;
  }

  // Total Scoped Culling for non-fixed models: Use visibility + display to drop GPU layers
  ScrollTrigger.create({
    trigger: viewer,
    start: "top bottom+=50", // INSTANT CULLING: 50px threshold
    end: "bottom top-=50",
    onEnter: () => {
      viewer.style.display = 'block';
      viewer.style.opacity = '1';
      viewer.style.visibility = 'visible';
    },
    onLeave: () => {
      viewer.style.display = 'none';
      viewer.style.opacity = '0';
      viewer.style.visibility = 'hidden';
    },
    onEnterBack: () => {
      viewer.style.display = 'block';
      viewer.style.opacity = '1';
      viewer.style.visibility = 'visible';
    },
    onLeaveBack: () => {
      viewer.style.display = 'none';
      viewer.style.opacity = '0';
      viewer.style.visibility = 'hidden';
    }
  });

  // Initial state check — Immediate culling
  const rect = viewer.getBoundingClientRect();
  if (rect.top < window.innerHeight + 50 && rect.bottom > -50) {
    viewer.style.display = 'block';
    viewer.style.opacity = '1';
    viewer.style.visibility = 'visible';
  } else {
    viewer.style.display = 'none';
    viewer.style.opacity = '0';
    viewer.style.visibility = 'hidden';
  }
});







 
 // ─── Native Spline scroll interactions will now handle the drawer smoothly ─────────


// ─── Native Spline scroll interactions will now handle the drawer smoothly ─────────


// ─── Staggered Animation for Project Cards ───────────────
const projectGrid = document.querySelector('.projects-grid');
if (projectGrid) {
  const gridObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      const cards = projectGrid.querySelectorAll('.project-card');
      cards.forEach((card, i) => {
        setTimeout(() => {
          card.classList.add('visible');
        }, i * 60);
      });
      gridObserver.unobserve(projectGrid);
    }
  }, { threshold: 0.05 });
  gridObserver.observe(projectGrid);
}

// ─── Animated Counter for Highlight Cards ────────────────
function animateCounter(el, target) {
  let current = 0;
  const increment = target / 40;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = Math.floor(current) + (el.dataset.suffix || '+');
  }, 30);
}

const highlightCards = document.querySelectorAll('.highlight-number');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const text = entry.target.textContent;
      const numMatch = text.match(/\d+/);
      if (numMatch) {
        const targetNum = parseInt(numMatch[0]);
        const suffix = text.replace(/\d+/, '');
        entry.target.dataset.suffix = suffix;
        animateCounter(entry.target, targetNum);
      }
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

highlightCards.forEach(card => counterObserver.observe(card));
