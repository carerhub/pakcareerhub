import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";
import { getObjectEntityFile } from "./objectStorage";

const execFileAsync = promisify(execFile);

export type ExtractedAdvertisement = {
  jobs: Array<Record<string, unknown>>;
  extractedText: string;
  extractionStatus: "completed" | "failed";
};

function clean(value: string | undefined): string | null {
  const normalized = value?.replace(/\r/g, "").replace(/[ \t]+/g, " ").trim();
  return normalized || null;
}

function field(text: string, labels: string[]): string | null {
  const pattern = labels.join("|");
  const match = text.match(new RegExp(`(?:^|\\n)\\s*(?:${pattern})\\s*[:：\\-]\\s*(.+)`, "im"));
  return clean(match?.[1]);
}

function html(text: string | null): string | null {
  return text ? `<p>${text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>` : null;
}

function parseJobs(text: string): Array<Record<string, unknown>> {
  const organization = field(text, ["department", "organization", "department\\/organization", "institution"]) ?? "Requires Verification";
  const postMatches = [...text.matchAll(/(?:^|\\n)\\s*(?:[-•*]\\s*)?(.{3,90}?)\\s*[-–:]\\s*(\\d+)\\s*(?:posts?|vacancies?|seats?)/gim)]
    .map((match) => ({ title: clean(match[1]), vacancies: Number(match[2]) }))
    .filter((item): item is { title: string; vacancies: number } => Boolean(item.title));
  const title = field(text, ["job title", "post name", "position", "post"]);
  const base = {
    organization,
    postName: title,
    title: title ?? postMatches[0]?.title ?? "Requires Verification",
    jobType: /private|corporate|company/i.test(text) && !/government|govt|public sector|federal|provincial/i.test(text) ? "private" : "government",
    employmentType: "full_time",
    vacancies: field(text, ["number of vacancies", "vacancies", "no\\. of posts", "posts"]) ? Number(field(text, ["number of vacancies", "vacancies", "no\\. of posts", "posts"])?.match(/\d+/)?.[0]) : postMatches[0]?.vacancies ?? null,
    bps: field(text, ["bps", "grade", "scale"]),
    qualification: field(text, ["qualification", "qualifications"]),
    education: field(text, ["education", "educational requirement", "required education"]),
    experience: field(text, ["experience", "required experience"]),
    ageMin: null,
    ageMax: field(text, ["age limit", "age"])?.match(/\d{2}/g)?.map(Number)?.pop() ?? null,
    gender: field(text, ["gender", "sex"]),
    domicile: field(text, ["domicile"]),
    quota: field(text, ["quota"]),
    province: field(text, ["province", "region"]),
    location: field(text, ["job location", "location", "place of posting"]),
    salaryPackage: field(text, ["salary", "pay package", "pay scale", "remuneration"]),
    applicationFee: field(text, ["application fee", "fee"]),
    applicationStartDate: field(text, ["application start date", "start date"]),
    deadline: field(text, ["last date", "deadline", "closing date"]),
    applyUrl: field(text, ["application url", "official website", "apply online", "website"]),
    requiredDocuments: html(field(text, ["required documents", "documents required"])),
    contactInformation: html(field(text, ["contact", "contact information", "phone", "email"])),
    importantInstructions: html(field(text, ["important instructions", "instructions"])),
    termsConditions: html(field(text, ["terms", "terms and conditions"])),
    description: html(field(text, ["job description", "description"])),
    requirements: html(field(text, ["requirements", "eligibility"])),
    howToApply: html(field(text, ["how to apply", "application method", "apply method"])),
    verificationStatus: "needs_review",
    extractionStatus: "completed",
  };
  if (postMatches.length > 1) {
    return postMatches.map((post) => ({ ...base, title: post.title, postName: post.title, vacancies: post.vacancies }));
  }
  return [base];
}

async function run(command: string, args: string[]): Promise<string> {
  const result = await execFileAsync(command, args, { maxBuffer: 20 * 1024 * 1024 });
  return result.stdout;
}

async function extractText(filePath: string, mimeType: string, workDir: string): Promise<string> {
  if (mimeType === "application/pdf" || extname(filePath).toLowerCase() === ".pdf") {
    const text = await run("pdftotext", ["-layout", filePath, "-"]).catch(() => "");
    if (text.trim().length >= 40) return text;
    await run("pdftoppm", ["-png", "-r", "180", filePath, join(workDir, "page")]).catch(() => "");
    const pages = (await readdir(workDir)).filter((name) => name.startsWith("page-") && name.endsWith(".png")).sort();
    const ocr = await Promise.all(pages.map((page) => run("tesseract", [join(workDir, page), "stdout", "-l", "eng+urd", "--psm", "6"]).catch(() => "")));
    return ocr.join("\n");
  }
  return run("tesseract", [filePath, "stdout", "-l", "eng+urd", "--psm", "6"]);
}

export async function extractAdvertisement(
  objectPath: string,
  mimeType: string,
  originalName: string,
): Promise<ExtractedAdvertisement> {
  const workDir = await mkdtemp(join(tmpdir(), "pakcareer-ad-"));
  const inputPath = join(workDir, `advertisement${extname(originalName) || ".bin"}`);
  try {
    const file = await getObjectEntityFile(objectPath);
    const [buffer] = await file.download();
    await writeFile(inputPath, buffer);
    const extractedText = await extractText(inputPath, mimeType, workDir);
    if (!extractedText.trim()) {
      return { jobs: [{ title: "Requires Verification", organization: "Requires Verification", jobType: "government", employmentType: "full_time", extractionStatus: "failed", verificationStatus: "needs_review" }], extractedText: "", extractionStatus: "failed" };
    }
    return { jobs: parseJobs(extractedText), extractedText, extractionStatus: "completed" };
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}