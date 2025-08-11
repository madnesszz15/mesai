const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mesai')
    .setDescription('Mesai giriş çıkış sistemini gösterir'),

  async execute(interaction) {
    // Tarihi ve saati al
    const now = new Date();
    const tarih = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth()+1).toString().padStart(2, '0')}.${now.getFullYear()}`;
    const saat = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const embed = new EmbedBuilder()
      .setTitle('📋 Blain County Sheriff Office')
      .setDescription(`**Mesai Sistemi**\n\n Merhabalar, mesaiye girmek ve çıkmak için aşağıdaki butonları kullanabilirsiniz.\n\n Oyuna girdikten sonra mesainizi açmanız, oyundan çıktıktan sonra mesainizi kapatmanız gerekmektedir. Mesainizi açık unutursanız strike vb. durumlar ile karşılaşabilirsiniz.`)
      .setImage('https://cdn.discordapp.com/attachments/1402782133294071960/1404223684071395502/SfEpW9L.png?ex=689a68b7&is=68991737&hm=dd796984cd7c46e0b0e6a5d67cedd2f9e5f710419b0d8772036b8a01aaf3a4f7&') // logo URL'sini buraya koy
      .setFooter({ text: `by Alberto Cali– ${tarih} ${saat}` });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('mesai_basla')
          .setLabel('Mesai Giriş')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('mesai_bitir')
          .setLabel('Mesai Bitir')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('bilgilendirme')
          .setLabel('Bilgilendirme')
          .setStyle(ButtonStyle.Primary),
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
