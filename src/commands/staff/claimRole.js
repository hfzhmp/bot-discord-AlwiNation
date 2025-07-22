const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const config = require('../../../config.json');

module.exports = {
  // Definisi slash command
  data: new SlashCommandBuilder()
    .setName('claimrole')
    .setDescription('Klaim atau lepas role notifikasi untuk staff AlwiNation.')
    .addStringOption(option =>
      option.setName('role')
      .setDescription('Pilih role notifikasi yang ingin di-toggle.')
      .setRequired(true)
      .addChoices(
        { name: 'Problem Tickets', value: 'Problem' },
        { name: 'Top-Up Tickets', value: 'TopUp' },
        { name: 'Claim-Reward Tickets', value: 'Reward' },
        { name: 'Creator Tickets', value: 'Creator' }
      )
    ),

  async execute(interaction) {
    try {
      // 1. Ambil data dari interaksi dan config
      const chosenRoleKey = interaction.options.getString('role');
      const roleId = config.slashClaimableRoles[chosenRoleKey];
      const role = interaction.guild.roles.cache.get(roleId);

      // 2. Validasi bahwa role ada
      if (!role) {
        return interaction.reply({ 
          content: `Error: Role '${chosenRoleKey}' tidak ditemukan. Hubungi admin.`, 
          flags: [MessageFlags.Ephemeral] 
        });
      }

      // 3. Logika Inti (Toggle Role)
      const memberHasRole = interaction.member.roles.cache.has(role.id);
      if (memberHasRole) {
        await interaction.member.roles.remove(role);
        await interaction.reply({ 
          content: `Role **${role.name}** berhasil dilepas.`, 
          flags: [MessageFlags.Ephemeral] 
        });
      } else {
        await interaction.member.roles.add(role);
        await interaction.reply({ 
          content: `Role **${role.name}** berhasil ditambahkan.`, 
          flags: [MessageFlags.Ephemeral] 
        });
      }
    } catch (error) {
      console.error(`[LOG] Error pada /claimrole:`, error);
      await interaction.reply({ 
        content: 'Gagal mengubah role. Pastikan saya memiliki izin "Manage Roles".', 
        flags: [MessageFlags.Ephemeral] 
      });
    }
  },
};