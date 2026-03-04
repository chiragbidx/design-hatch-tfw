import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3 = new S3Client({
  // Railway requires "auto" region and forcePathStyle
  region: process.env.STORAGE_REGION || "auto",
  endpoint: process.env.STORAGE_ENDPOINT!, // e.g. https://storage.railway.app
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY!,
    secretAccessKey: process.env.STORAGE_SECRET_KEY!,
  },
  forcePathStyle: true,
});

/**
 * Generate a temporary signed URL for a file stored in Railway Object Storage.
 *
 * You can pass either:
 *  - the full public URL (https://storage.railway.app/bucket/key)
 *  - or just the object key (key)
 */
export async function getSignedFileUrl(rawUrlOrKey: string) {
  if (!rawUrlOrKey) return "";

  const bucket = process.env.STORAGE_BUCKET_NAME!;
  const endpoint = process.env.STORAGE_ENDPOINT!;

  try {
    // If it's a full URL, first check whether it's our storage host.
    if (rawUrlOrKey.startsWith("http")) {
      const url = new URL(rawUrlOrKey);
      const endpointHost = new URL(endpoint).host;

      // External URL (Freepik, patterns.dev, etc.) → do NOT sign.
      if (url.host !== endpointHost) {
        return rawUrlOrKey;
      }

      // URL points to our storage endpoint → extract key and sign.
      const prefix = `/${bucket}/`;
      let key: string;

      if (url.pathname.startsWith(prefix)) {
        // Path is /{bucket}/key → strip bucket prefix.
        key = url.pathname.slice(prefix.length);
      } else {
        // Fallback: remove leading slash and treat remainder as key.
        key = url.pathname.replace(/^\//, "");
      }

      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      return await getSignedUrl(s3, command, { expiresIn: 60 * 60 }); // 1 hour
    }

    // Not a full URL: treat as object key in our bucket.
    const key = rawUrlOrKey.replace(/^\//, "");

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    return await getSignedUrl(s3, command, { expiresIn: 60 * 60 }); // 1 hour
  } catch (err) {
    console.error("Error generating signed URL:", err);
    // Fall back to original value to avoid breaking UI
    return rawUrlOrKey;
  }
}

