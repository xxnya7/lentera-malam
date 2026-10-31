// Membuat sepasang kunci VAPID baru. Hanya bekerja SEBELUM VAPID_PRIVATE_KEY diatur di Vercel,
// sehingga setelah kunci dipasang, alamat ini tidak bisa dipakai lagi.
import webpush from 'web-push';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (process.env.VAPID_PRIVATE_KEY) {
    return res.status(403).json({ pesan: 'Kunci VAPID sudah terpasang. Alamat ini dinonaktifkan.' });
  }
  const keys = webpush.generateVAPIDKeys();
  res.status(200).json({
    pesan: 'Salin kedua nilai ini ke Vercel → Settings → Environment Variables, lalu Redeploy.',
    VAPID_PUBLIC_KEY: keys.publicKey,
    VAPID_PRIVATE_KEY: keys.privateKey
  });
}
