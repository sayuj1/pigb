import { MdCallReceived, MdCallMade } from "react-icons/md";

export const LOAN_TYPES = [
  {
    label: "Taken",
    value: "taken",
    icon: <MdCallReceived />,
    color: "#FFF3E0", // light orange
  },
  {
    label: "Given",
    value: "given",
    icon: <MdCallMade />,
    color: "#E8F5E9", // light green
  },
];
