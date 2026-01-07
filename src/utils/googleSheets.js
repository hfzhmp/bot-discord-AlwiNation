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
    
    // Cari sheet berdasarkan nama 'Bug Tracker'
    let sheet = doc.sheetsByTitle['Bug Tracker'];
    
    if (!sheet) {
      console.warn("WARN: Sheet 'Bug Tracker' tidak ditemukan. Menggunakan sheet pertama (index 0).");
      sheet = doc.sheetsByIndex[0];
    }

    if (!sheet) {
      throw new Error("Sheet tidak ditemukan (index 0).");
    }

    // Ubah array realm keys menjadi nama
    const realmNames = bugData.realms.map(key => config.realmsConfig[key]?.name || key).join(', ');
    
    // Format timestamp seperti |7/1/2026, 10.36.53|
    const dateObj = new Date(bugData.timestamp);
    const dateStr = dateObj.toLocaleDateString('en-US', { timeZone: 'Asia/Jakarta' }); // 7/1/2026
    const timeStr = dateObj.toLocaleTimeString('id-ID', { 
        timeZone: 'Asia/Jakarta', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        hour12: false 
    }).replace(/:/g, '.');
    
    const timeFormat = `${dateStr}, ${timeStr}`;

    // Load cells untuk area kerja.
    // Kita cek baris 6 sampai 200 (index 5 sampai 199).
    // Kolom B (1) sampai K (10).
    // B: No, C: Prioritas, D: Status, E: Waktu, F: Realm, G: Judul, H: Deskripsi, I: Bukti, J: Pelapor, K: ID
    const START_ROW_INDEX = 5; // Baris 6
    const CHECK_LIMIT = 200; // Cek sampai baris 200 + 6
    
    await sheet.loadCells({
      startRowIndex: START_ROW_INDEX,
      endRowIndex: START_ROW_INDEX + CHECK_LIMIT,
      startColumnIndex: 1, // Kolom B
      endColumnIndex: 11   // Sampai kolom L (eksklusif), jadi sampai K
    });

    let targetRowIndex = -1;

    // Loop cari baris kosong berdasarkan kolom Judul (G -> index 6)
    for (let i = 0; i < CHECK_LIMIT; i++) {
        const rowIndex = START_ROW_INDEX + i;
        const titleCell = sheet.getCell(rowIndex, 6); // Kolom G (Judul)
        
        // Jika cell judul kosong, kita anggap baris ini kosong
        if (!titleCell.value) {
            targetRowIndex = rowIndex;
            break;
        }
    }

    if (targetRowIndex === -1) {
        throw new Error("Sheet penuh atau tidak ada baris kosong ditemukan dalam range pencarian.");
    }

    // Tulis data ke baris yang ditemukan
    const noUrut = targetRowIndex - START_ROW_INDEX + 1;

    sheet.getCell(targetRowIndex, 1).value = noUrut; // B: No
    sheet.getCell(targetRowIndex, 2).value = bugData.priority; // C: Prioritas
    sheet.getCell(targetRowIndex, 3).value = 'Berjalan'; // D: Status
    sheet.getCell(targetRowIndex, 4).value = timeFormat; // E: Waktu
    sheet.getCell(targetRowIndex, 5).value = realmNames; // F: Realm
    sheet.getCell(targetRowIndex, 6).value = bugData.title; // G: Judul
    sheet.getCell(targetRowIndex, 7).value = bugData.description; // H: Deskripsi
    sheet.getCell(targetRowIndex, 8).value = bugData.imageUrls.join('\n'); // I: Bukti
    sheet.getCell(targetRowIndex, 9).value = bugData.reporterTag; // J: Pelapor
    sheet.getCell(targetRowIndex, 10).value = bugData.id; // K: ID

    await sheet.saveUpdatedCells();

  } catch (error) {
    console.error('Gagal menambahkan baris ke Google Sheet:', error);
    throw error;
  }
}

module.exports = { addBugToSheet };