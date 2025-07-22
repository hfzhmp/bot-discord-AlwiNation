const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { createBaseEmbed } = require('../../utils/embedTemplates');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('store')
    .setDescription('Web Store Server AlwiNation.'),
    
  async execute(interaction) {
    const description = [
      '## <:heart_orange:1353875339645812806> Web Store Server AlwiNation',
      '-# Top Up di **AlwiNation** – mudah, cepat, dan terpercaya!',
      '> ### <:NPC:1353870504280326205> **Link Store**: [store.alwination.id](https://store.alwination.id/)',
      '> ### <:sparkles:1353870538141073558> **Tutorial Top Up**: <#1353699516666216538>'
    ].join('\n');

    const embed = createBaseEmbed().setDescription(description);

    await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
  },
};