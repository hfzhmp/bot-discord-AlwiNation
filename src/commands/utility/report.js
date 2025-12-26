const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('report')
    .setDescription('Melaporkan staff yang melanggar aturan.')
    .addAttachmentOption(option =>
      option.setName('gambar')
        .setDescription('Lampirkan gambar untuk menjadi bukti.')
        .setRequired(false)
    ),

  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('reportModal')
      .setTitle('Formulir Report Staff');

    const nameInput = new TextInputBuilder()
      .setCustomId('name')
      .setLabel("Nama Pelapor (Boleh Anonim)")
      .setPlaceholder('Username / Anonim')
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    const staffUsernameInput = new TextInputBuilder()
      .setCustomId('staffUsername')
      .setLabel("Username Staff")
      .setPlaceholder('Username Staff yang Dilaporkan')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const realmInput = new TextInputBuilder()
      .setCustomId('realm')
      .setLabel("Realm")
      .setPlaceholder('Realm tempat kejadian berlangsung')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const detailDescriptionInput = new TextInputBuilder()
      .setCustomId('detailDescription')
      .setLabel("Detail Laporan")
      .setPlaceholder('Jelaskan detail deskripsi, waktu, dan lokasi kejadian secara rinci.')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const evidenceInput = new TextInputBuilder()
      .setCustomId('evidence')
      .setLabel("Bukti Pendukung (Link/Gambar)")
      .setPlaceholder('Link screenshot sebagai bukti. Gunakan command /report jika ingin melampirkan gambar tanpa link.')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false);

    const firstRow = new ActionRowBuilder().addComponents(nameInput);
    const secondRow = new ActionRowBuilder().addComponents(staffUsernameInput);
    const thirdRow = new ActionRowBuilder().addComponents(realmInput);
    const fourthRow = new ActionRowBuilder().addComponents(detailDescriptionInput);
    const fifthRow = new ActionRowBuilder().addComponents(evidenceInput);

    modal.addComponents(firstRow, secondRow, thirdRow, fourthRow, fifthRow);

    await interaction.showModal(modal);
  },
};