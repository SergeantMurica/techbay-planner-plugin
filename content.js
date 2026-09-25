(() => {
  if (globalThis.__techbayWorkOrderListenerInstalled) return;
  globalThis.__techbayWorkOrderListenerInstalled = true;

  const FIELD_LABELS = {
    device: ["device", "device type", "computer type"],
    makeModel: ["make/model", "make / model", "make model"],
    serial: ["serial", "serial number"],
    pin: ["pin"],
    checkInInitials: ["initials", "technician initials"],
    esd: ["esd", "esd date"],
    reimage: ["reimage/wipe", "reimage / wipe", "reimage"],
    backup: ["back-up", "backup", "back up"],
    image: ["image"],
    s2s: ["s2s"],
    priority: ["priority"],
    dailyUpdate: ["daily update"],
    issues: ["issue(s)", "issues", "issue"],
    techNotes: ["tech notes", "technician notes"],
    solutions: ["solutions", "solution"],
    callbackNotes: ["callback notes", "callback"],
    checkInNote: [
      "work order notes",
      "order notes",
      "check-in notes",
      "check in notes",
      "check-in",
      "check in",
      "notes",
      "note",
    ],
    serviceNote: ["tech notes", "technician notes"],
    qcNote: ["qc checklist", "completion notes", "qc notes"],
  };

  const APPEND_FIELDS = new Set([
    "dailyUpdate",
    "issues",
    "techNotes",
    "solutions",
    "callbackNotes",
    "checkInNote",
    "serviceNote",
    "qcNote",
  ]);

  const LABOR_PRICES = {
    "LABOR/BUILD": 199,
    "LABOR/BUILD/ADVANCED": 299,
    "LABOR/BUILD/GUIDED": 149.99,
    "LABOR/HOUR": 99.99,
    "LABOR/HOUR/VETERAN": 79.99,
    "LABOR/QFR QUICK FIX (15-30MIN)": 49.99,
    "LABOR/QF QUICK FIX GOOGLE REVIEW": 0,
  };

  function normalize(value) {
    return value.toLowerCase().replace(/\s+/g, " ").trim().replace(/:$/, "");
  }

  function isVisible(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      getComputedStyle(element).visibility !== "hidden"
    );
  }

  function labelMatches(text, keys) {
    const normalized = normalize(text);
    const padded = ` ${normalized} `;
    return keys.some(
      (key) =>
        normalized === key ||
        normalized.startsWith(`${key} `) ||
        padded.includes(` ${key} `),
    );
  }

  function controlsFromLabel(label) {
    const result = [];
    if (label.control) result.push(label.control);
    const forId = label.getAttribute("for");
    if (forId) {
      const control = document.getElementById(forId);
      if (control) result.push(control);
    }
    const nested = label.querySelector(
      "input:not([type=hidden]), textarea, select, [contenteditable=true]",
    );
    if (nested) result.push(nested);
    return result;
  }

  function accessibleText(control) {
    const labelledBy = (control.getAttribute("aria-labelledby") || "")
      .split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent || "")
      .join(" ");
    const labels = control.labels
      ? [...control.labels].map((label) => label.textContent || "").join(" ")
      : "";
    return [
      labelledBy,
      labels,
      control.getAttribute("aria-label"),
      control.getAttribute("placeholder"),
      control.getAttribute("name"),
      control.getAttribute("data-testid"),
    ]
      .filter(Boolean)
      .join(" ");
  }

  function findByAdjacentLabel(keys) {
    const selectors = "label, [class], [id], [data-testid], span, p";
    const labels = [...document.querySelectorAll(selectors)].filter(
      (element) => {
        if (!isVisible(element)) return false;
        const text = normalize(element.textContent || "");
        return keys.some((key) => text === key);
      },
    );

    for (const label of labels) {
      let container = label;
      for (let depth = 0; depth < 4 && container; depth += 1) {
        const controls = [
          ...container.querySelectorAll(
            "input:not([type=hidden]):not([type=file]), textarea, select, [contenteditable=true]",
          ),
        ].filter((control) => isVisible(control) && !control.disabled);
        if (controls.length === 1) return controls[0];
        container = container.parentElement;
      }
    }
    return undefined;
  }

  function findField(keys, exactOnly = false) {
    const labels = [...document.querySelectorAll("label")];
    for (const label of labels) {
      if (
        !isVisible(label) ||
        !keys.includes(normalize(label.textContent || ""))
      )
        continue;
      const control = controlsFromLabel(label).find(
        (item) => item.type !== "file" && isVisible(item),
      );
      if (control) return control;
    }

    if (exactOnly) return undefined;

    for (const label of labels) {
      if (!isVisible(label) || !labelMatches(label.textContent || "", keys))
        continue;
      const control = controlsFromLabel(label).find(
        (item) => item.type !== "file" && isVisible(item),
      );
      if (control) return control;
    }

    const candidates = [
      ...document.querySelectorAll(
        "input:not([type=hidden]):not([type=file]), textarea, select, [contenteditable=true]",
      ),
    ];
    return (
      candidates.find((control) => {
        if (!isVisible(control) || control.disabled) return false;
        return labelMatches(accessibleText(control), keys);
      }) || findByAdjacentLabel(keys)
    );
  }

  function dispatchValue(control, value) {
    if (control.isContentEditable) {
      control.textContent = value;
    } else {
      const prototype =
        control instanceof HTMLTextAreaElement
          ? HTMLTextAreaElement.prototype
          : control instanceof HTMLSelectElement
            ? HTMLSelectElement.prototype
            : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
      if (setter) setter.call(control, value);
      else control.value = value;
    }

    control.dispatchEvent(new Event("input", { bubbles: true }));
    control.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function appendValue(control, value) {
    const current = control.isContentEditable
      ? control.textContent
      : control.value;
    if ((current || "").includes(value.trim())) return;
    const combined = current?.trim()
      ? `${current.trimEnd()}\n\n${value}`
      : value;
    dispatchValue(control, combined);
  }

  async function setControlValue(control, value) {
    if (control instanceof HTMLInputElement && control.type === "radio") {
      const group = [
        ...document.querySelectorAll('input[type="radio"]'),
      ].filter((candidate) => candidate.name === control.name);
      const wanted = normalize(value);
      const choice = group.find((candidate) => {
        const label = candidate.labels
          ? [...candidate.labels]
              .map((item) => item.textContent || "")
              .join(" ")
          : "";
        return (
          normalize(candidate.value) === wanted ||
          normalize(label).includes(wanted)
        );
      });
      if (!choice) return false;
      choice.checked = true;
      choice.dispatchEvent(new Event("input", { bubbles: true }));
      choice.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    }

    if (control.getAttribute("role") !== "combobox") {
      dispatchValue(control, value);
      return true;
    }

    if (
      normalize(control.value || control.textContent || "") === normalize(value)
    ) {
      return true;
    }

    control.focus();
    control.click();
    dispatchValue(control, value);
    await wait(350);

    const options = [
      ...document.querySelectorAll('[role="option"], [role="menuitem"]'),
    ].filter(isVisible);
    const wanted = normalize(value);
    const option = options.find((candidate) => {
      const text = normalize(candidate.textContent || "");
      return text === wanted || text.startsWith(`${wanted} `);
    });

    if (option) {
      option.click();
      await wait(100);
      return true;
    }

    return false;
  }

  function findImageFileField() {
    const labels = [...document.querySelectorAll("label")];
    for (const label of labels) {
      if (
        !isVisible(label) ||
        !labelMatches(label.textContent || "", FIELD_LABELS.image)
      )
        continue;
      const control = controlsFromLabel(label).find(
        (item) =>
          item instanceof HTMLInputElement &&
          item.type === "file" &&
          !item.disabled,
      );
      if (control) return control;
    }
    return [...document.querySelectorAll('input[type="file"]')].find(
      (input) => {
        const label = input.labels
          ? [...input.labels].map((item) => item.textContent || "").join(" ")
          : "";
        return !input.disabled && labelMatches(label, FIELD_LABELS.image);
      },
    );
  }

  function setImageFile(input, image) {
    const encoded = image.dataUrl.split(",")[1];
    const bytes = Uint8Array.from(atob(encoded), (character) =>
      character.charCodeAt(0),
    );
    const file = new File([bytes], image.name, { type: image.type });
    const transfer = new DataTransfer();
    transfer.items.add(file);
    input.files = transfer.files;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function visibleProductOptions() {
    return [
      ...document.querySelectorAll(
        '[role="option"], [role="menuitem"], button, li',
      ),
    ].filter(
      (element) =>
        isVisible(element) && element.getAttribute("aria-disabled") !== "true",
    );
  }

  function findProductSearch() {
    const searchables = [
      ...document.querySelectorAll(
        'input, textarea, [role="searchbox"], [role="combobox"], [contenteditable=true]',
      ),
    ];
    return searchables.find((control) => {
      if (!isVisible(control) || control.disabled) return false;
      return normalize(accessibleText(control)).includes("search products");
    });
  }

  function wait(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  async function addLaborProduct(sku, quantity) {
    let search = findProductSearch();
    if (!search) {
      const trigger = [...document.querySelectorAll('button, [role="button"]')]
        .filter(isVisible)
        .find(
          (element) =>
            normalize(element.textContent || "") === "search products",
        );
      trigger?.click();
      if (trigger) {
        await wait(250);
        search = findProductSearch();
      }
    }
    if (!search) return "Labor SKU not added: product search field not found.";

    search.focus();
    await setControlValue(search, sku);
    await wait(700);

    const exact = visibleProductOptions().find((option) =>
      normalize(option.textContent || "").includes(normalize(sku)),
    );
    if (!exact)
      return `Labor SKU not added: no matching product result for ${sku}.`;

    exact.click();
    await wait(500);
    if (quantity > 1) {
      const quantityInput = [
        ...document.querySelectorAll('input[type="number"]'),
      ]
        .filter((input) => isVisible(input) && !input.disabled)
        .at(-1);
      if (quantityInput) await setControlValue(quantityInput, String(quantity));
    }

    const total = LABOR_PRICES[sku] * quantity;
    return `Added ${sku} ×${quantity} ($${total.toFixed(2)}).`;
  }

  async function fillWorkOrder(values) {
    let filled = 0;
    const missing = [];
    const fieldValues = {
      ...values,
      reimage:
        { yes: "Yes", no: "No", call: "Call Me First" }[values.reimage] ||
        values.reimage,
      backup: { yes: "Yes", no: "No" }[values.backup] || values.backup,
    };
    for (const [name, labels] of Object.entries(FIELD_LABELS)) {
      const value = String(fieldValues[name] ?? "").trim();
      if (!value) continue;

      const control = findField(labels, name === "checkInNote");
      if (!control) {
        missing.push(name === "makeModel" ? "Make/Model" : name);
        continue;
      }
      if (APPEND_FIELDS.has(name)) {
        appendValue(control, value);
        filled += 1;
      } else if (await setControlValue(control, value)) {
        filled += 1;
      } else {
        missing.push(
          `${name === "makeModel" ? "Make/Model" : name} option '${value}'`,
        );
      }
    }

    if (values.imageFile) {
      const imageInput = findImageFileField();
      if (imageInput) {
        setImageFile(imageInput, values.imageFile);
        filled += 1;
      } else if (!values.image?.trim()) {
        missing.push("Image upload");
      }
    }

    let product = "";
    if (values.laborSku && LABOR_PRICES[values.laborSku] !== undefined) {
      const quantity = values.laptopMultiplier ? 2 : 1;
      product = await addLaborProduct(values.laborSku, quantity);
    }

    const controls = document.querySelectorAll(
      "input:not([type=hidden]), textarea, select, [contenteditable=true]",
    );
    const labels = document.querySelectorAll("label");
    const embeddedFrames = [...document.querySelectorAll("iframe")]
      .map((frame) => {
        try {
          const host = new URL(frame.src, location.href).host;
          return frame.title ? `${host} (${frame.title})` : host;
        } catch {
          return "";
        }
      })
      .filter(Boolean)
      .slice(0, 4);
    return {
      ok: true,
      filled,
      missing,
      product,
      context: `${location.hostname}${location.pathname}`,
      frame: window.top === window ? "top frame" : "embedded frame",
      controlCount: controls.length,
      labelCount: labels.length,
      embeddedFrames,
    };
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== "TECHBAY_FILL_WORK_ORDER") return false;
    fillWorkOrder(message.values || {})
      .then(sendResponse)
      .catch((error) =>
        sendResponse({
          ok: false,
          error: error.message || "Shopify field fill failed.",
        }),
      );
    return true;
  });
})();
