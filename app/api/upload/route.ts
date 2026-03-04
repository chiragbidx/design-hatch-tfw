// c/Users/bhima/OneDrive/Desktop/panda_work/panda_upwork/app/api/upload/route.ts

import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.STORAGE_REGION || "auto",
  endpoint: process.env.STORAGE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY || "",
    secretAccessKey: process.env.STORAGE_SECRET_KEY || "",
  },
  forcePathStyle: true, // Needed for many S3-compatible providers like Railway/MinIO
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    // Create a unique filename
    const fileName = `${Date.now()}-${file.name.replace(/\s/g, "-")}`;
    
    // Upload to S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.STORAGE_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
        ACL: "public-read", // Request public read access
      })
    );

    // Construct the public URL
    // For Railway Storage, the pattern is typically endpoint/bucket/key
    const url = `${process.env.STORAGE_ENDPOINT}/${process.env.STORAGE_BUCKET_NAME}/${fileName}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
