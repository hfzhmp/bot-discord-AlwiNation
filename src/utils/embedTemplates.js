const { EmbedBuilder } = require('discord.js');

const FOOTER_TEXT = 'AlwiNation Official';
const FOOTER_ICON = 'https://media.discordapp.net/attachments/1327346272855916686/1394068883224133683/image.png?ex=68757752&is=687425d2&hm=eac7eceb40e7cdb4f4b9c47a2dc5c16a33f11d2c898e0bc160f0ae3fce127cc3&=&format=webp&quality=lossless&width=1244&height=1244';

function createBaseEmbed() {
  return new EmbedBuilder()
    .setFooter({ text: FOOTER_TEXT, iconURL: FOOTER_ICON })
    .setTimestamp();
}

module.exports = { createBaseEmbed };
