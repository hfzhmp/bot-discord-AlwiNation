const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { createBaseEmbed } = require('../../utils/embedTemplates');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vote')
    .setDescription('Link Vote Server AlwiNation.'),
    
  async execute(interaction) {

    const description = [
      '## <:heart_orange:1353875339645812806> Vote Server AlwiNation',
      '-# Vote dari kalian membantu **AlwiNation** tetap berkembang.',
      '> ### <:gift:1353853808421376151> **Link Vote**: [Klik di sini!](https://minecraft-mp.com/server/339723/vote/)'
    ].join('\n');

    const embed = createBaseEmbed().setDescription(description);

    await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
  },
};