import moment from "moment";

export const weekdayFirstUpper = (m: moment.Moment) => m.format('dddd')[0].toUpperCase() + m.format('dddd').slice(1);