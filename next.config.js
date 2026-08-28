/**
 * Shiour Gavriel — configuration Next.js.
 * Export statique pour les pages vitrine/réservation ; la logique serveur
 * (lecture Google Agenda, création de réservation) vit à part dans /functions
 * (Cloudflare Pages Functions), appelée en fetch() depuis le client.
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
};

module.exports = nextConfig;
