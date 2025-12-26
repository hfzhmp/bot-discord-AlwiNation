// 1. Muat variabel dari .env
require('dotenv').config();

// 2. Impor library dan file konfigurasi
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

// 3. Inisialisasi client dengan Intent yang dibutuhkan
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Membuat 'Collection' untuk menyimpan slash commands
client.commands = new Collection();

// 4. Memanggil handler (akan kita buat di langkah berikutnya)
const handlersPath = path.join(__dirname, 'handlers');
const handlerFiles = fs.readdirSync(handlersPath).filter(file => file.endsWith('.js'));

for (const file of handlerFiles) {
  require(path.join(handlersPath, file))(client);
}

// 5. Login menggunakan token dari .env
// 5. Login menggunakan token dari .env
client.login(process.env.DISCORD_TOKEN);

// 6. Global Error Handlers (Mencegah Bot Crash)
process.on('unhandledRejection', (reason, promise) => {
  console.error('[AntiChase] Unhandled Rejection at:', promise, 'reason:', reason);
  // Optional: Kirim notifikasi ke admin di Discord jika perlu
});

process.on('uncaughtException', (error) => {
  console.error('[AntiCrash] Uncaught Exception:', error);
});