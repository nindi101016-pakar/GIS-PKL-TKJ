import * as XLSX from 'xlsx';
import { Dudi } from '../types';

export const EXCEL_COLUMNS = [
  'ID (Opsional)',
  'No',
  'Nama Dudi',
  'Maksimal Siswa',
  'Pimpinan',
  'Jenis Dudi',
  'Bidang Pekerjaan',
  'Alamat',
  'Kabupaten',
  'Latitude (Lintang)',
  'Longitude (Bujur)',
  'No. Hp',
  'Jaminan',
  'Nominal',
];

/**
 * Generates and triggers download of a standardized Excel template for DUDI import
 */
export function downloadExcelTemplate(): void {
  const sampleData = [
    {
      'ID (Opsional)': 'b0000000-0000-0000-0000-000000000001',
      'No': 1,
      'Nama Dudi': 'ABS Komputer',
      'Maksimal Siswa': 4,
      'Pimpinan': 'Arief Bayu S.',
      'Jenis Dudi': 'Mandiri',
      'Bidang Pekerjaan': 'Teknisi / Mekanik, Penjualan',
      'Alamat': 'Jl. Projosumarto 01 Gg. Balok Desa Sutapranan, Kec. Dukuhturi, Kab. Tegal',
      'Kabupaten': 'Kab. Tegal',
      'Latitude (Lintang)': -6.90356,
      'Longitude (Bujur)': 109.13615,
      'No. Hp': '0857-1234-5001',
      'Jaminan': '-',
      'Nominal': 0,
    },
    {
      'ID (Opsional)': 'b0000000-0000-0000-0000-000000000002',
      'No': 2,
      'Nama Dudi': 'Era Network Center (ENC)',
      'Maksimal Siswa': 4,
      'Pimpinan': 'Nasruloh',
      'Jenis Dudi': 'CV/PT',
      'Bidang Pekerjaan': 'Jaringan, Jasa',
      'Alamat': 'Jl. Kertaharja, Jatirokeh, Kec. Songgom, Kab. Brebes',
      'Kabupaten': 'Kab. Brebes',
      'Latitude (Lintang)': -6.99565,
      'Longitude (Bujur)': 109.03018,
      'No. Hp': '0819-0234-5002',
      'Jaminan': '-',
      'Nominal': 0,
    },
    {
      'ID (Opsional)': 'b0000000-0000-0000-0000-000000000003',
      'No': 3,
      'Nama Dudi': 'Fito Komputer',
      'Maksimal Siswa': 4,
      'Pimpinan': 'Fiqri silando Amd.T',
      'Jenis Dudi': 'Mandiri',
      'Bidang Pekerjaan': 'Teknisi / Mekanik, Jasa, Penjualan',
      'Alamat': 'Jl. Gajah Mada, RT.05/RW.07, Desa Kalisapu, Kec. Slawi, Kab. Tegal',
      'Kabupaten': 'Kab. Tegal',
      'Latitude (Lintang)': -6.98403,
      'Longitude (Bujur)': 109.12567,
      'No. Hp': '0878-3012-5003',
      'Jaminan': '-',
      'Nominal': 0,
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData, { header: EXCEL_COLUMNS });

  // Column width hints
  worksheet['!cols'] = [
    { wch: 14 }, // ID
    { wch: 6 }, // No
    { wch: 35 }, // Nama Dudi
    { wch: 16 }, // Maksimal Siswa
    { wch: 25 }, // Pimpinan
    { wch: 15 }, // Jenis Dudi
    { wch: 35 }, // Bidang Pekerjaan
    { wch: 60 }, // Alamat
    { wch: 18 }, // Kabupaten
    { wch: 18 }, // Latitude
    { wch: 18 }, // Longitude
    { wch: 18 }, // No HP
    { wch: 12 }, // Jaminan
    { wch: 12 }, // Nominal
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template_Tempat_PKL');

  XLSX.writeFile(workbook, 'Template_Import_DUDI_SMKN1Songgom.xlsx');
}

/**
 * Exports current DUDI list to an Excel workbook
 */
export function exportDudiToExcel(dudiList: Dudi[]): void {
  const exportData = dudiList.map((item, index) => ({
    'ID (Opsional)': item.id || `dudi-${item.no || index + 1}`,
    'No': item.no || index + 1,
    'Nama Dudi': item.nama_dudi,
    'Maksimal Siswa': item.maksimal_siswa,
    'Pimpinan': item.pimpinan || '',
    'Jenis Dudi': item.jenis_dudi || 'Mandiri',
    'Bidang Pekerjaan': item.bidang_pekerjaan || '',
    'Alamat': item.alamat,
    'Kabupaten': item.kabupaten || detectKabupaten(item.alamat),
    'Latitude (Lintang)': item.latitude,
    'Longitude (Bujur)': item.longitude,
    'No. Hp': item.no_hp || '',
    'Jaminan': item.jaminan || '-',
    'Nominal': item.nominal || 0,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData, { header: EXCEL_COLUMNS });
  worksheet['!cols'] = [
    { wch: 14 },
    { wch: 6 },
    { wch: 36 },
    { wch: 16 },
    { wch: 26 },
    { wch: 15 },
    { wch: 35 },
    { wch: 65 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 12 },
    { wch: 12 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data_DUDI_TKJ');

  const todayStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `Data_Tempat_PKL_TKJ_SMKN1Songgom_${todayStr}.xlsx`);
}

/**
 * Detects district/regency from address text
 */
export function detectKabupaten(alamat: string): string {
  const lower = alamat.toLowerCase();
  if (lower.includes('kota tegal')) return 'Kota Tegal';
  if (lower.includes('kab. tegal') || lower.includes('kabupaten tegal') || lower.includes('slawi') || lower.includes('margasari') || lower.includes('lebaksiu') || lower.includes('dukuhturi') || lower.includes('talang')) return 'Kab. Tegal';
  if (lower.includes('banyumas') || lower.includes('purwokerto')) return 'Kab. Banyumas';
  return 'Kab. Brebes';
}

/**
 * Parses uploaded Excel or CSV file
 */
export async function parseExcelFile(
  file: File
): Promise<{ success: boolean; data: Partial<Dudi>[]; errors: string[] }> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          resolve({
            success: false,
            data: [],
            errors: ['File Excel kosong atau tidak memiliki data yang valid.'],
          });
          return;
        }

        const errors: string[] = [];
        const parsedDudi: Partial<Dudi>[] = [];

        rawJson.forEach((row, idx) => {
          const rowNum = idx + 2; // header is row 1
          // Flexible key lookup
          const namaDudi =
            row['Nama Dudi'] ||
            row['NAMA DUDI'] ||
            row['nama_dudi'] ||
            row['Nama Tempat'] ||
            row['Nama Perusahaan'];

          if (!namaDudi || String(namaDudi).trim() === '') {
            errors.push(`Baris ${rowNum}: Nama DUDI tidak boleh kosong.`);
            return;
          }

          const rawLat =
            row['Latitude (Lintang)'] ??
            row['Latitude'] ??
            row['latitude'] ??
            row['Lintang'] ??
            row['lat'];
          const rawLon =
            row['Longitude (Bujur)'] ??
            row['Longitude'] ??
            row['longitude'] ??
            row['Bujur'] ??
            row['lng'] ??
            row['lon'];

          const latNum = parseFloat(String(rawLat).replace(',', '.'));
          const lonNum = parseFloat(String(rawLon).replace(',', '.'));

          if (isNaN(latNum) || isNaN(lonNum)) {
            errors.push(
              `Baris ${rowNum} (${namaDudi}): Koordinat Latitude/Longitude tidak valid.`
            );
            return;
          }

          const alamat =
            row['Alamat'] || row['ALAMAT'] || row['alamat'] || '-';
          const maxSiswa = parseInt(
            String(
              row['MAKSIMAL SISWA'] ||
                row['Maksimal Siswa'] ||
                row['maksimal_siswa'] ||
                row['Kuota'] ||
                4
            )
          ) || 4;

          const pimpinan =
            row['Pimpinan'] || row['PIMPINAN'] || row['pimpinan'] || '-';
          const jenisDudi =
            row['Jenis Dudi'] || row['JENIS DUDI'] || row['jenis_dudi'] || 'Mandiri';
          const bidangPekerjaan =
            row['Bidang Pekerjaan'] ||
            row['BIDANG PEKERJAAN'] ||
            row['bidang_pekerjaan'] ||
            'Teknisi / Mekanik';
          const noHp =
            row['No. Hp'] ||
            row['No Hp'] ||
            row['NO HP'] ||
            row['Telepon'] ||
            row['no_hp'] ||
            '';
          const jaminan =
            row['Jaminan'] || row['JAMINAN'] || row['jaminan'] || '-';
          const nominal =
            parseFloat(String(row['Nominal'] || row['NOMINAL'] || 0)) || 0;
          const kabupaten =
            row['Kabupaten'] || detectKabupaten(String(alamat));

          const rawId =
            row['ID (Opsional)'] ||
            row['ID'] ||
            row['id'] ||
            row['Id'];
          const parsedNo = parseInt(String(row['No'] || idx + 1)) || idx + 1;
          const assignedId = (rawId && String(rawId).trim() !== '')
            ? String(rawId).trim()
            : `b0000000-0000-0000-0000-${String(parsedNo).padStart(12, '0')}`;

          parsedDudi.push({
            id: assignedId,
            no: parsedNo,
            nama_dudi: String(namaDudi).trim(),
            maksimal_siswa: maxSiswa,
            pimpinan: String(pimpinan).trim(),
            jenis_dudi: String(jenisDudi).trim(),
            bidang_pekerjaan: String(bidangPekerjaan).trim(),
            alamat: String(alamat).trim(),
            kabupaten: kabupaten,
            latitude: latNum,
            longitude: lonNum,
            no_hp: String(noHp).trim(),
            jaminan: String(jaminan).trim(),
            nominal: nominal,
          });
        });

        resolve({
          success: parsedDudi.length > 0,
          data: parsedDudi,
          errors,
        });
      } catch (err: any) {
        resolve({
          success: false,
          data: [],
          errors: [
            `Gagal memproses file Excel: ${err?.message || 'Format file tidak didukung.'}`,
          ],
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        data: [],
        errors: ['Terjadi kesalahan saat membaca file.'],
      });
    };

    reader.readAsBinaryString(file);
  });
}
