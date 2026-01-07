const { SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, MessageFlags } = require('discord.js');
const config = require('../../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bugreport')
    .setDescription('Melaporkan bug yang ditemukan di server.')
    .addAttachmentOption(option =>
      option.setName('bukti-1')
        .setDescription('Bukti foto/video bug (opsional).')
        .setRequired(false))
    .addAttachmentOption(option =>
      option.setName('bukti-2')
        .setDescription('Bukti foto/video bug kedua (opsional).')
        .setRequired(false))
    .addAttachmentOption(option =>
      option.setName('bukti-3')
        .setDescription('Bukti foto/video bug ketiga (opsional).')
        .setRequired(false)),
  
  async execute(interaction) {
    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      
      const realmOptions = Object.keys(config.realmsConfig).map(key => 
        new StringSelectMenuOptionBuilder()
          .setLabel(config.realmsConfig[key].name)
          .setValue(key)
      );
      
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('bugreport_realm_select')
        .setPlaceholder('Pilih realm(s) yang terdampak bug')
        .setMinValues(1)
        .setMaxValues(realmOptions.length)
        .addOptions(realmOptions);

      const row = new ActionRowBuilder().addComponents(selectMenu);

      await interaction.editReply({
        content: 'Silakan pilih realm(s) yang mengalami bug ini:',
        components: [row]
      });
    } catch (error) {
      if (!interaction.deferred && !interaction.replied) {
        await interaction.reply({ content: 'Terjadi error internal.', flags: MessageFlags.Ephemeral });
      } else {
        await interaction.followUp({ content: 'Terjadi error internal.', flags: MessageFlags.Ephemeral });
      }
    }
  },
};