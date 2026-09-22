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
  // Dropdown selection states - empty by default so list is NOT displayed immediately
  const [selectedKabupaten, setSelectedKabupaten] = useState<string>('');
  const [selectedDudiId, setSelectedDudiId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBidang, setSelectedBidang] = useState('Semua');
  const [sortBy, setSortBy] = useState<'jarak' | 'nama' | 'kuota'>('jarak');

  // Compute distance from school
  const safeDudiList = useMemo(() => (Array.isArray(dudiList) ? dudiList : []), [dudiList]);

  const dudiWithDistance = useMemo(() => {
    return safeDudiList.map((dudi) => {
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
  }, [safeDudiList, school]);

  // Unique kabupaten counts
  const kabupatenStats = useMemo(() => {
    const map = new Map<string, number>();
    safeDudiList.forEach((d) => {
      const kab = d?.kabupaten || 'Lainnya';
      map.set(kab, (map.get(kab) || 0) + 1);
    });
    return map;
  }, [safeDudiList]);

  // Has user made a selection from dropdown OR typed into search?
  const hasSelection = Boolean(selectedKabupaten || selectedDudiId || searchQuery.trim());

  // Filtered & Sorted DUDI based on active dropdown selection or search
  const displayedDudi = useMemo(() => {
    if (!hasSelection) return [];

    return dudiWithDistance
      .filter((dudi) => {
        // If a specific DUDI was selected in dropdown
        if (selectedDudiId) {
          return dudi.id === selectedDudiId;
        }

        // If a kabupaten was selected
        const matchesKabupaten =
          !selectedKabupaten ||
          selectedKabupaten === 'Semua' ||
          dudi.kabupaten === selectedKabupaten;

        const matchesSearch =
          !searchQuery.trim() ||
          dudi.nama_dudi.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dudi.alamat.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (dudi.pimpinan && dudi.pimpinan.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (dudi.bidang_pekerjaan && dudi.bidang_pekerjaan.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (dudi.kabupaten && dudi.kabupaten.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesBidang =
          selectedBidang === 'Semua' ||
          (dudi.bidang_pekerjaan &&
            dudi.bidang_pekerjaan.toLowerCase().includes(selectedBidang.toLowerCase()));

        return matchesKabupaten && matchesSearch && matchesBidang;
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
  }, [dudiWithDistance, hasSelection, selectedDudiId, selectedKabupaten, searchQuery, selectedBidang, sortBy]);

  const handleResetSelection = () => {
    setSelectedKabupaten('');
    setSelectedDudiId('');
    setSearchQuery('');
    setSelectedBidang('Semua');
  };

  const handleSelectKabupaten = (val: string) => {
    setSelectedKabupaten(val);
    setSelectedDudiId(''); // Clear specific DUDI
  };

  const handleSelectDudiId = (id: string) => {
    setSelectedDudiId(id);
    setSelectedKabupaten(''); // Clear kabupaten filter
  };

  return (
    <section id="dudi-catalog" className="py-12 lg:py-20 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-red-700 bg-red-100/70 px-3 py-1 rounded-full mb-3">
            <Building2 className="w-3.5 h-3.5" />
            <span>KATALOG MITRA INDUSTRI PKL</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-neutral-900 tracking-tight">
            Daftar DUDI / Tempat Praktik Kerja Lapangan
          </h2>
          <p className="text-neutral-600 text-sm sm:text-base mt-2">
            Pilih wilayah kabupaten atau tempat DUDI melalui menu dropdown di bawah untuk menampilkan data mitra industri yang sesuai.
          </p>
        </div>

        {/* Dropdown Selector Box */}
        <div className="bg-neutral-50 rounded-2xl p-5 sm:p-6 border-2 border-neutral-200 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
            
            {/* Dropdown 1: Pilih Wilayah / Kabupaten */}
            <div className="flex-1">
              <label className="block text-xs font-bold text-neutral-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-600" />
                <span>Pilih Wilayah / Kabupaten:</span>
              </label>
              <div className="relative">
                <select
                  id="select-dudi-kabupaten"
                  value={selectedKabupaten}
                  onChange={(e) => handleSelectKabupaten(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none appearance-none pr-10 cursor-pointer ${
                    selectedKabupaten
                      ? 'border-red-500 bg-red-50/50 text-red-950 ring-2 ring-red-500/20'
                      : 'border-neutral-300 bg-white text-neutral-800 hover:border-neutral-400 focus:border-red-500'
                  }`}
                >
                  <option value="">-- Silakan Pilih Wilayah / Kabupaten --</option>
                  {Array.from(kabupatenStats.entries()).map(([kab, count]) => (
                    <option key={kab} value={kab}>
                      {kab} ({count} Tempat PKL)
                    </option>
                  ))}
                  <option value="Semua">Tampilkan Semua Wilayah ({dudiList.length} Tempat PKL)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-neutral-500 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div className="hidden md:flex items-center text-xs font-bold text-neutral-400 px-1 pt-5">
              ATAU
            </div>

            {/* Dropdown 2: Pilih Langsung Tempat DUDI */}
            <div className="flex-1">
              <label className="block text-xs font-bold text-neutral-700 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-red-600" />
                <span>Pilih Langsung Nama DUDI:</span>
              </label>
              <div className="relative">
                <select
                  id="select-dudi-single"
                  value={selectedDudiId}
                  onChange={(e) => handleSelectDudiId(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none appearance-none pr-10 cursor-pointer ${
                    selectedDudiId
                      ? 'border-red-500 bg-red-50/50 text-red-950 ring-2 ring-red-500/20'
                      : 'border-neutral-300 bg-white text-neutral-800 hover:border-neutral-400 focus:border-red-500'
                  }`}
                >
                  <option value="">-- Atau Pilih Langsung Tempat DUDI ({safeDudiList.length} Pilihan) --</option>
                  {safeDudiList.map((d) => (
                    <option key={d.id} value={d.id}>
                      No. {d.no} - {d.nama_dudi} ({d.kabupaten})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-neutral-500 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Reset Button */}
            {hasSelection && (
              <div className="md:pt-5">
                <button
                  onClick={handleResetSelection}
                  className="w-full md:w-auto px-4 py-3 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-bold transition-colors shrink-0 flex items-center justify-center gap-1.5"
                  title="Tutup daftar DUDI dan reset pilihan dropdown"
                >
                  <span>✕ Sembunyikan Daftar</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Filter & Sort Options when a Kabupaten is selected */}
          {selectedKabupaten && (
            <div className="mt-4 pt-4 border-t border-neutral-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center text-xs">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Cari di wilayah terpilih..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-neutral-300 bg-white text-xs outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <select
                  value={selectedBidang}
                  onChange={(e) => setSelectedBidang(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white text-xs font-medium outline-none"
                >
                  <option value="Semua">Semua Bidang Pekerjaan</option>
                  <option value="Teknisi">Teknisi / Mekanik</option>
                  <option value="Jasa">Jasa Layanan</option>
                  <option value="Penjualan">Penjualan Komputer</option>
                  <option value="Jaringan">Jaringan & ISP</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white text-xs font-medium outline-none"
                >
                  <option value="jarak">Urutkan: Jarak Terdekat</option>
                  <option value="nama">Urutkan: Nama A - Z</option>
                  <option value="kuota">Urutkan: Kuota Terbanyak</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* State 1: When user has NOT selected anything from dropdown yet */}
        {!hasSelection && (
          <div className="py-14 px-6 text-center bg-neutral-50/80 rounded-3xl border-2 border-dashed border-neutral-200 max-w-3xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-red-100/70 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-neutral-800 mb-2">
              Pilih Wilayah atau DUDI pada Menu Dropdown di Atas
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto mb-6 leading-relaxed">
              Daftar tempat Praktik Kerja Lapangan disembunyikan agar tampilan lebih ringkas.
              Silakan pilih salah satu opsi dari menu dropdown untuk memuat data DUDI.
            </p>

            {/* Quick Click Shortcut Pills */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-neutral-400 tracking-wider">
                ATAU PILIH CEPAT WILAYAH:
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {Array.from(kabupatenStats.entries()).map(([kab, count]) => (
                  <button
                    key={kab}
                    onClick={() => handleSelectKabupaten(kab)}
                    className="px-3.5 py-1.5 rounded-full bg-white hover:bg-red-50 hover:border-red-300 border border-neutral-200 text-neutral-700 hover:text-red-700 text-xs font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <MapPin className="w-3 h-3 text-red-500" />
                    <span>{kab} ({count})</span>
                  </button>
                ))}
                <button
                  onClick={() => handleSelectKabupaten('Semua')}
                  className="px-3.5 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Tampilkan Semua ({dudiList.length} DUDI)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* State 2: When user HAS made a dropdown selection, display the matching DUDI list */}
        {hasSelection && (
          <div>
            {/* Active Selection Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-3 border-b border-neutral-200 text-xs text-neutral-600">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                <span>
                  Menampilkan <b>{displayedDudi.length}</b> tempat DUDI yang sesuai dengan pilihan dropdown.
                </span>
              </div>

              <div className="text-[11px] text-neutral-400">
                *Jarak dihitung otomatis dari kampus SMK Negeri 1 Songgom
              </div>
            </div>

            {/* DUDI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayedDudi.length === 0 ? (
                <div className="col-span-full py-16 text-center bg-neutral-50 rounded-2xl border border-dashed border-neutral-300">
                  <Building2 className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-neutral-700">Tidak ada tempat DUDI yang cocok</h3>
                  <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                    Coba sesuaikan kata kunci pencarian atau bersihkan filter bidang pekerjaan.
                  </p>
                </div>
              ) : (
                displayedDudi.map((dudi) => {
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
                            className="p-2 rounded-lg bg-white hover:bg-red-50 text-neutral-700 hover:text-red-700 border border-neutral-200 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            title="Tampilkan lokasi di Peta GIS"
                          >
                            <Compass className="w-3.5 h-3.5 text-red-600" />
                            <span>Peta</span>
                          </button>

                          <button
                            onClick={() => onOpenDetailModal(dudi)}
                            className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-white transition-colors text-xs font-bold shadow-xs cursor-pointer"
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
        )}

      </div>
    </section>
  );
};
