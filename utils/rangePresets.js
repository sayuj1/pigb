import dayjs from "dayjs";

const rangePresets = [
  { label: "Today", value: [dayjs().startOf("day"), dayjs().endOf("day")] },
  {
    label: "Yesterday",
    value: [
      dayjs().subtract(1, "day").startOf("day"),
      dayjs().subtract(1, "day").endOf("day"),
    ],
  },
  {
    label: "This Week",
    value: [dayjs().startOf("week"), dayjs().endOf("week")],
  },
  {
    label: "Last Week",
    value: [
      dayjs().subtract(1, "week").startOf("week"),
      dayjs().subtract(1, "week").endOf("week"),
    ],
  },
  {
    label: "This Month",
    value: [dayjs().startOf("month"), dayjs().endOf("month")],
  },
  {
    label: "Last Month",
    value: [
      dayjs().subtract(1, "month").startOf("month"),
      dayjs().subtract(1, "month").endOf("month"),
    ],
  },
  { label: "Last 7 Days", value: [dayjs().subtract(7, "day"), dayjs()] },
  { label: "Last 14 Days", value: [dayjs().subtract(14, "day"), dayjs()] },
  { label: "Last 30 Days", value: [dayjs().subtract(30, "day"), dayjs()] },
  { label: "Last 90 Days", value: [dayjs().subtract(90, "day"), dayjs()] },
  { label: "Year to Date", value: [dayjs().startOf("year"), dayjs()] },
];

export default rangePresets;
