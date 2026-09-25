# Techbay Work Order Assistant

Chrome Manifest V3 extension for managing a Shopify Admin Work Mate work order from the browser toolbar. The popup includes check-in, device-specific service plans, technician responses, QC, and the shared Techbay tool themes.

## Install for local use

1. Open `chrome://extensions` in Chrome or a Chromium-based browser.
2. Turn on **Developer mode**.
3. Choose **Load unpacked** and select this `techbay-planner-plugin` folder.
4. Open a Shopify Admin Work Mate URL such as `/apps/work-mate/work-orders/SO-%231774`, then open the extension from the toolbar.

## Use

Use the **Check in**, **Choose this service**, and **QC Checklist** tabs to enter order details, select desktop or laptop service plans and tools, record a response for each plan, and track final checks. Select a color theme from the header. **Append notes and fill order** adds the generated check-in, service, and QC blocks to their matching WorkMate note fields and fills matching order fields. Existing note text is preserved, and the same generated block is not appended twice. On first use, Chrome asks permission to access WorkMate's embedded app at `app.workmatepos.co`; allow it so the extension can reach the order fields inside Shopify's cross-origin frame. The optional labor picker remains available on the Check in tab. Confirm all fields and pricing in Shopify, then use Shopify's own save or submit controls.

The extension does not submit or change order status. Check-in details, plan selections and responses, QC readings, and theme choice are saved locally with `chrome.storage.local`.

## Notes

- The extension requests access only to Shopify Admin and the WorkMate embedded app host. Chrome stores the WorkMate host approval for this extension until revoked.
- Shopify can change its product picker markup. If a field or product result is not found, the extension reports that in its popup; enter that value through Shopify as usual.
- Labor products must already exist in the store with the listed SKU names. Price displays in the extension are estimates based on the supplied labor list.
