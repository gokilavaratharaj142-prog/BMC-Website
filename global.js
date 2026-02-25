document.addEventListener('DOMContentLoaded', () => {
  // Load Header
  fetch('_header.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('global-header').innerHTML = data;
      // Theme Toggler Logic
      const themeToggle = document.getElementById('themeToggle');
      if (themeToggle) {
        const k = 'bmc_theme';
        const cur = localStorage.getItem(k) || 'light';
        document.documentElement.setAttribute('data-theme', cur);
        function txt() { return (localStorage.getItem(k) === 'dark') ? 'Light Mode' : 'Dark Mode' }
        themeToggle.textContent = txt();
        themeToggle.addEventListener('click', () => {
          const now = (localStorage.getItem(k) === 'dark') ? 'light' : 'dark';
          localStorage.setItem(k, now);
          document.documentElement.setAttribute('data-theme', now);
          themeToggle.textContent = txt();
        });
      }
    });

  // Load Footer
  fetch('_footer.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('global-footer').innerHTML = data;
      // Chatbot Logic
      const chatWin = document.getElementById('chatWin');
      const chatToggle = document.getElementById('chatToggle');
      if (chatToggle) {
        chatToggle.addEventListener('click', () => {
          chatWin.style.display = chatWin.style.display === 'none' || chatWin.style.display === '' ? 'block' : 'none';
        });
      }
      const chatSend = document.getElementById('chatSend');
      if(chatSend){
        chatSend.addEventListener('click', () => {
          const input = document.getElementById('chatText');
          const text = input.value.trim();
          if (!text) return;
          reply('You: ' + text);
          setTimeout(() => reply('BMC: ' + handle(text)), 300);
          input.value = '';
        });
      }
    });

  // Lenis Smooth Scroll
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
  });
  function raf(time) {
    lenis.raf(time);
    if (window.ScrollTrigger) {
      window.ScrollTrigger.update();
    }
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Scroll Progress & Nav
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrolled / max) * 100;
    const scrollProgress = document.getElementById('scroll-progress');
    if(scrollProgress) {
        scrollProgress.style.width = progress + '%';
    }
    
    const mainNav = document.querySelector('.main-nav');
    if (mainNav) {
      if (scrolled > 50) {
        mainNav.classList.add('scrolled');
      } else {
        mainNav.classList.remove('scrolled');
      }
    }
  });

  // Custom Cursor
  const cursorDot = document.querySelector('.cursor-dot');
  const outline = document.querySelector('.cursor-outline');
  if (cursorDot && outline) {
    window.addEventListener('mousemove', (e) => {
      const posX = e.clientX;
      const posY = e.clientY;
      cursorDot.style.transform = `translate(${posX}px, ${posY}px)`;
      outline.animate({
        left: `${posX}px`,
        top: `${posY}px`
      }, { duration: 500, fill: 'forwards' });
    });
    document.querySelectorAll('a, button, .dropdown, .product-card, .pod, .service-row, .case-card, .trust-item, .nav-btn, input, textarea, .tab, .btn, .fab, .star, .emoji, .contact-pill, .card').forEach(el => {
      el.addEventListener('mouseenter', () => {
        outline.style.width = '60px';
        outline.style.height = '60px';
        outline.style.background = 'rgba(141, 110, 99, 0.2)';
        outline.style.borderColor = 'transparent';
      });
      el.addEventListener('mouseleave', () => {
        outline.style.width = '40px';
        outline.style.height = '40px';
        outline.style.background = 'transparent';
        outline.style.borderColor = 'var(--accent-dark)';
      });
    });
  }
});

function reply(msg) {
  const body = document.getElementById('chatBody');
  const add = (text) => { const d = document.createElement('div'); d.className = 'chat-msg'; d.textContent = text; body.appendChild(d); body.scrollTop = body.scrollHeight; };
  add(msg);
}

function handle(text) {
  const t = text.toLowerCase();
  if (t.includes('valve')) return 'Valves: Solenoid, Pneumatic, Control, Actuated. Email valves_automation@bestmarketingco.net.';
  if (t.includes('crucible')) return 'Crucibles: Excel, Salamander, Syncarb. Email cruciblebmc@bestmarketingco.net.';
  if (t.includes('contact') || t.includes('phone') || t.includes('call')) return 'Call +91 9095195647 or +91  7373449324.';
  if (t.includes('location') || t.includes('address')) return 'No: 5, RKK Nagar, Singanallur, Coimbatore - 641033.';
  if (t.includes('lubricant') || t.includes('coolant')) return 'MORESCO speciality lubricants & coolants. Email mail@bestmarketingco.net.';
  if (t.includes('quote') || t.includes('request a quote')) return 'Please use Contact → Get Quote or email mail@bestmarketingco.net. Share product, quantity, and timeline.';
  if (t.includes('recommend') || t.includes('suggest') || t.includes('which')) return 'Tell me the application. For flow control: Valves; melting: Crucibles; dosing: Automation; vacuum integrity: Vacuum Casting.';
  return 'Our team will respond soon. Please leave your email and query.';
}
