const { REST, Routes } = require('discord.js');
const config = require('./config.json');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const commands = [];
// Ambil semua file command dari direktori commands
const commandsPath = path.join(__dirname, 'src', 'commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
  const folderPath = path.join(commandsPath, folder);
  const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(path.join(folderPath, file));
    if (command.data) {
      commands.push(command.data.toJSON());
    }
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// Proses registrasi command
(async () => {
  try {
    console.log(`Memulai registrasi ${commands.length} slash command.`);

    // Gunakan metode 'put' untuk mendaftarkan command ke guild tertentu
    const data = await rest.put(
      Routes.applicationGuildCommands(config.clientId, config.guildId),
      { body: commands },
    );

    console.log(`Berhasil meregistrasi ulang ${data.length} slash command.`);
  } catch (error) {
    console.error(error);
  }
})();