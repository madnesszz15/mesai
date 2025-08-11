const { SlashCommandBuilder } = require('discord.js');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const config = require('../settings.json');
const { Mesai } = require('../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mesai-bitir')
    .setDescription('Seçilen kullanıcının mesaisini sonlandırır.')
    .addUserOption(option =>
      option.setName('kullanici')
        .setDescription('Mesaisi bitirilecek kullanıcı.')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('secenek')
        .setDescription('Kullanıcının mesai süresi toplam süresine eklensin mi?')
        .setRequired(true)
        .addChoices(
          { name: 'Ekle', value: 'ekle' },
          { name: 'Ekleme', value: 'ekleme' }
        )
    )
    .addStringOption(option =>
      option.setName('sebep')
        .setDescription('Mesai bitirme sebebi.')
        .setRequired(false)
    ),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: 'Bu komutu kullanabilmek için `Yönetici` yetkisine sahip olmalısınız.',
        ephemeral: true,
      });
    }

    const target = interaction.options.getUser('kullanici');
    const secenek = interaction.options.getString('secenek');
    const sebep = interaction.options.getString('sebep') ?? 'Sebep belirtilmedi.';

    const mesaiDurumu = await Mesai.findOne({ userID: target.id });

    if (!mesaiDurumu || !mesaiDurumu.mesaiDurumu) {
      return interaction.reply({
        content: 'Bu kullanıcı şu anda mesaide değil.',
        ephemeral: true,
      });
    }

    const mesaiBitirmeZamani = Math.floor(Date.now() / 1000);
    const toplamMesai = mesaiDurumu.toplamMesai;
    const eklenenSure = new Date() - new Date(mesaiDurumu.mesaiGiris * 1000);
    const yeniToplamMesai = secenek === 'ekle' ? toplamMesai + eklenenSure : toplamMesai;

    mesaiDurumu.toplamMesai = yeniToplamMesai;
    mesaiDurumu.mesaiDurumu = false;
    mesaiDurumu.mesaiGiris = 0;
    await mesaiDurumu.save();

    const dmMesaj = `Merhaba, <@${interaction.user.id}> tarafından mesainiz sonlandırıldı. Lütfen yeniden mesaiye giriş yapınız.\n\n⏰・**Mesai Bitiş Zamanı:** <t:${mesaiBitirmeZamani}:R>\n\n⚠️・*Unutmayınız, emek olmadan yemek olmaz.*`;
    const logMesaj = `**Mesaiyi Bitiren Yönetici:** <@${interaction.user.id}>\n**Mesaisi Bitirilen Kullanıcı:** <@${target.id}>\n**Kullanıcı Rozeti:** ${getMemberBadge(interaction.member)}\n**Mesai Bitirme Sebebi:** ${sebep}\n**Toplam Mesai Süresi:** ${timeDifference2(yeniToplamMesai)}`;

    const targetDmEmbed = new EmbedBuilder()
      .setAuthor({
        name: `${config.settings.departmentName} Mesai Sistemi`,
        iconURL: config.settings.departmentLogo,
      })
      .setColor('Red')
      .setDescription(dmMesaj)
      .setImage(config.settings.departmentBanner);

    await target.send({ embeds: [targetDmEmbed] });

    const logChannel = interaction.client.channels.cache.get(config.settings.channels.denetim);
    const logEmbed = new EmbedBuilder()
      .setAuthor({
        name: `${config.settings.departmentName} Mesai Bitirme Log`,
        iconURL: config.settings.departmentLogo,
      })
      .setColor('Red')
      .setDescription(logMesaj)
      .setImage(config.settings.departmentBanner);

    logChannel.send({ embeds: [logEmbed] });

    await interaction.reply({
      content: 'Kullanıcının mesai süresi başarıyla sonlandırıldı.',
      ephemeral: true,
    });
  }
};

function timeDifference2(ms) {
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  const daysms = ms % (24 * 60 * 60 * 1000);
  const hours = Math.floor(daysms / (60 * 60 * 1000));
  const hoursms = ms % (60 * 60 * 1000);
  const minutes = Math.floor(hoursms / (60 * 1000));
  const minutesms = ms % (60 * 1000);
  const sec = Math.floor(minutesms / 1000);
  return `${days} Gün ${hours} Saat ${minutes} Dakika ${sec} Saniye`;
}

function getMemberBadge(member) {
  const roles = member.roles.cache
    .sort((a, b) => b.position - a.position)
    .values();
  for (const role of roles) {
    if (config.settings.roles.officers.includes(role.id)) {
      return `<@&${role.id}>`;
    }
  }
  return 'Rozet bulunamadı.';
}
