const { SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');
const config = require('../../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bugreport')
    .setDescription('Melaporkan bug yang ditemukan di server.')
    .addAttachmentOption(option =>
      option.setName('gambar-1')
        .setDescription('Bukti gambar bug (opsional).')
        .setRequired(false))
    .addAttachmentOption(option =>
      option.setName('gambar-2')
        .setDescription('Bukti gambar bug kedua (opsional).')
        .setRequired(false))
    .addAttachmentOption(option =>
      option.setName('gambar-3')
        .setDescription('Bukti gambar bug ketiga (opsional).')
        .setRequired(false)),
  
  async execute(interaction) {
    
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

    await interaction.reply({
      content: 'Silakan pilih realm(s) yang mengalami bug ini:',
      components: [row],
      ephemeral: true
    });
  },
};