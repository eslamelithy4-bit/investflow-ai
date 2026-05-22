import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const region = process.env.S3_REGION || 'us-east-1';
const endpoint = process.env.S3_ENDPOINT || undefined;

export const s3 = new S3Client({
  region,
  endpoint,
  forcePathStyle: !!endpoint,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || 'YOUR_ACCESS_KEY_HERE',
    secretAccessKey: process.env.S3_SECRET_KEY || 'YOUR_SECRET_KEY_HERE',
  },
});

const BUCKET = process.env.S3_BUCKET || 'YOUR_BUCKET_HERE';
const PUBLIC_URL = process.env.S3_PUBLIC_URL || `https://${BUCKET}.s3.${region}.amazonaws.com`;

export async function uploadObject(key: string, body: Buffer, contentType: string, isPublic = true) {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      ACL: isPublic ? 'public-read' : 'private',
    })
  );
  return isPublic ? `${PUBLIC_URL}/${key}` : key;
}

export async function deleteObject(key: string) {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

export async function getSignedReadUrl(key: string, expiresIn = 3600) {
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn });
}
