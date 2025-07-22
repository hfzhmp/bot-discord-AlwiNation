const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { createBaseEmbed } = require('../../utils/embedTemplates');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('staffhelp')
    .setDescription('Menampilkan daftar perintah untuk staff AlwiNation.'),
    
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
      '### <:NPC:1353870504280326205> Perintah Staff (Prefix `!`)',
      '`!w` - Memberi peringatan pada tiket.',
      '`!c` - Menandai tiket akan ditutup.',
      '`!cp` - Respon untuk lupa password.',
      '`!dt` - Respon untuk top up berhasil.',
      '`!dr` - Respon untuk register berhasil.',
      '`!fp` - Info syarat reset password.',
      '`!ptm` - Info syarat klaim top up.',
      '`!rolerank` - Info syarat klaim role rank.',
      '`!cboost` - Info untuk klaim role booster.',
      '### <:sparkles:1353870538141073558> Perintah Khusus Staff (Slash Command)',
      '`/claimrole` - Klaim/lepas role khusus untuk staff.'
    ].join('\n');

    const embed = createBaseEmbed().setDescription(description);

    await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
  },
};