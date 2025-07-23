const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('maintenance')
    .setDescription('Membuat pengumuman maintenance server.'),

  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('maintenanceModal')
      .setTitle('Formulir Pengumuman Maintenance');

    const realmsNameInput = new TextInputBuilder()
      .setCustomId('realmsName')
      .setLabel("Nama Realm(s) yang terdampak")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Contoh: EarthSMP & Skyblock')
      .setRequired(true);

    const timeScheduleInput = new TextInputBuilder()
      .setCustomId('timeSchedule')
      .setLabel("Jadwal Waktu Maintenance")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Contoh: 14:00 - 15:00')
      .setRequired(true);

    const reasonMaintenanceInput = new TextInputBuilder()
      .setCustomId('reasonMaintenance')
      .setLabel("Alasan Maintenance")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Contoh: Penyesuaian Ekonomi Server')
      .setRequired(true);

    const detailsMaintenanceInput = new TextInputBuilder()
      .setCustomId('detailsMaintenance')
      .setLabel("Detail Maintenance")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Gunakan `-` untuk membuat daftar poin.\n- Menambahkan item baru A\n- Memperbaiki bug B')
      .setRequired(true);

    const firstRow = new ActionRowBuilder().addComponents(realmsNameInput);
    const secondRow = new ActionRowBuilder().addComponents(timeScheduleInput);
    const thirdRow = new ActionRowBuilder().addComponents(reasonMaintenanceInput);
    const fourthRow = new ActionRowBuilder().addComponents(detailsMaintenanceInput);

    modal.addComponents(firstRow, secondRow, thirdRow, fourthRow);

    await interaction.showModal(modal);
  },
};