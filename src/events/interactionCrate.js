const { Events, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, EmbedBuilder, MessageFlags, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const config = require('../../config.json');
const fs = require('fs').promises;
const path = require('path');
const ongoingTicketsPath = path.join(__dirname, '../../ongoing_tickets.json');

async function handleChatInputCommand(interaction) {
  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`Tidak ada command yang cocok dengan nama "${interaction.commandName}".`);
    return;
  }

  if (command.data.name === 'changelog') {
    const attachment = interaction.options.getAttachment('gambar');
    changelogDataStore.set(interaction.user.id, { 
      text: null, 
      imageUrl: attachment ? attachment.url : null 
    });
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

  else if (interaction.customId === 'changelogModal') {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    const data = changelogDataStore.get(interaction.user.id);
    if (!data) {
      return interaction.editReply({ content: 'Sesi Anda telah berakhir, silakan mulai lagi dengan perintah /changelog.' });
    }
    
    data.text = interaction.fields.getTextInputValue('changelogText');
    
    const realmOptions = Object.keys(config.realmsConfig).map(key => 
      new StringSelectMenuOptionBuilder()
        .setLabel(config.realmsConfig[key].name)
        .setValue(key)
    );

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('changelogRealmSelect')
      .setPlaceholder('Pilih satu atau beberapa realms')
      .setMinValues(1)
      .setMaxValues(realmOptions.length)
      .addOptions(realmOptions);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.editReply({
      content: 'Changelog diterima. Sekarang, pilih realm(s) yang menerima pembaruan ini:',
      components: [row],
    });
  }

  else if (interaction.customId.startsWith('ongoingTicketModal_')) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    try {
      const selectedRealm = interaction.customId.split('_')[1];
      const realmName = config.realmsConfig[selectedRealm]?.name || 'Tidak Diketahui';

      const kategori = interaction.fields.getTextInputValue('kategori');
      const deskripsi = interaction.fields.getTextInputValue('deskripsi');

      const data = await fs.readFile(ongoingTicketsPath, 'utf8');
      const tickets = JSON.parse(data);

      if (tickets.some(ticket => ticket.channel_id === interaction.channelId)) {
        return interaction.editReply({ content: 'Tiket ini sudah ditandai sebagai "berlangsung".' });
      }

      const newTicket = {
        channel_id: interaction.channelId,
        realm_name: realmName,
        category: kategori,
        description: deskripsi,
        added_by: interaction.user.id,
        added_at: new Date().toISOString()
      };

      tickets.push(newTicket);
      await fs.writeFile(ongoingTicketsPath, JSON.stringify(tickets, null, 2));

      await interaction.editReply({ content: `✅ Tiket untuk realm **${realmName}** telah ditandai sebagai "berlangsung".` });
    } catch (error) {
      console.error("Gagal menyimpan tiket ongoing:", error);
      await interaction.editReply({ content: 'Terjadi error saat menyimpan data tiket.' });
    }
  }
}

async function handleSelectMenu(interaction) {
  if (interaction.customId === 'changelogRealmSelect') {
    await interaction.deferUpdate({ flags: [MessageFlags.Ephemeral] });

    const selectedRealmKeys = interaction.values;
    const data = changelogDataStore.get(interaction.user.id);

    if (!data || !data.text) {
      return interaction.editReply({ content: 'Terjadi error: Data changelog tidak ditemukan. Silakan coba lagi.', components: [] });
    }

    const targetChannel = await interaction.client.channels.fetch(config.changelogChannelId);
    if (!targetChannel) {
      return interaction.editReply({ content: 'Error: Channel changelog tidak ditemukan.', components: [] });
    }

    const realmNames = selectedRealmKeys.map(key => config.realmsConfig[key].name);
    const roleTags = selectedRealmKeys.map(key => `<@&${config.realmsConfig[key].roleId}>`).join(' ');

    let finalTitle;
    if (realmNames.length === 1) {
      finalTitle = realmNames[0];
    } else if (realmNames.length === 2) {
      finalTitle = realmNames.join(' & ');
    } else {
      finalTitle = `${realmNames.slice(0, -1).join(', ')}, & ${realmNames.slice(-1)}`;
    }
    
    const messageContent = `## ${finalTitle}\n${data.text}\n\n${roleTags}`;
    
    const messageOptions = {
      content: messageContent,
    };

    if (data.imageUrl) {
      messageOptions.files = [data.imageUrl];
    }

    await targetChannel.send(messageOptions);

    changelogDataStore.delete(interaction.user.id);
    await interaction.editReply({ content: `✅ Changelog berhasil dikirim untuk **${finalTitle}**!`, components: [] });
  }
  else if (interaction.customId === 'ongoing_realm_select') {
    const selectedRealm = interaction.values[0];
    
    const modal = new ModalBuilder()
      .setCustomId(`ongoingTicketModal_${selectedRealm}`) 
      .setTitle('Formulir Tiket Berlangsung');

    const kategoriInput = new TextInputBuilder()
      .setCustomId('kategori')
      .setLabel("Kategori Tiket")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Contoh: Lupa Password, Top Up, Bug')
      .setRequired(true);

    const deskripsiInput = new TextInputBuilder()
      .setCustomId('deskripsi')
      .setLabel("Deskripsi Singkat Masalah")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Jelaskan masalah utama tiket ini...')
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(kategoriInput),
      new ActionRowBuilder().addComponents(deskripsiInput)
    );

    await interaction.showModal(modal);
  }
  else if (interaction.customId === 'ongoing_ticket_delete_select') {
    await interaction.deferUpdate({ flags: [MessageFlags.Ephemeral] });

    try {
      const channelIdToDelete = interaction.values[0];

      const data = await fs.readFile(ongoingTicketsPath, 'utf8');
      let tickets = JSON.parse(data);

      const updatedTickets = tickets.filter(ticket => ticket.channel_id !== channelIdToDelete);

      if (tickets.length === updatedTickets.length) {
        return interaction.editReply({ content: 'Tiket yang dipilih tidak lagi ada di dalam daftar.', components: [] });
      }

      await fs.writeFile(ongoingTicketsPath, JSON.stringify(updatedTickets, null, 2));

      await interaction.editReply({
        content: '✅ Tiket telah berhasil dihapus dari daftar "on-going".',
        components: []
      });

    } catch (error) {
      console.error("Gagal menghapus tiket ongoing:", error);
      await interaction.editReply({ content: 'Terjadi error saat mencoba menghapus tiket.', components: [] });
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
    } else if (interaction.isStringSelectMenu()) {
      await handleSelectMenu(interaction);
    } else if (interaction.isButton()) {
      await handleButton(interaction);
    }
  },
};