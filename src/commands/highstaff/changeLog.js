const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('changelog')
    .setDescription('[Staff] Membuat catatan changelog baru untuk server/realms.')
    .addAttachmentOption(option =>
      option.setName('gambar-1')
        .setDescription('Lampirkan gambar pertama (opsional).')
        .setRequired(false)
    )
    .addAttachmentOption(option =>
      option.setName('gambar-2')
        .setDescription('Lampirkan gambar kedua (opsional).')
        .setRequired(false)
    )
    .addAttachmentOption(option =>
      option.setName('gambar-3')
        .setDescription('Lampirkan gambar ketiga (opsional).')
        .setRequired(false)
    ),

  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('changelogModal')
      .setTitle('Formulir Changelog');

    const changelogInput = new TextInputBuilder()
      .setCustomId('changelogText')
      .setLabel("Tuliskan isi changelog di sini")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder("Gunakan '-' untuk membuat daftar poin.\n- Menambahkan item baru A\n- Memperbaiki bug B")
      .setRequired(true);

    const noteInput = new TextInputBuilder()
      .setCustomId('noteText')
      .setLabel("Catatan (opsional)")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Misalnya: 'Perbaikan kecil pada server X'")
      .setRequired(false);

    const firstRow = new ActionRowBuilder().addComponents(changelogInput);
    const secondRow = new ActionRowBuilder().addComponents(noteInput);

    modal.addComponents(firstRow, secondRow);

    await interaction.showModal(modal);
  },
};