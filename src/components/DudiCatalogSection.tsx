import React, { useState, useMemo } from 'react';
import {
  Building2,
  Search,
  Filter,
  MapPin,
  Users,
  Briefcase,
  UserCheck,
  Phone,
  Navigation,
  ExternalLink,
  ChevronDown,
  ArrowUpDown,
  Tag,
  ShieldCheck,
  DollarSign,
  Compass,
} from 'lucide-react';
import { Dudi, SchoolLocation } from '../types';
import {
  calculateHaversineDistance,
  formatDistance,
  estimateTravelTime,
  getCompassBearing,
} from '../utils/geo';

interface DudiCatalogSectionProps {
  dudiList: Dudi[];
  school: SchoolLocation;
  onFocusMap: (dudi: Dudi) => void;
  selectedDudi: Dudi | null;
  onOpenDetailModal: (dudi: Dudi) => void;
}

export const DudiCatalogSection: React.FC<DudiCatalogSectionProps> = ({
  dudiList,
  school,
  onFocusMap,
  onOpenDetailModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKabupaten, setSelectedKabupaten] = useState('Semua');
  const [selectedBidang, setSelectedBidang] = useState('Semua');
  const [selectedJenis, setSelectedJenis] = useState('Semua');
  const [sortBy, setSortBy] = useState<'jarak' | 'nama' | 'kuota'>('jarak');

  // Compute distance from school
  const dudiWithDistance = useMemo(() => {
    return dudiList.map((dudi) => {
      const dist = calculateHaversineDistance(
        school.latitude,
        school.longitude,
        dudi.latitude,
        dudi.longitude
      );
      return {
        ...dudi,
        jarakKm: dist,
      };
    });
  }, [dudiList, school]);

  // Unique options
  const kabupatenOptions = useMemo(() => {
    const set = new Set(dudiList.map((d) => d.kabupaten || 'Lainnya'));
    return ['Semua', ...Array.from(set)];
  }, [dudiList]);

  const jenisOptions = useMemo(() => {
    const set = new Set(dudiList.map((d) => d.jenis_dudi || 'Mandiri'));
    return ['Semua', ...Array.from(set)];
  }, [dudiList]);

  // Filtered & Sorted
  const filteredDudi = useMemo(() => {
    return dudiWithDistance
      .filter((dudi) => {
        const matchesSearch =
          !searchQuery.trim() ||
          dudi.nama_dudi.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dudi.alamat.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dudi.pimpinan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dudi.bidang_pekerjaan.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesKabupaten =
          selectedKabupaten === 'Semua' || dudi.kabupaten === selectedKabupaten;

        const matchesBidang =
          selectedBidang === 'Semua' ||
          (dudi.bidang_pekerjaan &&
            dudi.bidang_pekerjaan.toLowerCase().includes(selectedBidang.toLowerCase()));

        const matchesJenis =
          selectedJenis === 'Semua' || dudi.jenis_dudi === selectedJenis;

        return matchesSearch && matchesKabupaten && matchesBidang && matchesJenis;
      })
      .sort((a, b) => {
        if (sortBy === 'jarak') {
          return (a.jarakKm || 0) - (b.jarakKm || 0);
        }
        if (sortBy === 'nama') {
          return a.nama_dudi.localeCompare(b.nama_dudi);
        }
        if (sortBy === 'kuota') {
          return (b.maksimal_siswa || 0) - (a.maksimal_siswa || 0);
        }
        return 0;
      });
  }, [dudiWithDistance, searchQuery, selectedKabupaten, selectedBidang, selectedJenis, sortBy]);

  return (
    <section id="dudi-catalog" className="py-12 lg:py-20 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-red-700 bg-red-100/70 px-3 py-1 rounded-full mb-3">
            <Building2 className="w-3.5 h-3.5" />
            <span>KATALOG MITRA INDUSTRI PKL</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-neutral-900 tracking-tight">
            Daftar DUDI / Tempat Praktik Kerja Lapangan
          </h2>
          <p className="text-neutral-600 text-sm sm:text-base mt-2">
            Pilihan dunia usaha dan dunia industri bidang Teknik Komputer dan Jaringan dengan data kuota,
            bidang pekerjaan, penanggung jawab, dan jarak tempuh dari SMK Negeri 1 Songgom.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200/90 shadow-xs mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
            {/* Search Input (5 cols) */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Cari nama DUDI, pimpinan, bidang..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-neutral-300 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-neutral-400 hover:text-neutral-700"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Kabupaten (2 cols) */}
            <div className="md:col-span-2">
              <select
                value={selectedKabupaten}
                onChange={(e) => setSelectedKabupaten(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-neutral-300 bg-white focus:ring-2 focus:ring-red-500 outline-none font-medium"
              >
                <option value="Semua">Semua Wilayah</option>
                {kabupatenOptions.filter((k) => k !== 'Semua').map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Bidang (2 cols) */}
            <div className="md:col-span-2">
              <select
                value={selectedBidang}
                onChange={(e) => setSelectedBidang(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-neutral-300 bg-white focus:ring-2 focus:ring-red-500 outline-none font-medium"
              >
                <option value="Semua">Semua Bidang</option>
                <option value="Teknisi">Teknisi / Mekanik</option>
                <option value="Jasa">Jasa Layanan</option>
                <option value="Penjualan">Penjualan Komputer</option>
                <option value="Jaringan">Jaringan & ISP</option>
              </select>
            </div>

            {/* Sort Dropdown (3 cols) */}
            <div className="md:col-span-3 flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-neutral-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-neutral-300 bg-white focus:ring-2 focus:ring-red-500 outline-none font-medium"
              >
                <option value="jarak">Urutkan: Jarak Terdekat</option>
                <option value="nama">Urutkan: Nama A - Z</option>
                <option value="kuota">Urutkan: Kuota Terbanyak</option>
              </select>
            </div>
          </div>

          {/* Quick Active Filters tags */}
          <div className="mt-3 pt-3 border-t border-neutral-200/70 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500">
            <div className="flex items-center gap-2">
              <span>Menampilkan: <b>{filteredDudi.length}</b> dari {dudiList.length} DUDI</span>
              {(selectedKabupaten !== 'Semua' || selectedBidang !== 'Semua' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedKabupaten('Semua');
                    setSelectedBidang('Semua');
                    setSelectedJenis('Semua');
                    setSearchQuery('');
                  }}
                  className="text-red-600 hover:underline font-semibold"
                >
                  Reset Filter
                </button>
              )}
            </div>

            <div className="text-[11px] text-neutral-400">
              *Jarak dihitung otomatis dari kampus SMK Negeri 1 Songgom
            </div>
          </div>
        </div>

        {/* DUDI Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDudi.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-neutral-50 rounded-2xl border border-dashed border-neutral-300">
              <Building2 className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-neutral-700">Tidak ada tempat DUDI yang cocok</h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                Coba ubah kata kunci pencarian atau bersihkan filter wilayah/bidang pekerjaan.
              </p>
            </div>
          ) : (
            filteredDudi.map((dudi) => {
              const bidangTags = dudi.bidang_pekerjaan
                ? dudi.bidang_pekerjaan.split(',').map((s) => s.trim())
                : [];

              return (
                <div
                  key={dudi.id}
                  className="bg-white rounded-2xl border border-neutral-200 hover:border-red-400 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                >
                  {/* Card Top Banner */}
                  <div className="p-5 pb-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded-lg bg-red-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                          {dudi.no}
                        </span>
                        <span className="text-[11px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">
                          {dudi.kabupaten}
                        </span>
                        <span className="text-[10px] font-semibold text-neutral-500 border border-neutral-200 px-1.5 py-0.5 rounded">
                          {dudi.jenis_dudi || 'Mandiri'}
                        </span>
                      </div>

                      {/* Quota Badge */}
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md shrink-0">
                        <Users className="w-3 h-3" />
                        <span>Maks. {dudi.maksimal_siswa} Siswa</span>
                      </span>
                    </div>

                    {/* DUDI Name */}
                    <h3 className="font-extrabold text-base text-neutral-900 group-hover:text-red-700 transition-colors line-clamp-1 mb-1">
                      {dudi.nama_dudi}
                    </h3>

                    {/* Leader / PIC */}
                    <div className="flex items-center gap-1.5 text-xs text-neutral-600 mb-3">
                      <UserCheck className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span className="truncate">Pimpinan: <b>{dudi.pimpinan || '-'}</b></span>
                    </div>

                    {/* Job field badges */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {bidangTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-medium bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-1.5 text-xs text-neutral-500 line-clamp-2 bg-neutral-50 p-2 rounded-lg border border-neutral-100">
                      <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{dudi.alamat}</span>
                    </div>
                  </div>

                  {/* Card Bottom / Distance & Actions */}
                  <div className="bg-neutral-50/90 border-t border-neutral-100 px-5 py-3 flex items-center justify-between gap-3">
                    <div className="text-left">
                      <div className="text-xs font-black text-red-700">
                        {formatDistance(dudi.jarakKm)}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        {estimateTravelTime(dudi.jarakKm)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onFocusMap(dudi)}
                        className="p-2 rounded-lg bg-white hover:bg-red-50 text-neutral-700 hover:text-red-700 border border-neutral-200 transition-colors text-xs font-semibold flex items-center gap-1"
                        title="Tampilkan lokasi di Peta GIS"
                      >
                        <Compass className="w-3.5 h-3.5 text-red-600" />
                        <span>Peta</span>
                      </button>

                      <button
                        onClick={() => onOpenDetailModal(dudi)}
                        className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-white transition-colors text-xs font-bold shadow-xs"
                      >
                        Detail
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};
