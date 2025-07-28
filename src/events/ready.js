const { Events } = require('discord.js');
const mc = require('node-mcstatus');
const fs = require('fs').promises;
const path = require('path');
const ads = require('../../ads.json');
const config = require('../../config.json');
const announcerConfig = config.announcer_config;

const stateFilePath = path.join(__dirname, '../../state.json');

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

    const announcerTick = async () => {
      try {
        const stateData = await fs.readFile(stateFilePath, 'utf8');
        const state = JSON.parse(stateData);
        if (!state.ads_active) {
          return;
        }

        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        if (!announcerConfig.schedule_times.includes(currentTime)) {
          return;
        }

        if (ads.length === 0) return;

        const adToSend = ads[state.current_ad_index];
        
        const targetChannel = await client.channels.fetch(announcerConfig.channel_id);
        if (!targetChannel) return;

        const adEmbed = new EmbedBuilder()
          .setColor('#FFA500')
          .setDescription(adToSend.content)
          .setFooter({ text: "AlwiNation Official", iconURL: "https://media.discordapp.net/attachments/1327346272855916686/1394068883224133683/image.png?ex=68757752&is=687425d2&hm=eac7eceb40e7cdb4f4b9c47a2dc5c16a33f11d2c898e0bc160f0ae3fce127cc3&=&format=webp&quality=lossless&width=1244&height=1244" });

        const messageOptions = { 
          embeds: [adEmbed] 
        };

        if (adToSend.imageUrl) {
          messageOptions.files = [{
            attachment: adToSend.imageUrl,
            name: adToSend.name || 'iklan.png'
          }];
        }

        const sentMessage = await targetChannel.send(messageOptions);
        console.log(`[Announcer] Iklan "${adToSend.content.substring(0, 20)}..." telah dikirim.`);

        const nextIndex = (state.current_ad_index + 1) % ads.length;
        
        state.current_ad_index = nextIndex;
        
        await fs.writeFile(stateFilePath, JSON.stringify(state, null, 2));

        setTimeout(() => {
          sentMessage.delete().catch(error => {
            if (error.code !== 10008) { // 10008 = Unknown Message
              console.error("[Announcer] Gagal menghapus pesan iklan terjadwal:", error);
            }
          });
          console.log(`[Announcer] Pesan iklan "${adToSend.content.substring(0, 20)}..." telah dihapus setelah 10 menit.`);
        }, 600000); 

      } catch (error) {
        console.error("[Announcer] Gagal menjalankan tick:", error);
      }
    };

    console.log('[Announcer] Mesin announcer iklan telah diaktifkan.');
    setInterval(announcerTick, 60000);
  },
};