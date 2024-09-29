const moment = require('moment-timezone');

const ConvertTime = (availability, hostTimeZone, bookerTimeZone) => {
    const currentYear = new Date().getFullYear();
    const convertedAvailability = [];

    const nowInHostZone = moment.tz(hostTimeZone);

    for (let i = 0; i < availability.length; i++) {
        const { month, date, slots, _id: availabilityId } = availability[i];
        const validSlots = [];

        // Ensure month and date are zero-padded to conform to ISO format (e.g., "09" instead of "9")
        const formattedMonth = String(month).padStart(2, '0');
        const formattedDate = String(date).padStart(2, '0');

        slots.forEach(slot => {
            const { start, end, _id: slotId } = slot;

            // Construct date-time strings for start and end time
            let startTime = `${currentYear}-${formattedMonth}-${formattedDate}T${start.split(" ")[0]}:00`;
            let endTime = `${currentYear}-${formattedMonth}-${formattedDate}T${end.split(" ")[0]}:00`;

            // Convert host time to UTC first
            let utcStartTime = moment.tz(startTime, hostTimeZone).utc().format();
            let utcEndTime = moment.tz(endTime, hostTimeZone).utc().format();

            // Convert UTC to booker's timezone
            let convertedStartTime = moment.tz(utcStartTime, 'UTC').tz(bookerTimeZone).format();
            let convertedEndTime = moment.tz(utcEndTime, 'UTC').tz(bookerTimeZone).format();

            // Check if the start time is in the future based on the host's time zone
            let hostStartTimeMoment = moment.tz(startTime, hostTimeZone);
            if (hostStartTimeMoment.isAfter(nowInHostZone)) {
                // Push valid converted slots to the array
                validSlots.push({
                    _id: slotId,  // Keep the slot id
                    start: convertedStartTime,
                    end: convertedEndTime
                });
            }
        });

        // Only add the day if there are valid slots remaining
        if (validSlots.length > 0) {
            convertedAvailability.push({
                _id: availabilityId,  // Keep the availability id
                month,
                date,
                slots: validSlots
            });
        }
    }

    return convertedAvailability;
};

module.exports = ConvertTime;
