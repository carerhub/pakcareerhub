import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import { File, Storage } from "@google-cloud/storage";

const SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

export const objectStorageClient = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${SIDECAR_ENDPOINT}/token`,
    type: "external_account",
    credential_source: {
      url: `${SIDECAR_ENDPOINT}/credential`,
      format: { type: "json", subject_token_field_name: "access_token" },
    },
    universe_domain: "googleapis.com",
  },
  projectId: "",
});

function privateObjectDir(): string {
  const dir = process.env.PRIVATE_OBJECT_DIR;
  if (!dir) throw new Error("PRIVATE_OBJECT_DIR is not configured");
  return dir.replace(/\/+$/, "");
}

function parseObjectPath(path: string): { bucketName: string; objectName: string } {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const parts = normalized.split("/");
  if (parts.length < 3 || !parts[1] || !parts.slice(2).join("/")) {
    throw new Error("Invalid object storage path");
  }
  return { bucketName: parts[1], objectName: parts.slice(2).join("/") };
}

function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120) || "advertisement";
}

async function signObjectUrl(
  bucketName: string,
  objectName: string,
  method: "PUT" | "GET",
): Promise<string> {
  const response = await fetch(`${SIDECAR_ENDPOINT}/object-storage/signed-object-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bucket_name: bucketName,
      object_name: objectName,
      method,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`Object storage signing failed (${response.status})`);
  const payload = (await response.json()) as { signed_url?: string };
  if (!payload.signed_url) throw new Error("Object storage returned no signed URL");
  return payload.signed_url;
}

export async function requestAdvertisementUpload(name: string): Promise<{
  uploadURL: string;
  objectPath: string;
}> {
  const objectId = randomUUID();
  const objectName = `job-advertisements/${objectId}-${safeFileName(name)}`;
  const fullPath = `${privateObjectDir()}/${objectName}`;
  const parsed = parseObjectPath(fullPath);
  return {
    uploadURL: await signObjectUrl(parsed.bucketName, parsed.objectName, "PUT"),
    objectPath: `/objects/${objectName}`,
  };
}

export async function getObjectEntityFile(objectPath: string): Promise<File> {
  if (!objectPath.startsWith("/objects/")) throw new Error("Invalid object path");
  const fullPath = `${privateObjectDir()}/${objectPath.slice("/objects/".length)}`;
  const { bucketName, objectName } = parseObjectPath(fullPath);
  const file = objectStorageClient.bucket(bucketName).file(objectName);
  const [exists] = await file.exists();
  if (!exists) throw new Error("Uploaded advertisement was not found");
  return file;
}

export async function downloadObjectResponse(file: File): Promise<{
  stream: NodeJS.ReadableStream;
  contentType: string;
  size?: string;
}> {
  const [metadata] = await file.getMetadata();
  return {
    stream: file.createReadStream(),
    contentType: metadata.contentType || "application/octet-stream",
    size: metadata.size == null ? undefined : String(metadata.size),
  };
}

export async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks);
}

export function objectPathToUrl(objectPath: string | null): string | null {
  return objectPath ? `/api/storage/objects${objectPath.slice("/objects".length)}` : null;
}