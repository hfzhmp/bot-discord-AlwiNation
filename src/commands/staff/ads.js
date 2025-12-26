const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');

const stateFilePath = path.join(__dirname, '../../../state.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ads')
    .setDescription('[Staff] Mengelola announcer iklan otomatis.')
    .addSubcommand(subcommand =>
      subcommand
        .setName('on')
        .setDescription('[Staff] Mengaktifkan announcer iklan otomatis.')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('off')
        .setDescription('[Staff] Menonaktifkan announcer iklan otomatis.')
    ),
  
  async execute(interaction) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    
    const subcommand = interaction.options.getSubcommand();
    
    try {
      const stateData = await fs.readFile(stateFilePath, 'utf8');
      const state = JSON.parse(stateData);

      if (subcommand === 'on') {
        if (state.ads_active) {
          return interaction.editReply('Announcer sudah dalam keadaan aktif.');
        }
        state.ads_active = true;
        await fs.writeFile(stateFilePath, JSON.stringify(state, null, 2));
        await interaction.editReply('✅ Announcer iklan otomatis telah **dinyalakan**.');
      } else if (subcommand === 'off') {
        if (!state.ads_active) {
          return interaction.editReply('Announcer sudah dalam keadaan mati.');
        }
        state.ads_active = false;
        await fs.writeFile(stateFilePath, JSON.stringify(state, null, 2));
        await interaction.editReply('🛑 Announcer iklan otomatis telah **dimatikan**.');
      }
    } catch (error) {
      console.error("Error saat mengubah status announcer:", error);
      await interaction.editReply("Gagal mengubah status announcer.");
    }
  }
};