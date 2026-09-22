import { Dudi } from '../types';

/**
 * Filter cerdas pencarian DUDI / Tempat PKL
 * Menangani pencarian kata kunci umum seperti 'dudi', 'cari dudi', 'pkl', 'tempat pkl'
 * agar menampilkan seluruh data DUDI yang tersimpan dan diisi oleh admin,
 * serta mendukung pencarian multi-kata (nama, alamat, kabupaten, pimpinan, bidang).
 */
export function matchesDudiSearch(dudi: Dudi, query: string): boolean {
  if (!query || !query.trim()) return true;
  const raw = query.trim().toLowerCase();

  // Bersihkan istilah umum yang sering diketik pengguna (misal: "cari dudi", "dudi", "pkl", dll)
  const cleanQ = raw
    .replace(/\b(cari|tempat|data|daftar|mitra|industri|dudi|pkl)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Jika kata pencarian murni berupa istilah umum (misal pengguna mengetik "DUDI" atau "cari DUDI"),
  // maka tampilkan SELURUH data DUDI yang tersimpan dari admin!
  if (!cleanQ) {
    return true;
  }

  // Jika ada kata kunci spesifik (misal "dudi slawi", "komputer", "jatirokeh", "arief"),
  // cocokkan token terhadap seluruh properti DUDI
  const tokens = cleanQ.split(' ').filter(Boolean);
  const searchableText = [
    dudi.nama_dudi || '',
    dudi.pimpinan || '',
    dudi.bidang_pekerjaan || '',
    dudi.alamat || '',
    dudi.kabupaten || '',
    dudi.jenis_dudi || '',
    dudi.no ? `no ${dudi.no} ${dudi.no}` : '',
  ]
    .join(' ')
    .toLowerCase();

  return tokens.every((token) => searchableText.includes(token));
}
