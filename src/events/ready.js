const { Events } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  
  async execute(client) {
    console.log(`Bot telah login sebagai ${client.user.tag}!`);
	  console.log(`Waktu aktif: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`);
  },
};