const defaultCategories = [
  // Income
  { name: "Salary", type: "income", isDefault: true, icon: "💼" },
  { name: "Business Income", type: "income", isDefault: true, icon: "🏢" },
  { name: "Freelancing", type: "income", isDefault: true, icon: "🖥️" },
  { name: "Investments", type: "income", isDefault: true, icon: "📈" },
  { name: "Rental Income", type: "income", isDefault: true, icon: "🏠" },
  { name: "Gifts", type: "income", isDefault: true, icon: "🎁" },
  { name: "Bonuses", type: "income", isDefault: true, icon: "🎉" },
  { name: "Refunds", type: "income", isDefault: true, icon: "🔄" },
  { name: "Other Income", type: "income", isDefault: true, icon: "❓" },

  // Expense
  {
    name: "Household & Utilities",
    type: "expense",
    isDefault: true,
    icon: "🏠",
  },
  { name: "Rent/Mortgage", type: "expense", isDefault: true, icon: "🏡" },
  { name: "Electricity", type: "expense", isDefault: true, icon: "⚡" },
  { name: "Water", type: "expense", isDefault: true, icon: "🚰" },
  { name: "Internet & Cable", type: "expense", isDefault: true, icon: "📡" },
  { name: "Mobile/Phone Bill", type: "expense", isDefault: true, icon: "📱" },
  { name: "Gas", type: "expense", isDefault: true, icon: "⛽" },

  { name: "Transportation", type: "expense", isDefault: true, icon: "🚗" },
  { name: "Fuel", type: "expense", isDefault: true, icon: "⛽" },
  { name: "Public Transport", type: "expense", isDefault: true, icon: "🚌" },
  { name: "Taxi/Rideshare", type: "expense", isDefault: true, icon: "🚕" },
  { name: "Car Maintenance", type: "expense", isDefault: true, icon: "🔧" },
  { name: "Parking", type: "expense", isDefault: true, icon: "🅿️" },

  { name: "Food & Dining", type: "expense", isDefault: true, icon: "🍽️" },
  { name: "Groceries", type: "expense", isDefault: true, icon: "🛒" },
  { name: "Restaurants", type: "expense", isDefault: true, icon: "🍔" },
  { name: "Coffee & Snacks", type: "expense", isDefault: true, icon: "☕" },
  { name: "Fast Food", type: "expense", isDefault: true, icon: "🍟" },
  { name: "Delivery & Takeout", type: "expense", isDefault: true, icon: "📦" },

  { name: "Healthcare", type: "expense", isDefault: true, icon: "🏥" },
  { name: "Doctor Visits", type: "expense", isDefault: true, icon: "👩‍⚕️" },
  {
    name: "Medicines & Pharmacy",
    type: "expense",
    isDefault: true,
    icon: "💊",
  },
  { name: "Health Insurance", type: "expense", isDefault: true, icon: "🩺" },
  { name: "Dental Care", type: "expense", isDefault: true, icon: "🦷" },
  { name: "Eye Care", type: "expense", isDefault: true, icon: "👓" },

  {
    name: "Entertainment & Leisure",
    type: "expense",
    isDefault: true,
    icon: "🎉",
  },
  { name: "Movies & Streaming", type: "expense", isDefault: true, icon: "🎬" },
  {
    name: "Games & Subscriptions",
    type: "expense",
    isDefault: true,
    icon: "🎮",
  },
  { name: "Concerts & Events", type: "expense", isDefault: true, icon: "🎭" },
  { name: "Hobbies", type: "expense", isDefault: true, icon: "🎨" },
  { name: "Books", type: "expense", isDefault: true, icon: "📚" },

  { name: "Shopping", type: "expense", isDefault: true, icon: "🛍️" },
  { name: "Clothing", type: "expense", isDefault: true, icon: "👗" },
  { name: "Accessories", type: "expense", isDefault: true, icon: "💍" },
  { name: "Electronics", type: "expense", isDefault: true, icon: "📱" },
  { name: "Home Decor", type: "expense", isDefault: true, icon: "🛏️" },

  { name: "Travel", type: "expense", isDefault: true, icon: "✈️" },
  { name: "Flights", type: "expense", isDefault: true, icon: "🛫" },
  { name: "Hotels", type: "expense", isDefault: true, icon: "🏨" },
  { name: "Local Transport", type: "expense", isDefault: true, icon: "🚖" },
  { name: "Travel Insurance", type: "expense", isDefault: true, icon: "🛡️" },

  {
    name: "Education & Learning",
    type: "expense",
    isDefault: true,
    icon: "📚",
  },
  { name: "School/College Fees", type: "expense", isDefault: true, icon: "🏫" },
  { name: "Online Courses", type: "expense", isDefault: true, icon: "💻" },
  {
    name: "Books & Study Materials",
    type: "expense",
    isDefault: true,
    icon: "📖",
  },

  { name: "Loans & Debt", type: "expense", isDefault: true, icon: "🏦" },
  { name: "Loan EMI", type: "expense", isDefault: true, icon: "📑" },
  { name: "Credit Card Payment", type: "expense", isDefault: true, icon: "💳" },
  {
    name: "Personal Loan Repayment",
    type: "expense",
    isDefault: true,
    icon: "💰",
  },

  { name: "Taxes & Insurance", type: "expense", isDefault: true, icon: "💵" },
  { name: "Income Tax", type: "expense", isDefault: true, icon: "📜" },
  { name: "Property Tax", type: "expense", isDefault: true, icon: "🏡" },
  { name: "Vehicle Insurance", type: "expense", isDefault: true, icon: "🚗" },
  { name: "Life Insurance", type: "expense", isDefault: true, icon: "🛡️" },

  { name: "Miscellaneous", type: "expense", isDefault: true, icon: "🔖" },
  { name: "Charity/Donations", type: "expense", isDefault: true, icon: "🙏" },

  // Savings
  { name: "Emergency Fund", type: "savings", isDefault: true, icon: "🚨" },
  { name: "Retirement Fund", type: "savings", isDefault: true, icon: "🏖️" },
  { name: "Fixed Deposit", type: "savings", isDefault: true, icon: "🏦" },
  { name: "Recurring Deposit", type: "savings", isDefault: true, icon: "🔁" },
  { name: "Mutual Funds", type: "savings", isDefault: true, icon: "📊" },
  { name: "Stock Investment", type: "savings", isDefault: true, icon: "📈" },
  {
    name: "SIP (Systematic Investment Plan)",
    type: "savings",
    isDefault: true,
    icon: "🗓️",
  },
  {
    name: "PPF (Public Provident Fund)",
    type: "savings",
    isDefault: true,
    icon: "🏛️",
  },
  {
    name: "NSC (National Savings Certificate)",
    type: "savings",
    isDefault: true,
    icon: "💹",
  },
  {
    name: "NPS (National Pension System)",
    type: "savings",
    isDefault: true,
    icon: "🧓",
  },
];

export default defaultCategories;
