import React from 'react';
import {
  X,
  Building2,
  Users,
  MapPin,
  Phone,
  Briefcase,
  UserCheck,
  Shield,
  Coins,
  ExternalLink,
  Compass,
  Navigation,
} from 'lucide-react';
import { Dudi, SchoolLocation } from '../types';
import {
  calculateHaversineDistance,
  formatDistance,
  estimateTravelTime,
  getCompassBearing,
} from '../utils/geo';

interface DudiDetailModalProps {
  dudi: Dudi | null;
  school: SchoolLocation;
  onClose: () => void;
  onFocusOnMap: (dudi: Dudi) => void;
}

export const DudiDetailModal: React.FC<DudiDetailModalProps> = ({
  dudi,
  school,
  onClose,
  onFocusOnMap,
}) => {
  if (!dudi) return null;

  const distanceKm = calculateHaversineDistance(
    school.latitude,
    school.longitude,
    dudi.latitude,
    dudi.longitude
  );

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${school.latitude},${school.longitude}&destination=${dudi.latitude},${dudi.longitude}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-neutral-200 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-800 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="bg-white/20 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full backdrop-blur-xs">
              Nomor Urut: #{dudi.no}
            </span>
            <span className="bg-white/20 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-xs">
              {dudi.kabupaten}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight">{dudi.nama_dudi}</h3>
          <p className="text-red-100 text-xs mt-1">
            Mitra Resmi Praktik Kerja Lapangan (PKL) SMK Negeri 1 Songgom
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-red-50/80 p-3 rounded-xl border border-red-100">
              <span className="text-[10px] font-bold text-red-600 uppercase block">Kuota Siswa</span>
              <span className="text-lg font-black text-red-950 flex items-center gap-1.5 mt-0.5">
                <Users className="w-4 h-4 text-red-600" />
                {dudi.maksimal_siswa} Orang
              </span>
            </div>

            <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200">
              <span className="text-[10px] font-bold text-neutral-500 uppercase block">Jarak dari Sekolah</span>
              <span className="text-lg font-black text-neutral-900 flex items-center gap-1.5 mt-0.5">
                <Navigation className="w-4 h-4 text-red-600" />
                {formatDistance(distanceKm)}
              </span>
            </div>

            <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-neutral-500 uppercase block">Jenis Usaha</span>
              <span className="text-sm font-extrabold text-neutral-900 block mt-1 truncate">
                {dudi.jenis_dudi || 'Mandiri'}
              </span>
            </div>
          </div>

          {/* Details Table */}
          <div className="space-y-3 text-xs divide-y divide-neutral-100">
            <div className="pt-2 flex items-start justify-between gap-4">
              <span className="text-neutral-500 font-semibold flex items-center gap-1.5 shrink-0">
                <UserCheck className="w-4 h-4 text-red-600" />
                Pimpinan / Penanggung Jawab
              </span>
              <span className="font-bold text-neutral-900 text-right">{dudi.pimpinan || '-'}</span>
            </div>

            <div className="pt-2 flex items-start justify-between gap-4">
              <span className="text-neutral-500 font-semibold flex items-center gap-1.5 shrink-0">
                <Briefcase className="w-4 h-4 text-red-600" />
                Bidang Pekerjaan
              </span>
              <span className="font-semibold text-neutral-900 text-right bg-neutral-100 px-2 py-0.5 rounded">
                {dudi.bidang_pekerjaan || '-'}
              </span>
            </div>

            <div className="pt-2 flex items-start justify-between gap-4">
              <span className="text-neutral-500 font-semibold flex items-center gap-1.5 shrink-0">
                <Phone className="w-4 h-4 text-red-600" />
                Kontak / No. Telepon
              </span>
              <span className="font-bold text-neutral-900 text-right">
                {dudi.no_hp ? (
                  <a href={`tel:${dudi.no_hp}`} className="text-red-600 hover:underline">
                    {dudi.no_hp}
                  </a>
                ) : (
                  <span className="text-neutral-400">Tersedia via Hubin Sekolah</span>
                )}
              </span>
            </div>

            <div className="pt-2 flex items-start justify-between gap-4">
              <span className="text-neutral-500 font-semibold flex items-center gap-1.5 shrink-0">
                <Shield className="w-4 h-4 text-red-600" />
                Jaminan
              </span>
              <span className="font-medium text-neutral-800 text-right">{dudi.jaminan || '-'}</span>
            </div>

            <div className="pt-2 flex items-start justify-between gap-4">
              <span className="text-neutral-500 font-semibold flex items-center gap-1.5 shrink-0">
                <Coins className="w-4 h-4 text-red-600" />
                Nominal / Uang Saku
              </span>
              <span className="font-medium text-neutral-800 text-right">
                {dudi.nominal ? `Rp ${dudi.nominal.toLocaleString('id-ID')}` : '-'}
              </span>
            </div>

            <div className="pt-2 flex items-start justify-between gap-4">
              <span className="text-neutral-500 font-semibold flex items-center gap-1.5 shrink-0">
                <MapPin className="w-4 h-4 text-red-600" />
                Alamat Lengkap
              </span>
              <span className="font-medium text-neutral-700 text-right leading-relaxed max-w-xs">
                {dudi.alamat}
              </span>
            </div>

            <div className="pt-2 flex items-start justify-between gap-4">
              <span className="text-neutral-500 font-semibold flex items-center gap-1.5 shrink-0">
                <Compass className="w-4 h-4 text-red-600" />
                Koordinat GPS
              </span>
              <span className="font-mono text-neutral-600 text-[11px] text-right">
                {dudi.latitude.toFixed(5)}, {dudi.longitude.toFixed(5)}
              </span>
            </div>
          </div>

          {/* Travel Info Box */}
          <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200 text-xs text-neutral-600 flex items-center justify-between">
            <div>
              <span>Estimasi Waktu Tempuh: </span>
              <b className="text-neutral-900">{estimateTravelTime(distanceKm)}</b>
            </div>
            <div className="text-[11px] text-neutral-400">
              Arah: <b>{getCompassBearing(school.latitude, school.longitude, dudi.latitude, dudi.longitude)}</b>
            </div>
          </div>
        </div>

        {/* Modal Footer / Action Buttons */}
        <div className="bg-neutral-50 border-t border-neutral-200 p-4 px-6 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onFocusOnMap(dudi);
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-neutral-300 hover:border-red-400 bg-white text-neutral-700 hover:text-red-700 font-bold text-xs transition-colors"
          >
            <Compass className="w-4 h-4 text-red-600" />
            <span>Fokus di Peta GIS</span>
          </button>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Petunjuk Arah (Google Maps)</span>
          </a>
        </div>
      </div>
    </div>
  );
};
