-- ============================================================================
-- SKEMA BASIS DATA SUPABASE (VERSI FINAL - SIAP PRODUKSI)
-- SISTEM INFORMASI GEOGRAFIS (GIS) PEMETAAN TEMPAT PKL TKJ
-- SMK NEGERI 1 SONGGOM - BREBES DAN SEKITARNYA
-- ============================================================================
-- Petunjuk Penggunaan:
-- 1. Buka dashboard Supabase Anda di https://supabase.com
-- 2. Pilih Project Anda, lalu buka menu "SQL Editor" di bilah navigasi kiri.
-- 3. Klik "New query", salin (copy) dan tempel (paste) seluruh isi file ini.
-- 4. Klik tombol "Run" (atau tekan Ctrl + Enter) untuk mengeksekusi skema.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. AKTIFKAN EKSTENSI POSTGRESQL YANG DIBUTUHKAN
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 2. TABEL: AKUN PENGGUNA ADMINISTRATOR (admin_users)
-- Digunakan untuk autentikasi masuk ke Dashboard Pengelolaan Data GIS
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 3. TABEL: MITRA INDUSTRI / TEMPAT PKL (dudi)
-- Menyimpan profil 32 tempat magang, kuota, koordinat GIS, dan kontak
-- ----------------------------------------------------------------------------
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
CREATE INDEX IF NOT EXISTS idx_dudi_nama ON public.dudi(nama_dudi);

-- ----------------------------------------------------------------------------
-- 4. TABEL: KONTEN DINAMIS CMS (cms_content)
-- Menyimpan konfigurasi teks hero, profil keahlian TKJ, manfaat, dan info kontak
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cms_content (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 5. TABEL: GALERI DOKUMENTASI PRAKTIK SISWA (gallery)
-- Menyimpan dokumentasi teknis kegiatan praktik perakitan & instalasi jaringan
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'Instalasi Jaringan',
    image_url TEXT NOT NULL,
    description TEXT,
    date VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_gallery_category ON public.gallery(category);

-- ----------------------------------------------------------------------------
-- 6. FUNGSI & TRIGGER PEMBARUAN OTOMATIS KOLOM updated_at
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_dudi_updated_at ON public.dudi;
CREATE TRIGGER trigger_dudi_updated_at
    BEFORE UPDATE ON public.dudi
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_cms_updated_at ON public.cms_content;
CREATE TRIGGER trigger_cms_updated_at
    BEFORE UPDATE ON public.cms_content
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) & KEBIJAKAN AKSES (POLICIES)
-- Memastikan data dapat dibaca oleh publik dan dapat dimodifikasi oleh Admin
-- ----------------------------------------------------------------------------
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dudi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

-- Kebijakan untuk Tabel admin_users
DROP POLICY IF EXISTS "Public Read Admin Users" ON public.admin_users;
CREATE POLICY "Public Read Admin Users" ON public.admin_users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Full Access Admin Users" ON public.admin_users;
CREATE POLICY "Full Access Admin Users" ON public.admin_users FOR ALL USING (true);

-- Kebijakan untuk Tabel dudi
DROP POLICY IF EXISTS "Public Read DUDI" ON public.dudi;
CREATE POLICY "Public Read DUDI" ON public.dudi FOR SELECT USING (true);

DROP POLICY IF EXISTS "Full Access DUDI" ON public.dudi;
CREATE POLICY "Full Access DUDI" ON public.dudi FOR ALL USING (true);

-- Kebijakan untuk Tabel cms_content
DROP POLICY IF EXISTS "Public Read CMS" ON public.cms_content;
CREATE POLICY "Public Read CMS" ON public.cms_content FOR SELECT USING (true);

DROP POLICY IF EXISTS "Full Access CMS" ON public.cms_content;
CREATE POLICY "Full Access CMS" ON public.cms_content FOR ALL USING (true);

-- Kebijakan untuk Tabel gallery
DROP POLICY IF EXISTS "Public Read Gallery" ON public.gallery;
CREATE POLICY "Public Read Gallery" ON public.gallery FOR SELECT USING (true);

DROP POLICY IF EXISTS "Full Access Gallery" ON public.gallery;
CREATE POLICY "Full Access Gallery" ON public.gallery FOR ALL USING (true);

-- ----------------------------------------------------------------------------
-- 8. SEED DATA: AKUN PENGELOLA ADMINISTRATOR
-- Kredensial default: email admin@smkn1songgom.sch.id / password admin123
-- ----------------------------------------------------------------------------
INSERT INTO public.admin_users (email, password, full_name, role, is_active)
VALUES (
    'admin@smkn1songgom.sch.id',
    'admin123',
    'Administrator GIS SMKN 1 Songgom',
    'superadmin',
    true
)
ON CONFLICT (email) DO UPDATE 
SET full_name = EXCLUDED.full_name, role = EXCLUDED.role, is_active = EXCLUDED.is_active;

-- ----------------------------------------------------------------------------
-- 9. SEED DATA: KONTEN UTAMA CMS (cms_content)
-- ----------------------------------------------------------------------------
INSERT INTO public.cms_content (key, value)
VALUES 
(
    'hero',
    '{
        "badge": "Sistem Informasi Geografis PKL TKJ",
        "headline": "Pemetaan Tempat PKL Teknik Komputer & Jaringan di Brebes dan Sekitarnya",
        "subheadline": "Platform GIS interaktif SMK Negeri 1 Songgom untuk eksplorasi sebaran industri mitra, pengukuran jarak tempuh, ketersediaan kuota siswa, dan manajemen terpadu tempat Praktik Kerja Lapangan.",
        "statsText": "Tersebar di Brebes, Kab. Tegal, Kota Tegal, dan Purwokerto"
    }'::jsonb
),
(
    'tkj',
    '{
        "title": "Konsentrasi Keahlian Teknik Komputer & Jaringan",
        "description": "Jurusan Teknik Komputer dan Jaringan (TKJ) SMK Negeri 1 Songgom membekali peserta didik dengan keahlian teknis terapan di bidang perakitan hardware, administrasi infrastruktur jaringan komputer, fiber optik, cloud server, dan internet service provider (ISP) yang selaras dengan kebutuhan industri 4.0.",
        "competencies": [
            {
                "title": "Infrastruktur Jaringan & Routing",
                "description": "Konfigurasi MikroTik MTCNA/MTCRE, Cisco CCNA, routing statis & dinamis, VLAN, bandwidth management, firewall, dan instalasi kabel UTP/STP standar industri.",
                "icon": "Network"
            },
            {
                "title": "Teknologi Fiber Optik & ISP",
                "description": "Penyambungan kabel serat optik (splicing OTDR, OPM, VFL), instalasi FTTH (Fiber to the Home), setting OLT/ONT, serta maintenance jaringan internet wireless broadband.",
                "icon": "Radio"
            },
            {
                "title": "Hardware & Troubleshooting PC/Laptop",
                "description": "Perakitan komputer mutakhir, diagnosa kerusakan motherboard, bios flashing, maintenance printer & toner, serta perbaikan komponen periferal.",
                "icon": "Cpu"
            },
            {
                "title": "Administrasi Server & Cloud Linux",
                "description": "Deployment server Linux (Debian, Ubuntu, AlmaLinux), Web Server, DNS, DHCP, Virtualisasi (Proxmox), dan dasar-dasar cyber security.",
                "icon": "Server"
            }
        ],
        "careerOpportunities": [
            "Network Administrator & Support Engineer",
            "Teknisi Hardware & Komputer Spesialis",
            "Fiber Optic Technician & Field Engineer",
            "Helpdesk & IT Support Officer",
            "Wirausaha Toko Komputer & Servis Center",
            "Teknisi ISP / Wireless Network Provider"
        ]
    }'::jsonb
),
(
    'manfaat',
    '{
        "title": "Tujuan dan Manfaat Pemetaan GIS PKL",
        "subtitle": "Menghubungkan Dunia Pendidikan Vokasi dengan Dunia Usaha dan Dunia Industri (DUDI) secara transparan, terukur, dan berbasis spasial.",
        "benefits": [
            {
                "target": "Bagi Peserta Didik (Siswa TKJ)",
                "points": [
                    "Mempermudah pencarian tempat PKL yang relevan dengan minat keahlian (Jaringan, Servis Hardware, atau ISP).",
                    "Dapat mengukur estimasi jarak dan waktu tempuh dari rumah atau sekolah ke lokasi DUDI secara akurat.",
                    "Mengetahui ketersediaan kuota maksimal siswa di tiap tempat magang sehingga tidak terjadi penumpukan.",
                    "Transparansi profil pimpinan DUDI, legalitas usaha, dan kontak resmi untuk koordinasi awal."
                ],
                "icon": "UserCheck"
            },
            {
                "target": "Bagi Sekolah & Guru Pembimbing",
                "points": [
                    "Monitoring sebaran geografis lokasi siswa PKL secara real-time di peta digital.",
                    "Efisiensi rute dan jadwal monitoring berkala bagi guru pembimbing ke berbagai DUDI.",
                    "Database terpusat yang selalu mutakhir melalui Content Management System (CMS).",
                    "Kemudahan pelaporan dan evaluasi kemitraan industri dari tahun ke tahun."
                ],
                "icon": "GraduationCap"
            },
            {
                "target": "Bagi DUDI Mitra Industri",
                "points": [
                    "Mendapatkan calon tenaga magang yang memiliki kualifikasi sesuai kebutuhan operasional teknis.",
                    "Promosi profil usaha dan reputasi industri sebagai mitra resmi vokasi SMK Negeri 1 Songgom.",
                    "Kemudahan komunikasi langsung dengan pihak BKK / Hubin sekolah.",
                    "Membantu menyaring talenta terbaik untuk direkrut menjadi karyawan tetap pasca kelulusan."
                ],
                "icon": "Briefcase"
            }
        ]
    }'::jsonb
),
(
    'kontak',
    '{
        "address": "Jl. Raya Songgom, Karangsembung, Kec. Songgom, Kab. Brebes, Jawa Tengah 52266",
        "email": "smkn1songgom@gmail.com",
        "phone": "(0283) 6175001 / 0852-2590-7711",
        "website": "https://www.smkn1songgom.sch.id",
        "operatingHours": "Senin - Jumat: 07.00 - 15.30 WIB",
        "googleMapsEmbed": "https://maps.google.com/maps?q=-7.02640,108.99820&z=15&output=embed"
    }'::jsonb
)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = timezone('utc'::text, now());

-- ----------------------------------------------------------------------------
-- 10. SEED DATA: DOKUMENTASI TEKNIS & PERALATAN (gallery)
-- Fokus visual teknis, hardware, dan instalasi jaringan tanpa menampilkan wajah
-- ----------------------------------------------------------------------------
INSERT INTO public.gallery (id, title, category, image_url, description, date)
VALUES
(
    '11111111-1111-1111-1111-111111111101',
    'Penyambungan Core Fiber Optik Menggunakan Fusion Splicer',
    'Instalasi Jaringan',
    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
    'Penyambungan inti serat optik presisi (splicing) pada proyek FTTH jaringan internet ISP mitra.',
    '15 Agustus 2024'
),
(
    '11111111-1111-1111-1111-111111111102',
    'Manajemen Kabel Rack Server & Patch Panel Switch',
    'Instalasi Jaringan',
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    'Pengkabelan terstruktur (structured cabling) dan instalasi patch cord Cat6 pada rack server instansi industri.',
    '28 September 2024'
),
(
    '11111111-1111-1111-1111-111111111103',
    'Pemeriksaan & Perakitan Hardware Komputer Motherboard',
    'Perakitan & Servis',
    'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=800&q=80',
    'Diagnosa komponen motherboard, instalasi RAM DDR4, dan penggantian pasta termal processor.',
    '10 Oktober 2024'
),
(
    '11111111-1111-1111-1111-111111111104',
    'Aktivitas Perakitan Komputer PC Desktop di Workshop',
    'Perakitan & Servis',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    'Praktek perakitan unit casing, power supply, dan manajemen kabel internal PC siswa di tempat PKL.',
    '02 November 2024'
),
(
    '11111111-1111-1111-1111-111111111105',
    'Pengujian & Crimping Konektor RJ45 Kabel UTP LAN',
    'Pengujian Alat',
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    'Terminasi kabel jaringan UTP Cat6 dengan konektor RJ45 standar TIA/EIA-568B dan pengetesan LAN tester.',
    '18 November 2024'
),
(
    '11111111-1111-1111-1111-111111111106',
    'Penyolderan & Perbaikan Sirkuit Elektronika Router',
    'Perakitan & Servis',
    'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=800&q=80',
    'Pemeriksaan jalur daya dan penyolderan komponen resistor/kapasitor pada board perangkat jaringan.',
    '01 Juli 2024'
)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 11. SEED DATA: 32 TEMPAT PKL / DUDI RESMI SMK NEGERI 1 SONGGOM
-- Lengkap dengan data pimpinan, bidang teknis, kuota siswa, dan koordinat GPS
-- ----------------------------------------------------------------------------
INSERT INTO public.dudi (no, nama_dudi, maksimal_siswa, pimpinan, jenis_dudi, bidang_pekerjaan, alamat, kabupaten, latitude, longitude, no_hp, jaminan, nominal)
VALUES
(1, 'ABS Komputer', 4, 'Arief Bayu S.', 'Mandiri', 'Teknisi / Mekanik, Penjualan', 'Jl. Projosumarto 01 Gg. Balok Desa Sutapranan, Kec. Dukuhturi, Kab. Tegal', 'Kab. Tegal', -6.903560, 109.136150, '', '', 0),
(2, 'Era Network Center (ENC)', 4, 'Nasruloh', 'CV/PT', 'Jaringan, Jasa', 'Jl. Kertaharja, Jatirokeh, Kec. Songgom, Kab. Brebes', 'Kab. Brebes', -6.995650, 109.030180, '', '', 0),
(3, 'Fito Komputer', 4, 'Fiqri silando Amd.T', 'Mandiri', 'Teknisi / Mekanik, Jasa, Penjualan', 'Jl. Gajah Mada, RT.05/RW.07, Desa Kalisapu, Kec. Slawi, Kab. Tegal, Kode Pos : 52416', 'Kab. Tegal', -6.984030, 109.126890, '', '', 0),
(4, 'Gibran Net (PT Media Cepat Indonesia)', 4, 'SUNARYO', 'CV/PT', 'Teknisi / Mekanik, Jasa', 'Jl. Kalipasir 2 Desa Margaayu, Kec. Margasari, Kab. Tegal, Kode Pos 52463', 'Kab. Tegal', -7.092810, 108.983380, '', '', 0),
(5, 'Griya Komputer dan Network', 4, 'Imam Khaedar', 'Mandiri', 'Teknisi / Mekanik, Jasa', 'Jl. Raya Pejagan - Ketanggungan Desa sutamaja, Kec. Ketanggungan, Kab. Brebes, Kode Pos 52263', 'Kab. Brebes', -6.925150, 108.893480, '', '', 0),
(6, 'Jet Computer', 4, 'M. Faiquttamam', 'Industri', 'Penjualan', 'Jl. Gajah Mada, Karang Moncol, Desa Kalisapu, Kec. Slawi, Kab. Tegal, 52416', 'Kab. Tegal', -6.987800, 109.127480, '', '', 0),
(7, 'JNT.NET', 4, 'M.MUHLISIN', 'Mandiri', 'Jasa', 'Desa Dukuhdamu RT 7/RW 4, Kec. Lebaksiu, Kab. Tegal', 'Kab. Tegal', -6.990910, 109.101380, '', '', 0),
(8, 'Kim Komputer', 4, 'Diki Zahrudin', 'Mandiri', 'Teknisi / Mekanik, Jasa, Penjualan', 'Sutamaja No.4, Ketanggungan, Kec. Ketanggungan, Kabupaten Brebes', 'Kab. Brebes', -6.930470, 108.892980, '', '', 0),
(9, 'MAMAS.COM', 4, 'Ade Susiyanto. S.Pd', 'Mandiri', 'Jasa, Penjualan', 'Jl. Raya Barat Larangan, Kec. Larangan, Kab. Brebes, Kode Pos 52268', 'Kab. Brebes', -7.001110, 108.945840, '', '', 0),
(10, 'Mulia Hati Studio', 4, 'Nanang Budi Santoso', 'Mandiri', 'Jasa', 'Jembayat Rt.04/Rw.06, Kec. Margasari, Kab. Tegal, Kode Pos : 52463', 'Kab. Tegal', -7.088850, 109.052650, '', '', 0),
(11, 'Nada Komputer (NC)', 4, 'Hilman Maghfur', 'Mandiri', 'Teknisi / Mekanik', 'Jl. AMD Gg. Posyandu RT.002 RW.006 Dusun Sikancil Desa Slatri, Kec. Larangan, Kab. Brebes', 'Kab. Brebes', -6.970370, 108.947230, '', '', 0),
(12, 'Naza Komputer', 4, 'BAGJA BUDIONO', 'Mandiri', 'Teknisi / Mekanik, Jasa, Penjualan', 'Jl. Taman Siswa No.1, Saditan Brebes', 'Kab. Brebes', -6.879160, 109.045840, '', '', 0),
(13, 'Percetakan 99', 2, 'Tobroni', 'Mandiri', 'Jasa', 'Jln. Raya Tangglog, Desa Karangsembung, Kec. Songgom, Kab. Brebes, Kode Pos : 52266', 'Kab. Brebes', -6.967850, 109.027820, '', '', 0),
(14, 'PLN Icon Plus Purwokerto', 4, 'KRESHNA ADITAMA', 'Industri', 'Jaringan, Jasa', 'Jl. Jend Sudirman No 805 Sokabaru Berkoh, Desa Sokabaru, Kec. Purwokerto, Kab. Banyumas, Kode Pos 53146', 'Kab. Banyumas', -7.436130, 109.261170, '', '', 0),
(15, 'PT Admin Juara Network', 4, 'Abdul Anwar', 'CV/PT', 'Jasa', 'Jl. Suta Merta No.20, Blubuk, Kec. Dukuhturi, Kab. Tegal, Jawa Tengah, Kode Pos : 52451', 'Kab. Tegal', -6.974340, 109.091850, '', '', 0),
(16, 'PT Chandra Sarana Lintas Media', 4, 'Dwi Candra', 'CV/PT', 'Teknisi / Mekanik, Jasa', 'Jl. Raya Luwunggede - Bulakelor, Desa: Bulakelor, Kec. Ketanggungan, Kab. Brebes, Kode Pos : 52262', 'Kab. Brebes', -6.941950, 108.911180, '', '', 0),
(17, 'PT Jayahana Munuara Mekanika Selaras', 4, 'Cahyadi', 'CV/PT', 'Teknisi / Mekanik, Jasa, Penjualan', 'Jl. Dukuh II, Desa Songgom Lor RT.02/RW.03, Kec. Songgom, Kab. Brebes, Kode Pos : 52266', 'Kab. Brebes', -7.028020, 108.994560, '', '', 0),
(18, 'PT Saka Media Komunika (Cabang 1)', 2, 'Dadi Yugiono', 'CV/PT', 'Teknisi / Mekanik', 'Jl. Jatimakmur Wetan, Desa Kemakmuran, Kab. Brebes, Kec. Songgom, Kode Pos : 52266', 'Kab. Brebes', -7.028880, 109.001210, '', '', 0),
(19, 'PT Saka Media Komunika (Cabang 2)', 2, 'Dadi Yugiono', 'CV/PT', 'Teknisi / Mekanik', 'Jl. Pancasakti Blok Kampung baru No. 11 Desa Songgom Lor, Kec. Songgom, Kab. Brebes 52266', 'Kab. Brebes', -7.028880, 109.001210, '', '', 0),
(20, 'PT Saka Media Komunika (Cabang 3)', 2, 'Dadi Yugiyono', 'CV/PT', 'Teknisi / Mekanik', 'Jl. Jatimakmur Kulon, Desa Jatimakmur, Kec. Songgom, Kab. Brebes, Kode Pos:52266', 'Kab. Brebes', -7.015060, 109.011540, '', '', 0),
(21, 'PT Serayu Multi Connection (Jatirokeh)', 4, 'Imam Eko Satrio', 'Industri', 'Teknisi / Mekanik', 'Jl. Faisol Jatirokeh, Kec. Songgom, Kab. Brebes', 'Kab. Brebes', -6.994930, 109.022780, '', '', 0),
(22, 'PT Serayu Multi Connection (Songgom)', 4, 'Imam Eko Satrio', 'Industri', 'Teknisi / Mekanik', 'Jl. Pancasakti No. 14 Desa Songgom Lor, Kec. Songgom, Kab. Brebes, Kode Pos : 52266', 'Kab. Brebes', -7.032320, 108.996110, '', '', 0),
(23, 'Raja Komputer (RK)', 4, 'Ahmad Anis Faizal S.Kom', 'Mandiri', 'Penjualan', 'Jl. Imam Bonjol, Penjalin Banyu, Desa Siandong, Kec. Larangan, Kab. Brebes, Kode Pos : 52262', 'Kab. Brebes', -6.964090, 108.971050, '', '', 0),
(24, 'Republik Computer', 4, 'Adi Winarto. S.Kom', 'Mandiri', 'Teknisi / Mekanik, Jasa', 'Jl. Flores Baru No.1 Desa Griya Trayeman, Procot Kec. Slawi, Kab. Tegal, Kode Pos : 52414', 'Kab. Tegal', -6.963220, 109.133990, '', '', 0),
(25, 'Rizky Computer (RC)', 4, 'Nofan', 'Mandiri', 'Teknisi / Mekanik', 'Perumahan Griya Satria Pesona Alamanda No.7 Desa Klampis Barat, Kec. Jatibarang, Kab. Brebes, Kode Pos : 52261', 'Kab. Brebes', -6.967290, 109.034940, '', '', 0),
(26, 'Rizky Net', 4, 'Akhmad Sumidin', 'Mandiri', 'Jasa, Jaringan', 'Jl. Tirto Gang Pasar Larangan RT 09 RW 06 No. 28, Kec. Larangan, Kab. Brebes', 'Kab. Brebes', -7.002950, 108.946510, '', '', 0),
(27, 'RIZSKI COMPUTER', 4, 'Veri Riz''Qiyanto A.Md.Kom', 'Mandiri', 'Teknisi / Mekanik, Jasa, Penjualan', 'Jl. Pecakran, Pasangan - Kec. Talang, Kab. Tegal', 'Kab. Tegal', -6.930080, 109.149100, '', '', 0),
(28, 'Sahabat Komputer', 4, 'Uki Prasetyo, S.Kom', 'Mandiri', 'Teknisi / Mekanik, Penjualan', 'Jl. Dewi Sartika, Sigambir, Kec. Brebes, Kab. Brebes', 'Kab. Brebes', -6.857970, 109.041450, '', '', 0),
(29, 'SH Net', 4, 'Bravo Drajat Niti Toto Wibowo', 'Mandiri', 'Jasa, Jaringan', 'Gg. Gudang Balung, Siandong, Kec. Larangan, Kab. Brebes, Jawa Tengah 52262', 'Kab. Brebes', -6.957380, 108.972920, '', '', 0),
(30, 'Sigy Toner & Komputer', 4, 'Totu Siswo Raharjo', 'Mandiri', 'Jasa, Penjualan', 'Jl. Rengaspendawa, Desa Rengaspendawa, Kec. Larangan, Kab. Brebes, 52262', 'Kab. Brebes', -6.955980, 108.999130, '', '', 0),
(31, 'SKI Computer', 4, 'Teguh Bintoro', 'Mandiri', 'Teknisi / Mekanik, Penjualan', 'Jl. Sepat No 16 Tegalsari Kota Tegal', 'Kota Tegal', -6.858410, 109.127910, '', '', 0),
(32, 'Smart Komputer', 4, 'Doni Aulia', 'Mandiri', 'Jasa, Penjualan', 'Jl. Professor M.Yamin, Desa Kudaile, Kec. Slawi, Kab. Tegal', 'Kab. Tegal', -6.974450, 109.134640, '', '', 0)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- AKHIR SKEMA SUPABASE (VERSI FINAL)
-- ============================================================================
