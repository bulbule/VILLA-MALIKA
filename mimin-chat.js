/* Chatbot "Mimin" untuk web Villa Malika
 *
 * Cara pasang:
 *  1. Taruh file ini, "admin a.png" dan "admin b.png" di folder yang sama dengan index.html
 *  2. Pastikan index.html memuat:  <script src="mimin-chat.js" defer></script>  (sebelum </body>)
 *
 * Jawaban Harga & Fasilitas dibaca langsung dari isi index.html (kartu villa),
 * jadi kalau harga/fasilitas di index.html diubah, chatbot otomatis ikut berubah.
 */
(function () {
  'use strict';
  if (document.getElementById('miminLauncher')) return;

  /* ===== PENGATURAN ===== */
  var IMG_TERBUKA = 'admin b.png';   // Mimin mata terbuka (tukar nama file jika terbalik)
  var IMG_SENYUM  = 'admin a.png';   // Mimin tersenyum, mata tertutup
  var WA_NUMBER   = '6281315265266';
  var WA_SAPAAN   = 'Halo Mrs. Nova, ';
  var MAPS_URL    = 'https://www.google.com/maps/search/?api=1&query=' +
                    encodeURIComponent('VILLA MALIKA 2, Jl. Pasir Tugu No.17, Cibeureum, Cisarua');
  var VILLAS = [
    { id: 'villa3', short: 'Villa 3' },
    { id: 'villa2', short: 'Villa 2' },
    { id: 'villa1', short: 'Villa 1' }
  ];

  /* ===== STYLE ===== */
  var css = [
    '.mimin-launcher{position:fixed;right:14px;bottom:88px;z-index:950;width:70px;height:70px;border-radius:50%;border:3px solid var(--gold-accent,#d4af37);background:#fff;padding:0;cursor:pointer;box-shadow:0 8px 24px rgba(11,19,41,.28);animation:miminFloat 3.4s ease-in-out infinite;-webkit-tap-highlight-color:transparent}',
    '.mimin-launcher::after{content:"";position:absolute;inset:-6px;border-radius:50%;border:2px solid var(--gold-accent,#d4af37);opacity:0;animation:miminPulse 3.4s ease-out infinite;pointer-events:none}',
    '.mimin-launcher:focus-visible{outline:3px solid #0b1329;outline-offset:3px}',
    '.mimin-face{position:absolute;inset:0;border-radius:50%;overflow:hidden;transition:transform .35s ease;display:flex;align-items:center;justify-content:center;color:var(--navy-dark,#0b1329);font-size:1.6rem}',
    '.mimin-face img{position:absolute;inset:3px;width:calc(100% - 6px);height:calc(100% - 6px);object-fit:contain;transition:opacity .3s ease;user-select:none;-webkit-user-drag:none}',
    '.mimin-face .smile{opacity:0}',
    '.mimin-launcher.smile .mimin-face .smile{opacity:1}',
    '.mimin-launcher.smile .mimin-face .open{opacity:0}',
    '.mimin-launcher.smile .mimin-face{transform:scale(1.07) rotate(-5deg)}',
    '.mimin-dot{position:absolute;top:0;right:0;width:15px;height:15px;border-radius:50%;background:#ef4444;border:2px solid #fff}',

    '.mimin-bubble{position:fixed;right:96px;bottom:104px;z-index:950;max-width:210px;background:#fff;color:var(--text-main,#0f172a);font-size:.86rem;font-weight:600;line-height:1.35;padding:10px 14px;border-radius:16px 16px 4px 16px;box-shadow:0 8px 24px rgba(11,19,41,.18);border:1px solid #e2e8f0;cursor:pointer;opacity:0;transform:translateY(8px) scale(.96);pointer-events:none;transition:opacity .3s ease,transform .3s ease}',
    '.mimin-bubble.show{opacity:1;transform:none;pointer-events:auto}',

    '.mimin-win{position:fixed;right:14px;bottom:88px;z-index:950;width:360px;max-width:calc(100vw - 28px);height:540px;max-height:calc(100vh - 110px);max-height:calc(100dvh - 110px);background:#f8fafc;border-radius:24px;box-shadow:0 20px 50px rgba(11,19,41,.35);border:1px solid #e2e8f0;display:flex;flex-direction:column;overflow:hidden;opacity:0;visibility:hidden;transform:translateY(16px) scale(.97);transform-origin:bottom right;pointer-events:none;transition:opacity .25s ease,transform .25s ease,visibility .25s}',
    '.mimin-win.open{opacity:1;visibility:visible;transform:none;pointer-events:auto}',
    '.mimin-win:focus{outline:none}',
    '.mimin-head{display:flex;align-items:center;gap:12px;padding:14px 16px;background:linear-gradient(135deg,#0b1329,#1e293b);color:#fff;flex-shrink:0}',
    '.mimin-avatar{width:44px;height:44px;border-radius:50%;background:#fff;border:2px solid var(--gold-accent,#d4af37);flex-shrink:0;overflow:hidden;display:flex;align-items:center;justify-content:center}',
    '.mimin-avatar img{width:100%;height:100%;object-fit:contain}',
    '.mimin-title{flex:1;min-width:0}',
    '.mimin-title strong{display:block;font-size:.98rem;font-weight:800}',
    '.mimin-title span{display:flex;align-items:center;gap:6px;font-size:.76rem;color:#cbd5e1}',
    '.mimin-title span::before{content:"";width:8px;height:8px;border-radius:50%;background:#22c55e}',
    '.mimin-close{background:rgba(255,255,255,.12);border:0;color:#fff;width:34px;height:34px;border-radius:50%;font-size:1.2rem;line-height:1;cursor:pointer;flex-shrink:0}',
    '.mimin-close:hover{background:rgba(255,255,255,.22)}',

    '.mimin-body{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;overscroll-behavior:contain}',
    '.mimin-msg{max-width:88%;padding:10px 13px;border-radius:16px;font-size:.88rem;line-height:1.5;white-space:pre-line;word-wrap:break-word;animation:miminIn .25s ease}',
    '.mimin-msg.bot{align-self:flex-start;background:#fff;color:var(--text-main,#0f172a);border:1px solid #e2e8f0;border-bottom-left-radius:4px}',
    '.mimin-msg.user{align-self:flex-end;background:var(--navy-dark,#0b1329);color:#fff;border-bottom-right-radius:4px}',
    '.mimin-typing{display:flex;gap:5px;align-items:center;padding:13px 15px}',
    '.mimin-typing i{width:7px;height:7px;border-radius:50%;background:#94a3b8;animation:miminDot 1s infinite ease-in-out}',
    '.mimin-typing i:nth-child(2){animation-delay:.15s}',
    '.mimin-typing i:nth-child(3){animation-delay:.3s}',

    '.mimin-chips{display:flex;flex-wrap:wrap;gap:8px;padding:10px 12px 14px;background:#fff;border-top:1px solid #e2e8f0;max-height:42%;overflow-y:auto;flex-shrink:0}',
    '.mimin-chips:empty{display:none}',
    '.mimin-chip{border:1px solid #cbd5e1;background:#fff;color:var(--navy-dark,#0b1329);border-radius:20px;padding:8px 14px;font-size:.82rem;font-weight:600;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:6px;line-height:1.2;transition:background .2s,color .2s,border-color .2s}',
    '.mimin-chip:hover{background:var(--navy-dark,#0b1329);border-color:var(--navy-dark,#0b1329);color:#fff}',
    '.mimin-chip.wa{background:#16a34a;border-color:#16a34a;color:#fff}',
    '.mimin-chip.wa:hover{background:#15803d;border-color:#15803d}',

    '@keyframes miminFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}',
    '@keyframes miminPulse{0%{transform:scale(.9);opacity:.7}70%,100%{transform:scale(1.25);opacity:0}}',
    '@keyframes miminIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}',
    '@keyframes miminDot{0%,80%,100%{transform:translateY(0);opacity:.5}40%{transform:translateY(-4px);opacity:1}}',

    '@media(max-width:480px){.mimin-win{left:8px;right:8px;width:auto;max-width:none;bottom:80px;max-height:calc(100vh - 96px);max-height:calc(100dvh - 96px)}}',
    '@media(prefers-reduced-motion:reduce){.mimin-launcher,.mimin-launcher::after,.mimin-typing i{animation:none}.mimin-face,.mimin-face img,.mimin-win,.mimin-bubble{transition:none}}'
  ].join('\n');

  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ===== HELPER ===== */
  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function src(name) { return encodeURI(name); }
  function waUrl(msg) { return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(WA_SAPAAN + msg); }
  function makeImg(name, cls) {
    var i = new Image();
    i.src = src(name);
    i.alt = '';
    i.draggable = false;
    if (cls) i.className = cls;
    return i;
  }

  /* ===== DATA (dibaca dari isi halaman) ===== */
  function villaData(v) {
    var root = document.getElementById(v.id);
    if (!root) return null;
    var nameEl = root.querySelector('.villa-name');
    var introEl = root.querySelector('.villa-intro');
    var facilities = Array.prototype.map.call(root.querySelectorAll('.facility-text'), function (n) { return n.textContent.trim(); });
    var rates = Array.prototype.map.call(root.querySelectorAll('.rate-row'), function (r) {
      return { label: r.querySelector('.rate-label').textContent.trim(), price: r.querySelector('.rate-price').textContent.trim() };
    });
    return {
      name: nameEl ? nameEl.textContent.trim() : 'Villa Malika ' + v.short.slice(-1),
      intro: introEl ? introEl.textContent.trim() : '',
      facilities: facilities,
      rates: rates
    };
  }
  function bundlingPrice() {
    var d = villaData(VILLAS[0]);
    if (!d) return '';
    var r = d.rates.filter(function (x) { return /bundling/i.test(x.label); })[0];
    return r ? r.price : '';
  }
  function alamat() {
    var n = document.querySelector('.maps-card div');
    var t = n ? n.textContent.replace(/\s+/g, ' ').trim() : '';
    return t || 'Jl. Pasir Tugu No.17, Cibeureum, Cisarua, Bogor';
  }

  /* ===== BANGUN TAMPILAN ===== */
  var launcher = el('button', 'mimin-launcher');
  launcher.id = 'miminLauncher';
  launcher.type = 'button';
  launcher.setAttribute('aria-label', 'Buka chat dengan Mimin');
  var face = el('span', 'mimin-face');
  var imgOpen = makeImg(IMG_TERBUKA, 'open');
  var imgSmile = makeImg(IMG_SENYUM, 'smile');
  var fallback = el('i', 'fa-solid fa-comments');
  fallback.style.display = 'none';
  imgOpen.onerror = function () { imgOpen.style.display = 'none'; imgSmile.style.display = 'none'; fallback.style.display = ''; };
  face.appendChild(imgOpen);
  face.appendChild(imgSmile);
  face.appendChild(fallback);
  var dot = el('span', 'mimin-dot');
  launcher.appendChild(face);
  launcher.appendChild(dot);

  var bubble = el('div', 'mimin-bubble', 'Ada yang bisa Mimin bantu? 👋');
  bubble.setAttribute('role', 'button');

  var win = el('section', 'mimin-win');
  win.setAttribute('role', 'dialog');
  win.setAttribute('aria-label', 'Chat Mimin Villa Malika');
  win.tabIndex = -1;

  var head = el('div', 'mimin-head');
  var avatar = el('div', 'mimin-avatar');
  avatar.appendChild(makeImg(IMG_TERBUKA));
  var title = el('div', 'mimin-title');
  title.appendChild(el('strong', '', 'Mimin Villa Malika'));
  title.appendChild(el('span', '', 'Online · siap membantu'));
  var closeBtn = el('button', 'mimin-close', '×');
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', 'Tutup chat');
  head.appendChild(avatar);
  head.appendChild(title);
  head.appendChild(closeBtn);

  var body = el('div', 'mimin-body');
  body.setAttribute('aria-live', 'polite');
  var chips = el('div', 'mimin-chips');
  chips.setAttribute('aria-label', 'Pilihan pertanyaan');

  win.appendChild(head);
  win.appendChild(body);
  win.appendChild(chips);
  document.body.appendChild(win);
  document.body.appendChild(bubble);
  document.body.appendChild(launcher);

  /* ===== STATE ===== */
  var isOpen = false, engaged = false, started = false, busy = false;

  function scrollDown() { body.scrollTop = body.scrollHeight; }
  function addMsg(text, who) {
    var m = el('div', 'mimin-msg ' + who, text);
    body.appendChild(m);
    scrollDown();
    return m;
  }
  async function say(text) {
    var t = el('div', 'mimin-msg bot mimin-typing');
    t.appendChild(el('i')); t.appendChild(el('i')); t.appendChild(el('i'));
    body.appendChild(t);
    scrollDown();
    await wait(500 + Math.min(text.length * 4, 500));
    t.remove();
    addMsg(text, 'bot');
  }
  function setChips(list) {
    chips.innerHTML = '';
    list.forEach(function (c) {
      var b;
      if (c.href) {
        b = el('a', 'mimin-chip' + (c.wa ? ' wa' : ''), c.label);
        b.href = c.href;
        b.target = '_blank';
        b.rel = 'noopener';
      } else {
        b = el('button', 'mimin-chip', c.label);
        b.type = 'button';
        b.addEventListener('click', function () { choose(c); });
      }
      chips.appendChild(b);
    });
  }
  async function choose(c) {
    if (busy) return;
    busy = true;
    chips.innerHTML = '';
    addMsg(c.label, 'user');
    try { await c.run(); } catch (e) { menuChips(); }
    busy = false;
  }

  /* ===== ALUR PERCAKAPAN ===== */
  function waChip(label, msg) { return { label: label, href: waUrl(msg), wa: true }; }

  function menuChips() {
    setChips([
      { label: '💰 Harga', run: flowHargaPilih },
      { label: '🏊 Fasilitas', run: flowFasilitasPilih },
      { label: '📍 Lokasi', run: flowLokasi },
      { label: '📋 Ketentuan booking', run: flowKetentuan },
      { label: '📅 Cara booking', run: flowCaraBooking },
      waChip('💬 Chat Admin', 'saya ingin bertanya tentang Villa Malika.')
    ]);
  }
  async function flowMenu() {
    await say('Ada lagi yang bisa Mimin bantu, kak? 😊');
    menuChips();
  }
  function pilihVillaChips(run) {
    return VILLAS.map(function (v) {
      var d = villaData(v);
      return { label: '🏠 ' + (d ? d.name : 'Villa ' + v.short), run: function () { return run(v); } };
    });
  }

  async function flowHargaPilih() {
    await say('Mau cek harga villa yang mana, kak? 😊');
    var list = pilihVillaChips(flowHarga);
    list.push({ label: '🎁 Paket Bundling 2 & 3', run: flowBundling });
    list.push({ label: '☰ Menu utama', run: flowMenu });
    setChips(list);
  }
  async function flowHarga(v) {
    var d = villaData(v);
    if (!d || !d.rates.length) {
      await say('Maaf kak, daftar harga belum bisa ditampilkan. Silakan chat admin ya 🙏');
      return menuChips();
    }
    var lines = d.rates.map(function (r) { return '• ' + r.label + ': ' + r.price; });
    await say('💰 Harga sewa ' + d.name + '\n\n' + lines.join('\n'));
    await say('Harga bisa menyesuaikan tanggal tertentu (event / libur panjang), jadi untuk harga final dan ketersediaan tanggal silakan cek ke admin ya kak 😊');
    setChips([
      { label: '🏊 Fasilitas villa ini', run: function () { return flowFasilitas(v); } },
      { label: '🏠 Villa lain', run: flowHargaPilih },
      waChip('📅 Booking via WhatsApp', 'saya tertarik untuk melakukan booking ' + d.name + '. Mohon informasi ketersediaan tanggal dan prosedurnya. Terima kasih!'),
      { label: '☰ Menu utama', run: flowMenu }
    ]);
  }
  async function flowBundling() {
    var price = bundlingPrice();
    var txt = '🎁 Paket Bundling Villa Malika 2 & 3\n\nSewa Villa 2 dan Villa 3 sekaligus, dapat potongan Rp1.000.000 per malam dari total harga normal kedua villa.';
    if (price) txt += '\n\n• Harga bundling: ' + price;
    txt += '\n\nCocok untuk rombongan besar atau gathering.';
    await say(txt);
    setChips([
      waChip('📅 Booking bundling', 'saya tertarik untuk booking paket bundling Villa Malika 2 & 3. Mohon informasi ketersediaan tanggal dan prosedurnya. Terima kasih!'),
      { label: '💰 Harga villa lain', run: flowHargaPilih },
      { label: '☰ Menu utama', run: flowMenu }
    ]);
  }

  async function flowFasilitasPilih() {
    await say('Fasilitas villa yang mana nih, kak? 😊');
    var list = pilihVillaChips(flowFasilitas);
    list.push({ label: '☰ Menu utama', run: flowMenu });
    setChips(list);
  }
  async function flowFasilitas(v) {
    var d = villaData(v);
    if (!d || !d.facilities.length) {
      await say('Maaf kak, daftar fasilitas belum bisa ditampilkan. Silakan chat admin ya 🙏');
      return menuChips();
    }
    var txt = '🏊 ' + d.name + '\n';
    if (d.intro) txt += '\n' + d.intro + '\n';
    txt += '\nFasilitas utama:\n' + d.facilities.map(function (f) { return '• ' + f; }).join('\n');
    await say(txt);
    setChips([
      { label: '💰 Harga villa ini', run: function () { return flowHarga(v); } },
      { label: '🏠 Villa lain', run: flowFasilitasPilih },
      waChip('📅 Booking via WhatsApp', 'saya tertarik untuk melakukan booking ' + d.name + '. Mohon informasi ketersediaan tanggal dan prosedurnya. Terima kasih!'),
      { label: '☰ Menu utama', run: flowMenu }
    ]);
  }

  async function flowLokasi() {
    await say('📍 Villa Malika berlokasi di:\n' + alamat() + '\n\nPeta ada di bagian "Lokasi Villa" pada halaman ini, atau buka langsung di Google Maps ya kak.');
    setChips([
      { label: '🧭 Buka Google Maps', href: MAPS_URL },
      { label: '🗺️ Lihat peta di halaman', run: lihatPeta },
      waChip('💬 Tanya rute ke admin', 'saya ingin bertanya rute menuju Villa Malika.'),
      { label: '☰ Menu utama', run: flowMenu }
    ]);
  }
  async function lihatPeta() {
    closeChat();
    var m = document.querySelector('.maps-card');
    if (m) m.scrollIntoView({ behavior: 'smooth', block: 'center' });
    menuChips();
  }

  async function flowKetentuan() {
    await say('📋 Ketentuan booking Villa Malika\n\n' +
      '• DP minimal 50%\n' +
      '• Pelunasan H-1 (jika H-1 belum lunas, booking otomatis dibatalkan dan DP dianggap hangus)\n' +
      '• Reschedule maksimal 7 hari sebelum hari H. Lewat H-7, DP hangus\n' +
      '• First pay first book: tanggal belum bisa di-block kalau belum DP\n' +
      '• Pembayaran hanya melalui transfer antar bank (real time online / BI Fast)');
    setChips([
      { label: '📅 Cara booking', run: flowCaraBooking },
      waChip('💬 Tanya admin', 'saya ingin bertanya tentang ketentuan booking Villa Malika.'),
      { label: '☰ Menu utama', run: flowMenu }
    ]);
  }
  async function flowCaraBooking() {
    await say('📅 Cara booking di Villa Malika\n\n' +
      '1. Pilih villa dan tanggal menginap\n' +
      '2. Chat admin lewat WhatsApp untuk cek ketersediaan dan harga\n' +
      '3. Transfer DP minimal 50% untuk mengunci tanggal\n' +
      '4. Lunasi paling lambat H-1');
    setChips([
      waChip('📅 Booking sekarang', 'saya ingin melakukan booking Villa Malika. Mohon informasi ketersediaan tanggal dan prosedurnya. Terima kasih!'),
      { label: '📋 Ketentuan booking', run: flowKetentuan },
      { label: '☰ Menu utama', run: flowMenu }
    ]);
  }

  /* ===== BUKA / TUTUP ===== */
  function openChat() {
    isOpen = true;
    engaged = true;
    win.classList.add('open');
    launcher.style.display = 'none';
    bubble.classList.remove('show');
    dot.style.display = 'none';
    if (!started) {
      started = true;
      busy = true;
      say('Halo, kak! 👋 Mimin dari Villa Malika di sini.\nAda yang bisa Mimin bantu? Pilih salah satu di bawah ya 😊').then(function () {
        menuChips();
        busy = false;
      });
    }
    try { win.focus({ preventScroll: true }); } catch (e) {}
  }
  function closeChat() {
    isOpen = false;
    win.classList.remove('open');
    launcher.style.display = '';
    try { launcher.focus({ preventScroll: true }); } catch (e) {}
  }
  launcher.addEventListener('click', openChat);
  bubble.addEventListener('click', openChat);
  closeBtn.addEventListener('click', closeChat);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen) closeChat(); });

  /* ===== ANIMASI MENYAPA ===== */
  function blink() {
    if (isOpen) return;
    launcher.classList.add('smile');
    setTimeout(function () { launcher.classList.remove('smile'); }, 1500);
  }
  function showBubble() {
    if (engaged) return;
    bubble.classList.add('show');
    blink();
    setTimeout(function () { bubble.classList.remove('show'); }, 7000);
  }
  setTimeout(blink, 1200);
  setInterval(blink, 4200);
  setTimeout(showBubble, 2500);
  setInterval(showBubble, 30000);
})();
