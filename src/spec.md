# Specification

## Summary
**Goal:** Remove all watermark/disclaimer messaging across the site and replace the global/top and ID footer disclaimer text with “ORDER NOW”.

**Planned changes:**
- Replace the global top banner text “Not valid for official identification” with “ORDER NOW” so it displays consistently site-wide.
- Remove all UI instances of the disclaimer sentence “These identification cards are not valid for official identification or legal use. For informational purposes only.” (including any centralized copy/constants feeding it).
- Remove all UI instances of the order-form disclaimer text “Not valid for official identification or legal use.” (including any centralized copy/constants feeding it).
- Update the ID card preview/export/print footer text by removing “NOT VALID FOR OFFICIAL IDENTIFICATION” and replacing it with “ORDER NOW”.
- Remove all watermark overlays/components/CSS/DOM elements so no watermarks appear on any page or in ID outputs (preview, PNG export, print).

**User-visible outcome:** The site no longer shows watermark or disclaimer text anywhere, and users see “ORDER NOW” in the top banner and on the ID card footer in preview, exported PNGs, and printed output.
