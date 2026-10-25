# Rav — Website

Landing page resmi untuk **Rav**, smart capsule untuk Windows.
Brand: **Rav — A Ravéon Labs Product** · By Akbar Al Habsyie

## Isi folder
- `index.html` — halaman utama
- `style.css` — tampilan halaman
- `script.js` — tombol download, animasi, dan konfigurasi download (`RAV`)
- `app/` — **kode tampilan asli Rav** (salinan dari folder `renderer/`), dipakai di bagian "Coba langsung"
- `shim/rav-shim.js` — pengganti `preload.js` (Electron) agar UI bisa jalan di browser
- `hub.js` — meniru main process: settings default dari `main.js`, serta data simulasi (musik, cuaca, sistem, game)
- `assets/` — ikon dan video promo

## Menjaga demo tetap sama dengan aplikasi
Setiap kali kamu mengubah tampilan di `renderer/`, salin lagi ke `app/`:
```
cp renderer/* ../rav-website/app/
```
Lalu tambahkan kembali satu baris ini di `app/index.html` dan `app/settings.html`, tepat sebelum `<script src="chars.js">`:
```html
<script src="../shim/rav-shim.js"></script>
```
Jika ada fungsi baru di `preload.js` (bridge Electron), tambahkan juga di `shim/rav-shim.js` dan `hub.js`.

## 1. Publish ke GitHub Pages
1. Buat repository baru di GitHub, misalnya `rav` (boleh public).
2. Upload semua isi folder ini ke repository (drag & drop di web GitHub, atau pakai git).
3. Buka **Settings → Pages**.
4. Di bagian **Source**, pilih `Deploy from a branch`, branch `main`, folder `/ (root)`, lalu **Save**.
5. Beberapa menit kemudian website aktif di `https://USERNAME.github.io/rav/`.

## 2. Upload installer ke GitHub Releases (supaya tombol download berfungsi)
File installer (±82 MB) terlalu besar untuk dimasukkan ke repository, jadi taruh di **Releases**:
1. Di repository, buka **Releases → Create a new release**.
2. Tulis tag, misalnya `v3.0.0`, lalu **Publish release**.
3. Di bagian **Attach binaries**, upload dua file dengan nama persis seperti ini:
   - `Rav-Setup-3.0.0.exe` (installer)
   - `Rav-3.0.0-portable.exe` (versi portable)
4. Publish. Tombol download di website akan langsung mengarah ke file terbaru.

## 3. Ganti nama akun di website
Buka `script.js`, lalu ubah baris berikut:
```js
repo: 'USERNAME/rav',   // ganti dengan username dan nama repository kamu
```
Di `index.html`, cari `https://github.com/USERNAME/rav` (di footer) dan ganti juga.

Setelah itu commit perubahan, dan website akan terbarui otomatis.

## Catatan
- Rav hanya berjalan di Windows 10 / 11 (64-bit).
- Windows SmartScreen bisa menampilkan peringatan "unknown publisher" karena aplikasi belum di-code-sign. Website sudah menjelaskan cara melanjutkannya.
