export const handleApiError = (res, error, fallbackMessage = "Server Error") => {
  console.error(fallbackMessage, error);
  res.status(500).json({
    message: fallbackMessage,
    error: error?.message || "Unknown error",
  });
};
