const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { sendSuccess } = require("../utils/apiResponse");

// In a production app this would be persisted to a ContactMessage collection
// and/or forwarded to an email/helpdesk service. Kept minimal here.
const submitContactMessage = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    throw new ApiError(400, "Name, email and message are required");
  }

  console.log("New support inquiry:", { name, email, subject, message });

  sendSuccess(res, 200, "Thanks! Your message has been received. Our team will get back to you soon.");
});

module.exports = { submitContactMessage };
