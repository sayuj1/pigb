import * as PhIcons from "react-icons/pi";
import {
  MdHome,
  MdSchool,
  MdBusinessCenter,
  MdDirectionsCar,
  MdPerson,
  MdCategory,
  MdCallReceived,
  MdCallMade,
} from "react-icons/md";

export const getIconComponent = (iconName) => {
  return PhIcons[iconName] || PhIcons.PiMoneyWavyDuotone; // Default icon if not found
};

export const CATEGORY_ICONS = {
  home: <MdHome />,
  education: <MdSchool />,
  business: <MdBusinessCenter />,
  car: <MdDirectionsCar />,
  personal: <MdPerson />,
  other: <MdCategory />,
};

export const LOAN_TYPE_ICONS = {
  taken: <MdCallReceived />,
  given: <MdCallMade />,
};
