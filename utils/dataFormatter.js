

export const attachCategoryIconsToTransactions = (categories, transactions) => {
    return new Promise((resolve, reject) => {
        if (!Array.isArray(transactions) || !Array.isArray(categories)) {
            return reject(new Error("Transactions should be a list"));
        }

        try {
            const updated = transactions.map((transaction) => {
                const matchedCategory = categories.find((cat) => cat.name === transaction.category);
                if (matchedCategory) {
                    return {
                        ...transaction,
                        category: `${matchedCategory.icon} ${matchedCategory.name}`,
                    };
                }
                return transaction;
            });

            resolve(updated);
        } catch (err) {
            reject(err);
        }
    });
};

export const addAccountIdToTransactions = (transactions, accountId) => {
    return new Promise((resolve, reject) => {
        try {
            const updatedTransactions = transactions.map(txn => ({
                ...txn,
                accountId,
            }));
            resolve(updatedTransactions);
        } catch (error) {
            reject(error);
        }
    });
};

export const replaceDateWithBillDate = (transactions) => {
    return new Promise((resolve, reject) => {
        try {
            const updated = transactions.map(({ date, ...rest }) => ({
                ...rest,
                billDate: date,
            }));
            resolve(updated);
        } catch (error) {
            reject(error);
        }
    });
};


