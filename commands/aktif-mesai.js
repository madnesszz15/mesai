const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
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

module.exports = {
  data: new SlashCommandBuilder()
    .setName('aktif-mesai')
    .setDescription('Aktif mesai yapan kişilerin listesini gösterir'),

  async execute(interaction) {
    const mesaiVeri = mesaiVeriOku();

    // Mesai yapanlar: baslamaZamani dolu olanlar
    const aktifMesailer = Object.entries(mesaiVeri).filter(([kisiId, veri]) => veri.baslamaZamani);

    if (aktifMesailer.length === 0) {
      return interaction.reply({ content: 'Şu anda aktif mesai yapan kimse yok.', ephemeral: true });
    }

    let mesaj = '';

    for (const [kisiId, veri] of aktifMesailer) {
      const baslamaZamani = new Date(veri.baslamaZamani);
      const simdi = new Date();
      const farkMs = simdi - baslamaZamani;
      const farkSaat = Math.floor(farkMs / 1000 / 3600);
      const farkDakika = Math.floor((farkMs / 1000 % 3600) / 60);

      mesaj += `<@${kisiId}> - ${farkSaat} saat ${farkDakika} dakika\n`;
    }

    const embed = new EmbedBuilder()
      .setTitle('Aktif Mesai Yapanlar')
      .setDescription(mesaj)
      .setColor('#00FF00')
      .setTimestamp();

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
