const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { createBaseEmbed } = require('../../utils/embedTemplates');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('map')
    .setDescription('Map EarthSMP AlwiNation.'),
    
  async execute(interaction) {

    const description = [
      '## <:earth:1343359303045742693> World Map EarthSMP',
      '-# Klik link di bawah untuk melihat peta dunia.',
      '- **[EarthSMP](https://maps.alwination.id/)**'
    ].join('\n');

    const embed = createBaseEmbed().setDescription(description);

    await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
  },
};