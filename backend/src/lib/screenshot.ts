import puppeteer from "puppeteer";

function isValidProfileUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
    const host = parsed.hostname.toLowerCase();
    const allowed = [
      "linkedin.com",
      "twitter.com",
      "x.com",
      "instagram.com",
      "github.com",
      "medium.com",
      "youtube.com",
      "tiktok.com",
      "facebook.com",
      "about.me",
      "linktr.ee",
    ];
    if (!allowed.some((h) => host.includes(h))) return false;
    return true;
  } catch {
    return false;
  }
}

export async function screenshotUrl(url: string): Promise<string> {
  if (!isValidProfileUrl(url)) {
    throw new Error(
      "URL not supported. Use LinkedIn, Twitter/X, Instagram, GitHub, or similar profile URLs."
    );
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 15000,
    });
    await new Promise((r) => setTimeout(r, 2000));
    const buffer = await page.screenshot({
      type: "png",
      fullPage: false,
    });
    const base64 = Buffer.from(buffer as Buffer).toString("base64");
    return `data:image/png;base64,${base64}`;
  } finally {
    await browser.close();
  }
}
