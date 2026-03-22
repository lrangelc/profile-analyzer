import puppeteer from "puppeteer";

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function toUserFriendlyError(err: unknown, url: string): string {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (msg.includes("timeout") || msg.includes("navigation"))
      return `Page load timed out. The site (${url}) may be slow or blocking automated browsers. Try again.`;
    if (msg.includes("net::") || msg.includes("econnrefused"))
      return `Could not reach ${url}. Check the URL and your network connection.`;
    if (msg.includes("target closed") || msg.includes("session"))
      return "Screenshot capture failed. The browser closed unexpectedly. Try again.";
    return `Failed to capture URL screenshot: ${err.message}`;
  }
  return "Failed to capture URL screenshot. Try again.";
}

export async function screenshotUrl(url: string): Promise<string> {
  if (!isValidUrl(url)) {
    throw new Error("Invalid URL. Use a valid http or https URL (e.g. portfolio, LinkedIn, etc.).");
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });
  } catch (err) {
    throw new Error(
      "Chromium could not be started. Run 'npm install' in the backend folder to ensure Puppeteer and Chromium are installed."
    );
  }

  try {
    const page = await browser.newPage();
    // 1024x768 @ 1x = smaller image, faster OpenAI vision processing
    await page.setViewport({ width: 1024, height: 768, deviceScaleFactor: 1 });
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
    try {
      await page.goto(url, {
        waitUntil: "load",
        timeout: 25000,
      });
    } catch (navErr) {
      throw new Error(toUserFriendlyError(navErr, url));
    }
    await new Promise((r) => setTimeout(r, 1500));
    const buffer = await page.screenshot({
      type: "png",
      fullPage: false,
    });
    const base64 = Buffer.from(buffer as Buffer).toString("base64");
    return `data:image/png;base64,${base64}`;
  } catch (err) {
    throw new Error(toUserFriendlyError(err, url));
  } finally {
    await browser.close();
  }
}
