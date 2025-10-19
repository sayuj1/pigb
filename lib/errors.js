export const handleApiError = (res, error, fallbackMessage = "Server Error") => {
  console.error(fallbackMessage, error);
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    name: error.name,
    message: error.message,
  });
};
