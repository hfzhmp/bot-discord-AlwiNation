const { Events } = require('discord.js');
const config = require('../../config.json');
const { hasRequiredRole } = require('../utils/permissions');

// prefix
const prefix = '!';

// Fungsi Pengecekan Staff Permission
async function checkStaffPermission(message) {
  if (!hasRequiredRole(message.member)) {
    try {
      const warningMessage = await message.channel.send(`${message.author}, kamu tidak punya izin untuk menggunakan perintah ini!`);
      setTimeout(() => warningMessage.delete().catch(console.error), 5000);
    } catch (error) {
      console.error('[LOG] Error while checking staff permission:', error);
    }
    return false;
  }
  return true;
}

// Fungsi Pengecekan Username Creator Ticket
async function getTicketCreator(message) {
  const parts = message.channel.name.split('-');
  const identifier = parts.slice(1).join('-');
  if (!identifier) return null;

  try {
    // By Id
    if (/^\d{17,20}$/.test(identifier)) {
      const memberById = await message.guild.members.fetch(identifier).catch(() => null);
      if (memberById) return memberById;
    }

    // By Username
    const memberByUsername = message.guild.members.cache.find(member =>
      member.user.username === identifier
    );
    if (memberByUsername) return memberByUsername;

    const fetchedMembers = await message.guild.members.fetch({
      query: identifier,
      limit: 1
    });

    return fetchedMembers.first() || null;
  } catch (error) {
    console.error('[LOG] Error fetching ticket creator:', error);
    return null;
  }
}

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    await message.delete();
    if (!await checkStaffPermission(message)) return; 
    
    // Parsing perintah
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    try{
      if(command === 'c'){ // Ketika permasalahan selesai
        await message.channel.send(`## <:sunglasses_smile:1353870545015410788>   Jika tidak ada pertanyaan atau masalah lainnya,  <:thumbs:1353853869951553636> \n        **Ticket ini akan kami close. Terima kasih!**`);
      } else if(command === 'w'){ // Memberikan warning tiket
        const ticketCreator = await getTicketCreator(message);
        if(ticketCreator){
          await message.channel.send(`## <:warning:1353853707929780244> Perhatian untuk ${ticketCreator}!
                                    > Mohon segera **merespon ticket yang telah Anda** buat.
                                    > Jika tidak ada respon dalam 5 jam kedepan, ticket akan kami tutup tanpa konfirmasi.`);
        } else {
          console.error(`[LOG] Gagal menemukan member dengan username: #${message.channel.name}`);
          await message.channel.send(`## <:warning:1353853707929780244> Perhatian!
                                    > Mohon segera **merespon ticket yang telah Anda** buat.
                                    > Jika tidak ada respon dalam 5 jam kedepan, ticket akan kami tutup tanpa konfirmasi.`);
        }
      } else if(command === 'cp'){ // Done Reset Password
        await message.channel.send('# <:videogame:1353853736757493770> Password kamu sudah berhasil diubah!\n > Silakan login kembali dengan mengetik: `/login alwi123`\n > Jangan lupa segera ganti password baru dengan mengetik:  `/changepassword alwi123 (newpw)`\nGunakan password yang mudah diingat tapi tetap aman, misalnya kombinasi nama dan angka favoritmu!');
      } else if(command === 'dt'){ // Done Transaksi
        await message.channel.send(`## <:star:1353853739068424383>  Top up Sudah Terikirim! Silakan login & cek. <:star:1353853739068424383> 
      ~ Terima kasih sudah berbelanja rank atau credit, semoga betah mainnya! ~`);
      } else if(command === 'dr'){ // Done Register
        await message.channel.send('## <:sparkles:1353870538141073558> Account kamu sudah kami bantu register! \n > Silakan login dengan mengetik: `/login alwi123`\n > Jangan lupa segera ganti password dengan mengetik: `/changepassword alwi123 (newpw)` \n\nGunakan password yang mudah diingat tapi tetap aman, misalnya kombinasi nama dan angka favoritmu!');
      } else if(command === 'fp'){ // Instruksi Forgot Password
        await message.channel.send({
          content: `## <:warning:1353853707929780244> Jika kamu lupa password akunmu, silakan ikuti langkah-langkah berikut: \n > - Ambil screenshot tab saat diminta memasukkan password. \n > - Ambil screenshot dari client yang kamu gunakan (misalnya, TLauncher). \n > - Jika ada, berikan bukti tambahan seperti screenshot saat kamu bermain di server. \nPastikan semua bukti yang dikirim jelas agar permintaan reset password bisa diproses dengan cepat!`,
          files: [{
            attachment: 'https://cdn.discordapp.com/attachments/1327346272855916686/1397628213966012616/image.png',
			      name: 'forget_password.png'
          }]
        });
      } else if(command === 'ptm'){ // Instruksi Top Up
        await message.channel.send(`## <:rotating_light:1353870512450834443>  Pembayaran kamu belum masuk? \nKami butuh bukti pembayaran kamu, ya! \n### Silakan kirim:
                            > - Bukti transfer / screenshot pembayaran
                            > - Nama Minecraft
                            > - Platform Minecraft ( Java / Bedrock )
                            > - Rank / Credit yang dibeli / jumlahnya
                            > - Jam Pembelian`);
      } else if(command === 'rolerank'){ // Instruksi claim role rank
        await message.channel.send('## <:videogame:1353853736757493770>  Mau ambil role Discord sesuai rank kamu di in-game? \n **Kamu bisa chat **`AlwiNation Jaya`** di Server, lalu screenshot dan kirim ke sini!**');
      } else if(command === 'cboost'){ // Instruksi claim boost rewards
        await message.channel.send('## <:sparkles:1353870538141073558> Discord Role Booster Reward\nNama : \nColor Gradient : COLORID + COLORID\n\n`Note : Booster Hilang = Role Hilang`\n\nGunakan Command `/claimboosts` ingame untuk claim tags & rewards\nPilih Salah satu dari 3 Tags di dalam game nya <:sunglasses_smile:1353870545015410788>');
      }
    } catch(error){
      console.error(`[LOG] Error saat memproses prefix command "${command}":`, error);
    }
  },
};