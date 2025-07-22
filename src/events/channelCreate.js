const { Events, ChannelType, EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
  name: Events.ChannelCreate,
  async execute(channel, client) { // Kita tambahkan 'client' sebagai parameter
    try {
      // Ambil konfigurasi dari file config.json
      const categoryConfig = config.ticketConfig[channel.parentId];
      if (!categoryConfig) return;

      if (channel.type !== ChannelType.GuildText || !channel.name.startsWith('ticket-')) return;

      const notificationChannel = await client.channels.fetch(config.notificationChannelId);
      if (!notificationChannel) return console.log('Channel notifikasi tidak ditemukan!');
      
      const categoryName = categoryConfig.name;
      const roleToPingId = categoryConfig.roleToPing;
      const rolePing = `<@&${roleToPingId}>`;

      const notificationEmbed = new EmbedBuilder()
        .setColor('#FFA500')
        .setDescription('### <:rotating_light:1353870512450834443> Notifikasi ' + `${categoryName}` + 
          '\n-# Sebuah tiket baru telah dibuat!\n'+ 
          '<:bread:1353863473800413194> **Ticket:** ' + `${channel}`
        )
        .setFooter({ 
          text: 'AlwiNation Official',
          iconURL: 'https://media.discordapp.net/attachments/1327346272855916686/1392392785688268902/image.png?ex=686f5e55&is=686e0cd5&hm=673ef48d679ac10f0833673f6cc8632e3d5769b2a03b05fb6e3dd0082fc28148&=&format=webp&quality=lossless&width=1244&height=1244'
        })
        .setTimestamp();

      await notificationChannel.send({
        content: rolePing,
        embeds: [notificationEmbed]
      });

    } catch (error) {
      console.error('Terjadi error pada event channelCreate:', error);
    }
  },
};