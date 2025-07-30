const { EmbedBuilder } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');
const config = require('../../config.json');

const ongoingTicketsPath = path.join(__dirname, '../../ongoing_tickets.json');

async function sendOngoingRecap(client) {
  try {
    let tickets = [];
    try {
      const data = await fs.readFile(ongoingTicketsPath, 'utf8');
      tickets = JSON.parse(data);
    } catch (readError) {
      if (readError.code !== 'ENOENT') throw readError;
    }

    if (tickets.length === 0) {
      console.log('[Recap] Tidak ada tiket berlangsung untuk direkap.');
      // Jika dipicu manual, kita bisa beri tahu pengguna.
      return { success: true, message: 'Tidak ada tiket yang sedang berlangsung saat ini.' };
    }

    const recapChannel = await client.channels.fetch(config.recapChannelId);
    if (!recapChannel) {
      throw new Error('Channel rekap tidak ditemukan.');
    }

    const allRealms = Object.values(config.realmsConfig);
    const recapSections = allRealms.map(realm => {
      const realmTickets = tickets.filter(ticket => ticket.realm_name === realm.name);
      let sectionText = `## ${realm.name}\n`;
      if (realmTickets.length > 0) {
        sectionText += realmTickets.map(ticket => `- <#${ticket.channel_id}>: **${ticket.category}** oleh <@${ticket.added_by}>`).join('\n');
      } else {
        sectionText += '-# *Tidak ada tiket yang berlangsung.*';
      }
      return sectionText;
    });

    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle(`📝 Rekap Tiket Berlangsung (${tickets.length} Total)`)
      .setDescription(recapSections.join('\n\n'))
      .setTimestamp()
      .setFooter({ text: "Mohon segera selesaikan tiket yang tertunda." });

    await recapChannel.send({ embeds: [embed] });
    console.log(`[Recap] Berhasil mengirim rekap untuk ${tickets.length} tiket.`);
    return { success: true, message: `Rekap berhasil dikirim ke channel <#${recapChannel.id}>.` };
    
  } catch (error) {
    console.error("[Recap] Gagal menjalankan rekap tiket:", error);
    return { success: false, message: 'Gagal mengirim rekap.' };
  }
}

module.exports = { sendOngoingRecap };