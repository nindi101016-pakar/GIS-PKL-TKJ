import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  MapPin,
  Save,
  Users,
  Compass,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Dudi } from '../../types';

interface DudiFormModalProps {
  isOpen: boolean;
  dudiToEdit: Dudi | null;
  nextNumber: number;
  onClose: () => void;
  onSave: (data: Omit<Dudi, 'id'>, id?: string) => Promise<void>;
}

export const DudiFormModal: React.FC<DudiFormModalProps> = ({
  isOpen,
  dudiToEdit,
  nextNumber,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    no: nextNumber,
    nama_dudi: '',
    maksimal_siswa: 4,
    pimpinan: '',
    jenis_dudi: 'Mandiri',
    bidang_pekerjaan: 'Teknisi / Mekanik, Jasa, Penjualan',
    alamat: '',
    kabupaten: 'Kab. Brebes',
    latitude: -6.9950,
    longitude: 109.0300,
    no_hp: '',
    jaminan: '-',
    nominal: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (dudiToEdit) {
      setFormData({
        no: dudiToEdit.no,
        nama_dudi: dudiToEdit.nama_dudi,
        maksimal_siswa: dudiToEdit.maksimal_siswa,
        pimpinan: dudiToEdit.pimpinan || '',
        jenis_dudi: dudiToEdit.jenis_dudi || 'Mandiri',
        bidang_pekerjaan: dudiToEdit.bidang_pekerjaan || '',
        alamat: dudiToEdit.alamat,
        kabupaten: dudiToEdit.kabupaten || 'Kab. Brebes',
        latitude: dudiToEdit.latitude,
        longitude: dudiToEdit.longitude,
        no_hp: dudiToEdit.no_hp || '',
        jaminan: dudiToEdit.jaminan || '-',
        nominal: dudiToEdit.nominal || 0,
      });
    } else {
      setFormData({
        no: nextNumber,
        nama_dudi: '',
        maksimal_siswa: 4,
        pimpinan: '',
        jenis_dudi: 'Mandiri',
        bidang_pekerjaan: 'Teknisi / Mekanik, Jasa',
        alamat: '',
        kabupaten: 'Kab. Brebes',
        latitude: -7.0264,
        longitude: 108.9982,
        no_hp: '',
        jaminan: '-',
        nominal: 0,
      });
    }
  }, [dudiToEdit, nextNumber, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_dudi.trim()) {
      setErrorMsg('Nama DUDI wajib diisi.');
      return;
    }
    if (!formData.alamat.trim()) {
      setErrorMsg('Alamat tempat PKL wajib diisi.');
      return;
    }
    if (isNaN(Number(formData.latitude)) || isNaN(Number(formData.longitude))) {
      setErrorMsg('Koordinat Latitude dan Longitude harus berupa angka yang valid.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await onSave(
        {
          no: Number(formData.no),
          nama_dudi: formData.nama_dudi.trim(),
          maksimal_siswa: Number(formData.maksimal_siswa),
          pimpinan: formData.pimpinan.trim(),
          jenis_dudi: formData.jenis_dudi,
          bidang_pekerjaan: formData.bidang_pekerjaan.trim(),
          alamat: formData.alamat.trim(),
          kabupaten: formData.kabupaten,
          latitude: Number(formData.latitude),
          longitude: Number(formData.longitude),
          no_hp: formData.no_hp.trim(),
          jaminan: formData.jaminan.trim() || '-',
          nominal: Number(formData.nominal) || 0,
        },
        dudiToEdit?.id
      );
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Gagal menyimpan data DUDI.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-neutral-200 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-800 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-5 h-5 text-red-200" />
            <span className="text-xs font-bold text-red-200 uppercase tracking-wider">
              {dudiToEdit ? 'Edit Data DUDI' : 'Input Tempat PKL Baru'}
            </span>
          </div>

          <h3 className="text-xl font-black tracking-tight">
            {dudiToEdit ? `Ubah Data: ${dudiToEdit.nama_dudi}` : 'Tambah Tempat PKL / DUDI'}
          </h3>
          <p className="text-xs text-red-100 mt-1">
            Formulir isian standar sesuai format data resmi tempat PKL TKJ SMKN 1 Songgom
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Row 1: No & Nama Dudi & Kuota */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
            <div className="sm:col-span-2">
              <label className="font-bold text-neutral-700 block mb-1">Nomor Urut *</label>
              <input
                type="number"
                required
                value={formData.no}
                onChange={(e) => setFormData({ ...formData, no: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <div className="sm:col-span-7">
              <label className="font-bold text-neutral-700 block mb-1">Nama DUDI / Tempat PKL *</label>
              <input
                type="text"
                required
                placeholder="Contoh: ABS Komputer"
                value={formData.nama_dudi}
                onChange={(e) => setFormData({ ...formData, nama_dudi: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="font-bold text-neutral-700 block mb-1">Maks. Siswa (Kuota) *</label>
              <input
                type="number"
                required
                min={1}
                max={20}
                value={formData.maksimal_siswa}
                onChange={(e) => setFormData({ ...formData, maksimal_siswa: parseInt(e.target.value) || 4 })}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
          </div>

          {/* Row 2: Pimpinan & Jenis DUDI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Nama Pimpinan / PIC</label>
              <input
                type="text"
                placeholder="Contoh: Arief Bayu S."
                value={formData.pimpinan}
                onChange={(e) => setFormData({ ...formData, pimpinan: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1">Jenis DUDI</label>
              <select
                value={formData.jenis_dudi}
                onChange={(e) => setFormData({ ...formData, jenis_dudi: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
              >
                <option value="Mandiri">Mandiri</option>
                <option value="CV/PT">CV / PT</option>
                <option value="Industri">Industri</option>
                <option value="BUMN">BUMN / Instansi</option>
              </select>
            </div>
          </div>

          {/* Row 3: Bidang Pekerjaan & Wilayah Kabupaten */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Bidang Pekerjaan</label>
              <input
                type="text"
                placeholder="Contoh: Teknisi / Mekanik, Jasa, Penjualan"
                value={formData.bidang_pekerjaan}
                onChange={(e) => setFormData({ ...formData, bidang_pekerjaan: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1">Kabupaten / Wilayah *</label>
              <select
                value={formData.kabupaten}
                onChange={(e) => setFormData({ ...formData, kabupaten: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
              >
                <option value="Kab. Brebes">Kab. Brebes</option>
                <option value="Kab. Tegal">Kab. Tegal</option>
                <option value="Kota Tegal">Kota Tegal</option>
                <option value="Kab. Banyumas">Kab. Banyumas (Purwokerto)</option>
              </select>
            </div>
          </div>

          {/* Row 4: Alamat Lengkap */}
          <div>
            <label className="font-bold text-neutral-700 block mb-1">Alamat Lengkap *</label>
            <textarea
              rows={2}
              required
              placeholder="Contoh: Jl. Projosumarto 01 Gg. Balok Desa Sutapranan, Kec. Dukuhturi, Kab. Tegal"
              value={formData.alamat}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none resize-none"
            />
          </div>

          {/* Row 5: Koordinat GIS Spasial */}
          <div className="bg-red-50/60 p-3.5 rounded-2xl border border-red-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-red-900 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-red-600" /> Koordinat Geografis (Wajib untuk GIS)
              </span>
              <span className="text-[10px] text-neutral-500">Format Desimal Derajat</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Latitude (Lintang) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="-6.90356"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white focus:ring-2 focus:ring-red-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Longitude (Bujur) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="109.13615"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white focus:ring-2 focus:ring-red-500 outline-none font-mono"
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 pt-1 text-[11px] text-neutral-600">
              <span className="text-neutral-400">Pusat Wilayah:</span>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, latitude: -7.0264, longitude: 108.9982 })}
                className="text-red-700 hover:underline font-semibold"
              >
                Songgom
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, latitude: -6.9840, longitude: 109.1268 })}
                className="text-red-700 hover:underline font-semibold"
              >
                Slawi
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, latitude: -6.8791, longitude: 109.0458 })}
                className="text-red-700 hover:underline font-semibold"
              >
                Kota Brebes
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, latitude: -6.8584, longitude: 109.1279 })}
                className="text-red-700 hover:underline font-semibold"
              >
                Kota Tegal
              </button>
            </div>
          </div>

          {/* Row 6: No. Hp, Jaminan, Nominal */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="font-bold text-neutral-700 block mb-1">No. HP / WhatsApp</label>
              <input
                type="text"
                placeholder="Contoh: 0857-1234-5001"
                value={formData.no_hp}
                onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1">Jaminan (Jika ada)</label>
              <input
                type="text"
                placeholder="Contoh: -"
                value={formData.jaminan}
                onChange={(e) => setFormData({ ...formData, jaminan: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1">Nominal (Rp)</label>
              <input
                type="number"
                min={0}
                placeholder="0"
                value={formData.nominal}
                onChange={(e) => setFormData({ ...formData, nominal: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-neutral-700 font-bold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold shadow-md shadow-red-600/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Data DUDI'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
