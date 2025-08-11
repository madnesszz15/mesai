const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const settings = require('../settings.json');

// BCSO CDN görsel linki
const BCSO_IMAGE = 'https://cdn.discordapp.com/attachments/1402782133294071960/1404223684071395502/SfEpW9L.png';

// Rütbe rollerin id'leri (örnek)
const rütbe_rol_id = [
  '1258776596110639217',
  '1258776591367143514',
  '1262029738524803173',
  '1262156146454560880',
  '1258776598669430784',
  '1258776622819967049',
  '1262156085402271835',
  '1262152416246366238',
  '1258777615808991283',
  '1259143816158511145',
  '1262835958223474859',
  '1258856732269084754',
  '1267618370136834159',
  '1266476435980423218',
  '1267618440034648166',
  '1258777943857954886',
  '1269714265489543200',
  '1403481246792683622',
  '1402740491262496850',
  '1258777951768547410',
];

// Mesai durum dosyasının yolu
const mesaiDurumPath = path.join(__dirname, '../mesaiDurum.json');

// Mesai verisini oku
function mesaiVeriOku() {
  try {
    const data = fs.readFileSync(mesaiDurumPath, 'utf8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

// Mesai verisini yaz
function mesaiVeriYaz(veri) {
  fs.writeFileSync(mesaiDurumPath, JSON.stringify(veri, null, 2));
}

// Rol ID'sine göre rozet ve isim döndür
function rozetEmojiVeIsim(rolId) {
  switch (rolId) {
    case '1267618370136834159': return '⭐ Sergeant';
    case '1403481246792683622': return '🌟 Division Chief';
    case '1258776596110639217': return '🛡️ Deputy';
    default: return `<@&${rolId}>`;
  }
}

// Süre formatlama fonksiyonu
function formatSure(saniye) {
  const gun = Math.floor(saniye / 86400);
  saniye %= 86400;
  const saat = Math.floor(saniye / 3600);
  saniye %= 3600;
  const dakika = Math.floor(saniye / 60);
  saniye %= 60;
  return { gun, saat, dakika, saniye };
}

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    try {
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        await command.execute(interaction, client);
      }

      if (interaction.isButton()) {
        const logChannelId = settings.bot.status.logChannelId;
        const logChannel = client.channels.cache.get(logChannelId);
        if (!logChannel) {
          return interaction.reply({ content: 'Log kanalı bulunamadı!', ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        const userId = interaction.user.id;
        const mesaiVeri = mesaiVeriOku();
        const userMesai = mesaiVeri[userId] || { baslamaZamani: null, ilkGirisZamani: null, toplamSure: 0 };

        const memberRoles = interaction.member.roles.cache;
        const kullaniciRolleri = rütbe_rol_id.filter(rolId => memberRoles.has(rolId));
        const rozetMentions = kullaniciRolleri.length > 0
          ? kullaniciRolleri.map(id => rozetEmojiVeIsim(id)).join(', ')
          : 'Rol bulunamadı';

        // MESAI BAŞLA
        if (interaction.customId === 'mesai_basla') {
          if (userMesai.baslamaZamani) {
            return interaction.editReply({ content: 'Mesainiz zaten açık!' });
          }

          const now = Date.now();

          userMesai.baslamaZamani = now;

          // Eğer ilk giriş zamanı yoksa kaydet
          if (!userMesai.ilkGirisZamani) {
            userMesai.ilkGirisZamani = now;
          }

          mesaiVeri[userId] = userMesai;
          mesaiVeriYaz(mesaiVeri);

          const toplamSureFormatted = formatSure(userMesai.toplamSure);
          const toplamSureMetin = `${toplamSureFormatted.gun} gün ${toplamSureFormatted.saat} saat ${toplamSureFormatted.dakika} dakika ${toplamSureFormatted.saniye} saniye`;

          const simdi = new Date();

          const userEmbed = new EmbedBuilder()
            .setTitle('Mesai Başlatıldı')
            .setDescription(
              `**Kişi:** <@${userId}>\n` +
              `**Rozet:** ${rozetMentions}\n` +
              `**Başlama Tarihi:** ${simdi.toLocaleString('tr-TR')}\n` +
              `**Toplam Mesai:** ${toplamSureMetin}`
            )
            .setColor('Green')
            .setImage(BCSO_IMAGE)
            .setFooter({ text: `By Alberto Cali • ${simdi.toLocaleTimeString('tr-TR')}` });

          await interaction.editReply({ embeds: [userEmbed] });
          await logChannel.send({ embeds: [userEmbed] });

          return;
        }

        // MESAI BITIR
        if (interaction.customId === 'mesai_bitir') {
          if (!userMesai.baslamaZamani) {
            return interaction.editReply({ content: 'Mesainiz zaten kapalı!' });
          }

          const now = Date.now();
          const farkMs = now - userMesai.baslamaZamani;
          const farkSaniye = Math.floor(farkMs / 1000);

          userMesai.toplamSure += farkSaniye;
          userMesai.baslamaZamani = null;
          mesaiVeri[userId] = userMesai;
          mesaiVeriYaz(mesaiVeri);

          const eklenenFormatted = formatSure(farkSaniye);
          const eklenenMetin = `${eklenenFormatted.gun} gün ${eklenenFormatted.saat} saat ${eklenenFormatted.dakika} dakika ${eklenenFormatted.saniye} saniye`;

          const toplamFormatted = formatSure(userMesai.toplamSure);
          const toplamMetin = `${toplamFormatted.gun} gün ${toplamFormatted.saat} saat ${toplamFormatted.dakika} dakika ${toplamFormatted.saniye} saniye`;

          const bitisTarihi = new Date();

          const userEmbed = new EmbedBuilder()
            .setTitle('Mesai Sonlandırıldı')
            .setDescription(
              `**Kişi:** <@${userId}>\n` +
              `**Rozet:** ${rozetMentions}\n` +
              `**Bitiş Tarihi:** ${bitisTarihi.toLocaleString('tr-TR')}\n` +
              `**Eklenen Mesai:** ${eklenenMetin}\n` +
              `**Toplam Mesai:** ${toplamMetin}`
            )
            .setColor('Red')
            .setImage(BCSO_IMAGE)
            .setFooter({ text: `By Alberto Cali • ${bitisTarihi.toLocaleTimeString('tr-TR')}` });

          await interaction.editReply({ embeds: [userEmbed] });
          await logChannel.send({ embeds: [userEmbed] });

          return;
        }

        // MESAI BILGI
        if (interaction.customId === 'bilgilendirme') {
          if (!userMesai.ilkGirisZamani && userMesai.toplamSure === 0) {
            return interaction.editReply({ content: 'Henüz mesai bilgisi bulunmamaktadır!' });
          }

          const baslamaTarihi = userMesai.ilkGirisZamani ? new Date(userMesai.ilkGirisZamani) : null;
          const toplamSureFormatted = formatSure(userMesai.toplamSure);

          const bilgiEmbed = new EmbedBuilder()
            .setTitle('Mesai Bilgileri')
            .setDescription(`Merhaba <@${userId}>! Aşağıdan gerekli bilgileri görebilirsin!`)
            .setColor('#ffa500');

          if (baslamaTarihi) {
            bilgiEmbed.addFields({
              name: 'Mesaiye İlk Giriş Tarihi',
              value: baslamaTarihi.toLocaleString('tr-TR'),
            });
          } else {
            bilgiEmbed.addFields({
              name: 'Mesaiye İlk Giriş Tarihi',
              value: 'Henüz mesaiye giriş yapılmamış.',
            });
          }

          bilgiEmbed.addFields({
            name: 'Toplam Mesai',
            value: `${toplamSureFormatted.gun} gün ${toplamSureFormatted.saat} saat ${toplamSureFormatted.dakika} dakika ${toplamSureFormatted.saniye} saniye`,
          });

          bilgiEmbed.setImage(BCSO_IMAGE);
          bilgiEmbed.setFooter({ text: `By Alberto Cali • ${new Date().toLocaleString('tr-TR')}` });

          await interaction.editReply({ embeds: [bilgiEmbed] });

          return;
        }

        // Eğer bilinmeyen buton ID'si ise burada bilgi ver
        await interaction.editReply({ content: `Bilinmeyen buton: ${interaction.customId}` });
      }
    } catch (error) {
      console.error('interactionCreate hatası:', error);
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply('Bir hata oluştu!');
      } else {
        await interaction.reply({ content: 'Bir hata oluştu!', ephemeral: true });
      }
    }
  }
};
