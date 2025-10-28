/**
 * Build a dynamic Mongoose query object with filters, search, sorting, and pagination
 * @param {Object} query - req.query from API request
 * @param {String} userId - current userId
 * @param {Array} searchableFields - fields to search across (for regex search)
 * @returns {Object} { filters, sort, skip, limit }
 */
export function buildQuery(query, userId, searchableFields = []) {
    const {
        search,
        sortField = "createdAt",
        sortOrder = "desc",
        page = 1,
        limit = 20,
        startDate,
        endDate,
        dateField = "createdAt", // 👈 new param to control which field to use for date filtering
        minAmount,
        maxAmount,
        ...rest
    } = query;

    const filters = { userId };

    // Dynamic filters (status, savingsType, etc.)
    for (const [key, value] of Object.entries(rest)) {
        if (
            value &&
            ![
                "search",
                "sortField",
                "sortOrder",
                "page",
                "limit",
                "startDate",
                "endDate",
                "dateField",
                "minAmount",
                "maxAmount",
            ].includes(key)
        ) {
            // Support comma-separated filters
            if (typeof value === "string" && value.includes(",")) {
                filters[key] = { $in: value.split(",") };
            } else {
                filters[key] = value;
            }
        }
    }

    // Range filters (amount)
    if (minAmount || maxAmount) {
        filters.amount = {};
        if (minAmount) filters.amount.$gte = Number(minAmount);
        if (maxAmount) filters.amount.$lte = Number(maxAmount);
    }

    // ✅ Flexible date field filter
    if (startDate || endDate) {
        filters[dateField] = {};
        if (startDate) filters[dateField].$gte = new Date(startDate);
        if (endDate) filters[dateField].$lte = new Date(endDate);
    }

    // Search support
    if (search && searchableFields.length > 0) {
        filters.$or = searchableFields.map((field) => ({
            [field]: { $regex: search, $options: "i" },
        }));
    }

    // Sorting
    const sort = {};
    sort[sortField] = sortOrder === "asc" ? 1 : -1;

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    return {
        filters,
        sort,
        skip,
        limit: Number(limit),
    };
}
