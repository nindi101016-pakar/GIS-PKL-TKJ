import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Send,
  CheckCircle,
  ExternalLink,
  MessageSquare,
  Building,
} from 'lucide-react';
import { CMSContent, SchoolLocation } from '../types';

interface KontakSectionProps {
  school: SchoolLocation;
  cms: CMSContent;
}

export const KontakSection: React.FC<KontakSectionProps> = ({ school, cms }) => {
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    telepon: '',
    kategori: 'Siswa / Orang Tua',
    pesan: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setFormData({
        nama: '',
        email: '',
        telepon: '',
        kategori: 'Siswa / Orang Tua',
        pesan: '',
      });
      setIsSubmitted(false);
    }, 4000);
  };

  return (
    <section id="kontak" className="py-14 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-red-700 bg-red-100/70 px-3 py-1 rounded-full mb-3">
            <Phone className="w-3.5 h-3.5" />
            <span>LAYANAN INFORMASI & KEMITRAAN DUDI</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-neutral-900 tracking-tight">
            Hubungi SMK Negeri 1 Songgom
          </h2>
          <p className="text-neutral-600 text-sm sm:text-base mt-2">
            Pusat koordinasi Praktik Kerja Lapangan (PKL), Bursa Kerja Khusus (BKK), dan Hubungan Industri Program Keahlian TKJ.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* School Information Card (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-3xl p-7 sm:p-8 shadow-xl border-4 border-white ring-1 ring-neutral-200 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-extrabold text-red-400 uppercase tracking-wider mb-2">
                <Building className="w-4 h-4" />
                Sekretariat BKK & Hubin
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {school.name}
              </h3>
              <p className="text-xs text-neutral-300 mt-1">
                Konsentrasi Keahlian: {school.departmentName}
              </p>
            </div>

            <div className="space-y-4 text-xs divide-y divide-neutral-700/60">
              <div className="pt-3 flex items-start gap-3">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <b className="text-white block mb-0.5">Alamat Kampus:</b>
                  <span className="text-neutral-300 leading-relaxed">{school.address}</span>
                </div>
              </div>

              <div className="pt-3 flex items-start gap-3">
                <Globe className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <b className="text-white block mb-0.5">Website Resmi:</b>
                  <a
                    href={school.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-400 hover:text-white flex items-center gap-1 font-semibold transition-colors underline"
                  >
                    <span>{school.website}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="pt-3 flex items-start gap-3">
                <Mail className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <b className="text-white block mb-0.5">Email Hubin / BKK:</b>
                  <a href={`mailto:${school.email}`} className="text-neutral-300 hover:text-white transition-colors">
                    {school.email}
                  </a>
                </div>
              </div>

              <div className="pt-3 flex items-start gap-3">
                <Phone className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <b className="text-white block mb-0.5">Telepon & WhatsApp:</b>
                  <span className="text-neutral-300">{school.phone}</span>
                </div>
              </div>

              <div className="pt-3 flex items-start gap-3">
                <Clock className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <b className="text-white block mb-0.5">Jam Kerja Pelayanan:</b>
                  <span className="text-neutral-300">{cms.kontak.operatingHours}</span>
                </div>
              </div>
            </div>

            {/* School Coordinate Chip */}
            <div className="bg-white/10 rounded-2xl p-4 border border-white/10 text-xs">
              <div className="text-neutral-300 mb-1">Koordinat Pusat GIS:</div>
              <div className="font-mono text-white font-bold">
                {school.latitude.toFixed(5)}, {school.longitude.toFixed(5)}
              </div>
            </div>
          </div>

          {/* Contact & Inquiries Form (7 cols) */}
          <div className="lg:col-span-7 bg-neutral-50 rounded-3xl p-7 sm:p-9 border border-neutral-200 shadow-xs">
            <div className="mb-6">
              <h3 className="text-xl font-black text-neutral-900">
                Kirim Pesan / Usulan Tempat PKL Baru
              </h3>
              <p className="text-xs text-neutral-600 mt-1">
                Bagi siswa yang ingin berkonsultasi tempat PKL atau DUDI yang berminat menjadi mitra industri baru.
              </p>
            </div>

            {isSubmitted ? (
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-6 text-center space-y-2 animate-in fade-in duration-300">
                <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-extrabold text-emerald-950 text-base">Pesan Anda Berhasil Terkirim!</h4>
                <p className="text-xs text-emerald-700">
                  Terima kasih telah menghubungi pihak Hubin / Tim GIS TKJ SMK Negeri 1 Songgom. Kami akan merespons melalui kontak yang Anda cantumkan.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Masukkan nama Anda"
                      value={formData.nama}
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">
                      Kategori Pengirim
                    </label>
                    <select
                      value={formData.kategori}
                      onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-xs"
                    >
                      <option value="Siswa / Orang Tua">Siswa / Orang Tua Siswa TKJ</option>
                      <option value="DUDI / Industri">DUDI / Mitra Industri Baru</option>
                      <option value="Guru / Pembimbing">Guru Pembimbing / Instansi</option>
                      <option value="Masyarakat Umum">Masyarakat Umum</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">
                      Alamat Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="nama@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">
                      No. WhatsApp / Telepon
                    </label>
                    <input
                      type="tel"
                      placeholder="Contoh: 0812-3456-7890"
                      value={formData.telepon}
                      onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">
                    Isi Pesan / Informasi Kemitraan *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tuliskan pertanyaan seputar tempat PKL, usulan mitra DUDI baru, atau koordinasi penempatan..."
                    value={formData.pesan}
                    onChange={(e) => setFormData({ ...formData, pesan: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-xs resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-7 py-3 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold text-xs shadow-md shadow-red-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Pesan Sekarang</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
