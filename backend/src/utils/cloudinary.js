import { v2 as cloudinary } from "cloudinary";

function requireCloudinaryEnv() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (
    !cloudName ||
    !apiKey ||
    !apiSecret ||
    cloudName === "temporary_later" ||
    apiKey === "temporary_later" ||
    apiSecret === "temporary_later"
  ) {
    throw new Error("Cloudinary environment variables are missing.");
  }

  return {
    cloudName,
    apiKey,
    apiSecret
  };
}

export function configureCloudinary() {
  const { cloudName, apiKey, apiSecret } = requireCloudinaryEnv();

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });

  return cloudinary;
}

export function uploadBufferToCloudinary(buffer, options = {}) {
  const client = configureCloudinary();

  return new Promise((resolve, reject) => {
    const uploadStream = client.uploader.upload_stream(
      {
        folder: "one-earth-legacy/avatars",
        resource_type: "image",
        transformation: [
          {
            width: 512,
            height: 512,
            crop: "fill",
            gravity: "face"
          },
          {
            quality: "auto",
            fetch_format: "auto"
          }
        ],
        ...options
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        return resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
}