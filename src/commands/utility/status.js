const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { createBaseEmbed } = require('../../utils/embedTemplates');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Status Server AlwiNation.'),
    
  async execute(interaction) {
    await interaction.reply({ 
      files: [{
        attachment: 'https://api.mcstatus.io/v2/widget/java/play.alwination.id',
        name: 'server-status.png'
      }]
    });
  },
};