const { Events } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');

const ongoingTicketsPath = path.join(__dirname, '../../ongoing_tickets.json');

module.exports = {
  name: Events.ChannelDelete,
  async execute(channel) {
    try {
      let tickets = [];
      try {
        const data = await fs.readFile(ongoingTicketsPath, 'utf8');
        tickets = JSON.parse(data);
      } catch (readError) {
        if (readError.code !== 'ENOENT') throw readError;
        return;
      }

      const ticketExists = tickets.some(ticket => ticket.channel_id === channel.id);
      
      if (ticketExists) {
        const updatedTickets = tickets.filter(ticket => ticket.channel_id !== channel.id);
        await fs.writeFile(ongoingTicketsPath, JSON.stringify(updatedTickets, null, 2));
        console.log(`[Ongoing Ticket] Data untuk channel #${channel.name} (${channel.id}) telah dihapus.`);
      }
    } catch (error) {
      console.error("Gagal menghapus data tiket ongoing:", error);
    }
  },
};