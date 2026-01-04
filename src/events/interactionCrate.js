const { Events, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, EmbedBuilder, MessageFlags, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const config = require('../../config.json');
const { createBaseEmbed } = require('../utils/embedTemplates');
const path = require('path');
const jsonDb = require('../utils/jsonDb');
const ongoingTicketsPath = path.join(__dirname, '../../ongoing_tickets.json');
const pendingBugsPath = path.join(__dirname, '../../pending_bugs.json');

const { randomUUID } = require('crypto');
const bugReportStore = new Map();
// const pendingBugReports = new Map(); // Replaced with persistent storage
const { addBugToSheet } = require('../utils/googleSheets');

const changelogDataStore = new Map();
const reportDataStore = new Map();

const HIGH_STAFF_ROLE_ID = '1327298533690179679';

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
  if (command.data.name === 'report') {
    const attachment = interaction.options.getAttachment('gambar');
    reportDataStore.set(interaction.user.id, { 
      text: null, 
      imageUrl: attachment ? attachment.url : null 
    });
  }

  if (command.data.name === 'bugreport') {
    const imageUrls = [];
    for (let i = 1; i <= 3; i++) {
      const attachment = interaction.options.getAttachment(`gambar-${i}`);
      if (attachment) {
        imageUrls.push(attachment.url);
      }
    }
    
    bugReportStore.set(interaction.user.id, {
      imageUrls: imageUrls,
      realms: [],
      priority: null,
      title: null,
      description: null
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

    const adminChannel = await interaction.client.channels.fetch(config.adminChatChannelId);

    if (!adminChannel) {
      return interaction.editReply({ 
        content: 'Error: Channel Admin Chat tidak ditemukan di konfigurasi.', 
      });
    }

    try {
      const realmsName = interaction.fields.getTextInputValue('realmsName');
      const timeSchedule = interaction.fields.getTextInputValue('timeSchedule');
      const reasonMaintenance = interaction.fields.getTextInputValue('reasonMaintenance');
      const detailsMaintenance = interaction.fields.getTextInputValue('detailsMaintenance');
      const maker = interaction.member.displayName;
      const makerId = interaction.user.id;

      const targetChannel = await interaction.client.channels.fetch(config.maintenanceChannelId);
      if (!targetChannel) {
        return interaction.editReply({ 
          content: 'Error: Channel maintenance pengumuman tidak ditemukan.',
        });
      }

      const maintenanceEmbed = createBaseEmbed()
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
        );

      const announcementMessage = await targetChannel.send({
        content: '@/everyone',
        embeds: [maintenanceEmbed]
      });

      const doneButton = new ButtonBuilder()
        .setCustomId(`maintenance_done_${announcementMessage.channel.id}_${announcementMessage.id}`)
        .setLabel('Maintenance Selesai')
        .setStyle(ButtonStyle.Success);
      
      const row = new ActionRowBuilder().addComponents(doneButton);

      const notificationEmbed = createBaseEmbed()
        .setColor('#FF7D29')
        .setDescription(
          `## <:checkmark:1353853747725340813> Maintenance Status : On Going\n` +
          `Maintenance mengenai "**${reasonMaintenance}**" berhasil dikirim!\n`+ 
          `### <:redmessage:1418552581768347739>: ${announcementMessage.url}\n` +
          `> By: ${maker} (<@${makerId}>)`
        );

      const confirmationMessage = await adminChannel.send({ 
        embeds: [notificationEmbed],
        components: [row]
      });

      if (interaction.channelId !== config.adminChatChannelId) {
        await interaction.editReply({
          content: `✅ Pengumuman berhasil dikirim! Pesan **Konfirmasi** (untuk menandai selesai) telah dikirim ${confirmationMessage.url}.`,
        });
      } else {
        await interaction.deleteReply();
      }

    } catch (error) {
      console.error('Error saat memproses modal maintenance:', error);
      await interaction.editReply({ content: 'Terjadi error saat mengirim pengumuman.' });
    }
  }

  else if (interaction.customId === 'emergencyMaintenanceModal') {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] }); 

    const adminChannel = await interaction.client.channels.fetch(config.adminChatChannelId);

    if (!adminChannel) {
      return interaction.editReply({ 
        content: 'Error: Channel Admin Chat tidak ditemukan di konfigurasi.', 
      });
    }

    try {
      const realmsName = interaction.fields.getTextInputValue('realmsName');
      const reasonMaintenance = interaction.fields.getTextInputValue('reasonMaintenance');
      const maker = interaction.member.displayName;
      const makerId = interaction.user.id;

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

      const emergencyEmbed = createBaseEmbed()
        .setColor('#DC2525') 
        .setDescription(
          `# <:warning:1353853707929780244> Pemberitahuan Emergency Maintenance\n` +
          `Kami akan segera melakukan **Maintenance Darurat** untuk mengatasi masalah kritis pada server.\n` +
          `## <:cheese:1353853751282241670>  Maintenance Information\n` +
          `\`\`\`Realm  : ${realmsName}\nTime   : ${startTime} - ???\nReason : ${reasonMaintenance}\`\`\`\n` +
          `Selama proses maintenance berlangsung, **Realms tidak dapat diakses**. Kami mohon maaf atas gangguan mendadak ini.\n\n` +
          `Terima kasih atas pengertiannya. <:heart_orange:1353875339645812806>`
        )

      const announcementMessage = await targetChannel.send({
        content: '@/everyone',
        embeds: [emergencyEmbed]
      });

      const doneButton = new ButtonBuilder()
        .setCustomId(`maintenance_done_${announcementMessage.channel.id}_${announcementMessage.id}_${startTime}`)
        .setLabel('Maintenance Selesai')
        .setStyle(ButtonStyle.Success);
      
      const row = new ActionRowBuilder().addComponents(doneButton);

      const notificationEmbed = createBaseEmbed()
        .setColor('#DC2525')
        .setDescription(
          `## <:checkmark:1353853747725340813> Maintenance Status : On Going\n` +
          `Emergency Maintenance mengenai "**${reasonMaintenance}**" berhasil dikirim!\n`+ 
          `### <:redmessage:1418552581768347739> ${announcementMessage.url}\n` +
          `> By: ${maker} (<@${makerId}>)`

        )

      const confirmationMessage = await adminChannel.send({ 
        embeds: [notificationEmbed],
        components: [row]
      });

      if (interaction.channelId !== config.adminChatChannelId) {
        await interaction.editReply({
          content: `✅ Pengumuman berhasil dikirim! Pesan **Konfirmasi** (untuk menandai selesai) telah dikirim ${confirmationMessage.url}.`,
        });
      } else {
        await interaction.deleteReply();
      }

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
    data.note = interaction.fields.getTextInputValue('noteText');
    
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

  else if (interaction.customId === 'reportModal') {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    try{
      const name = interaction.fields.getTextInputValue('name') || 'Anonim';
      const staffUsername = interaction.fields.getTextInputValue('staffUsername');
      const realm = interaction.fields.getTextInputValue('realm');
      const detailDescription = interaction.fields.getTextInputValue('detailDescription')
      const evidence = interaction.fields.getTextInputValue('evidence') || 'Tidak ada bukti.';
      const data = reportDataStore.get(interaction.user.id);

      const targetChannel = await interaction.client.channels.fetch(config.reportLogId);
      if (!targetChannel) {
        return interaction.editReply({ content: 'Error: Channel maintenance tidak ditemukan.' });
      }

      const messageContent = `# <:megaphone:1418541090235224074> — New Report!\n\n<@&${HIGH_STAFF_ROLE_ID}>`;
      const reportEmbed = createBaseEmbed()
        .setColor('#FF0000')
        .setDescription(
          `## <:rotating_light:1353870512450834443> Report Detail\n` +
          `**Staff Username**: ${staffUsername}\n` +
          `**Realms**: ${realm}\n` +
          `### <:gforms:1353187627150606418> Deskripsi Laporan:\n` +
          `${detailDescription}\n` +
          `### <:redmessage:1418552581768347739> Bukti:\n` +
          `\`\`\`${evidence}\`\`\`\n`
        )
        .addFields(
          { name: '<:moyai:1353870495828803697> Pelapor', value: name, inline: true },
          { name: '<:eyes:1353853762464256041> Name', value: interaction.member.displayName, inline: true },
          { name: '<:discord:1353187631571275797> Discord', value: `<@${interaction.user.id}>`, inline: true }
        )

      await targetChannel.send({
        content: messageContent,
        embeds: [reportEmbed]
      });

      if (data && data.imageUrl) {
        targetChannel.send({
          content: "Bukti Gambar:",
          files: [data.imageUrl]
        })
      }

      reportDataStore.delete(interaction.user.id);
      const successEmbed = createBaseEmbed()
        .setColor('#57F287')
        .setTitle('Laporan Terkirim')
        .setDescription('Terima kasih, laporan Anda telah dikirim dan akan segera ditinjau oleh High Staff.');

      await interaction.editReply({ embeds: [successEmbed] });
    } catch (error) {
      console.error("Gagal memproses laporan:", error);
      const errorEmbed = createBaseEmbed()
        .setColor('#FF0000')
        .setTitle('❌ Terjadi Error')
        .setDescription('Gagal mengirim laporan Anda ke tim kami karena ada masalah internal. Silakan hubungi admin secara langsung.');
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  }

  else if (interaction.customId.startsWith('ongoingTicketModal_')) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    try {
      const selectedRealm = interaction.customId.split('_')[1];
      const realmName = config.realmsConfig[selectedRealm]?.name || 'Tidak Diketahui';

      const kategori = interaction.fields.getTextInputValue('kategori');
      const deskripsi = interaction.fields.getTextInputValue('deskripsi');

      await jsonDb.update(ongoingTicketsPath, (tickets) => {
        if (tickets.some(ticket => ticket.channel_id === interaction.channelId)) {
          throw new Error('TIKET_ADA');
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
        return tickets;
      }, []);

      await interaction.editReply({ content: `✅ Tiket untuk realm **${realmName}** telah ditandai sebagai "berlangsung".` });
    } catch (error) {
      if (error.message === 'TIKET_ADA') {
        return interaction.editReply({ content: 'Tiket ini sudah ditandai sebagai "berlangsung".' });
      }
      console.error("Gagal menyimpan tiket ongoing:", error);
      await interaction.editReply({ content: 'Terjadi error saat menyimpan data tiket.' });
    }
  }

  else if (interaction.customId === 'bugreport_modal') {
    await interaction.deferReply({ ephemeral: true });

    const data = bugReportStore.get(interaction.user.id);
    if (!data) {
      return interaction.editReply({ content: 'Sesi Anda telah berakhir. Silakan mulai lagi.' });
    }

    data.title = interaction.fields.getTextInputValue('bugTitle');
    data.description = interaction.fields.getTextInputValue('bugDescription');

    bugReportStore.delete(interaction.user.id);

    const bugId = randomUUID();

    const completeBugData = {
      ...data,
      id: bugId,
      reporterId: interaction.user.id,
      reporterTag: interaction.user.tag,
      timestamp: new Date().toISOString()
    };
    
    // Simpan ke storage persisten
    await jsonDb.update(pendingBugsPath, (bugs) => {
      bugs[bugId] = completeBugData;
      return bugs;
    }, {});
    
    const adminChannel = await interaction.client.channels.fetch(config.adminChatChannelId);

    if (!adminChannel) {
      return interaction.editReply({ 
        content: 'Error: Channel Admin Chat tidak ditemukan di konfigurasi.', 
      });
    }

    const realmNames = data.realms.map(key => config.realmsConfig[key]?.name || key).join(', ');
    const priorityColors = { minor: '#00FF00', mayor: '#FFFF00', critical: '#FF0000' };
    
    const verificationEmbed = new EmbedBuilder()
      .setColor(priorityColors[data.priority] || '#FFFFFF')
      .setTitle(`Verifikasi Bug Report: ${data.title}`)
      .setDescription(data.description)
      .addFields(
        { name: 'Pelapor', value: `<@${interaction.user.id}> (\`${interaction.user.tag}\`)`, inline: true },
        { name: 'Realm(s)', value: realmNames, inline: true },
        { name: 'Prioritas', value: data.priority, inline: true }
      )
      .setFooter({ text: `Bug ID: ${bugId}` })
      .setTimestamp();
    
    if (data.imageUrls.length > 0) {
      const imageLinks = data.imageUrls.map((url, i) => `[Gambar ${i+1}](${url})`).join('\n');
      verificationEmbed.addFields({ name: 'Lampiran Gambar', value: imageLinks });
    }

    const approveButton = new ButtonBuilder()
      .setCustomId(`bug_approve_${bugId}`)
      .setLabel('Tambahkan ke List')
      .setStyle(ButtonStyle.Success)
      .setEmoji('✅');
      
    const rejectButton = new ButtonBuilder()
      .setCustomId(`bug_reject_${bugId}`)
      .setLabel('Tolak')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('❌');

    const row = new ActionRowBuilder().addComponents(rejectButton, approveButton);

    await adminChannel.send({
      content: `<@&${HIGH_STAFF_ROLE_ID}>, ada laporan bug baru yang perlu diverifikasi.`,
      embeds: [verificationEmbed],
      components: [row]
    });

    await interaction.editReply({
      content: '✅ Terima kasih! Laporan bug Anda telah dikirim ke tim Admin untuk diverifikasi.'
    });
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
    const roleTags = selectedRealmKeys.map(key => `<@&${config.realmsConfig[key].roleId}>`).join(` `);

    let finalTitle;
    if (realmNames.length === 1) {
      finalTitle = realmNames[0];
    } else if (realmNames.length === 2) {
      finalTitle = realmNames.join(' & ');
    } else {
      finalTitle = `${realmNames.slice(0, -1).join(', ')}, & ${realmNames.slice(-1)}`;
    }
    
    const messageContent = `# <:megaphone:1418541090235224074> — New Update!\n\n${roleTags}`;

    const changelogEmbed = new EmbedBuilder()
      .setColor('#29B0FF')
      .setDescription(
        `## <:cheese:1353853751282241670> Realm: ${finalTitle}\n` +
        `### Changes:\n` +
        `${data.text}` +
        (data.note ? `\n**Note:**\n${data.note}` : '')
      )
      .setFooter({
        text: `—Updated by ${interaction.member.displayName}`,
        iconURL: `${interaction.user.displayAvatarURL()}`
      })
      .setTimestamp();
    
    const messageOptions = {
      content: messageContent,
      embeds: [changelogEmbed]
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

      let found = false;
      await jsonDb.update(ongoingTicketsPath, (tickets) => {
        const initialLength = tickets.length;
        const updatedTickets = tickets.filter(ticket => ticket.channel_id !== channelIdToDelete);
        if (updatedTickets.length !== initialLength) {
          found = true;
        }
        return updatedTickets;
      }, []);

      if (!found) {
        return interaction.editReply({ content: 'Tiket yang dipilih tidak lagi ada di dalam daftar.', components: [] });
      }

      await interaction.editReply({
        content: '✅ Tiket telah berhasil dihapus dari daftar "on-going".',
        components: []
      });

    } catch (error) {
      console.error("Gagal menghapus tiket ongoing:", error);
      await interaction.editReply({ content: 'Terjadi error saat mencoba menghapus tiket.', components: [] });
    }
  }

  else if (interaction.customId === 'bugreport_realm_select') {
    const data = bugReportStore.get(interaction.user.id);
    if (!data) {
      return interaction.update({ content: 'Sesi bug report Anda telah berakhir.', components: [], ephemeral: true });
    }

    data.realms = interaction.values;

    const priorityMenu = new StringSelectMenuBuilder()
      .setCustomId('bugreport_priority_select')
      .setPlaceholder('Pilih tingkatan bug')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('Minor')
          .setDescription('Bug kecil, tidak mengganggu gameplay utama.')
          .setValue('Minor')
          .setEmoji('🟢'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Mayor')
          .setDescription('Bug yang berdampak pada gameplay atau ekonomi.')
          .setValue('Mayor')
          .setEmoji('🟡'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Critical')
          .setDescription('Bug yang merusak server, duplikasi, atau crash.')
          .setValue('Critical')
          .setEmoji('🔴')
      );
    
    const row = new ActionRowBuilder().addComponents(priorityMenu);

    await interaction.update({
      content: 'Realm telah dipilih. Sekarang, pilih tingkatan prioritas bug:',
      components: [row],
      ephemeral: true
    });
  }
  else if (interaction.customId === 'bugreport_priority_select') {
    const data = bugReportStore.get(interaction.user.id);
    if (!data) {
      return interaction.update({ content: 'Sesi bug report Anda telah berakhir.', components: [], ephemeral: true });
    }

    data.priority = interaction.values[0];

    const modal = new ModalBuilder()
      .setCustomId('bugreport_modal')
      .setTitle('Formulir Bug Report');

    const titleInput = new TextInputBuilder()
      .setCustomId('bugTitle')
      .setLabel("Judul Bug Report")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Contoh: Duplikasi item di Realm Survival')
      .setRequired(true);

    const descriptionInput = new TextInputBuilder()
      .setCustomId('bugDescription')
      .setLabel("Deskripsi Bug")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Jelaskan cara agar bug ini terjadi...')
      .setRequired(true);
      
    modal.addComponents(
      new ActionRowBuilder().addComponents(titleInput),
      new ActionRowBuilder().addComponents(descriptionInput)
    );

    await interaction.showModal(modal);
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
      const doneEmbed = createBaseEmbed()
        .setColor('#06923E')
        .setDescription(
          `# <:sparkles:1353870538141073558> Maintenance Selesai\n` +
          `Proses maintenance telah selesai. Server atau realms yang terdampak kini sudah kembali **Online** dan dapat diakses seperti biasa.\n\n` +
          `Terima kasih atas kesabaran Anda!`
        )

      await originalMessage.reply({
        content: '@/everyone',
        embeds: [doneEmbed]
      });

      const finalNotificationEmbed = createBaseEmbed()
        .setColor('#06923E')
        .setDescription(
          `## <:sparkles:1353870538141073558> Maintenance Status : Done\n` +
          `Pemberitahuan "**Maintenance Selesai**" telah berhasil dikirim.\n`+ 
          `### <:redmessage:1418552581768347739> ${originalMessage.url} \n` +
          `> By: ${interaction.member.displayName} (<@${interaction.user.id}>)`
        )

      await interaction.message.edit({
        embeds: [finalNotificationEmbed],
        components: []
      });

    } catch (error) {
      console.error('Error saat menangani tombol maintenance selesai:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'Gagal memproses. Pesan asli mungkin sudah dihapus.', flags: [MessageFlags.Ephemeral] });
      } else {
        await interaction.followUp({ content: 'Gagal memproses. Pesan asli mungkin sudah dihapus.', flags: [MessageFlags.Ephemeral] });
      }
    }
  }
  else if (interaction.customId === 'reportButton') {
    const modal = new ModalBuilder()
      .setCustomId('reportModal')
      .setTitle('Formulir Report Staff');

    const nameInput = new TextInputBuilder()
      .setCustomId('name')
      .setLabel("Nama Pelapor (Boleh Anonim)")
      .setPlaceholder('Username / Anonim')
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    const staffUsernameInput = new TextInputBuilder()
      .setCustomId('staffUsername')
      .setLabel("Username Staff")
      .setPlaceholder('Username Staff yang Dilaporkan')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const realmInput = new TextInputBuilder()
      .setCustomId('realm')
      .setLabel("Realm")
      .setPlaceholder('Realm tempat kejadian berlangsung')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const detailDescriptionInput = new TextInputBuilder()
      .setCustomId('detailDescription')
      .setLabel("Detail Laporan")
      .setPlaceholder('Jelaskan detail deskripsi, waktu, dan lokasi kejadian secara rinci.')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const evidenceInput = new TextInputBuilder()
      .setCustomId('evidence')
      .setLabel("Bukti Pendukung (Link/Gambar)")
      .setPlaceholder('Link screenshot sebagai bukti. Gunakan command /report jika ingin melampirkan gambar tanpa link.')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false);

    const firstRow = new ActionRowBuilder().addComponents(nameInput);
    const secondRow = new ActionRowBuilder().addComponents(staffUsernameInput);
    const thirdRow = new ActionRowBuilder().addComponents(realmInput);
    const fourthRow = new ActionRowBuilder().addComponents(detailDescriptionInput);
    const fifthRow = new ActionRowBuilder().addComponents(evidenceInput);

    modal.addComponents(firstRow, secondRow, thirdRow, fourthRow, fifthRow);

    await interaction.showModal(modal);
  }

  else if (interaction.customId.startsWith('bug_reject_')) {
    const bugId = interaction.customId.split('_')[2];
    
    await jsonDb.update(pendingBugsPath, (bugs) => {
      delete bugs[bugId];
      return bugs;
    }, {});
    
    await interaction.message.delete();
    
  }

  else if (interaction.customId.startsWith('bug_approve_')) {
    await interaction.deferReply({ ephemeral: true });
    const bugId = interaction.customId.split('_')[2];
    
    // Ambil data terbaru dari file
    const allPendingBugs = await jsonDb.read(pendingBugsPath, {});
    const bugData = allPendingBugs[bugId];

    if (!bugData) {
      return interaction.editReply({ content: 'Error: Bug report ini tidak lagi ada di daftar pending (mungkin sudah diproses).' });
    }
    
    try {

      await addBugToSheet(bugData);

      await jsonDb.update(pendingBugsPath, (bugs) => {
        delete bugs[bugId];
        return bugs;
      }, {});
      
      const originalEmbed = interaction.message.embeds[0];
      const approvedEmbed = new EmbedBuilder(originalEmbed.toJSON())
        .setColor('#57F287')
        .setTitle(`[DISETUJUI] ${originalEmbed.title}`)
        .setFooter({ text: `Disetujui oleh ${interaction.user.tag} | ID: ${bugId}` });
        
      await interaction.message.edit({
        content: `Bug report ini telah disetujui oleh <@${interaction.user.id}> dan ditambahkan ke list.`,
        embeds: [approvedEmbed],
        components: []
      });

      await interaction.editReply({ content: '✅ Laporan berhasil disetujui dan dicatat.' });
      
    } catch (error) {
      console.error("Gagal mengirim ke Google Sheets:", error);
      await interaction.editReply({ content: 'Gagal mengirim data ke Google Sheets. Cek console.' });
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