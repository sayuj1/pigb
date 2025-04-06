import * as PhIcons from "react-icons/pi";

export const getIconComponent = (iconName) => {
  return PhIcons[iconName] || PhIcons.PiMoneyWavyDuotone; // Default icon if not found
};

// export default getIconComponent;