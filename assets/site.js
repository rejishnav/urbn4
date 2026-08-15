const navEl = document.querySelector('nav');
  const onNavScroll = ()=>{ navEl.classList.toggle('scrolled', window.scrollY > 40); };
  window.addEventListener('scroll', onNavScroll, { passive:true });
  onNavScroll();

  // ---- Hamburger menu ----
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  function setMenu(open){
    navToggle.classList.toggle('open', open);
    mobileMenu.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  navToggle.addEventListener('click', ()=> setMenu(!navToggle.classList.contains('open')));
  mobileMenu.querySelectorAll('a').forEach(a=> a.addEventListener('click', ()=> setMenu(false)));
  document.addEventListener('keydown', (e)=>{
    if(e.key==='Escape' && navToggle.classList.contains('open')) setMenu(false);
  });

  const revealEls = document.querySelectorAll('.reveal, .reveal-mask');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(el=>io.observe(el));

  // ---- Reduced motion check ----
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Cursor-reactive dot-field background ----
  (function(){
    const canvas = document.getElementById('bgCanvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const isTouch = !window.matchMedia('(hover:hover) and (pointer:fine)').matches;
    let w, h, dots = [];
    const spacing = 34;
    const radius = 140;
    let mouseX = -9999, mouseY = -9999;

    function resize(){
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      dots = [];
      for(let y = spacing/2; y < h; y += spacing){
        for(let x = spacing/2; x < w; x += spacing){
          dots.push({ ox:x, oy:y });
        }
      }
    }
    window.addEventListener('resize', resize);
    resize();

    if(!isTouch && !prefersReducedMotion){
      window.addEventListener('mousemove', (e)=>{ mouseX = e.clientX; mouseY = e.clientY; });
      window.addEventListener('mouseleave', ()=>{ mouseX = -9999; mouseY = -9999; });
    }

    function draw(){
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(11,11,10,0.07)';
      for(const d of dots){
        let px = d.ox, py = d.oy, size = 0.55;
        if(!isTouch && !prefersReducedMotion){
          const dx = d.ox - mouseX, dy = d.oy - mouseY;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if(dist < radius){
            const force = 1 - dist / radius;
            const angle = Math.atan2(dy, dx);
            px = d.ox + Math.cos(angle) * force * 8;
            py = d.oy + Math.sin(angle) * force * 8;
            size = 0.55 + force * 1.2;
          }
        }
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    draw();
  })();

  // ---- Split-word stagger reveal ----
  function splitWords(el){
    const walker = document.createDocumentFragment();
    let wordIndex = 0;
    el.childNodes.forEach(node=>{
      if(node.nodeType === Node.TEXT_NODE){
        const words = node.textContent.split(' ');
        words.forEach((word, i)=>{
          if(word.length){
            const wrap = document.createElement('span');
            wrap.className = 'split-word';
            const inner = document.createElement('span');
            inner.className = 'split-word-inner';
            inner.textContent = word;
            inner.style.transitionDelay = (wordIndex * 70) + 'ms';
            wrap.appendChild(inner);
            walker.appendChild(wrap);
            wordIndex++;
          }
          if(i < words.length - 1) walker.appendChild(document.createTextNode(' '));
        });
      } else if(node.nodeName === 'BR'){
        walker.appendChild(document.createElement('br'));
      } else {
        walker.appendChild(node.cloneNode(true));
      }
    });
    el.innerHTML = '';
    el.appendChild(walker);
  }

  const heroTitleEl = document.getElementById('heroTitle');
  const ctaTitleEl = document.getElementById('ctaTitle');
  if(heroTitleEl) splitWords(heroTitleEl);
  if(ctaTitleEl) splitWords(ctaTitleEl);

  if(ctaTitleEl){
    const ctaIo = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){ e.target.classList.add('split-ready'); ctaIo.unobserve(e.target); }
      });
    }, { threshold: 0.2 });
    ctaIo.observe(ctaTitleEl);
  }

  // ---- Intro curtain ----
  const introCurtain = document.getElementById('introCurtain');

if (introCurtain) {
  if (prefersReducedMotion) {
    introCurtain.remove();
    if (heroTitleEl) heroTitleEl.classList.add('split-ready');
  } else {

    requestAnimationFrame(() => introCurtain.classList.add('visible'));

    window.addEventListener('load', () => {
      setTimeout(() => {
        introCurtain.classList.add('leaving');

        if (heroTitleEl) heroTitleEl.classList.add('split-ready');

        setTimeout(() => introCurtain.remove(), 1100);

      }, 1400);
    });

    // Fallback in case 'load' already fired or is slow
    setTimeout(() => {
      if (
        document.body.contains(introCurtain) &&
        !introCurtain.classList.contains('leaving')
      ) {
        introCurtain.classList.add('leaving');

        if (heroTitleEl) heroTitleEl.classList.add('split-ready');

        setTimeout(() => introCurtain.remove(), 1100);

      }
    }, 2600);
  }
}
  // ---- Custom cursor (desktop / fine-pointer only) ----
  const customCursor = document.getElementById('customCursor');
  if(customCursor && window.matchMedia('(hover:hover) and (pointer:fine)').matches){
    document.body.classList.add('has-custom-cursor');
    let cx = 0, cy = 0, tx = 0, ty = 0;
    window.addEventListener('mousemove', (e)=>{
      tx = e.clientX; ty = e.clientY;
      customCursor.classList.add('ready');
    });
    function trackCursor(){
      const dx = tx - cx;
const dy = ty - cy;

const speed = Math.hypot(dx, dy);

const ease = Math.min(0.38, 0.18 + speed / 350);

cx += dx * ease;
cy += dy * ease;
      customCursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
      requestAnimationFrame(trackCursor);
    }
    trackCursor();

    document.querySelectorAll('.masonry-item').forEach(item=>{
      item.addEventListener('mouseenter', ()=> customCursor.classList.add('cursor-view'));
      item.addEventListener('mouseleave', ()=> customCursor.classList.remove('cursor-view'));
    });
    document.querySelectorAll('.cta').forEach(section=>{
      section.addEventListener('mouseenter', ()=> customCursor.classList.add('cursor-light'));
      section.addEventListener('mouseleave', ()=> customCursor.classList.remove('cursor-light'));
    });
  }

  // ---- Magnetic buttons ----
  if(!prefersReducedMotion){
    document.querySelectorAll('.magnetic').forEach(btn=>{
      btn.addEventListener('mousemove', (e)=>{
        const rect = btn.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width/2);
        const dy = e.clientY - (rect.top + rect.height/2);
        btn.style.transform = `translate(${dx*0.28}px, ${dy*0.35}px)`;
      });
      btn.addEventListener('mouseleave', ()=>{ btn.style.transform = 'translate(0,0)'; });
    });
  }

  // ---- Animated stat counters ----
  const countEls = document.querySelectorAll('.count');
  const countIo = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      const el = e.target;
      const target = parseFloat(el.dataset.target);
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const suffix = el.dataset.suffix || '';
      const duration = 1600;
      const start = performance.now();
      function tick(now){
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = target * eased;
        el.textContent = val.toFixed(decimals) + suffix;
        if(p < 1) requestAnimationFrame(tick);
        else el.textContent = target.toFixed(decimals) + suffix;
      }
      requestAnimationFrame(tick);
      countIo.unobserve(el);
    });
  }, { threshold: 0.4 });
  countEls.forEach(el=> countIo.observe(el));

  // ---- Project popup (window, not a page) ----
  const projectModal = document.getElementById('projectModal');
  let lastFocused = null;

  function openProject(title, year, img){
    document.getElementById('pmTitle').textContent = title;
    document.getElementById('pmYear').textContent = year;
    document.getElementById('pmImage').src = img;
    document.getElementById('pmImage').alt = title;
    lastFocused = document.activeElement;
    projectModal.classList.add('open');
    projectModal.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
  }
  function closeProject(){
    projectModal.classList.remove('open');
    projectModal.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
    if(lastFocused) lastFocused.focus();
  }
  document.addEventListener('keydown', (e)=>{
    if(e.key==='Escape' && projectModal.classList.contains('open')) closeProject();
  });
  // Allow opening a project card with Enter/Space (keyboard access)
  document.querySelectorAll('.masonry-item').forEach(item=>{
    item.addEventListener('keydown', (e)=>{
      if(e.key==='Enter' || e.key===' '){ e.preventDefault(); item.click(); }
    });
  });

  // ---- Enquiry form ----
  // No backend is connected yet — this opens a pre-filled email as a placeholder.
  // Swap this for a real endpoint (Formspree, your CRM, etc.) when ready.
  function handleEnquiry(e){
    e.preventDefault();
    const f = e.target;
    const name = f.name.value.trim();
    const email = f.email.value.trim();
    const service = f.service.value;
    const message = f.message.value.trim();
    const subject = encodeURIComponent(`Enquiry from ${name} — ${service}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nPhone: ${f.phone.value.trim()}\nBuilding: ${service}\n\n${message}`);
    window.location.href = `mailto:infourbn4@gmail.com?subject=${subject}&body=${body}`;
    document.getElementById('efNote').textContent = "Opening your email client — we'll reply within two working days.";
    return false;
  }

  // ---- Newsletter signup ----
  // No backend connected yet — swap for Mailchimp/ConvertKit/your ESP when ready.
  function handleNewsletter(e){
    e.preventDefault();
    const input = e.target.email;
    const note = document.getElementById('nlNote');
    if(input.value.trim()){
      note.textContent = "Thanks — you're on the list.";
      input.value = '';
    }
    return false;
  }
