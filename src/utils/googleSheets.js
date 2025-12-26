const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const creds = require('../../credentials.json'); 
const config = require('../../config.json');

const serviceAccountAuth = new JWT({
  email: creds.client_email,
  key: creds.private_key.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});


const doc = new GoogleSpreadsheet(config.googleSheetId, serviceAccountAuth);

/**
 * Menambahkan satu baris data bug ke Google Sheet.
 * @param {object} bugData - Objek data bug lengkap dari pendingBugReports.
 */
async function addBugToSheet(bugData) {
  try {
    await doc.loadInfo();
    
    // Cari sheet berdasarkan nama 'Bug Tracker' agar lebih aman jika tab digeser
    let sheet = doc.sheetsByTitle['Bug Tracker'];
    
    // Fallback ke index 0 jika nama tidak ditemukan, tapi log warning
    if (!sheet) {
      console.warn("WARN: Sheet 'Bug Tracker' tidak ditemukan. Menggunakan sheet pertama (index 0).");
      sheet = doc.sheetsByIndex[0];
    }

    if (!sheet) {
      throw new Error("Sheet tidak ditemukan (index 0).");
    }

    // Ubah array realm keys menjadi nama
    const realmNames = bugData.realms.map(key => config.realmsConfig[key]?.name || key).join(', ');

    // Tambahkan baris baru
    // Pastikan nama properti di sini (e.g., 'ID', 'Judul')
    // SAMA PERSIS dengan nama kolom header di Sheet Anda
    await sheet.addRow({
      'ID': bugData.id,
      'Timestamp': bugData.timestamp,
      'Pelapor': bugData.reporterTag,
      'Judul': bugData.title,
      'Deskripsi': bugData.description,
      'Realm': realmNames,
      'Prioritas': bugData.priority,
      'Status': 'Berjalan', // Status awal saat disetujui
      'Gambar': bugData.imageUrls.join('\n'), // Gabung semua link gambar
    });

  } catch (error) {
    console.error('Gagal menambahkan baris ke Google Sheet:', error);
    // Melempar error lagi agar bisa ditangkap oleh handler tombol
    throw error;
  }
}

module.exports = { addBugToSheet };