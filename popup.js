import {
  optionalToolsByDevice,
  plannerOptionsByDevice,
  serviceTypeLabels,
  serviceTypesByDevice,
} from "./lib/template-data.js";
import { DEFAULT_THEME, THEMES } from "./lib/themes.js";

const DRAFT_KEY = "techbay-work-order-draft-v1";
const THEME_KEY = "techbay-tool-theme";
const INITIALS_KEY = "techbay-technician-initials";
const form = document.querySelector("#order-form");
const status = document.querySelector("#status");
const orderNumber = document.querySelector("#order-number");
const connection = document.querySelector("#connection");
const submitLabel = document.querySelector("#submit-label");
const initialsInput = document.querySelector('[name="checkInInitials"]');
const themeSelect = document.querySelector("#theme-select");
themeSelect.replaceChildren(
  ...THEMES.map((theme) => new Option(theme.name, theme.id)),
);
const serviceOption = document.querySelector("#service-option");
const optionalTool = document.querySelector("#optional-tool");
const selectedOptionsNode = document.querySelector("#selected-options");
const selectedToolsNode = document.querySelector("#selected-tools");
const planResponsesNode = document.querySelector("#plan-responses");
const selectedOptions = new Set();
const selectedTools = new Set();
const planResponses = {};
const checkInFieldNames = new Set([
  "device",
  "priority",
  "makeModel",
  "serial",
  "pin",
  "checkInInitials",
  "workDate",
  "esd",
  "reimage",
  "backup",
  "issues",
  "techNotes",
  "solutions",
  "callbackNotes",
  "s2s",
  "image",
  "dailyUpdate",
]);
let activeTabId;
let activeOrderNumber = "";
let draftSaveTimer;

function todayLabel() {
  const date = new Date();
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function showStatus(message, kind = "") {
  status.textContent = message;
  status.className = `status ${kind}`.trim();
}

function updateSubmitLabel(tabName) {
  submitLabel.textContent =
    tabName === "service" ? "Copy Tech Notes" : "Fill Check-in and append note";
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

function applyTheme(themeId) {
  const palette =
    THEMES.find((item) => item.id === themeId) ||
    THEMES.find((item) => item.id === DEFAULT_THEME);
  const theme = palette.id;
  document.documentElement.dataset.theme = theme;
  for (const [token, value] of Object.entries(palette)) {
    if (["id", "name", "onAccent"].includes(token)) continue;
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

function updateServiceTypeOptions() {
  const serviceType = form.elements.serviceType;
  const availableTypes = serviceTypesByDevice[currentPlannerDevice()];
  const selectedType = availableTypes.includes(serviceType.value)
    ? serviceType.value
    : availableTypes[0];

  serviceType.replaceChildren(
    ...availableTypes.map((type) => new Option(serviceTypeLabels[type], type)),
  );
  serviceType.value = selectedType;
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
  delete planResponses[`${id}:why`];
  renderServices();
}

function removeTool(id) {
  selectedTools.delete(id);
  delete planResponses[id];
  delete planResponses[`${id}:why`];
  renderServices();
}

function renderPlanResponses() {
  planResponsesNode.replaceChildren();
  const plans = activePlans().filter((plan) => selectedOptions.has(plan.id));
  const tools = activeTools().filter((tool) => selectedTools.has(tool.id));
  for (const item of [...plans, ...tools]) {
    const label = document.createElement("div");
    label.className = "field response-field";
    const title = document.createElement("span");
    title.textContent = `${item.label} · What you did and found`;
    const guide = document.createElement("details");
    guide.className = "step-guide";
    guide.open = true;
    const guideSummary = document.createElement("summary");
    guideSummary.textContent = item.steps
      ? "Suggested steps"
      : "Suggested step";
    const guideList = document.createElement("ol");
    for (const text of item.steps
      ? item.steps.map((step) => step.title)
      : [item.step]) {
      const entry = document.createElement("li");
      entry.textContent = text;
      guideList.append(entry);
    }
    guide.append(guideSummary, guideList);
    const why = document.createElement("input");
    why.className = "why-input";
    why.autocomplete = "off";
    why.value = planResponses[`${item.id}:why`] || "";
    why.placeholder = "Why are we checking this? (optional)";
    why.addEventListener("input", () => {
      planResponses[`${item.id}:why`] = why.value;
      saveDraft();
      updatePreviews();
    });
    const textarea = document.createElement("textarea");
    textarea.rows = 3;
    textarea.value = planResponses[item.id] || "";
    textarea.placeholder =
      "One line per action, past tense. Example: Pulled RAM; test RAM in; no post, DRAM light on";
    textarea.addEventListener("input", () => {
      planResponses[item.id] = textarea.value;
      saveDraft();
      updatePreviews();
    });
    label.append(title, guide, why, textarea);
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
  const initials = initialsInput.value.trim() || "__";
  return `${date} ${initials}`;
}

function toBullets(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^[-*]\s*/, ""))
    .filter(Boolean)
    .map((line) => `-${line}`);
}

function formatDailyUpdate(text) {
  const update = text.trim();
  if (!update) return "";
  const initials = initialsInput.value.trim() || "__";
  return `${todayLabel()} ${initials} - ${update}`;
}

function getCheckInNote() {
  return [
    `PIN: ${form.elements.pin.value}`,
    `ESD: ${form.elements.esd.value}`,
    `Reimage/Wipe: Yes[${mark(checkedValue("reimage"), "yes")}] No[${mark(checkedValue("reimage"), "no")}] Call Me First[${mark(checkedValue("reimage"), "call")}]`,
    `Back-up: Yes[${mark(checkedValue("backup"), "yes")}] No[${mark(checkedValue("backup"), "no")}]`,
    `Initials: ${initialsInput.value}`,
    "",
    `Issue(s): ${form.elements.issues.value}`,
    "",
    "Tech Notes:",
    "",
    "Solutions:",
    "",
    "Callback Notes:",
  ].join("\n");
}

function getServiceNote() {
  const plans = activePlans().filter((plan) => selectedOptions.has(plan.id));
  const tools = activeTools().filter((tool) => selectedTools.has(tool.id));
  const lines = [noteHeader()];
  for (const item of [...plans, ...tools]) {
    const why = (planResponses[`${item.id}:why`] || "").trim();
    lines.push("", `${item.label}${why ? ` (${why})` : ""}:`);
    lines.push(...toBullets(planResponses[item.id] || ""));
  }
  if (lines.length === 1) lines.push("-");
  return lines.join("\n");
}

function updatePreviews() {
  document.querySelector("#checkin-preview").textContent = getCheckInNote();
  document.querySelector("#service-preview").textContent = getServiceNote();
}

function saveDraft(immediate = false) {
  clearTimeout(draftSaveTimer);

  const persist = () => {
    const draft = Object.fromEntries(new FormData(form).entries());
    delete draft.workDate;
    for (const checkbox of form.querySelectorAll(
      'input[type="checkbox"][name]',
    )) {
      draft[checkbox.name] = checkbox.checked;
    }
    draft.selectedOptions = [...selectedOptions];
    draft.selectedTools = [...selectedTools];
    draft.planResponses = { ...planResponses };

    chrome.storage.local
      .set({
        [DRAFT_KEY]: draft,
        [INITIALS_KEY]: initialsInput.value,
      })
      .catch((error) =>
        console.error("Could not save work-order draft.", error),
      );
  };

  if (immediate) persist();
  else draftSaveTimer = setTimeout(persist, 200);
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

  const stored = await chrome.storage.local.get([DRAFT_KEY, INITIALS_KEY]);
  const values = stored[DRAFT_KEY];
  if (values) {
    for (const [name, value] of Object.entries(values)) {
      if (
        [
          "selectedOptions",
          "selectedTools",
          "planResponses",
          "workDate",
        ].includes(name)
      )
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
  if (typeof stored[INITIALS_KEY] === "string")
    initialsInput.value = stored[INITIALS_KEY];

  if (!form.elements.workDate.value)
    form.elements.workDate.value = todayLabel();
  if (!form.elements.esd.value) form.elements.esd.value = todayLabel();
  updateServiceTypeOptions();
  renderServices();
  const theme = await chrome.storage.local.get(THEME_KEY);
  applyTheme(theme[THEME_KEY] || DEFAULT_THEME);
}

form.addEventListener("input", () => {
  saveDraft();
  updatePreviews();
});
form.addEventListener("change", () => {
  saveDraft(true);
  updatePreviews();
});

initialsInput.addEventListener("input", () => {
  saveDraft();
  updatePreviews();
});
initialsInput.addEventListener("change", () => saveDraft(true));
initialsInput.addEventListener("blur", () => saveDraft(true));
form.addEventListener("focusout", () => saveDraft(true));
window.addEventListener("pagehide", () => saveDraft(true));

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
    updateSubmitLabel(tab.dataset.tab);
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
  updateServiceTypeOptions();
  renderServices();
});
form.elements.serviceType.addEventListener("change", () => {
  selectedOptions.clear();
  selectedTools.clear();
  for (const key of Object.keys(planResponses)) delete planResponses[key];
  renderServices();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const activeTab = document.querySelector(".tab.active")?.dataset.tab;
  if (activeTab === "service") {
    const note = getServiceNote();
    try {
      await navigator.clipboard.writeText(note);
      showStatus("Tech note copied. Paste it into WorkMate Notes.", "success");
    } catch {
      showStatus("Could not copy the note to the clipboard.", "error");
    }
    return;
  }

  if (!activeTabId || !activeOrderNumber) {
    showStatus("Select a Shopify Work Mate work-order tab first.", "error");
    return;
  }

  const formValues = Object.fromEntries(new FormData(form).entries());
  const values = { orderNumber: activeOrderNumber };
  for (const [name, value] of Object.entries(formValues)) {
    if (checkInFieldNames.has(name)) values[name] = value;
  }
  values.dailyUpdate = formatDailyUpdate(formValues.dailyUpdate || "");
  values.checkInNote = getCheckInNote();

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

    const response = await sendFillMessage(activeTabId, values);
    if (!response?.ok)
      throw new Error(response?.error || "The Shopify page did not respond.");

    const parts = [
      `Filled ${response.filled} field${response.filled === 1 ? "" : "s"}.`,
    ];
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
