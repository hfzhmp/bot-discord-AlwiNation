const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('changelog')
    .setDescription('Membuat catatan changelog baru untuk server/realms.')
    .addAttachmentOption(option =>
      option.setName('gambar') // Opsional
        .setDescription('Lampirkan gambar opsional untuk changelog ini.')
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

    const actionRow = new ActionRowBuilder().addComponents(changelogInput);
    modal.addComponents(actionRow);

    await interaction.showModal(modal);
  },
};