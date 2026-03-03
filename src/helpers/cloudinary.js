const crypto = require("crypto");

const MAX_ATTACHMENT_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const requiredEnv = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

function ensureCloudinaryConfig() {
  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length) {
    const err = new Error(
      `Missing Cloudinary environment variables: ${missing.join(", ")}`,
    );
    err.statusCode = 500;
    throw err;
  }
}

function getMimeType(data, mimeType) {
  if (mimeType) return mimeType;
  if (typeof data === "string" && data.startsWith("data:")) {
    return data.substring(5, data.indexOf(";")) || "application/octet-stream";
  }
  return "application/octet-stream";
}

function getBase64Payload(data) {
  if (!data || typeof data !== "string") {
    const err = new Error("Attachment data is required");
    err.statusCode = 400;
    throw err;
  }

  if (data.startsWith("data:")) {
    const parts = data.split(",");
    if (parts.length < 2) {
      const err = new Error("Invalid data URL format");
      err.statusCode = 400;
      throw err;
    }
    return parts[1];
  }

  return data;
}

function validateAttachmentSize(base64Payload) {
  const buffer = Buffer.from(base64Payload, "base64");
  if (buffer.length > MAX_ATTACHMENT_SIZE_BYTES) {
    const err = new Error("Attachment size must be 5MB or less");
    err.statusCode = 400;
    throw err;
  }
  return buffer.length;
}

async function uploadSingleAttachment(attachment) {
  ensureCloudinaryConfig();

  const { data, fileName, mimeType } = attachment || {};
  const base64Payload = getBase64Payload(data);
  const size = validateAttachmentSize(base64Payload);
  const resolvedMimeType = getMimeType(data, mimeType);

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = process.env.CLOUDINARY_TASK_ATTACHMENTS_FOLDER || "task-attachments";
  const signatureBase = `folder=${folder}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`;
  const signature = crypto.createHash("sha1").update(signatureBase).digest("hex");

  const formData = new FormData();
  formData.append(
    "file",
    `data:${resolvedMimeType};base64,${base64Payload}`,
  );
  formData.append("api_key", process.env.CLOUDINARY_API_KEY);
  formData.append("timestamp", String(timestamp));
  formData.append("folder", folder);
  formData.append("signature", signature);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/auto/upload`;
  const response = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  const responseBody = await response.json();

  if (!response.ok) {
    const err = new Error(
      responseBody?.error?.message || "Failed to upload attachment to Cloudinary",
    );
    err.statusCode = 500;
    throw err;
  }

  return {
    url: responseBody.secure_url,
    publicId: responseBody.public_id,
    originalName: fileName || responseBody.original_filename || "attachment",
    mimeType: resolvedMimeType,
    size,
  };
}

async function uploadTaskAttachments(attachmentsInput) {
  if (!attachmentsInput) return [];

  const attachments = Array.isArray(attachmentsInput)
    ? attachmentsInput
    : [attachmentsInput];

  if (!attachments.length) return [];

  const uploads = attachments.map((attachment) =>
    uploadSingleAttachment(attachment),
  );

  return Promise.all(uploads);
}

module.exports = {
  uploadTaskAttachments,
  MAX_ATTACHMENT_SIZE_BYTES,
};
