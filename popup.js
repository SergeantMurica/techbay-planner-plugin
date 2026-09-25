import {
  optionalToolsByDevice,
  plannerOptionsByDevice,
} from "./lib/templates.js";

const DRAFT_KEY = "techbay-work-order-draft-v1";
const THEME_KEY = "techbay-tool-theme";
const THEMES = {
  "meta-red": {
    bg: "#0b0b0c",
    panel: "#1e1e21",
    line: "#2b2b30",
    text: "#fff",
    muted: "#9a9a9a",
    accent: "#e02020",
    onAccent: "#fff",
  },
  volt: {
    bg: "#0a0b08",
    panel: "#1c1f16",
    line: "#2a2e22",
    text: "#f2f5ea",
    muted: "#949c86",
    accent: "#c8ff00",
    onAccent: "#10160a",
  },
  midnight: {
    bg: "#0f1216",
    panel: "#1c212a",
    line: "#262c37",
    text: "#e6e9ef",
    muted: "#8b93a3",
    accent: "#5b9dff",
    onAccent: "#08101f",
  },
  "hot-pink": {
    bg: "#12080e",
    panel: "#26141e",
    line: "#351d2a",
    text: "#fdeaf3",
    muted: "#b08a9d",
    accent: "#ff4d9d",
    onAccent: "#2b0616",
  },
  ember: {
    bg: "#120d07",
    panel: "#241b11",
    line: "#33261a",
    text: "#fdf0e2",
    muted: "#b09a80",
    accent: "#ff8c1a",
    onAccent: "#241100",
  },
  emerald: {
    bg: "#06110c",
    panel: "#13241a",
    line: "#1d3327",
    text: "#e6f6ec",
    muted: "#86a795",
    accent: "#2fd18a",
    onAccent: "#04180e",
  },
  violet: {
    bg: "#0e0a16",
    panel: "#1f172c",
    line: "#2c2140",
    text: "#ece6f8",
    muted: "#9b8db5",
    accent: "#a06bff",
    onAccent: "#150726",
  },
  arctic: {
    bg: "#071216",
    panel: "#12262e",
    line: "#1c3640",
    text: "#e2f4f9",
    muted: "#85a5b0",
    accent: "#34c6e0",
    onAccent: "#04181e",
  },
  daylight: {
    bg: "#f4f5f7",
    panel: "#fff",
    line: "#dcdfe5",
    text: "#14161a",
    muted: "#646b78",
    accent: "#d11414",
    onAccent: "#fff",
  },
};
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
const themeSelect = document.querySelector("#theme-select");
const serviceOption = document.querySelector("#service-option");
const optionalTool = document.querySelector("#optional-tool");
const selectedOptionsNode = document.querySelector("#selected-options");
const selectedToolsNode = document.querySelector("#selected-tools");
const planResponsesNode = document.querySelector("#plan-responses");
const qcChecklistNode = document.querySelector("#qc-checklist");
const selectedOptions = new Set();
const selectedTools = new Set();
const planResponses = {};
const qcItems = [
  ["bios", "Updated and verified latest BIOS version"],
  [
    "biosSettings",
    "Set applicable BIOS settings: RAM profile, Resize BAR, Intel temp limits, PBO off, Secure Boot",
  ],
  ["fansRgb", "Verified all fans spin and RGB LEDs work appropriately"],
  [
    "tertiaryDrives",
    "Verified tertiary drives are connected and initialized in Disk Management",
  ],
  [
    "driversAndDesktop",
    "Installed relevant drivers, set Chrome default, removed Edge, pinned programs, set Meta wallpaper and clock",
  ],
  ["wifi", "Checked for Wi-Fi networks"],
  [
    "activation",
    "Verified Windows activation and synchronized or quoted OEM key as needed",
  ],
  ["cleaned", "Cleaned system interior and exterior"],
  ["rebooted", "Rebooted after cleaning and verified continued functionality"],
  ["occt", "Ran OCCT and verified results make sense"],
  ["psuOff", "Verified PSU switch is off"],
];
let activeTabId;
let activeOrderNumber = "";

function todayLabel() {
  const date = new Date();
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

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

function applyTheme(themeId) {
  const theme = THEMES[themeId] ? themeId : "meta-red";
  const palette = THEMES[theme];
  document.documentElement.dataset.theme = theme;
  for (const [token, value] of Object.entries(palette)) {
    if (token === "onAccent") continue;
    document.documentElement.style.setProperty(
      token === "text" ? "--ink" : token === "accent" ? "--acid" : `--${token}`,
      value,
    );
  }
  document.documentElement.style.setProperty("--on-accent", palette.onAccent);
  document.documentElement.style.setProperty(
    "--control",
    "color-mix(in srgb, var(--bg), var(--panel) 55%)",
  );
  themeSelect.value = theme;
  chrome.storage.local.set({ [THEME_KEY]: theme });
}

function currentPlannerDevice() {
  return form.elements.device.value === "Laptop" ? "laptop" : "desktop";
}

function currentServiceType() {
  return form.elements.serviceType.value;
}

function activePlans() {
  return plannerOptionsByDevice[currentPlannerDevice()][currentServiceType()];
}

function activeTools() {
  return optionalToolsByDevice[currentPlannerDevice()].filter((tool) =>
    tool.serviceTypes.includes(currentServiceType()),
  );
}

function addChoiceChip(container, item, set, onRemove) {
  const button = document.createElement("button");
  button.className = "choice-chip";
  button.type = "button";
  button.textContent = `${item.label} ×`;
  button.setAttribute("aria-label", `Remove ${item.label}`);
  button.addEventListener("click", () => onRemove(item.id));
  container.append(button);
  set.add(item.id);
}

function renderServices() {
  const plans = activePlans();
  const tools = activeTools();
  serviceOption.replaceChildren(new Option("Choose a category...", ""));
  for (const plan of plans) {
    const option = new Option(
      `${selectedOptions.has(plan.id) ? "✓ " : ""}${plan.label}`,
      plan.id,
    );
    serviceOption.append(option);
  }
  optionalTool.replaceChildren(new Option("Choose a tool...", ""));
  for (const tool of tools) {
    optionalTool.append(
      new Option(
        `${selectedTools.has(tool.id) ? "✓ " : ""}${tool.label}`,
        tool.id,
      ),
    );
  }

  selectedOptionsNode.replaceChildren();
  for (const plan of plans.filter((item) => selectedOptions.has(item.id))) {
    addChoiceChip(selectedOptionsNode, plan, selectedOptions, removePlan);
  }
  selectedToolsNode.replaceChildren();
  for (const tool of tools.filter((item) => selectedTools.has(item.id))) {
    addChoiceChip(selectedToolsNode, tool, selectedTools, removeTool);
  }
  document.querySelector("#service-count").textContent =
    `${selectedOptions.size} selected`;
  renderPlanResponses();
  updatePreviews();
}

function removePlan(id) {
  selectedOptions.delete(id);
  delete planResponses[id];
  renderServices();
}

function removeTool(id) {
  selectedTools.delete(id);
  delete planResponses[id];
  renderServices();
}

function renderPlanResponses() {
  planResponsesNode.replaceChildren();
  const plans = activePlans().filter((plan) => selectedOptions.has(plan.id));
  const tools = activeTools().filter((tool) => selectedTools.has(tool.id));
  for (const item of [...plans, ...tools]) {
    const label = document.createElement("label");
    label.className = "field response-field";
    const title = document.createElement("span");
    title.textContent = `${item.label} · Technician response`;
    const textarea = document.createElement("textarea");
    textarea.rows = 2;
    textarea.value = planResponses[item.id] || "";
    textarea.placeholder = "Record findings or work completed";
    textarea.addEventListener("input", () => {
      planResponses[item.id] = textarea.value;
      saveDraft();
      updatePreviews();
    });
    label.append(title, textarea);
    planResponsesNode.append(label);
  }
}

function checkedValue(name) {
  return form.querySelector(`input[name="${name}"]:checked`)?.value || "";
}

function mark(value, expected) {
  return value === expected ? "X" : " ";
}

function noteHeader() {
  const date = form.elements.workDate.value.trim() || "__/__";
  const initials = form.elements.checkInInitials.value.trim() || "__";
  return `${date} - ${initials}`;
}

function getCheckInNote() {
  return [
    noteHeader(),
    `PIN: [${form.elements.pin.value}]`,
    `ESD: [${form.elements.esd.value}]`,
    `Reimage/Wipe: Yes[${mark(checkedValue("reimage"), "yes")}] No[${mark(checkedValue("reimage"), "no")}] Call Me First[${mark(checkedValue("reimage"), "call")}]`,
    `Back-up: Yes[${mark(checkedValue("backup"), "yes")}] No[${mark(checkedValue("backup"), "no")}]`,
    `Initials: [${form.elements.checkInInitials.value}]`,
    "",
    `Issue(s): ${form.elements.issues.value}`,
    "",
    "Tech Notes:",
    form.elements.techNotes.value,
    "",
    "Solutions:",
    form.elements.solutions.value,
    "",
    "Callback Notes:",
    form.elements.callbackNotes.value,
  ].join("\n");
}

function getServiceNote() {
  const plans = activePlans().filter((plan) => selectedOptions.has(plan.id));
  const tools = activeTools().filter((tool) => selectedTools.has(tool.id));
  const path =
    currentServiceType() === "upgrade"
      ? "PLANNED UPGRADE PATH"
      : `${currentServiceType().toUpperCase()} PATH`;
  const lines = [
    noteHeader(),
    `[${path}: ${plans.map((plan) => plan.label).join(" -> ") || "NO CATEGORY SELECTED"}]`,
  ];
  for (const plan of plans) {
    for (const step of plan.steps) lines.push(`-- ${step.title}`);
    const response = (planResponses[plan.id] || "").trim();
    if (response) lines.push(`   Technician response: ${response}`);
  }
  for (const tool of tools) {
    const response = (planResponses[tool.id] || "").trim();
    lines.push(`-- ${tool.step}${response ? ` -> ${response}` : " ->"}`);
  }
  if (!plans.length && !tools.length)
    lines.push("-- Select a service category or optional tool --");
  if (
    plans.length &&
    !plans.some((plan) => (planResponses[plan.id] || "").trim())
  ) {
    lines.push("-- Technician findings and conclusion --");
  }
  return lines.join("\n");
}

function getQcNote() {
  const checks = qcItems.map(([key, label]) => {
    const input = form.querySelector(`[name="qc-${key}"]`);
    return `[${input?.checked ? "X" : " "}] ${label}`;
  });
  const occtTest = form.elements.occtTest.value;
  const occtResult = form.elements.occtResult.value;
  const failure = form.elements.occtFailure.value.trim();
  return [
    "QC Checklist",
    noteHeader(),
    "",
    ...checks,
    "",
    "OCCT verification:",
    occtTest && occtResult
      ? `OCCT record: ${occtTest} -- ${occtResult.toUpperCase()}${occtResult === "failed" && failure ? ` (${failure})` : ""}`
      : "OCCT record: ________",
    "",
    "Test readings:",
    `BIOS version: ${form.elements.biosVersion.value || "________"}`,
    `Max CPU temp: ${form.elements.maxCpuTemp.value || "________"}`,
    `Max CPU power: ${form.elements.maxCpuPower.value || "________"}`,
    `Max CPU frequency: ${form.elements.maxCpuFrequency.value || "________"}`,
    `Max GPU temp: ${form.elements.maxGpuTemp.value || "________"}`,
    "",
    `Verified by: ${form.elements.checkInInitials.value || "________"}    Date completed: ${form.elements.workDate.value || "________"}`,
  ].join("\n");
}

function updatePreviews() {
  document.querySelector("#checkin-preview").textContent = getCheckInNote();
  document.querySelector("#service-preview").textContent = getServiceNote();
  document.querySelector("#qc-preview").textContent = getQcNote();
  const complete = qcItems.filter(
    ([key]) => form.querySelector(`[name="qc-${key}"]`)?.checked,
  ).length;
  document.querySelector("#qc-progress").textContent =
    `${complete}/${qcItems.length} checks`;
}

function renderQcChecklist() {
  for (const [key, labelText] of qcItems) {
    const label = document.createElement("label");
    label.className = "qc-item";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = `qc-${key}`;
    const text = document.createElement("span");
    text.textContent = labelText;
    label.append(input, text);
    qcChecklistNode.append(label);
  }
}

function saveDraft() {
  const values = Object.fromEntries(
    [...new FormData(form).entries()].filter(([name]) => name !== "imageFile"),
  );
  values.laptopMultiplier = laptopMultiplier.checked;
  values.selectedOptions = [...selectedOptions];
  values.selectedTools = [...selectedTools];
  values.planResponses = { ...planResponses };
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
  renderQcChecklist();
  const values = stored[DRAFT_KEY];
  if (values) {
    for (const [name, value] of Object.entries(values)) {
      if (["selectedOptions", "selectedTools", "planResponses"].includes(name))
        continue;
      const control = form.elements.namedItem(name);
      if (!control) continue;
      if (control instanceof RadioNodeList) {
        for (const radio of control)
          radio.checked = radio.value === String(value);
      } else if (control.type === "checkbox") control.checked = Boolean(value);
      else control.value = String(value);
    }
    for (const id of values.selectedOptions || []) selectedOptions.add(id);
    for (const id of values.selectedTools || []) selectedTools.add(id);
    Object.assign(planResponses, values.planResponses || {});
  }

  if (!form.elements.workDate.value)
    form.elements.workDate.value = todayLabel();
  if (!form.elements.esd.value) form.elements.esd.value = todayLabel();
  renderServices();
  const theme = await chrome.storage.local.get(THEME_KEY);
  applyTheme(theme[THEME_KEY] || "meta-red");
  updatePrice();
}

form.addEventListener("input", () => {
  saveDraft();
  updatePreviews();
});
form.addEventListener("change", () => {
  saveDraft();
  updatePrice();
  updatePreviews();
});

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((item) => {
      const active = item === tab;
      item.classList.toggle("active", active);
      item.setAttribute("aria-selected", String(active));
    });
    document.querySelectorAll(".tab-panel").forEach((panel) => {
      const active = panel.id === tab.getAttribute("aria-controls");
      panel.hidden = !active;
      panel.classList.toggle("active", active);
    });
  });
});

themeSelect.addEventListener("change", () => applyTheme(themeSelect.value));
serviceOption.addEventListener("change", () => {
  if (serviceOption.value) selectedOptions.add(serviceOption.value);
  renderServices();
});
optionalTool.addEventListener("change", () => {
  if (optionalTool.value) selectedTools.add(optionalTool.value);
  renderServices();
});
form.elements.device.addEventListener("change", () => {
  selectedOptions.clear();
  selectedTools.clear();
  for (const key of Object.keys(planResponses)) delete planResponses[key];
  renderServices();
});
form.elements.serviceType.addEventListener("change", () => {
  selectedOptions.clear();
  selectedTools.clear();
  for (const key of Object.keys(planResponses)) delete planResponses[key];
  renderServices();
});
qcChecklistNode.addEventListener("change", updatePreviews);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!activeTabId || !activeOrderNumber) {
    showStatus("Select a Shopify Work Mate work-order tab first.", "error");
    return;
  }

  const values = Object.fromEntries(new FormData(form).entries());
  values.laptopMultiplier = laptopMultiplier.checked;
  values.orderNumber = activeOrderNumber;
  values.checkInNote = getCheckInNote();
  values.serviceNote = getServiceNote();
  values.qcNote = getQcNote();
  values.selectedOptions = [...selectedOptions];
  values.selectedTools = [...selectedTools];
  delete values.imageFile;
  if (!selectedOptions.size && !selectedTools.size) delete values.serviceNote;
  const hasQcData =
    qcItems.some(
      ([key]) => form.querySelector(`[name="qc-${key}"]`)?.checked,
    ) ||
    Boolean(
      values.occtTest ||
      values.occtResult ||
      values.biosVersion ||
      values.maxCpuTemp ||
      values.maxCpuPower ||
      values.maxCpuFrequency ||
      values.maxGpuTemp,
    );
  if (!hasQcData) delete values.qcNote;

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
