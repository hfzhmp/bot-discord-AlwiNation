const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('emergencymaintenance')
    .setDescription('Membuat pengumuman maintenance darurat yang dikirim segera.'),

  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('emergencyMaintenanceModal')
      .setTitle('Formulir Maintenance Darurat');

    const realmsNameInput = new TextInputBuilder()
      .setCustomId('realmsName')
      .setLabel("Nama Realm(s) yang terdampak")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Contoh: EarthSMP & Skyblock')
      .setRequired(true);
	  
    const reasonMaintenanceInput = new TextInputBuilder()
      .setCustomId('reasonMaintenance')
      .setLabel("Alasan Maintenance Darurat")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Contoh: Perbaikan bug kritis, server crash, dll.')
      .setRequired(true);

    const firstRow = new ActionRowBuilder().addComponents(realmsNameInput);
    const secondRow = new ActionRowBuilder().addComponents(reasonMaintenanceInput);

    modal.addComponents(firstRow, secondRow);

    await interaction.showModal(modal);
  },
};