const fs = require('fs').promises;
const path = require('path');

// Sederhana "mutex" queue untuk setiap file path
const locks = new Map();

function getLock(filePath) {
  if (!locks.has(filePath)) {
    locks.set(filePath, Promise.resolve());
  }
  return locks.get(filePath);
}

/**
 * Membaca file JSON dengan aman.
 * Jika file tidak ada, mengembalikan defaultValue jika disediakan, atau throw error.
 */
async function read(filePath, defaultValue = null) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT' && defaultValue !== null) {
      return defaultValue;
    }
    throw error;
  }
}

/**
 * Menulis ke file JSON dengan aman (sequential/atomic simulation).
 * Menggunakan lock sederhana agar tidak ada dua proses tulis (atau baca-modify-tulis) yang tumpang tindih.
 */
async function write(filePath, data) {
  const currentLock = getLock(filePath);

  const nextLock = currentLock.then(async () => {
    // Pastikan direktori ada
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    // Tulis data
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  });

  locks.set(filePath, nextLock);
  return nextLock;
}

/**
 * Helper atomik untuk Membaca -> Modifikasi -> Tulis
 * @param {string} filePath - Path file target
 * @param {function} modifyFn - Fungsi callback yang menerima data lama dan me-return data baru
 * @param {any} defaultValue - Nilai default jika file belum ada (default: [])
 */
async function update(filePath, modifyFn, defaultValue = []) {
  const currentLock = getLock(filePath);

  const nextLock = currentLock.then(async () => {
    let currentData;
    try {
      const fileContent = await fs.readFile(filePath, 'utf8');
      currentData = JSON.parse(fileContent);
    } catch (error) {
      if (error.code === 'ENOENT') {
        currentData = defaultValue;
      } else {
        throw error;
      }
    }

    const newData = await modifyFn(currentData);
    
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(newData, null, 2), 'utf8');
    
    return newData;
  });

  locks.set(filePath, nextLock);
  return nextLock;
}

module.exports = { read, write, update };
