export const cacheInvalidationRules = {
    transaction: {
        onCreate: (data) => [
            { key: data.userId, prefix: "accounts" },
            { key: data.userId, prefix: "total-expense" },
            { key: data.userId, prefix: "total-balance" },
            { prefix: "expenses-income-trend" },
            { prefix: "category-spend" },
        ],
        onUpdate: (data) => [
            { key: data.userId, prefix: "accounts" },
            { key: data.userId, prefix: "category-spend" },
        ],
        onDelete: (data) => [
            { key: data.userId, prefix: "accounts" },
            { key: data.userId, prefix: "total-expense" },
            { key: data.userId, prefix: "total-balance" },
            { prefix: "expenses-income-trend" },
            { prefix: "category-spend" },
        ],
    },
    account: {
        onCreate: (data) => [
            { key: data.userId, prefix: "accounts" },
            { key: data.userId, prefix: "total-expense" },
            { key: data.userId, prefix: "total-balance" },
            { prefix: "expenses-income-trend" },
            { prefix: "category-spend" },
        ],
        onUpdate: (data) => [
            { key: data.userId, prefix: "accounts" },
            { key: data.userId, prefix: "total-balance" },
        ],
        onDelete: (data) => [
            { key: data.userId, prefix: "accounts" },
            { key: data.userId, prefix: "total-expense" },
            { key: data.userId, prefix: "total-balance" },
            { prefix: "expenses-income-trend" },
            { prefix: "category-spend" },
        ],
    },
    budget: {
        onUpdate: (data) => [
            { key: data.userId, prefix: "budgets" },
        ],
    },
};
