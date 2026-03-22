import puppeteer from "puppeteer";

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export async function screenshotUrl(url: string): Promise<string> {
  if (!isValidUrl(url)) {
    throw new Error("Invalid URL. Use a valid http or https URL (e.g. portfolio, LinkedIn, etc.).");
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
    // Use "load" instead of "networkidle2" - many sites never settle (analytics, websockets)
    await page.goto(url, {
      waitUntil: "load",
      timeout: 25000,
    });
    await new Promise((r) => setTimeout(r, 1500));
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
