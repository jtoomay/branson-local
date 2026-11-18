# Ad placements managed in the admin

**Old site:** sold a header on the front page ($200/yr), a front-page banner ($125/yr), an inside-page banner ($75/yr), and a listing with photo ($50/yr). Placement was hand-built in Xara. The home page also had "Advertise here" tiles for Fishing/Boating, Wedding and Venues.

**First build:** `featured` flag on businesses drives the home-page featured grid. Empty categories (fishing-boating, wedding-venues) render an "Advertise here" CTA.

**To do:**
- `ad_placements` table: id, business_id, slot (`home_header` | `home_banner` | `category_banner` | `listing_photo`), category_id (nullable), image_url, link_url, starts_on, ends_on, is_active.
- Admin CRUD screen + image upload to the `logos` bucket (or a new `ads` bucket).
- Render slots on home + category pages; fall back to "Advertise here" when empty.
