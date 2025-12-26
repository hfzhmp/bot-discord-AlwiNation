const { Events, ActivityType, EmbedBuilder } = require('discord.js');
const mc = require('node-mcstatus');
const path = require('path');
const jsonDb = require('../utils/jsonDb');
const ads = require('../../ads.json');
const config = require('../../config.json');
const announcerConfig = config.announcer_config;
const { sendOngoingRecap } = require('../utils/recapManager.js');

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
        const state = await jsonDb.read(stateFilePath, { ads_active: true, current_ad_index: 0 });
        if (!state.ads_active) {
          return;
        }

        // Force Jakarta Timezone
        const currentTime = new Date().toLocaleTimeString('en-GB', { 
            timeZone: 'Asia/Jakarta', 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false
        });
        
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
        
        await jsonDb.update(stateFilePath, (s) => {
          s.current_ad_index = nextIndex;
          return s;
        }, state);

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

    const scheduleRecap = () => {
      const [hours, minutes] = config.recapTime.split(':');

      const now = new Date();
      const targetTime = new Date();
      
      targetTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      
      const nowInWIB = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
      const targetInWIB = new Date(targetTime.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));

      let delay = targetInWIB.getTime() - nowInWIB.getTime();

      if (delay < 0) {
        delay += 24 * 60 * 60 * 1000; // Tambah 24 jam
      }
      
      console.log(`[Recap] Rekap tiket berikutnya dijadwalkan dalam ${Math.round(delay/1000/60)} menit.`);
      
      setTimeout(() => {
        sendOngoingRecap(client); 
        setInterval(() => {
          sendOngoingRecap(client);
        }, 24 * 60 * 60 * 1000);
      }, delay);
    };

    scheduleRecap();
    console.log('[Recap] Penjadwal rekap tiket harian telah aktif.');
  },
};