const { Events, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, EmbedBuilder, MessageFlags, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../config.json');

async function handleChatInputCommand(interaction) {
  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`Tidak ada command yang cocok dengan nama "${interaction.commandName}".`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error saat menjalankan command /${interaction.commandName}:`, error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'Terjadi error saat menjalankan perintah ini!', flags: [MessageFlags.Ephemeral] });
    } else {
      await interaction.reply({ content: 'Terjadi error saat menjalankan perintah ini!', flags: [MessageFlags.Ephemeral] });
    }
  }
}

async function handleModalSubmit(interaction) {
  if (interaction.customId === 'maintenanceModal') {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    try {
      const realmsName = interaction.fields.getTextInputValue('realmsName');
      const timeSchedule = interaction.fields.getTextInputValue('timeSchedule');
      const reasonMaintenance = interaction.fields.getTextInputValue('reasonMaintenance');
      const detailsMaintenance = interaction.fields.getTextInputValue('detailsMaintenance');

      const targetChannel = await interaction.client.channels.fetch(config.maintenanceChannelId);
      if (!targetChannel) {
        return interaction.editReply({ content: 'Error: Channel maintenance tidak ditemukan.' });
      }

      const maintenanceEmbed = new EmbedBuilder()
        .setColor('#FF7D29')
        .setDescription(
          `# <:warning:1353853707929780244> Pemberitahuan Maintenance Server\n` +
          `Kami akan melakukan **Maintenance** untuk melakukan **adjustment terhadap server**, yang akan berdampak pada akses server selama periode tersebut.\n` +
          `## <:cheese:1353853751282241670>  Maintenance Information\n` +
          `\`\`\`Realm  : ${realmsName}\nTime   : ${timeSchedule}\nReason : ${reasonMaintenance} \`\`\`\n` +
          `## <:question:1353853724103278713> Maintenance Details\n` +
          `\`\`\`${detailsMaintenance}\`\`\`\n` +
          `Selama proses maintenance berlangsung, **Realms tidak dapat diakses**. Kami mohon maaf atas ketidaknyamanan ini dan akan berusaha semaksimal mungkin untuk menyelesaikan proses maintenance secepatnya.\n\n` +
          `Terima kasih atas pengertiannya. <:heart_orange:1353875339645812806>`
        )
        .setFooter({
          text: "—Tim AlwiNation",
          iconURL: "https://media.discordapp.net/attachments/1327346272855916686/1394068883224133683/image.png?ex=68757752&is=687425d2&hm=eac7eceb40e7cdb4f4b9c47a2dc5c16a33f11d2c898e0bc160f0ae3fce127cc3&=&format=webp&quality=lossless&width=1244&height=1244"
        });

      const announcementMessage = await targetChannel.send({
        content: 'testing',
        embeds: [maintenanceEmbed]
      });

      const doneButton = new ButtonBuilder()
        .setCustomId(`maintenance_done_${announcementMessage.channel.id}_${announcementMessage.id}`)
        .setLabel('Maintenance Selesai')
        .setStyle(ButtonStyle.Success);
      
      const row = new ActionRowBuilder().addComponents(doneButton);

      await interaction.editReply({ 
        content: '✅ Pengumuman maintenance darurat berhasil dikirim!',
        components: [row]
      });

    } catch (error) {
      console.error('Error saat memproses modal maintenance:', error);
      await interaction.editReply({ content: 'Terjadi error saat mengirim pengumuman.' });
    }
  }

  else if (interaction.customId === 'emergencyMaintenanceModal') {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    try {
      const realmsName = interaction.fields.getTextInputValue('realmsName');
      const reasonMaintenance = interaction.fields.getTextInputValue('reasonMaintenance');

      const startTime = new Date().toLocaleTimeString('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      const targetChannel = await interaction.client.channels.fetch(config.maintenanceChannelId);
      if (!targetChannel) {
        return interaction.editReply({ content: 'Error: Channel maintenance tidak ditemukan.' });
      }

      const emergencyEmbed = new EmbedBuilder()
        .setColor('#DC2525') 
        .setDescription(
          `# <:warning:1353853707929780244> Pemberitahuan Emergency Maintenance\n` +
          `Kami akan segera melakukan **Maintenance Darurat** untuk mengatasi masalah kritis pada server.\n` +
          `## <:cheese:1353853751282241670>  Maintenance Information\n` +
          `\`\`\`Realm  : ${realmsName}\nTime   : ${startTime} - ???\nReason : ${reasonMaintenance}\`\`\`\n` +
          `Selama proses maintenance berlangsung, **Realms tidak dapat diakses**. Kami mohon maaf atas gangguan mendadak ini.\n\n` +
          `Terima kasih atas pengertiannya. <:heart_orange:1353875339645812806>`
        )
        .setFooter({
          text: "—Tim AlwiNation",
          iconURL: "https://media.discordapp.net/attachments/1327346272855916686/1394068883224133683/image.png?ex=68757752&is=687425d2&hm=eac7eceb40e7cdb4f4b9c47a2dc5c16a33f11d2c898e0bc160f0ae3fce127cc3&=&format=webp&quality=lossless&width=1244&height=1244"
        });

      const announcementMessage = await targetChannel.send({
        content: 'testing',
        embeds: [emergencyEmbed]
      });

      const doneButton = new ButtonBuilder()
        .setCustomId(`maintenance_done_${announcementMessage.channel.id}_${announcementMessage.id}_${startTime}`)
        .setLabel('Maintenance Selesai')
        .setStyle(ButtonStyle.Success);
      
      const row = new ActionRowBuilder().addComponents(doneButton);

      await interaction.editReply({ 
        content: '✅ Pengumuman maintenance darurat berhasil dikirim!',
        components: [row]
      });

    } catch (error) {
      console.error('Error saat memproses modal maintenance darurat:', error);
      await interaction.editReply({ content: 'Terjadi error saat mengirim pengumuman.' });
    }
  }
}

async function handleButton(interaction) {
  if (interaction.customId.startsWith('maintenance_done_')) {
    await interaction.deferUpdate();

    const parts = interaction.customId.split('_');
    const channelId = parts[2];
    const messageId = parts[3];
    const startTime = parts[4];

    try {
      const targetChannel = await interaction.client.channels.fetch(channelId);
      if (!targetChannel) throw new Error('Channel maintenance tidak ditemukan.');
      
      const originalMessage = await targetChannel.messages.fetch(messageId);
      const originalEmbed = originalMessage.embeds[0]; 
      
      if (!originalEmbed) throw new Error('Embed asli tidak ditemukan.');

      const endTime = new Date().toLocaleTimeString('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      const updatedDescription = originalEmbed.description.replace(
        `${startTime} - ???`, 
        `${startTime} - ${endTime}`
      );

      const updatedEmbed = new EmbedBuilder(originalEmbed.toJSON()) 
        .setDescription(updatedDescription)
        .setColor('#06923E');

      // Edit pesan asli dengan embed yang sudah diperbarui
      await originalMessage.edit({ embeds: [updatedEmbed] });

      // Buat pesan pemberitahuan selesai
      const doneEmbed = new EmbedBuilder()
        .setColor('#06923E')
        .setDescription(
          `# <:sparkles:1353870538141073558> Maintenance Selesai\n` +
          `Proses maintenance telah selesai. Server atau realms yang terdampak kini sudah kembali **Online** dan dapat diakses seperti biasa.\n\n` +
          `Terima kasih atas kesabaran Anda!`
        )
        .setFooter({ 
          text: "—Tim AlwiNation",
          iconURL: "https://media.discordapp.net/attachments/1327346272855916686/1394068883224133683/image.png?ex=68757752&is=687425d2&hm=eac7eceb40e7cdb4f4b9c47a2dc5c16a33f11d2c898e0bc160f0ae3fce127cc3&=&format=webp&quality=lossless&width=1244&height=1244"
        })
        .setTimestamp();

      await originalMessage.reply({
        content: 'testing',
        embeds: [doneEmbed]
      });

      await interaction.editReply({ 
        content: 'Notifikasi "Selesai" telah terkirim.',
        components: [] 
      });

      await interaction.followUp({
          content: '✅ Berhasil mengirim pemberitahuan maintenance selesai!',
          flags: [MessageFlags.Ephemeral]
      });

    } catch (error) {
      console.error('Error saat menangani tombol maintenance selesai:', error);
      await interaction.followUp({ content: 'Gagal memproses. Pesan asli mungkin sudah dihapus.', ephemeral: true });
    }
  }
}

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      await handleChatInputCommand(interaction);
    } else if (interaction.isModalSubmit()) {
      await handleModalSubmit(interaction);
    } else if (interaction.isButton()) {
      await handleButton(interaction);
    }
  },
};