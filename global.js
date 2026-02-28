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
  if (chatToggle && chatWin) {
    chatToggle.dataset.chatBound = '1';
    chatToggle.addEventListener('click', () => {
      chatWin.style.display = chatWin.style.display === 'block' ? 'none' : 'block';
    });
  }

  const chatSend = document.getElementById('chatSend');
  const chatInput = document.getElementById('chatText');
  if (chatSend && chatInput) {
    const send = () => {
      const text = chatInput.value.trim();
      if (!text) return;
      reply(`You: ${text}`);
      setTimeout(() => reply(`BMC: ${handle(text)}`), 250);
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

  document.addEventListener('click', (e) => {
    if (!chatWin || chatWin.style.display !== 'block') return;
    if (e.target.closest('#chatWin') || e.target.closest('#chatToggle')) return;
    chatWin.style.display = 'none';
  });
}

function reply(msg) {
  const body = document.getElementById('chatBody');
  if (!body) return;
  const bubble = document.createElement('div');
  bubble.className = 'chat-msg';
  bubble.textContent = msg;
  body.appendChild(bubble);
  body.scrollTop = body.scrollHeight;
}

function handle(text) {
  const t = text.toLowerCase();
  if (t.includes('valve')) return 'Valves: Solenoid, Pneumatic, Control, Actuated. Email valves_automation@bestmarketingco.net.';
  if (t.includes('crucible')) return 'Crucibles: Excel, Salamander, Syncarb. Email cruciblebmc@bestmarketingco.net.';
  if (t.includes('contact') || t.includes('phone') || t.includes('call')) return 'Call +91 9095195647 or +91 7373449324.';
  if (t.includes('location') || t.includes('address')) return 'No: 5, RKK Nagar, Singanallur, Coimbatore - 641033.';
  if (t.includes('lubricant') || t.includes('coolant')) return 'MORESCO speciality lubricants and coolants. Email mail@bestmarketingco.net.';
  if (t.includes('quote') || t.includes('request a quote')) return 'Please use Contact -> Get Quote or email mail@bestmarketingco.net.';
  if (t.includes('recommend') || t.includes('suggest') || t.includes('which')) return 'Tell me the application. For flow control: Valves; melting: Crucibles; dosing: Automation; vacuum integrity: Vacuum Casting.';
  return 'Our team will respond soon. Please leave your email and query.';
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
    wa.setAttribute('href', 'https://wa.me/919944403032');
    wa.setAttribute('target', '_blank');
    wa.setAttribute('rel', 'noopener');
  }
  if (call) call.setAttribute('href', 'tel:+914222314527');
  if (mail) mail.setAttribute('href', 'mailto:mail@bestmarketingco.net');
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
