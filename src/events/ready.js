const { Events } = require('discord.js');
const mc = require('node-mcstatus');

const serverAddress = 'play.alwination.id';
const offlineStatus = 'Jangan Xray~';

module.exports = {
  name: Events.ClientReady,
  once: true,
  
  async execute(client) {
    console.log(`Bot telah login sebagai ${client.user.tag}!`);
	  console.log(`Waktu aktif: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`);

    const updatePlayerCountActivity = async () => {
      try {
        const response = await mc.statusJava(serverAddress); 
    
        if (response.online) {
          const playerCount = response.players.online;
          client.user.setActivity(`with ${playerCount} players`, { type: ActivityType.Playing });
        } else {
          client.user.setActivity(offlineStatus, { type: ActivityType.Playing });
        }
      } catch (error) {
        console.error(`Error saat query status server: ${error.message}`);
        client.user.setActivity(offlineStatus, { type: ActivityType.Playing });
      }
    };

    await updatePlayerCountActivity();
    setInterval(updatePlayerCountActivity, 300000);
  },
};