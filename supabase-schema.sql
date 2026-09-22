-- ========================================================
-- SCHEMA SUPABASE: GIS MAPPING TEMPAT PKL TKJ SMKN 1 SONGGOM
-- Salin dan jalankan seluruh script ini pada SQL Editor di Dashboard Supabase Anda.
-- ========================================================

-- 1. Buat Tabel Tempat PKL / DUDI
CREATE TABLE IF NOT EXISTS public.dudi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    no INT NOT NULL,
    nama_dudi VARCHAR(255) NOT NULL,
    maksimal_siswa INT DEFAULT 4,
    pimpinan VARCHAR(255),
    jenis_dudi VARCHAR(100),
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

-- 2. Buat Tabel Konten CMS (Hero, Tentang TKJ, Tujuan Manfaat, Kontak)
CREATE TABLE IF NOT EXISTS public.cms_content (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Buat Tabel Galeri Dokumentasi PKL
CREATE TABLE IF NOT EXISTS public.gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'Kegiatan',
    image_url TEXT NOT NULL,
    description TEXT,
    date VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Buat Tabel Akun Pengguna Admin (Admin Users)
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

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.dudi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 6. Policies: Izinkan Read untuk Publik & Full CRUD untuk Pengguna Terautentikasi/Admin
CREATE POLICY "Public Read DUDI" ON public.dudi FOR SELECT USING (true);
CREATE POLICY "Public Read CMS" ON public.cms_content FOR SELECT USING (true);
CREATE POLICY "Public Read Gallery" ON public.gallery FOR SELECT USING (true);
CREATE POLICY "Public Read Admin Users" ON public.admin_users FOR SELECT USING (true);

CREATE POLICY "Admin Full DUDI" ON public.dudi FOR ALL USING (true);
CREATE POLICY "Admin Full CMS" ON public.cms_content FOR ALL USING (true);
CREATE POLICY "Admin Full Gallery" ON public.gallery FOR ALL USING (true);
CREATE POLICY "Admin Full Admin Users" ON public.admin_users FOR ALL USING (true);

-- 7. Seed Akun Default Admin untuk Login Dashboard
INSERT INTO public.admin_users (email, password, full_name, role)
VALUES 
('admin@smkn1songgom.sch.id', 'admin123', 'Administrator GIS SMKN 1 Songgom', 'superadmin')
ON CONFLICT (email) DO NOTHING;

-- 8. Seed Data: 32 Data DUDI Resmi SMK Negeri 1 Songgom
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
