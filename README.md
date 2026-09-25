# Techbay Work Order Assistant

Chrome Manifest V3 extension for filling the custom fields on a Shopify Admin Work Mate work order. It runs alongside the Techbay Note Planner; the planner's local drafts, note generation, and clipboard actions are unchanged.

## Install for local use

1. Open `chrome://extensions` in Chrome or a Chromium-based browser.
2. Turn on **Developer mode**.
3. Choose **Load unpacked** and select this `techbay-planner-plugin` folder.
4. Open a Shopify Admin Work Mate URL such as `/apps/work-mate/work-orders/SO-%231774`, then open the extension from the toolbar.

## Use

Enter any device details, choose an optional labor SKU, then select **Fill active work order**. On first use, Chrome asks permission to access WorkMate's embedded app at `app.workmatepos.co`; allow it so the extension can reach the order fields inside Shopify's cross-origin frame. The extension fills matching WorkMate fields and, when selected, searches the Shopify product picker for the labor SKU. For laptop repairs above Windows-level work, enable the 2× option; the extension attempts to set the added line quantity to two. Confirm all fields and pricing in Shopify, then use Shopify's own save or submit controls.

The extension does not submit, change order status, or replace Shopify behavior. Values in the extension form are saved locally with `chrome.storage.local`.

## Notes

- The extension requests access only to Shopify Admin and the WorkMate embedded app host. Chrome stores the WorkMate host approval for this extension until revoked.
- Shopify can change its product picker markup. If a field or product result is not found, the extension reports that in its popup; enter that value through Shopify as usual.
- Labor products must already exist in the store with the listed SKU names. Price displays in the extension are estimates based on the supplied labor list.
