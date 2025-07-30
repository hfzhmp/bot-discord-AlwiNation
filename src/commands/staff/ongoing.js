const { SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, MessageFlags } = require('discord.js');
const config = require('../../../config.json');
const fs = require('fs').promises;
const path = require('path');
const ongoingTicketsPath = path.join(__dirname, '../../../ongoing_tickets.json');
const { sendOngoingRecap } = require('../../utils/recapManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ongoing')
    .setDescription('Recap tiket yang sedang berlangsung.')
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Menambahkan tiket ke daftar on-going.')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('delete')
        .setDescription('Hapus tiket dari daftar on-going.')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('kirim')
        .setDescription('Mengirim rekap tiket on-going secara manual.')
    ),
  
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'add') {
      if (!interaction.channel.name.toLowerCase().startsWith('ticket')) {
        return interaction.reply({
          content: 'Perintah ini hanya bisa digunakan di dalam channel tiket.',
          flags: [MessageFlags.Ephemeral]
        });
      }

      const realmOptions = Object.keys(config.realmsConfig).map(key => 
        new StringSelectMenuOptionBuilder()
          .setLabel(config.realmsConfig[key].name)
          .setValue(key)
      );

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('ongoing_realm_select')
        .setPlaceholder('Pilih realm untuk tiket ini...')
        .addOptions(realmOptions);

      const row = new ActionRowBuilder().addComponents(selectMenu);

      await interaction.reply({
        content: 'Pilih realm yang sesuai untuk tiket ini.',
        components: [row],
        flags: [MessageFlags.Ephemeral]
      });
    }

    else if (subcommand === 'delete') {
      await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

      try {
        const data = await fs.readFile(ongoingTicketsPath, 'utf8');
        const tickets = JSON.parse(data);

        if (tickets.length === 0) {
          return interaction.editReply({ content: 'Tidak ada tiket yang sedang berlangsung untuk dihapus.' });
        }

        const ticketOptions = tickets.map(ticket => 
          new StringSelectMenuOptionBuilder()
            .setLabel(`[${ticket.category}] di #${interaction.guild.channels.cache.get(ticket.channel_id)?.name || 'Unknown Channel'}`)
            .setDescription(ticket.description.substring(0, 100))
            .setValue(ticket.channel_id)
        );

        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId('ongoing_ticket_delete_select')
          .setPlaceholder('Pilih tiket yang akan dihapus dari on-going')
          .addOptions(ticketOptions);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.editReply({
          content: 'Pilih tiket di bawah ini untuk dihapus dari daftar "on-going":',
          components: [row]
        });

      } catch (error) {
        if (error.code === 'ENOENT') {
            return interaction.editReply({ content: 'Tidak ada tiket yang sedang berlangsung untuk dihapus.' });
        }
        console.error("Gagal membaca data tiket ongoing:", error);
        await interaction.editReply({ content: 'Terjadi error saat mengambil daftar tiket.' });
      }
    }
    else if (subcommand === 'kirim') {
      await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
      const result = await sendOngoingRecap(interaction.client);
      
      await interaction.editReply(result.message);
    }
  }
};