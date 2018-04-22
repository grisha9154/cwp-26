const Moment = require('moment');
const MomentRange = require('moment-range');
const twix = require('twix');
const { intersection } = require('lodash');
const moment = MomentRange.extendMoment(Moment);

module.exports = {
    isWorkPeriodActive,
    getCommonWorkHours
};

function isWorkPeriodActive({from, to, weekDays}, timezone) {
    if (!weekDays) return;

    const daysList = _getDaysArray(weekDays);

    return _dayInDaysList(daysList, timezone) && _timeInRange(from, to, timezone);
}

function getCommonWorkHours(user1, user2) {
    // Calculate of common working hours
    const momentsRangeSource = _getMomentsRangeFromUserWorkPeriod(
        user1.workPeriod.from,
        user1.workPeriod.to,
        user1.timezone
    );

    const momentsRangeCompare = _getMomentsRangeFromUserWorkPeriod(
        user2.workPeriod.from,
        user2.workPeriod.to,
        user2.timezone
    );

    const rangeSource = momentsRangeSource.start.twix(momentsRangeSource.end);
    const rangeCompare = momentsRangeCompare.start.tz(user1.timezone).twix(momentsRangeCompare.end.tz(user1.timezone));

    const commonHours = rangeSource.intersection(rangeCompare);

    // Calculate of common working days
    const daysSource = _getDaysArray(user1.workPeriod.weekDays);
    const daysCompare = _getDaysArray(user2.workPeriod.weekDays);

    const intersectionWorkDays = intersection(daysSource, daysCompare);

    return {
        hours: commonHours.simpleFormat('HH:mm'),
        days: intersectionWorkDays
    }
}

const _timeInRange = (from, to, timezone) => {
    const startDate = moment(from, 'HH:mm').tz(timezone);
    const endDate = moment(to, 'HH:mm').tz(timezone);
    const currentTzTime = moment().tz(timezone);

    return currentTzTime.isBetween(startDate, endDate);
};

const _dayInDaysList = (weekDaysArray, timezone) => {
    const momentTz = moment().tz(timezone);
    const currentDayWithTz = momentTz.format('dd');

    return weekDaysArray.includes(currentDayWithTz);
};

const _getMomentsRangeFromUserWorkPeriod = (from, to, timezone) => {
    return {
        start: moment.tz(from, 'HH:mm', timezone),
        end: moment.tz(to, 'HH:mm', timezone)
    }
};

const _getDaysArray = (days) => days.trim().split(', ');