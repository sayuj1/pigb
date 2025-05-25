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
      title={<Title level={4}>📅 Upcoming Bills</Title>}
      bordered={false}
      className="rounded-2xl shadow-md"
    >
      {bills.length === 0 ? (
        <Text type="secondary">No upcoming bills</Text>
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
