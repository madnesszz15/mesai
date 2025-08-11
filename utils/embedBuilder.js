// utils/embedBuilder.js
const { EmbedBuilder } = require('discord.js');
const config = require('../settings.json');

module.exports = {
  buildMesaiEmbed() {
    return new EmbedBuilder()
      .setAuthor({
        name: `${config.settings.departmentName} Mesai Sistemi`,
        iconURL: config.settings.departmentLogo,
      })
      .setColor(config.settings.departmentColor)
      .setDescription(`👋 Merhaba! Buradan mesaiye giriş ve çıkış işlemlerini gerçekleştirebilirsiniz.\n\n🟢 **Mesaiye Gir:** Mesaiye başlamak için tıklayın.\n🔴 **Mesaiden Çık:** Mesaiyi sonlandırmak için tıklayın.\n\n⚠️ Oyunda değilseniz ve mesainizi açık bırakırsanız verileriniz silinebilir. Bu durumun tekrarı halinde ihraç edilebilirsiniz.`)
      .setImage(config.settings.departmentBanner);
  },
  buildLogEmbed(author, description) {
    return new EmbedBuilder()
      .setAuthor({
        name: `${config.settings.departmentName} Log`,
        iconURL: config.settings.departmentLogo,
      })
      .setColor('Red')
      .setDescription(description)
      .setImage(config.settings.departmentBanner);
  }
};
