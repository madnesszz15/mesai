const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const fs = require('fs');
const path = require('path');

const mesaiDurumPath = path.join(__dirname, '../mesaiDurum.json');

function mesaiVeriOku() {
  try {
    const data = fs.readFileSync(mesaiDurumPath, 'utf8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

function formatSure(saniye) {
  let toplam = saniye;
  const gun = Math.floor(toplam / 86400);
  toplam %= 86400;
  const saat = Math.floor(toplam / 3600);
  toplam %= 3600;
  const dakika = Math.floor(toplam / 60);
  const saniyeKalan = toplam % 60;
  return `${gun} gün ${saat} saat ${dakika} dakika ${saniyeKalan} saniye`;
}

function createEmbed(mesaiListesi, sayfa) {
  const basIndex = sayfa * 10;
  const slice = mesaiListesi.slice(basIndex, basIndex + 10);

  let mesaj = '';
  slice.forEach((kisi, index) => {
    mesaj += `**${basIndex + index + 1}.** <@${kisi.kisiId}> — ${formatSure(kisi.toplamSure)}\n`;
  });

  return new EmbedBuilder()
    .setTitle('Mesai Sıralaması (En Çok Mesai Yapanlar)')
    .setDescription(mesaj || 'Mesai verisi bulunamadı.')
    .setColor('#00AAFF')
    .setTimestamp();
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mesai-siralaması')
    .setDescription('Son sıfırlamadan sonra en çok mesai yapanların listesini gösterir'),

  async execute(interaction) {
    const mesaiVeri = mesaiVeriOku();

    const mesaiListesi = Object.entries(mesaiVeri).map(([kisiId, veri]) => ({
      kisiId,
      toplamSure: veri.toplamSure || 0
    }));

    if (mesaiListesi.length === 0) {
      return interaction.reply({ content: 'Mesai verisi bulunamadı.', ephemeral: true });
    }

    mesaiListesi.sort((a, b) => b.toplamSure - a.toplamSure);

    let sayfa = 0;
    const toplamSayfa = Math.ceil(mesaiListesi.length / 10);

    const embed = createEmbed(mesaiListesi, sayfa);

    // Butonlar (eğer 1 sayfadan fazlaysa)
    const row = new ActionRowBuilder();

    if (toplamSayfa > 1) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId('sol')
          .setLabel('◀️')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true), // Başlangıçta sol buton kapalı

        new ButtonBuilder()
          .setCustomId('sag')
          .setLabel('▶️')
          .setStyle(ButtonStyle.Primary)
      );
    }

    const mesaj = await interaction.reply({
      embeds: [embed],
      components: toplamSayfa > 1 ? [row] : [],
      ephemeral: true
    });

    if (toplamSayfa <= 1) return; // Sayfa yoksa butonları gösterme

    // Buton etkileşimleri için collector
    const collector = mesaj.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 120000 // 2 dakika boyunca aktif
    });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: 'Bu butonu sadece komutu kullanan kişi kullanabilir.', ephemeral: true });
      }

      if (i.customId === 'sag') {
        sayfa++;
      } else if (i.customId === 'sol') {
        sayfa--;
      }

      // Buton durumları
      const solDisabled = sayfa === 0;
      const sagDisabled = sayfa === toplamSayfa - 1;

      const yeniEmbed = createEmbed(mesaiListesi, sayfa);
      const yeniRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('sol')
          .setLabel('◀️')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(solDisabled),

        new ButtonBuilder()
          .setCustomId('sag')
          .setLabel('▶️')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(sagDisabled)
      );

      await i.update({ embeds: [yeniEmbed], components: [yeniRow] });
    });

    collector.on('end', async () => {
      // Zaman dolunca butonları pasif yap
      if (!mesaj.deleted) {
        const pasifRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('sol')
            .setLabel('◀️')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId('sag')
            .setLabel('▶️')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true)
        );
        mesaj.edit({ components: [pasifRow] });
      }
    });
  }
};
