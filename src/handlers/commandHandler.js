const fs = require('fs');
const path = require('path');
const { hasRequiredRole } = require('../utils/permissions.js');

module.exports = (client) => {
  const commandsPath = path.join(__dirname, '..', 'commands');
  const commandItems = fs.readdirSync(commandsPath);

  for (const itemName of commandItems) {
    const itemPath = path.join(commandsPath, itemName);

    try {
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        const commandFiles = fs.readdirSync(itemPath).filter(file => file.endsWith('.js'));
        
        for (const file of commandFiles) {
          const filePath = path.join(itemPath, file);
          const command = require(filePath);

          if ('data' in command && 'execute' in command) {
            if (itemName === 'staff') {
              const originalExecute = command.execute;
              command.execute = async (interaction) => {
                if (!hasRequiredRole(interaction.member)) {
                  return interaction.reply({
                    content: 'Hanya anggota staff yang dapat menggunakan perintah ini.',
                    ephemeral: true,
                  });
                }
                await originalExecute(interaction);
              };
            }
            client.commands.set(command.data.name, command);
          }
        }
      } 
      else if (stats.isFile()) {
        console.warn(`[PERINGATAN] Ditemukan file (${itemName}) di dalam 'src/commands/'. Seharusnya hanya berisi folder. File ini diabaikan.`);
      }

    } catch (error) {
      console.error(`[ERROR] Gagal memproses item: ${itemPath}`, error);
    }
  }
  console.log('Semua command berhasil dimuat.');
};