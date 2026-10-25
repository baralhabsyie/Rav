/* =========================================================
   RAV — landing page script
   ---------------------------------------------------------
   KONFIGURASI DOWNLOAD: ubah 'repo' ke akun GitHub kamu,
   lalu upload file installer ke GitHub Releases dengan nama
   yang sama seperti di bawah (lihat README.md).
   ========================================================= */
const RAV = {
  feedbackEmail: 'raveon.official.id@gmail.com', // tujuan email kritik & saran
  repo: 'baralhabsyie/rav',              // contoh: 'akbarhabsyie/rav'
  version: '3.0.0',
  installer: 'Rav-Setup-3.0.0.exe',  // nama file installer di Releases
  portable: 'Rav-3.0.0-portable.exe', // nama file versi portable di Releases
  downloadBase: 993                  // angka awal penghitung unduhan (ditambahkan ke jumlah dari GitHub)
};
const releaseUrl = file => `https://github.com/${RAV.repo}/releases/latest/download/${file}`;

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- modal kritik & saran ---------- */
  const fbDialog = document.getElementById('fbDialog');
  if (fbDialog) {
    document.querySelectorAll('[data-open-fb]').forEach(b => b.addEventListener('click', () => fbDialog.showModal()));
    document.getElementById('fbClose').addEventListener('click', () => fbDialog.close());
    fbDialog.addEventListener('click', e => { if (e.target === fbDialog) fbDialog.close(); });
  }

  /* ---------- media sosial: coba buka aplikasi dulu, kalau tidak terbuka pakai web ---------- */
  document.querySelectorAll('.soc-link[data-app]').forEach(a => {
    a.addEventListener('click', e => {
      const appUrl = a.dataset.app, webUrl = a.dataset.web;
      if (!appUrl) return;
      e.preventDefault();
      let opened = false;
      const onHide = () => { opened = true; };
      document.addEventListener('visibilitychange', onHide, { once: true });
      window.addEventListener('blur', onHide, { once: true });
      // coba buka aplikasi lewat skema (iframe tersembunyi supaya halaman tetap di tempat)
      const f = document.createElement('iframe');
      f.style.display = 'none'; f.src = appUrl; document.body.appendChild(f);
      setTimeout(() => {
        f.remove();
        if (!opened) window.open(webUrl, '_blank', 'noopener');
      }, 1200);
    });
  });

  /* ---------- kritik & saran: buka email dengan isi yang sudah terisi ---------- */
  const fbForm = document.getElementById('fbForm');
  if (fbForm) {
    let stars = 0;
    const starBtns = document.querySelectorAll('#fbStars button');
    starBtns.forEach(b => b.addEventListener('click', () => {
      stars = +b.dataset.v;
      starBtns.forEach(x => x.classList.toggle('on', +x.dataset.v <= stars));
    }));
    fbForm.addEventListener('submit', e => {
      e.preventDefault();
      const msg = document.getElementById('fbMsg');
      const hint = document.getElementById('fbHint');
      const ok = msg.value.trim().length >= 5;
      msg.classList.toggle('err', !ok);
      if (!ok) { hint.textContent = 'Tulis masukanmu dulu ya (minimal 5 karakter).'; msg.focus(); return; }
      const type = document.getElementById('fbType').value;
      const name = document.getElementById('fbName').value.trim();
      const lines = ['Jenis: ' + type];
      if (stars) lines.push('Nilai: ' + stars + '/5');
      if (name) lines.push('Nama: ' + name);
      lines.push('', msg.value.trim(), '', '---', 'Dikirim dari website Rav');
      const url = `mailto:${RAV.feedbackEmail}?subject=${encodeURIComponent('[Rav] ' + type)}&body=${encodeURIComponent(lines.join('\n'))}`;
      window.location.href = url;
      hint.textContent = 'Email kamu sudah terbuka. Tinggal tekan kirim. Terima kasih!';
    });
  }


  /* ---------- download links ---------- */
  document.querySelectorAll('[data-download]').forEach(a => { a.href = releaseUrl(RAV.installer); a.setAttribute('download', RAV.installer); });
  document.querySelectorAll('[data-download-portable]').forEach(a => { a.href = releaseUrl(RAV.portable); a.setAttribute('download', RAV.portable); });

  const isWin = /Windows/i.test(navigator.userAgent);
  const note = document.getElementById('osNote');
  if (note) {
    note.innerHTML = isWin
      ? 'Terdeteksi Windows. Klik tombol di atas untuk mulai mengunduh.'
      : 'Rav hanya berjalan di Windows 10 / 11 (64-bit). Buka halaman ini di PC Windows untuk mengunduh.';
  }


  /* ---------- jumlah unduhan (dibaca dari GitHub Releases) ---------- */
  (async function loadDownloadCount() {
    const nums = document.querySelectorAll('[data-dc]');
    const boxes = [document.getElementById('dlCount'), document.getElementById('heroCount')].filter(Boolean);
    const setNum = t => nums.forEach(n => { n.textContent = t; });
    if (!nums.length) return;
    const base = RAV.downloadBase || 0;
    if (RAV.repo.indexOf('USERNAME') !== -1) { setNum(base.toLocaleString('id-ID')); return; }
    try {
      const res = await fetch(`https://api.github.com/repos/${RAV.repo}/releases`);
      if (!res.ok) throw new Error(res.status);
      const releases = await res.json();
      // hitung semua file installer & portable dari semua rilis
      let total = 0;
      releases.forEach(r => (r.assets || []).forEach(a => { if (/\.exe$/i.test(a.name)) total += a.download_count || 0; }));
      setNum((base + total).toLocaleString('id-ID'));
      boxes.forEach(b => b.classList.add('live'));
    } catch (e) {
      // jika GitHub belum bisa dibaca, tampilkan angka dasar (bukan tanda strip)
      setNum(base.toLocaleString('id-ID'));
    }
  })();

  /* ---------- nav state ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => nav && nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach((el, i) => {
    // sedikit jeda berurutan untuk grup kartu di sekitar elemen yang sama
    const sib = el.parentElement ? [...el.parentElement.children].filter(c => c.classList.contains('reveal')) : [];
    const idx = Math.max(0, sib.indexOf(el));
    el.style.setProperty('--d', (Math.min(idx, 6) * 0.08) + 's');
    io.observe(el);
  });

  /* ---------- hero capsule cycling ---------- */
  const panels = document.querySelectorAll('#heroCap .cap-panel');
  const dots = document.querySelectorAll('#capDots i');
  let hi = 0;
  const showPanel = i => {
    panels.forEach((p, k) => p.classList.toggle('on', k === i));
    dots.forEach((d, k) => d.classList.toggle('on', k === i));
  };
  if (panels.length) {
    showPanel(0);
    setInterval(() => { hi = (hi + 1) % panels.length; showPanel(hi); }, 3200);
    dots.forEach((d, k) => d.addEventListener('click', () => { hi = k; showPanel(k); }));
  }

  /* ---------- feature card glow follows cursor ---------- */
  document.querySelectorAll('.feat').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------- guide tabs (panduan) ---------- */
  const tabs = document.querySelectorAll('.guide-tabs button');
  const gpanels = document.querySelectorAll('.guide-panel');
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => x.classList.toggle('on', x === t));
    gpanels.forEach(p => p.classList.toggle('on', p.id === t.dataset.target));
  }));

  /* ---------- toggles: hanya visual (contoh) ---------- */
  document.querySelectorAll('.toggles .tg').forEach(t => t.addEventListener('click', () => t.classList.toggle('on')));

  /* ---------- smooth anchor offset for fixed nav ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const el = document.querySelector(id);
      if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); history.replaceState(null, '', id); }
    });
  });
});
