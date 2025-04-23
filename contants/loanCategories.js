import {
  MdWork,
  MdHome,
  MdDirectionsCar,
  MdSchool,
  MdAttachMoney,
  MdHelpOutline,
} from "react-icons/md";

export const LOAN_CATEGORIES = [
  { value: "personal", label: "Personal", icon: <MdAttachMoney /> },
  { value: "business", label: "Business", icon: <MdWork /> },
  { value: "home", label: "Home", icon: <MdHome /> },
  { value: "car", label: "Car", icon: <MdDirectionsCar /> },
  { value: "education", label: "Education", icon: <MdSchool /> },
  { value: "other", label: "Other", icon: <MdHelpOutline /> },
];
