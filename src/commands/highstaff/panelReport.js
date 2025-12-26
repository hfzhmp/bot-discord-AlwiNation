const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags } = require('discord.js');
const config = require('../../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('panelreport')
    .setDescription('[Staff] Mengirim panel report ke channel yang ditentukan.'),

  async execute(interaction) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    try {
      const targetChannel = await interaction.client.channels.fetch(config.panelReportId);
      if (!targetChannel) {
        return interaction.editReply({ content: 'Error: Channel panel tidak ditemukan.', components: [] });
      }

      const panelEmbed = new EmbedBuilder()
        .setColor('#FF7D29')
        .setTitle('🛠️ Report Panel')
        .setDescription(
          '**Laporkan Staff** atau berikan **Kritik & Saran** dengan menekan tombol di bawah ini.\n' +
          'Harap sertakan **informasi yang jelas** serta **bukti pendukung** agar laporan dapat diproses dengan cepat dan akurat.\n' +
          '### 📝 - Report Staff\n' +
          '```Gunakan tombol ini jika staff:\n' +
          '- Menyalahgunakan wewenang (abuse)\n' +
          '- Bersikap tidak adil atau diskriminatif\n' +
          '- Melanggar aturan server```'
        )
        .addFields([
          {
            name: '⚠️ Catatan:',
            value:  '- Formulir tidak mendukung lampiran gambar. Jika perlu melampirkan bukti visual, gunakan command **`/report`** dan unggah gambar Anda di sana.\n' +
                    '- Semua laporan akan ditinjau secara rahasia oleh tim admin. Mohon bersabar menunggu prosesnya.'
          }
        ])

      const reportButton = new ButtonBuilder()
        .setCustomId('reportButton')
        .setLabel('Report Staff')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📝');
      
      // const criticBugButton = new ButtonBuilder()
      //   .setCustomId('criticBugButton')
      //   .setLabel('Report Bug')
      //   .setStyle(ButtonStyle.Danger)
      //   .setEmoji('🐞');

      const row = new ActionRowBuilder()
        .addComponents(reportButton);

      const messageOptions = {
        embeds: [panelEmbed],
        components: [row]
      };

      const panelMessage = await targetChannel.send(messageOptions);

      const notificationEmbed = new EmbedBuilder()
        .setColor('#57F287') 
        .setDescription(
          `## <:checkmark:1353853747725340813> Panel Berhasil Dikirim\n` +
          `> Panel report telah berhasil dikirim ke channel ${targetChannel}.\n` +
          `### <:redmessage:1418552581768347739> ${panelMessage.url}`
        )
        .setTimestamp();

      await interaction.editReply({ 
        embeds: [notificationEmbed]
      });

      console.log(`[LOG] Panel Report telah dibuat oleh ${interaction.member.displayName}`);

    } catch (error) {
      console.error("Gagal menjalankan /panelreport:", error);
      await interaction.editReply({ content: 'Terjadi kesalahan internal saat memproses perintah.' });
    }
  },
};