/* =========================================================
   Rav demo hub
   Meniru main process Electron (main.js) untuk demo di web.
   - DEF sama persis dengan main.js
   - merge settings sama seperti settings-set di main.js
   - data musik, cuaca, sistem, volume, dan game disimulasikan
   ========================================================= */
(function () {
  const capFrame = document.getElementById('ravCap');
  const setFrame = document.getElementById('ravSet');
  if (!capFrame || !setFrame) return;

  // ---- sama dengan DEF di main.js ----
  const DEF = {
    character: 'kitty', showClock: true, showWeather: true, showBattery: true, ambient: true, ambientFx: true,
    ambientLevel: 65, randomAnim: true, randomFreq: 'normal', clock24: true, city: '', unit: 'c',
    shape: 'notch', tint: 'black', hideInGame: true, gameRemind: true, gameRemindMin: 60,
    anim: { music: true, volume: true, download: true, copy: true, battery: true }
  };
  const merge = (a, b) => {
    const o = { ...a };
    for (const k in b) o[k] = (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k])) ? merge(a[k] || {}, b[k]) : b[k];
    return o;
  };
  let settings = JSON.parse(JSON.stringify(DEF));

  // ---- data simulasi (bentuk data sama dengan main.js) ----
  let vol = { v: 55, mute: false };
  let media = null;               // null = app menampilkan demo bawaannya sendiri
  const wx = {
    temp: 31, feel: 34, hum: 68, wind: 12, code: 2, day: true,
    city: 'Kota contoh', unit: 'c', hi: 33, lo: 25
  };
  const sampleTrack = { title: 'Senja di Kota', artist: 'Rindu Sore', playing: true, pos: 72, dur: 220, art: null };
  const LRC = [
    '[00:00.00]Senja turun pelan di atas kota',
    '[00:08.00]Lampu-lampu mulai menyala satu per satu',
    '[00:16.00]Kita berjalan tanpa banyak kata',
    '[00:24.00]Hanya langkah dan angin yang lewat',
    '[00:32.00]Biarkan sore ini sedikit lebih lama',
    '[00:40.00]Biarkan kita pulang sebentar lagi'
  ].join('\n');
  const games = [
    { id: 'steam:1001', name: 'Nebula Racer' },
    { id: 'steam:1002', name: 'Pixel Quest' },
    { id: 'epic:SkyRaiders', name: 'Sky Raiders' },
    { id: 'steam:1003', name: 'Tiny Kingdom' },
    { id: 'epic:Orbit', name: 'Orbit Drift' },
    { id: 'steam:1004', name: 'Cloud Garden' }
  ];

  // ---- toast kecil untuk aksi yang hanya ada di aplikasi asli ----
  const toastEl = document.getElementById('ravToast');
  let toastT;
  const toast = msg => {
    if (!toastEl) return;
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), 2600);
  };

  // ---- kirim ke frame ----
  const toFrame = (frame, ch, args) => {
    if (frame && frame.contentWindow) frame.contentWindow.postMessage({ rav: 1, kind: 'ev', ch, args }, '*');
  };
  const toCap = (ch, ...args) => toFrame(capFrame, ch, args);
  const toAll = (ch, ...args) => { toFrame(capFrame, ch, args); toFrame(setFrame, ch, args); };

  // ---- handler untuk setiap fungsi window.rav ----
  const handlers = {
    getSettings: () => settings,
    setSettings: patch => {
      settings = merge(settings, patch || {});
      toAll('settings', settings);
      return settings;
    },
    getWeather: () => wx,
    getVolume: () => vol,
    setVolume: v => { vol = { v: Math.max(0, Math.min(100, Math.round(v))), mute: false }; toCap('evt', 'volsync', vol); },
    volStep: n => { vol = { v: Math.max(0, Math.min(100, vol.v + n * 2)), mute: false }; toCap('evt', 'volsync', vol); },
    volMute: () => { vol = { v: vol.v, mute: !vol.mute }; toCap('evt', 'volsync', vol); },
    sys: () => ({
      cpu: 18 + Math.round(Math.random() * 30),
      mem: 44 + Math.round(Math.random() * 12),
      disk: 58,
      up: 60 * 60 * 9,
      memGB: '16.0'
    }),
    games: () => games,
    getLyrics: () => (media ? LRC : null),
    fileIcon: () => null,
    pin: () => {},
    attention: () => toCap('attention'),
    setSize: () => {},
    startDrag: () => toast('Seret file dari Windows Explorer ke capsule (hanya di aplikasi asli).'),
    openPath: () => toast('Membuka file (hanya di aplikasi asli).'),
    power: a => toast({ lock: 'Mengunci layar', sleep: 'Mode tidur', restart: 'Restart', shutdown: 'Matikan komputer' }[a] + ' · hanya di aplikasi asli.'),
    launch: n => toast('Membuka ' + ({ calc: 'Kalkulator', notepad: 'Notepad', explorer: 'File', taskmgr: 'Task Manager', settings: 'Setelan', snip: 'Screenshot', cmd: 'Terminal', web: 'Browser' }[n] || n) + ' (hanya di aplikasi asli).'),
    gameLaunch: id => toast('Membuka game ' + (games.find(g => g.id === id) || {}).name + ' (hanya di aplikasi asli).'),
    mediaKey: k => {
      if (!media) media = { ...sampleTrack };
      if (k === 'playpause') media.playing = !media.playing;
      toCap('media', media);
    },
    openSettings: () => setFrame.scrollIntoView({ behavior: 'smooth', block: 'center' }),
    quit: () => toast('Keluar dari Rav (hanya di aplikasi asli).'),
    test: name => toCap('evt', 'test', { name })
  };

  // ---- pesan dari iframe ----
  let frameReady = { cap: false, set: false };
  window.addEventListener('message', e => {
    const d = e.data;
    if (!d || d.rav !== 1) return;
    const from = e.source === capFrame.contentWindow ? 'cap' : e.source === setFrame.contentWindow ? 'set' : null;
    if (!from) return;

    if (d.kind === 'hello') {
      frameReady[from] = true;
      e.source.postMessage({ rav: 1, kind: 'ready' }, '*');
      // kirim kondisi awal supaya tampilan langsung benar
      toFrame(e.source === capFrame.contentWindow ? capFrame : setFrame, 'settings', [settings]);
      toFrame(e.source === capFrame.contentWindow ? capFrame : setFrame, 'weather', [wx]);
      if (e.source === capFrame.contentWindow) {
        toFrame(capFrame, 'media', [media]);
      }
      return;
    }
    if (d.kind === 'call') {
      const fn = handlers[d.fn];
      const value = fn ? fn(...(d.args || [])) : null;
      e.source.postMessage({ rav: 1, kind: 'ret', id: d.id, value }, '*');
      return;
    }
    if (d.kind === 'send') {
      const fn = handlers[d.fn];
      if (fn) fn(...(d.args || []));
    }
  });

  // ---- kontrol di atas panggung ----
  const $ = id => document.getElementById(id);
  const setState = open => toCap('state', open);
  $('btnOpen') && $('btnOpen').addEventListener('click', () => setState(true));
  $('btnClose') && $('btnClose').addEventListener('click', () => setState(false));
  $('btnPlay') && $('btnPlay').addEventListener('click', () => {
    media = { ...sampleTrack, playing: true, pos: 0 };
    toCap('media', media);
  });
  $('btnStop') && $('btnStop').addEventListener('click', () => { media = null; toCap('media', null); });
  $('btnBattery') && $('btnBattery').addEventListener('click', () => toCap('evt', 'test', { name: 'low' }));

  // mata capsule mengikuti kursor (seperti di aplikasi)
  const stage = $('ravStage');
  if (stage) {
    stage.addEventListener('pointermove', e => {
      const r = capFrame.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2)));
      const y = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2)));
      toCap('cursor', x, y);
    });
  }

  // skala panel personalisasi agar muat di layar
  const fit = () => {
    const box = $('ravSetBox');
    if (!box) return;
    const s = Math.min(1, box.clientWidth / 860);
    setFrame.style.transform = `scale(${s})`;
    box.style.height = (780 * s) + 'px';
  };
  window.addEventListener('resize', fit);
  fit();
})();
