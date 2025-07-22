const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { createBaseEmbed } = require('../../utils/embedTemplates');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rules')
    .setDescription('Rules Server AlwiNation.'),
    
  async execute(interaction) {

    const description = [
      '## <:heart_orange:1353875339645812806> Server Rules & Community Guidelines', 
      'Silahkan dibaca & dipahami.',
      '> <:star:1353853739068424383> **Regulasi Lengkap** : <#1327342814362730516>⁠',
      '> <:cheese:1353853751282241670> **Versi Ringkas** : <#1335509792386711655>\n',
      '-# *<:warning:1353853707929780244> Dengan bermain di **AlwiNation**, kamu dianggap menyetujui semua peraturan ini.*'
    ].join('\n');

    const embed = createBaseEmbed().setDescription(description);

    await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
  },
};