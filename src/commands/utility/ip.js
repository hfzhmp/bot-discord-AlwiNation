const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { createBaseEmbed } = require('../../utils/embedTemplates');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ip')
    .setDescription('Informasi Ip Address Server AlwiNation.'),
    
  async execute(interaction) {

    const description = [
      '## <:heart_orange:1353875339645812806> Server AlwiNation',
      '-# Gunakan informasi di bawah ini untuk bergabung.',
      '> - **Server Name**: **AlwiNation**',
      '> - **Server IP**: **alwination.id**',
      '> - **Server Port**: **19132**'
    ].join('\n');

    const embed = createBaseEmbed().setDescription(description);

    await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
  },
};