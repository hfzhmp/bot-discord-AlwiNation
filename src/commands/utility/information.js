const { SlashCommandBuilder } = require('discord.js');
const { createBaseEmbed } = require('../../utils/embedTemplates');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('information')
    .setDescription('Menampilkan panel informasi server.'),
    
  async execute(interaction) {

    const description = [
      '## <:heart_orange:1353875339645812806> Selamat Datang di AlwiNation!',
      '-# Berikut adalah informasi penting dan tautan bermanfaat yang kamu butuhkan.',
      '### - <:moyai:1353870495828803697> **Informasi Server:**',
      '>   - **Server Name**: **AlwiNation**',
      '>   - **Server IP**: **alwination.id**',
      '>   - **Server Port**: **19132**',
      '### - <:cheese:1353853751282241670> **Peraturan Server**:',
      '>   - **Regulasi Lengkap**: <#1327342814362730516>',
      '>   - **Versi Ringkas**: <#1335509792386711655>',
      '### - <:videogame:1353853736757493770> **Cara Bergabung**: <#1327298534369792061>',
      '### - <:gift:1353853808421376151> **Link Vote**: [Klik di sini!](https://minecraft-mp.com/server/339723/vote/)',
      '### - <:NPC:1353870504280326205> **Web Store**: [Kunjungi Store.](https://store.alwination.id/)',
      '### - <:sparkles:1353870538141073558> **Tutorial TopUp**: <#1353699516666216538>',
      '### - <:bread:1353863473800413194> **Media Sosial**:',
      '>   - **TikTok**: [@alwinationmc](http://tiktok.com/@alwinationmc/)',
      '>   - **YouTube**: [@Alwisusilo](https://www.youtube.com/@alwisusilo)'
    ].join('\n');

    const embed = createBaseEmbed().setDescription(description);

    await interaction.reply({
      files: [{
        attachment: 'https://api.mcstatus.io/v2/widget/java/play.alwination.id',
        name: 'server-status.png'
      }],
      embeds: [embed]
    });
  },
};