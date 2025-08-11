const { getConfig } = require('./configLoader');
const config = getConfig();

function timeDifference2(ms) {
  var days = Math.floor(ms / (24 * 60 * 60 * 1000));
  var daysms = ms % (24 * 60 * 60 * 1000);
  var hours = Math.floor(daysms / (60 * 60 * 1000));
  var hoursms = ms % (60 * 60 * 1000);
  var minutes = Math.floor(hoursms / (60 * 1000));
  var minutesms = ms % (60 * 1000);
  var sec = Math.floor(minutesms / 1000);
  var t = days + ' Gün ' + hours + ' Saat ' + minutes + ' Dakika ' + sec + ' Saniye';
  return t;
}

function timeDifference(date1, date2) {
  var difference = date1.getTime() - date2.getTime();

  var daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24);
  difference -= daysDifference * 1000 * 60 * 60 * 24;

  var hoursDifference = Math.floor(difference / 1000 / 60 / 60);
  difference -= hoursDifference * 1000 * 60 * 60;

  var minutesDifference = Math.floor(difference / 1000 / 60);
  difference -= minutesDifference * 1000 * 60;

  var secondsDifference = Math.floor(difference / 1000);

  return ` ${daysDifference} Gün ${hoursDifference} Saat ${minutesDifference} Dakika ${secondsDifference} Saniye`.replace(
    / 0 (Gün|Saat|Dakika|Saniye)/g,
    ''
  );
}

function getMemberBadge(member) {
  const roles = member.roles.cache
    .sort((a, b) => b.position - a.position)
    .values();
  for (const role of roles) {
    for (let i = 0; i < config.settings.roles.officers.length; i++) {
      if (role.id === config.settings.roles.officers[i]) {
        return `<@&${role.id}>`;
      }
    }
  }
  return 'Rozet bulunamadı.';
}

module.exports = { timeDifference2, timeDifference, getMemberBadge };
