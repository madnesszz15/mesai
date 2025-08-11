const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rütbe-ayarla')
    .setDescription('Bir kullanıcının rütbesini yükselt veya düşür.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addUserOption(option =>
      option.setName('kullanıcı')
        .setDescription('Rütbesini değiştireceğin kişi')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('işlem')
        .setDescription('Rütbe arttır mı düşür mü?')
        .addChoices(
          { name: 'Yükselt', value: 'yukselt' },
          { name: 'Düşür', value: 'dusur' }
        )
        .setRequired(true)
    )
    .addRoleOption(option =>
      option.setName('yeni_rütbe')
        .setDescription('Yeni atanacak rütbe rolü')
        .setRequired(true)
    ),

  async execute(interaction) {
    const hedefUser = interaction.options.getUser('kullanıcı');
    const işlem = interaction.options.getString('işlem');
    const yeniRütbe = interaction.options.getRole('yeni_rütbe');

    const guild = interaction.guild;
    const member = await guild.members.fetch(hedefUser.id);
    const yetkili = interaction.user;

    // Rütbe rollerinin ID'leri (bunları sen tanımlamalısın)
    const rutbeRolleri = [
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
      '1402740231236485120',
      '1402740409150472202',
      // Bu listeye tüm rütbe rol ID'lerini sırayla ekle
    ];

    // Eski rütbeyi bul
    const eskiRütbe = member.roles.cache.find(role => rutbeRolleri.includes(role.id));

    try {
      if (eskiRütbe) {
        await member.roles.remove(eskiRütbe);
      }
      await member.roles.add(yeniRütbe);
    } catch (err) {
      console.error(err);
      return await interaction.reply({ content: '❌ Rütbe değiştirilemedi. Yetki eksik olabilir.', ephemeral: true });
    }

    // Log mesajı
    const logKanalId = '1402782107134070887'; // 👈 BURAYA log kanalının ID’sini koy
    const logKanalı = guild.channels.cache.get(logKanalId);

const mesaj = işlem === 'yukselt'
  ? `📈 ${hedefUser} kişisi, ${eskiRütbe ? `<@&${eskiRütbe.id}>` : '*eski rütbe yok*'} rütbesinden <@&${yeniRütbe.id}> rütbesine, ${yetkili} tarafından **terfi ettirilmiştir.**`
  : `📉 ${hedefUser} kişisi, ${eskiRütbe ? `<@&${eskiRütbe.id}>` : '*eski rütbe yok*'} rütbesinden <@&${yeniRütbe.id}> rütbesine, ${yetkili} tarafından **düşürülmüştür.**`;

    if (logKanalı) {
      await logKanalı.send(mesaj);
    }

    await interaction.reply({
      content: `✅ ${hedefUser} kişisinin rütbesi başarıyla ayarlandı.`,
      ephemeral: true
    });
  }
};
