import { useEffect, useState } from "react";
import { format, differenceInDays, isPast } from "date-fns";
import { Card, List, Tag, Typography, Space, Divider } from "antd";
import {
  PiMoneyDuotone,
  PiCalendarDuotone,
  PiWarningCircleDuotone,
} from "react-icons/pi";

const { Text, Title } = Typography;

const formatAmount = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const getStatusTag = (dueDate) => {
  const now = new Date();
  const diff = differenceInDays(new Date(dueDate), now);

  if (isPast(new Date(dueDate))) {
    return <Tag color="red">Overdue</Tag>;
  } else if (diff <= 3) {
    return <Tag color="orange">Due Soon</Tag>;
  }
  return <Tag color="blue">Upcoming</Tag>;
};

export default function UpcomingBillsList() {
  const [bills, setBills] = useState([]);

  useEffect(() => {
    fetch(`/api/dashboard/upcoming-bills-list`)
      .then((r) => r.json())
      .then((json) => setBills(json.bills || []));
  }, []);

  return (
    <Card
      title={
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <Title level={4} className="!mb-0 flex items-center gap-2">
            📅 Upcoming Bills
          </Title>
          <span className="text-sm text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-md">
            In the Next 7 Days
          </span>
        </div>
      }
      bordered={false}
      className="rounded-2xl shadow-md"
    >
      {bills.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400 text-center select-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mb-4 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7V3m8 4V3m-9 8h10m-9 4h5m-3 4h6a2 2 0 002-2v-9a2 2 0 00-2-2H6a2 2 0 00-2 2v9a2 2 0 002 2z"
            />
          </svg>
          <h3 className="text-base font-semibold text-gray-500 mb-1">
            No Upcoming Bills
          </h3>
          <p className="text-sm max-w-xs">
            You have no bills due soon. New bills will show up here
            automatically as their due dates approach.
          </p>
        </div>
      ) : (
        <List
          dataSource={bills}
          split
          renderItem={(bill, index) => (
            <>
              {index > 0 && <Divider className="my-2" />}
              <List.Item className="flex flex-col items-start sm:flex-row sm:justify-between sm:items-center gap-2">
                <div>
                  <Text strong className="text-lg">
                    {bill.name}
                  </Text>
                  <div className="flex items-center gap-2 mt-1">
                    <PiMoneyDuotone className="text-green-600" />
                    <Text>{formatAmount(bill.amount)}</Text>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <PiCalendarDuotone className="text-blue-500" />
                    <Text>
                      {format(new Date(bill.dueDate), "EEE, MMM d, yyyy")}
                    </Text>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  <PiWarningCircleDuotone className="text-gray-400" />
                  {getStatusTag(bill.dueDate)}
                </div>
              </List.Item>
            </>
          )}
        />
      )}
    </Card>
  );
}
