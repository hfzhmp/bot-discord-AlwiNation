const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { createBaseEmbed } = require('../../utils/embedTemplates');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Menampilkan daftar perintah untuk pengguna umum.'),
    
  async execute(interaction) {

    const description = [
      '## <:heart_orange:1353875339645812806> Daftar Command Bot AlwiNation',
      '### <:star:1353853739068424383> Command Umum',
      '`/help` - Menampilkan pesan ini.',
      '`/information` - Menampilkan panel informasi server.',
      '`/rules` - Menampilkan informasi peraturan.',
      '`/ip` - Menampilkan alamat IP server.',
      '`/status` - Menampilkan status server Minecraft.',
      '`/map` - Menampilkan link peta EarthSMP.',
      '`/vote` - Menampilkan link untuk vote server.',
      '`/store` - Menampilkan link dan informasi web store.',
      '`/report` - Melaporkan staff yang abuse atau melanggar aturan.'
    ].join('\n');

    const embed = createBaseEmbed().setDescription(description);

    await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
  },
};