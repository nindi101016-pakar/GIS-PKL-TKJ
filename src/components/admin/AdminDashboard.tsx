import React, { useState } from 'react';
import {
  Building2,
  FileSpreadsheet,
  Settings,
  Image as ImageIcon,
  Database,
  Plus,
  Trash2,
  Edit,
  Download,
  Upload,
  Search,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  LogOut,
  ArrowLeft,
  RefreshCw,
  Eye,
  Save,
} from 'lucide-react';
import { Dudi, CMSContent, GalleryItem, SchoolLocation } from '../../types';
import { downloadExcelTemplate, exportDudiToExcel, parseExcelFile } from '../../utils/excel';
import { isSupabaseConfigured } from '../../lib/supabase';

interface AdminDashboardProps {
  dudiList: Dudi[];
  cms: CMSContent;
  gallery: GalleryItem[];
  school: SchoolLocation;
  onClose: () => void;
  onLogout: () => void;
  onAddDudi: () => void;
  onEditDudi: (dudi: Dudi) => void;
  onDeleteDudi: (id: string) => Promise<void>;
  onBulkImportDudi: (items: Dudi[]) => Promise<void>;
  onUpdateCMS: (section: keyof CMSContent, value: any) => Promise<void>;
  onAddGallery: (item: Omit<GalleryItem, 'id'>) => Promise<void>;
  onDeleteGallery: (id: string) => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  dudiList,
  cms,
  gallery,
  school,
  onClose,
  onLogout,
  onAddDudi,
  onEditDudi,
  onDeleteDudi,
  onBulkImportDudi,
  onUpdateCMS,
  onAddGallery,
  onDeleteGallery,
}) => {
  const [activeTab, setActiveTab] = useState<'dudi' | 'excel' | 'cms' | 'gallery' | 'database'>('dudi');
  const [searchTable, setSearchTable] = useState('');
  const [filterKab, setFilterKab] = useState('Semua');

  // Excel state
  const [uploadedData, setUploadedData] = useState<Partial<Dudi>[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [isParsingExcel, setIsParsingExcel] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState('');

  // CMS edit states
  const [heroForm, setHeroForm] = useState(cms.hero);
  const [tkjForm, setTkjForm] = useState(cms.tkj);
  const [kontakForm, setKontakForm] = useState(cms.kontak);
  const [cmsSaveMsg, setCmsSaveMsg] = useState('');

  // Gallery add state
  const [newGallery, setNewGallery] = useState({
    title: '',
    category: 'Kegiatan PKL' as GalleryItem['category'],
    imageUrl: '',
    description: '',
    date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
  });
  const [isAddingGallery, setIsAddingGallery] = useState(false);

  // Copy SQL state
  const [isCopiedSql, setIsCopiedSql] = useState(false);

  // Filtered DUDI for table
  const filteredTableDudi = dudiList.filter((dudi) => {
    const matchSearch =
      !searchTable.trim() ||
      dudi.nama_dudi.toLowerCase().includes(searchTable.toLowerCase()) ||
      dudi.alamat.toLowerCase().includes(searchTable.toLowerCase()) ||
      dudi.pimpinan?.toLowerCase().includes(searchTable.toLowerCase());
    const matchKab = filterKab === 'Semua' || dudi.kabupaten === filterKab;
    return matchSearch && matchKab;
  });

  // Handle Excel upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingExcel(true);
    setUploadErrors([]);
    setImportSuccessMsg('');

    const res = await parseExcelFile(file);
    setIsParsingExcel(false);

    if (res.success) {
      setUploadedData(res.data);
      setUploadErrors(res.errors);
    } else {
      setUploadedData([]);
      setUploadErrors(res.errors);
    }
  };

  const handleConfirmImport = async () => {
    if (uploadedData.length === 0) return;
    try {
      setIsImporting(true);
      await onBulkImportDudi(uploadedData as Dudi[]);
      setIsImporting(false);
      setImportSuccessMsg(`Berhasil mengimpor ${uploadedData.length} data tempat PKL ke sistem!`);
      setUploadedData([]);
    } catch (err: any) {
      setIsImporting(false);
      alert('Gagal mengimpor data: ' + err.message);
    }
  };

  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateCMS('hero', heroForm);
    setCmsSaveMsg('Berhasil memperbarui data Hero & Tagline!');
    setTimeout(() => setCmsSaveMsg(''), 3000);
  };

  const handleSaveTkj = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateCMS('tkj', tkjForm);
    setCmsSaveMsg('Berhasil memperbarui Profil Jurusan TKJ!');
    setTimeout(() => setCmsSaveMsg(''), 3000);
  };

  const handleSaveKontak = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateCMS('kontak', kontakForm);
    setCmsSaveMsg('Berhasil memperbarui Informasi Kontak & Sekolah!');
    setTimeout(() => setCmsSaveMsg(''), 3000);
  };

  const handleAddGallerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGallery.title || !newGallery.imageUrl) {
      alert('Judul foto dan URL Gambar wajib diisi.');
      return;
    }
    setIsAddingGallery(true);
    await onAddGallery(newGallery);
    setIsAddingGallery(false);
    setNewGallery({
      title: '',
      category: 'Kegiatan PKL',
      imageUrl: '',
      description: '',
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    });
  };

  const copySqlToClipboard = () => {
    const sqlText = `-- ============================================================================
-- SKEMA SUPABASE LENGKAP (VERSI FINAL - SMKN 1 SONGGOM)
-- Salin dan jalankan di SQL Editor Supabase
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TABEL ADMIN USERS
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE
);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);

-- 2. TABEL TEMPAT PKL / DUDI
CREATE TABLE IF NOT EXISTS public.dudi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    no INT NOT NULL,
    nama_dudi VARCHAR(255) NOT NULL,
    maksimal_siswa INT DEFAULT 4,
    pimpinan VARCHAR(255),
    jenis_dudi VARCHAR(100) DEFAULT 'Mandiri',
    bidang_pekerjaan TEXT,
    alamat TEXT NOT NULL,
    kabupaten VARCHAR(100) DEFAULT 'Kab. Brebes',
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    no_hp VARCHAR(50),
    jaminan VARCHAR(100),
    nominal NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_dudi_no ON public.dudi(no);
CREATE INDEX IF NOT EXISTS idx_dudi_kabupaten ON public.dudi(kabupaten);

-- 3. TABEL CMS CONTENT
CREATE TABLE IF NOT EXISTS public.cms_content (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABEL GALERI
CREATE TABLE IF NOT EXISTS public.gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'Instalasi Jaringan',
    image_url TEXT NOT NULL,
    description TEXT,
    date VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dudi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

-- 6. POLICIES (PUBLIC READ & FULL ACCESS)
DROP POLICY IF EXISTS "Public Read Admin Users" ON public.admin_users;
DROP POLICY IF EXISTS "Full Access Admin Users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow All Admin Users" ON public.admin_users;
CREATE POLICY "Allow All Admin Users" ON public.admin_users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read DUDI" ON public.dudi;
DROP POLICY IF EXISTS "Full Access DUDI" ON public.dudi;
DROP POLICY IF EXISTS "Allow All DUDI" ON public.dudi;
CREATE POLICY "Allow All DUDI" ON public.dudi FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read CMS" ON public.cms_content;
DROP POLICY IF EXISTS "Full Access CMS" ON public.cms_content;
DROP POLICY IF EXISTS "Allow All CMS" ON public.cms_content;
CREATE POLICY "Allow All CMS" ON public.cms_content FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Gallery" ON public.gallery;
DROP POLICY IF EXISTS "Full Access Gallery" ON public.gallery;
DROP POLICY IF EXISTS "Allow All Gallery" ON public.gallery;
CREATE POLICY "Allow All Gallery" ON public.gallery FOR ALL USING (true) WITH CHECK (true);

-- 7. SEED AKUN SUPERADMIN
INSERT INTO public.admin_users (email, password, full_name, role, is_active)
VALUES ('pakaryanoe@gmail.com', '@PTKsonggom1', 'Pak Aryanoe (Administrator GIS SMKN 1 Songgom)', 'superadmin', true)
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, full_name = EXCLUDED.full_name, role = EXCLUDED.role, is_active = EXCLUDED.is_active;
`;
    navigator.clipboard.writeText(sqlText);
    setIsCopiedSql(true);
    setTimeout(() => setIsCopiedSql(false), 2500);
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col font-sans">
      {/* Top Admin Header */}
      <header className="bg-neutral-900 text-white border-b-4 border-red-600 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 px-3 py-2 rounded-xl transition-colors font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Website GIS</span>
            </button>

            <div className="hidden sm:block border-l border-neutral-700 pl-4">
              <h1 className="font-black text-sm tracking-tight text-white flex items-center gap-2">
                <span>PANEL ADMINISTRATOR</span>
                <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-extrabold">
                  SMKN 1 SONGGOM
                </span>
              </h1>
              <p className="text-[11px] text-neutral-400">
                Pusat Kendali Basis Data Geospasial Tempat PKL TKJ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs bg-neutral-800/80 px-3 py-1.5 rounded-lg border border-neutral-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-neutral-300">
                {isSupabaseConfigured ? 'Supabase Connected' : 'Database Aktif (Auto-Sync)'}
              </span>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 text-xs bg-red-600/90 hover:bg-red-700 text-white font-bold px-3 py-2 rounded-xl transition-colors shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-neutral-800">
          <div className="flex items-center gap-2 overflow-x-auto py-2.5 scrollbar-none text-xs font-bold">
            <button
              onClick={() => setActiveTab('dudi')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors whitespace-nowrap ${
                activeTab === 'dudi'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Kelola Data DUDI ({dudiList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('excel')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors whitespace-nowrap ${
                activeTab === 'excel'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Import & Export Excel</span>
            </button>

            <button
              onClick={() => setActiveTab('cms')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors whitespace-nowrap ${
                activeTab === 'cms'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Konten CMS Website</span>
            </button>

            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors whitespace-nowrap ${
                activeTab === 'gallery'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Kelola Galeri ({gallery.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('database')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors whitespace-nowrap ${
                activeTab === 'database'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Database & Supabase</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ================= TAB 1: KELOLA DUDI (CRUD) ================= */}
        {activeTab === 'dudi' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-neutral-900">
                  Daftar Tempat Praktik Kerja Lapangan (DUDI)
                </h2>
                <p className="text-xs text-neutral-500">
                  Kelola data tempat PKL, kuota siswa, pimpinan, dan titik koordinat spasial
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => exportDudiToExcel(dudiList)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-neutral-700 font-bold text-xs transition-colors"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Download Excel</span>
                </button>

                <button
                  onClick={onAddDudi}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold text-xs shadow-md shadow-red-600/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Tempat PKL</span>
                </button>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari DUDI, pimpinan, alamat..."
                  value={searchTable}
                  onChange={(e) => setSearchTable(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white outline-none"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-neutral-500 font-medium shrink-0">Wilayah:</span>
                <select
                  value={filterKab}
                  onChange={(e) => setFilterKab(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 outline-none font-medium"
                >
                  <option value="Semua">Semua Wilayah</option>
                  <option value="Kab. Brebes">Kab. Brebes</option>
                  <option value="Kab. Tegal">Kab. Tegal</option>
                  <option value="Kota Tegal">Kota Tegal</option>
                  <option value="Kab. Banyumas">Kab. Banyumas</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-neutral-200">
                  <thead className="bg-neutral-50 font-bold text-neutral-700 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">No</th>
                      <th className="py-3 px-4">Nama DUDI</th>
                      <th className="py-3 px-3">Kuota</th>
                      <th className="py-3 px-4">Pimpinan</th>
                      <th className="py-3 px-4">Bidang Pekerjaan</th>
                      <th className="py-3 px-4">Wilayah</th>
                      <th className="py-3 px-4">Koordinat Lat/Lon</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 font-medium text-neutral-800">
                    {filteredTableDudi.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-neutral-400">
                          Tidak ada data tempat PKL yang cocok.
                        </td>
                      </tr>
                    ) : (
                      filteredTableDudi.map((dudi) => (
                        <tr key={dudi.id} className="hover:bg-neutral-50/80 transition-colors">
                          <td className="py-3 px-4 font-bold text-neutral-900">{dudi.no}</td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-neutral-900">{dudi.nama_dudi}</div>
                            <div className="text-[11px] text-neutral-400 line-clamp-1">{dudi.alamat}</div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="bg-red-50 text-red-700 font-extrabold px-2 py-0.5 rounded border border-red-200">
                              {dudi.maksimal_siswa} Siswa
                            </span>
                          </td>
                          <td className="py-3 px-4">{dudi.pimpinan || '-'}</td>
                          <td className="py-3 px-4">
                            <span className="line-clamp-1 max-w-xs">{dudi.bidang_pekerjaan || '-'}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-[11px] bg-neutral-100 px-2 py-0.5 rounded text-neutral-700">
                              {dudi.kabupaten}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-neutral-500">
                            {dudi.latitude.toFixed(4)}, {dudi.longitude.toFixed(4)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => onEditDudi(dudi)}
                                className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
                                title="Edit Data"
                              >
                                <Edit className="w-3.5 h-3.5 text-blue-600" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Yakin ingin menghapus ${dudi.nama_dudi}?`)) {
                                    onDeleteDudi(dudi.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-neutral-100 hover:bg-red-100 text-neutral-700 hover:text-red-700 transition-colors"
                                title="Hapus Data"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="p-4 bg-neutral-50 border-t border-neutral-200 text-xs text-neutral-500 flex items-center justify-between">
                <span>Total Data DUDI: <b>{filteredTableDudi.length}</b> tempat</span>
                <span>Konsentrasi Keahlian TKJ SMKN 1 Songgom</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: EXCEL IMPORT & EXPORT ================= */}
        {activeTab === 'excel' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs">
              <h2 className="text-lg font-black text-neutral-900 mb-1">
                Import & Export Data Excel Tempat PKL
              </h2>
              <p className="text-xs text-neutral-500">
                Gunakan template resmi untuk mengunggah puluhan data DUDI sekaligus, atau unduh cadangan seluruh data saat ini.
              </p>

              {/* Download actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div className="p-5 rounded-2xl bg-red-50/70 border border-red-200 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-red-600 uppercase block mb-1">Template Resmi</span>
                    <h3 className="font-extrabold text-sm text-neutral-900">
                      Download Format Excel (.xlsx)
                    </h3>
                    <p className="text-xs text-neutral-600 mt-1">
                      Unduh template kosong lengkap dengan nama kolom (No, Nama Dudi, Maksimal Siswa, Pimpinan, Jenis, Bidang, Alamat, Lat, Long, No HP, Jaminan, Nominal).
                    </p>
                  </div>
                  <button
                    onClick={downloadExcelTemplate}
                    className="mt-4 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh Template Excel</span>
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase block mb-1">Ekspor Data Nyata</span>
                    <h3 className="font-extrabold text-sm text-neutral-900">
                      Export Seluruh Data ({dudiList.length} DUDI)
                    </h3>
                    <p className="text-xs text-neutral-600 mt-1">
                      Unduh seluruh basis data tempat PKL yang tersimpan dalam format berkas Excel yang siap dicetak atau dianalisis.
                    </p>
                  </div>
                  <button
                    onClick={() => exportDudiToExcel(dudiList)}
                    className="mt-4 flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Ekspor Data ke Excel</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Upload Box */}
            <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-base text-neutral-900">
                Unggah Berkas Excel (.xlsx / .csv)
              </h3>
              <p className="text-xs text-neutral-500">
                Pilih file Excel yang telah diisi sesuai template. Sistem akan otomatis memvalidasi kolom dan koordinat GIS.
              </p>

              {importSuccessMsg && (
                <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{importSuccessMsg}</span>
                </div>
              )}

              {uploadErrors.length > 0 && (
                <div className="bg-amber-50 border border-amber-300 text-amber-900 p-4 rounded-xl text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-700" />
                    <span>Peringatan Pembacaan Berkas:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800">
                    {uploadErrors.slice(0, 5).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {uploadErrors.length > 5 && (
                      <li>...dan {uploadErrors.length - 5} baris lainnya.</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Drag & Drop Input */}
              <label className="border-2 border-dashed border-neutral-300 hover:border-red-500 bg-neutral-50 hover:bg-red-50/20 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
                <Upload className="w-10 h-10 text-neutral-400 mb-2" />
                <span className="font-bold text-sm text-neutral-800">
                  {isParsingExcel ? 'Sedang Memproses Berkas...' : 'Klik untuk Pilih Berkas Excel atau Tarik ke Sini'}
                </span>
                <span className="text-xs text-neutral-400 mt-1">Mendukung format .xlsx, .xls, .csv</span>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Uploaded Preview */}
              {uploadedData.length > 0 && (
                <div className="mt-6 space-y-3 pt-4 border-t border-neutral-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-neutral-900">
                        Pratinjau Data Terbaca ({uploadedData.length} Tempat)
                      </h4>
                      <p className="text-xs text-neutral-500">
                        Periksa data sebelum menyimpannya ke database sistem.
                      </p>
                    </div>

                    <button
                      onClick={handleConfirmImport}
                      disabled={isImporting}
                      className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md shadow-red-600/20 flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isImporting ? 'Mengimpor...' : 'Konfirmasi & Simpan ke Database'}</span>
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto rounded-xl border border-neutral-200">
                    <table className="w-full text-left text-xs divide-y divide-neutral-200">
                      <thead className="bg-neutral-50 font-bold text-neutral-700 uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="p-2">No</th>
                          <th className="p-2">Nama DUDI</th>
                          <th className="p-2">Kuota</th>
                          <th className="p-2">Pimpinan</th>
                          <th className="p-2">Bidang</th>
                          <th className="p-2">Wilayah</th>
                          <th className="p-2">Lat/Long</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {uploadedData.slice(0, 10).map((row, idx) => (
                          <tr key={idx} className="hover:bg-neutral-50">
                            <td className="p-2 font-bold">{row.no || idx + 1}</td>
                            <td className="p-2 font-bold">{row.nama_dudi}</td>
                            <td className="p-2">{row.maksimal_siswa} Siswa</td>
                            <td className="p-2">{row.pimpinan || '-'}</td>
                            <td className="p-2 truncate max-w-xs">{row.bidang_pekerjaan}</td>
                            <td className="p-2">{row.kabupaten}</td>
                            <td className="p-2 font-mono text-[10px]">
                              {row.latitude?.toFixed(4)}, {row.longitude?.toFixed(4)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {uploadedData.length > 10 && (
                    <div className="text-center text-xs text-neutral-400">
                      ...menampilkan 10 dari total {uploadedData.length} baris
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: CMS KONTEN WEBSITE ================= */}
        {activeTab === 'cms' && (
          <div className="space-y-6">
            {cmsSaveMsg && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{cmsSaveMsg}</span>
              </div>
            )}

            {/* Hero Form */}
            <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs">
              <h3 className="font-extrabold text-base text-neutral-900 mb-1">
                Pengaturan Teks Beranda & Tagline Hero
              </h3>
              <p className="text-xs text-neutral-500 mb-4">
                Ubah judul utama dan kalimat pengantar pada halaman depan aplikasi GIS
              </p>

              <form onSubmit={handleSaveHero} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Badge Atas</label>
                  <input
                    type="text"
                    value={heroForm.badge}
                    onChange={(e) => setHeroForm({ ...heroForm, badge: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Judul Utama (Headline)</label>
                  <input
                    type="text"
                    value={heroForm.headline}
                    onChange={(e) => setHeroForm({ ...heroForm, headline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Subjudul / Deskripsi Tagline</label>
                  <textarea
                    rows={3}
                    value={heroForm.subheadline}
                    onChange={(e) => setHeroForm({ ...heroForm, subheadline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-xs transition-colors"
                >
                  Simpan Perubahan Hero
                </button>
              </form>
            </div>

            {/* Kontak Form */}
            <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs">
              <h3 className="font-extrabold text-base text-neutral-900 mb-1">
                Informasi Kontak & Jam Kerja Sekolah
              </h3>
              <p className="text-xs text-neutral-500 mb-4">
                Perbarui alamat resmi, email, nomor telepon, dan jam operasional SMKN 1 Songgom
              </p>

              <form onSubmit={handleSaveKontak} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Email Resmi</label>
                    <input
                      type="text"
                      value={kontakForm.email}
                      onChange={(e) => setKontakForm({ ...kontakForm, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">No. Telepon / WhatsApp</label>
                    <input
                      type="text"
                      value={kontakForm.phone}
                      onChange={(e) => setKontakForm({ ...kontakForm, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Alamat Lengkap</label>
                  <input
                    type="text"
                    value={kontakForm.address}
                    onChange={(e) => setKontakForm({ ...kontakForm, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Jam Pelayanan</label>
                  <input
                    type="text"
                    value={kontakForm.operatingHours}
                    onChange={(e) => setKontakForm({ ...kontakForm, operatingHours: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-xs transition-colors"
                >
                  Simpan Kontak Sekolah
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================= TAB 4: KELOLA GALERI ================= */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs">
              <h2 className="text-lg font-black text-neutral-900 mb-1">
                Kelola Dokumentasi Galeri PKL
              </h2>
              <p className="text-xs text-neutral-500 mb-6">
                Tambah atau hapus foto dokumentasi aktivitas siswa TKJ di dunia industri
              </p>

              {/* Add form */}
              <form onSubmit={handleAddGallerySubmit} className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200 space-y-4 text-xs mb-8">
                <h4 className="font-extrabold text-sm text-neutral-900 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-red-600" />
                  <span>Tambah Foto Dokumentasi Baru</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Judul Foto *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Pemasangan Router Mikrotik di DUDI"
                      value={newGallery.title}
                      onChange={(e) => setNewGallery({ ...newGallery, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Kategori Aktivitas</label>
                    <select
                      value={newGallery.category}
                      onChange={(e) => setNewGallery({ ...newGallery, category: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white outline-none"
                    >
                      <option value="Kegiatan PKL">Kegiatan PKL</option>
                      <option value="Monitoring Guru">Monitoring Guru</option>
                      <option value="Instalasi Jaringan">Instalasi Jaringan</option>
                      <option value="Perakitan & Servis">Perakitan & Servis</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">URL Tautan Gambar *</label>
                    <input
                      type="url"
                      required
                      placeholder="https://images.unsplash.com/..."
                      value={newGallery.imageUrl}
                      onChange={(e) => setNewGallery({ ...newGallery, imageUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Tanggal Kegiatan</label>
                    <input
                      type="text"
                      value={newGallery.date}
                      onChange={(e) => setNewGallery({ ...newGallery, date: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Deskripsi Singkat</label>
                  <textarea
                    rows={2}
                    placeholder="Tuliskan keterangan tempat, siswa yang bertugas, dan aktivitas..."
                    value={newGallery.description}
                    onChange={(e) => setNewGallery({ ...newGallery, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAddingGallery}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  {isAddingGallery ? 'Menambahkan...' : 'Simpan Foto ke Galeri'}
                </button>
              </form>

              {/* Gallery Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {gallery.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs flex flex-col justify-between"
                  >
                    <div className="aspect-video relative bg-neutral-100">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                    </div>

                    <div className="p-3">
                      <h4 className="font-bold text-xs text-neutral-900 line-clamp-1">{item.title}</h4>
                      <p className="text-[11px] text-neutral-400 mt-0.5">{item.date}</p>
                    </div>

                    <div className="p-3 pt-0 border-t border-neutral-100 flex items-center justify-end">
                      <button
                        onClick={() => {
                          if (confirm(`Hapus foto "${item.title}"?`)) {
                            onDeleteGallery(item.id);
                          }
                        }}
                        className="text-xs text-red-600 hover:text-red-800 font-bold flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: DATABASE & SUPABASE ================= */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-neutral-900">
                    Status Basis Data & Supabase
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Konfigurasi database cloud Supabase untuk persistensi data seluruh tempat PKL
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500' : 'bg-emerald-400'} animate-pulse`} />
                  <span className="text-xs font-bold text-neutral-800">
                    {isSupabaseConfigured ? 'Terkoneksi ke Supabase' : 'Sistem Penyimpanan Aktif'}
                  </span>
                </div>
              </div>

              {/* Info Banner */}
              <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200 text-xs space-y-3">
                <div className="font-bold text-neutral-800 text-sm">
                  Informasi Integrasi Supabase SQL Editor:
                </div>
                <p className="text-neutral-600 leading-relaxed">
                  File SQL telah otomatis disiapkan di root proyek dengan nama <code className="bg-white px-2 py-0.5 rounded border border-neutral-300 font-mono text-red-600">supabase-schema.sql</code>. Berkas ini mencakup pembuatan tabel <code>dudi</code>, <code>cms_content</code>, <code>gallery</code>, Row Level Security (RLS) policies, serta seed data lengkap 32 tempat PKL resmi.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={copySqlToClipboard}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs transition-colors"
                  >
                    {isCopiedSql ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{isCopiedSql ? 'Skrip SQL Tersalin!' : 'Salin Skrip SQL Schema'}</span>
                  </button>
                </div>
              </div>

              {/* Step-by-step guidance */}
              <div className="space-y-3 pt-4 border-t border-neutral-200 text-xs">
                <h4 className="font-extrabold text-sm text-neutral-900">Langkah Menjalankan di Supabase:</h4>
                <ol className="list-decimal list-inside space-y-2 text-neutral-600">
                  <li>Buka dashboard proyek Anda di <b>Supabase</b> (https://supabase.com).</li>
                  <li>Masuk ke menu <b>SQL Editor</b> pada sidebar kiri.</li>
                  <li>Buat Query baru lalu paste skrip SQL dari file <code>supabase-schema.sql</code>.</li>
                  <li>Klik tombol <b>Run</b>. Semua tabel dan 32 data DUDI langsung terisi.</li>
                  <li>Masukkan <code>VITE_SUPABASE_URL</code> dan <code>VITE_SUPABASE_ANON_KEY</code> pada konfigurasi environment proyek bila ingin koneksi langsung.</li>
                </ol>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
