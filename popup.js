const DRAFT_KEY = "techbay-work-order-draft-v1";
const prices = {
  "LABOR/BUILD": 199,
  "LABOR/BUILD/ADVANCED": 299,
  "LABOR/BUILD/GUIDED": 149.99,
  "LABOR/HOUR": 99.99,
  "LABOR/HOUR/VETERAN": 79.99,
  "LABOR/QFR QUICK FIX (15-30MIN)": 49.99,
  "LABOR/QF QUICK FIX GOOGLE REVIEW": 0,
};

const form = document.querySelector("#order-form");
const status = document.querySelector("#status");
const orderNumber = document.querySelector("#order-number");
const connection = document.querySelector("#connection");
const laborSku = document.querySelector("#labor-sku");
const laptopMultiplier = form.elements.laptopMultiplier;
const priceLine = document.querySelector("#price-line");
let activeTabId;
let activeOrderNumber = "";

function showStatus(message, kind = "") {
  status.textContent = message;
  status.className = `status ${kind}`.trim();
}

function getOrderNumber(url = "") {
  const match = url.match(/work-orders\/([^/?#]+)/i);
  if (!match) return "";

  try {
    return decodeURIComponent(match[1]).replace(/^SO-#/i, "SO-#");
  } catch {
    return match[1];
  }
}

function updatePrice() {
  const sku = laborSku.value;
  if (!sku) {
    priceLine.textContent = "Select a labor SKU to see the total.";
    return;
  }

  const quantity = laptopMultiplier.checked ? 2 : 1;
  const total = prices[sku] * quantity;
  priceLine.textContent = `${quantity}× ${sku} · $${total.toFixed(2)} total`;
}

function saveDraft() {
  const values = Object.fromEntries(
    [...new FormData(form).entries()].filter(([name]) => name !== "imageFile"),
  );
  values.laptopMultiplier = laptopMultiplier.checked;
  chrome.storage.local.set({ [DRAFT_KEY]: values });
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () =>
      resolve({
        name: file.name,
        type: file.type,
        dataUrl: reader.result,
      }),
    );
    reader.addEventListener("error", () =>
      reject(new Error("Could not read the selected image.")),
    );
    reader.readAsDataURL(file);
  });
}

async function sendFillMessage(tabId, values) {
  const message = { type: "TECHBAY_FILL_WORK_ORDER", values };
  const injectedFrames = await chrome.scripting.executeScript({
    target: { tabId, allFrames: true },
    files: ["content.js"],
  });
  const frameIds = [...new Set(injectedFrames.map(({ frameId }) => frameId))];
  const attempts = await Promise.allSettled(
    frameIds.map((frameId) =>
      chrome.tabs.sendMessage(tabId, message, { frameId }),
    ),
  );
  const responses = attempts
    .filter((attempt) => attempt.status === "fulfilled" && attempt.value?.ok)
    .map((attempt) => attempt.value);

  if (!responses.length) {
    throw new Error(
      "Could not reach a WorkMate frame. Reload Shopify and try again.",
    );
  }

  responses.sort(
    (first, second) =>
      second.filled - first.filled || second.controlCount - first.controlCount,
  );
  return responses[0];
}

async function initialize() {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  activeTabId = tab?.id;
  const detectedOrder = getOrderNumber(tab?.url);
  activeOrderNumber = detectedOrder;
  orderNumber.textContent = detectedOrder || "No order detected";

  if (detectedOrder && /admin\.shopify\.com/i.test(tab?.url ?? "")) {
    connection.classList.add("ready");
    connection.setAttribute("aria-label", "Shopify Admin tab active");
    showStatus("Ready to fill the active Work Mate order.");
  } else {
    connection.classList.add("error");
    connection.setAttribute(
      "aria-label",
      "Shopify Work Mate order not detected",
    );
  }

  const stored = await chrome.storage.local.get(DRAFT_KEY);
  const values = stored[DRAFT_KEY];
  if (values) {
    for (const [name, value] of Object.entries(values)) {
      const control = form.elements.namedItem(name);
      if (!control) continue;
      if (control.type === "checkbox") control.checked = Boolean(value);
      else control.value = String(value);
    }
  }

  updatePrice();
}

form.addEventListener("input", saveDraft);
form.addEventListener("change", () => {
  saveDraft();
  updatePrice();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!activeTabId || !activeOrderNumber) {
    showStatus("Select a Shopify Work Mate work-order tab first.", "error");
    return;
  }

  const values = Object.fromEntries(new FormData(form).entries());
  values.laptopMultiplier = laptopMultiplier.checked;
  values.orderNumber = activeOrderNumber;
  delete values.imageFile;

  try {
    const hasWorkMateAccess = await chrome.permissions.request({
      origins: ["https://app.workmatepos.co/*"],
    });
    if (!hasWorkMateAccess) {
      showStatus(
        "Allow access to app.workmatepos.co to fill the embedded WorkMate order.",
        "error",
      );
      return;
    }

    const imageFile = form.elements.imageFile.files[0];
    if (imageFile) {
      if (imageFile.size > 8 * 1024 * 1024) {
        showStatus("Choose an image smaller than 8 MB.", "error");
        return;
      }
      values.imageFile = await readImageFile(imageFile);
    }

    const response = await sendFillMessage(activeTabId, values);
    if (!response?.ok)
      throw new Error(response?.error || "The Shopify page did not respond.");

    const parts = [
      `Filled ${response.filled} field${response.filled === 1 ? "" : "s"}.`,
    ];
    if (response.product) parts.push(response.product);
    if (response.missing?.length)
      parts.push(`Not found: ${response.missing.join(", ")}.`);
    if (response.filled === 0 && response.context) {
      parts.push(
        `Scanned ${response.frame} ${response.context}: ${response.controlCount} controls and ${response.labelCount} labels.`,
      );
      if (response.embeddedFrames?.length) {
        parts.push(`Embedded frames: ${response.embeddedFrames.join(", ")}.`);
      }
    }
    showStatus(parts.join(" "), response.filled ? "success" : "error");
  } catch (error) {
    showStatus(
      error instanceof Error
        ? error.message
        : "Could not reach the Shopify page.",
      "error",
    );
  }
});

initialize().catch(() =>
  showStatus("Could not read the active browser tab.", "error"),
);
