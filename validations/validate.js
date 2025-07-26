export const validateSchema = (schema, data) => {
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
        console.log("Validation errors:", parsed.error);
        const errorMessage = parsed.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(", ");
        const error = new Error(errorMessage);
        error.statusCode = 400;
        throw error;
    }
    return parsed.data;
};
