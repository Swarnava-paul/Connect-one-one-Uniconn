const moment = require('moment-timezone');

const ConvertTimeZoneToUtc = (time,timeZone) => {
// Convert user time to UTC
const utcTime = moment.tz(time, timeZone).utc().format();
return utcTime;
}

module.exports = ConvertTimeZoneToUtc;