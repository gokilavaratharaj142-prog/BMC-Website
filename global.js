document.addEventListener('DOMContentLoaded', () => {
  const headerMount = document.getElementById('global-header');
  const footerMount = document.getElementById('global-footer');

  if (headerMount) {
    fetch('_header.html')
      .then((response) => response.text())
      .then((data) => {
        headerMount.innerHTML = data;
        initThemeToggle();
      })
      .catch(() => {});
  }

  if (footerMount) {
    fetch('_footer.html')
      .then((response) => response.text())
      .then((data) => {
        footerMount.innerHTML = data;
        initChatbot();
        initFloatingActions();
        initBackToTop();
      })
      .catch(() => {});
  }

  initScrollUi();
  initCursor();
  initLenis();
});

function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  const key = 'bmc_theme';
  const current = localStorage.getItem(key) || 'light';
  document.documentElement.setAttribute('data-theme', current);

  if (!themeToggle) return;
  const btnText = () => (localStorage.getItem(key) === 'dark' ? 'Light Mode' : 'Dark Mode');
  themeToggle.textContent = btnText();
  themeToggle.addEventListener('click', () => {
    const now = localStorage.getItem(key) === 'dark' ? 'light' : 'dark';
    localStorage.setItem(key, now);
    document.documentElement.setAttribute('data-theme', now);
    themeToggle.textContent = btnText();
  });
}

function initScrollUi() {
  const onScroll = () => {
    const scrolled = window.scrollY;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = (scrolled / max) * 100;
    const scrollProgress = document.getElementById('scroll-progress');
    if (scrollProgress) scrollProgress.style.width = `${progress}%`;

    const nav = document.querySelector('.main-nav');
    if (nav) nav.classList.toggle('scrolled', scrolled > 50);
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

function initLenis() {
  if (!window.Lenis) return;
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
  });

  const raf = (time) => {
    lenis.raf(time);
    if (window.ScrollTrigger) window.ScrollTrigger.update();
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
}

function initCursor() {
  const cursorDot = document.querySelector('.cursor-dot');
  const outline = document.querySelector('.cursor-outline');
  if (!cursorDot || !outline) return;

  window.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    const y = e.clientY;
    cursorDot.style.transform = `translate(${x}px, ${y}px)`;
    outline.animate({ left: `${x}px`, top: `${y}px` }, { duration: 500, fill: 'forwards' });
  });

  document
    .querySelectorAll('a, button, .dropdown, .product-card, .pod, .service-row, .case-card, .trust-item, .nav-btn, input, textarea, .tab, .btn, .fab, .star, .emoji, .contact-pill, .card')
    .forEach((el) => {
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

function initChatbot() {
  const chatWin = document.getElementById('chatWin');
  const chatToggle = document.getElementById('chatToggle');
  const chatClose = document.getElementById('chatClose');
  
  if (chatToggle && chatWin && !chatToggle.dataset.chatBound) {
    chatToggle.dataset.chatBound = '1';
    chatToggle.addEventListener('click', () => {
      chatWin.classList.toggle('is-open');
      if (chatWin.classList.contains('is-open')) {
        trackEngagement('chat');
      }
    });
  }
  
  if (chatClose && chatWin) {
    chatClose.addEventListener('click', () => {
      chatWin.classList.remove('is-open');
    });
  }

  const chatSend = document.getElementById('chatSend');
  const chatInput = document.getElementById('chatText');
  if (chatSend && chatInput) {
    const send = () => {
      const text = chatInput.value.trim();
      if (!text) return;
      addMessage('user', text);
      setTimeout(() => addMessage('bot', handle(text)), 400);
      chatInput.value = '';
    };
    chatSend.addEventListener('click', send);
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        send();
      }
    });
  }

  // Quick reply buttons
  const quickBtns = document.querySelectorAll('.quick-btn');
  quickBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const msg = btn.dataset.msg;
      addMessage('user', msg);
      setTimeout(() => addMessage('bot', handle(msg)), 400);
    });
  });

  document.addEventListener('click', (e) => {
    if (!chatWin || !chatWin.classList.contains('is-open')) return;
    if (e.target.closest('#chatWin') || e.target.closest('#chatToggle')) return;
    chatWin.classList.remove('is-open');
  });
}

function addMessage(sender, text) {
  const body = document.getElementById('chatBody');
  if (!body) return;
  
  // Remove quick replies after first message
  const quickReplies = document.getElementById('quickReplies');
  if (quickReplies && sender === 'user') {
    quickReplies.style.display = 'none';
  }
  
  const bubble = document.createElement('div');
  bubble.className = sender === 'user' ? 'chat-msg user-msg' : 'chat-msg bot-msg';
  
  const msgText = document.createElement('div');
  msgText.className = 'msg-text';
  msgText.textContent = text;
  bubble.appendChild(msgText);
  
  body.appendChild(bubble);
  body.scrollTop = body.scrollHeight;
}

function handle(text) {
  const t = text.toLowerCase();
  
  // Keyword detection with professional responses
  if (t.includes('product') || t.includes('view products')) {
    return 'We offer Valves, Crucibles, Foundry Products, Coolants & Lubricants, Die Casting Machines, and Automation Solutions. Visit our Products page for details.';
  }
  if (t.includes('valve')) {
    return 'Our valve range includes Solenoid, Pneumatic, Control, and Actuated valves. Contact gokilavaratharaj142@gmail.com for specifications.';
  }
  if (t.includes('crucible')) {
    return 'We supply Excel, Salamander, and Syncarb crucibles for various melting applications. Email gokilavaratharaj142@gmail.com for more information.';
  }
  if (t.includes('automation') || t.includes('die casting')) {
    return 'BMC Automation & Solutions provides non-ferrous foundry automation and cold chamber die casting machines. Contact us for custom solutions.';
  }
  if (t.includes('price') || t.includes('cost') || t.includes('quote')) {
    return 'For pricing and quotations, please contact our sales team at gokilavaratharaj142@gmail.com or call +91 9095195647.';
  }
  if (t.includes('contact') || t.includes('sales')) {
    return 'Reach us at: Phone: +91 9095195647, Email: gokilavaratharaj142@gmail.com, Address: No. 5, R.K.K Nagar, Singanallur, Coimbatore - 641033.';
  }
  if (t.includes('support') || t.includes('technical')) {
    return 'Our technical support team is ready to assist you. Email gokilavaratharaj142@gmail.com or call +91 9095195647 for immediate support.';
  }
  if (t.includes('company') || t.includes('about') || t.includes('info')) {
    return 'Best Marketing Company, established in 1994, is a leading marketing company based in Coimbatore with operations across Tamil Nadu, Kerala, and Karnataka.';
  }
  if (t.includes('location') || t.includes('address') || t.includes('where')) {
    return 'We are located at No. 5, R.K.K Nagar, Neelikonam Palayan Post, Singanallur, Coimbatore - 641033, Tamil Nadu, India.';
  }
  if (t.includes('lubricant') || t.includes('coolant')) {
    return 'We supply MORESCO specialty lubricants and coolants for industrial applications. Contact gokilavaratharaj142@gmail.com for product details.';
  }
  
  return 'Thank you for your message. Our team will respond shortly. For immediate assistance, please call +91 9095195647 or email gokilavaratharaj142@gmail.com.';
}

function initFloatingActions() {
  const wrap = document.querySelector('.fab-wrap');
  if (!wrap || wrap.dataset.bound === '1') return;
  wrap.dataset.bound = '1';

  const items = wrap.querySelectorAll('.fab');
  const wa = items[0];
  const call = items[1];
  const mail = items[2];

  if (wa) {
    wa.setAttribute('href', 'https://wa.me/919095195647');
    wa.setAttribute('target', '_blank');
    wa.setAttribute('rel', 'noopener');
    wa.addEventListener('click', () => trackEngagement('whatsapp'));
  }
  if (call) {
    call.setAttribute('href', 'tel:+919095195647');
    call.addEventListener('click', () => trackEngagement('call'));
  }
  if (mail) {
    mail.setAttribute('href', 'mailto:gokilavaratharaj142@gmail.com');
    mail.addEventListener('click', () => trackEngagement('email'));
  }
}

function trackEngagement(type) {
  const API_BASE = window.API_BASE || 'http://localhost:5000';
  fetch(`${API_BASE}/api/engagement/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type,
      page: window.location.pathname
    })
  }).catch(err => console.log('Tracking error:', err));
}

function initBackToTop() {
  const btn = document.getElementById('homeTopBtn');
  if (!btn || btn.dataset.bound === '1') return;
  btn.dataset.bound = '1';

  const syncState = () => {
    if (window.scrollY > 300) btn.classList.add('is-visible');
    else btn.classList.remove('is-visible');
  };

  syncState();
  window.addEventListener('scroll', syncState, { passive: true });
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
