const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const settings = require('../settings.json');

const mesaiDurumPath = path.join(__dirname, '../mesaiDurum.json');

function mesaiVeriOku() {
  try {
    const data = fs.readFileSync(mesaiDurumPath, 'utf8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

function mesaiVeriYaz(veri) {
  fs.writeFileSync(mesaiDurumPath, JSON.stringify(veri, null, 2));
}

const yetkiliRolId = settings.bot.status.yetkiliRolId;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mesai-ayarla')
    .setDescription('Mesai süresi ekle, çıkar veya sıfırla')
    .addStringOption(option =>
      option.setName('işlem')
        .setDescription('İşlem türü')
        .setRequired(true)
        .addChoices(
          { name: 'Ekle', value: 'ekle' },
          { name: 'Çıkar', value: 'çıkar' },
          { name: 'Sıfırla', value: 'sıfırla' }
        ))
    .addUserOption(option =>
      option.setName('kullanıcı')
        .setDescription('Mesai ayarlanacak kişi')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('birim')
        .setDescription('Mesai birimi (sadece ekle veya çıkar için)')
        .addChoices(
          { name: 'Gün', value: 'gun' },
          { name: 'Saat', value: 'saat' },
          { name: 'Dakika', value: 'dakika' }
        )
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('miktar')
        .setDescription('Mesai miktarı (sadece ekle veya çıkar için)')
        .setMinValue(1)
        .setRequired(false)),

  async execute(interaction, client) {
    await interaction.member.fetch();

    // Yetkili rol kontrolü
    if (!interaction.member.roles.cache.has(yetkiliRolId)) {
      return interaction.reply({ content: 'Bu işlemi yapmak için yetkiniz yok.', ephemeral: true });
    }

    const işlem = interaction.options.getString('işlem');
    const kullanıcı = interaction.options.getUser('kullanıcı');
    const birim = interaction.options.getString('birim');
    const miktar = interaction.options.getInteger('miktar');

    const mesaiLogChannel = client.channels.cache.get(settings.bot.status.mesaiLogChannelId);
    if (!mesaiLogChannel) {
      return interaction.reply({ content: 'Mesai log kanalı bulunamadı!', ephemeral: true });
    }

    if ((işlem === 'ekle' || işlem === 'çıkar') && (!birim || !miktar)) {
      return interaction.reply({ content: 'Eklemek veya çıkarmak için birim ve miktar girmeniz gerekiyor.', ephemeral: true });
    }

    let mesaiVeri = mesaiVeriOku();
    if (!mesaiVeri[kullanıcı.id]) {
      mesaiVeri[kullanıcı.id] = { baslamaZamani: null, toplamSure: 0 };
    }

    let toplamSure = mesaiVeri[kullanıcı.id].toplamSure || 0;
    let miktarSaniye = 0;

    if (birim === 'gun') miktarSaniye = miktar * 86400;
    else if (birim === 'saat') miktarSaniye = miktar * 3600;
    else if (birim === 'dakika') miktarSaniye = miktar * 60;

    if (işlem === 'ekle') {
      toplamSure += miktarSaniye;
    } else if (işlem === 'çıkar') {
      toplamSure -= miktarSaniye;
      if (toplamSure < 0) toplamSure = 0;
    } else if (işlem === 'sıfırla') {
      toplamSure = 0;
    }

    mesaiVeri[kullanıcı.id].toplamSure = toplamSure;
    mesaiVeriYaz(mesaiVeri);

    let kalan = toplamSure;
    const gun = Math.floor(kalan / 86400);
    kalan %= 86400;
    const saat = Math.floor(kalan / 3600);
    kalan %= 3600;
    const dakika = Math.floor(kalan / 60);
    const saniye = kalan % 60;

    const embed = new EmbedBuilder()
      .setColor(işlem === 'ekle' ? 0x2ECC71 : işlem === 'çıkar' ? 0xE74C3C : 0x95A5A6)
      .setTitle(`📌 Mesai ${işlem.charAt(0).toUpperCase() + işlem.slice(1)}`)
      .setDescription(
        `👤 **Kişi:** <@${kullanıcı.id}>\n` +
        `🎖️ **Yetkili:** <@${interaction.user.id}>\n` +
        (işlem !== 'sıfırla' ? `⏱️ **${işlem === 'ekle' ? 'Eklenen' : 'Çıkarılan'} Miktar:** ${miktar} ${birim}\n` : '') +
        `🕒 **Toplam Mesai:** ${gun} gün ${saat} saat ${dakika} dakika ${saniye} saniye`
      )
      .setImage('https://cdn.discordapp.com/attachments/1402782133294071960/1404223684071395502/SfEpW9L.png')
      .setFooter({ text: `by ${interaction.user.globalName || interaction.user.username} • ${new Date().toLocaleString('tr-TR')}` });

    await mesaiLogChannel.send({ embeds: [embed] });
    return interaction.reply({ content: 'İşlem başarıyla tamamlandı.', ephemeral: true });
  }
};
