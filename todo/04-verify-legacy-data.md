# Verify data problems found on the old site

The scrape found these mistakes on the live site. They are recorded in each business's `notes` in
`data/scraped/businesses.json`. Confirm each one with the owner, then fix it in the admin.

- The Branson Duck Tours logo linked to That Hippies House's Facebook page.
- The High Platinum Dancewear logo linked to the Secret Garden website.
- John A. Moore's Facebook icon pointed to Concrete Creations. It was set to null in the import.
- Truth Traveler's text links went to wranglershonkytonk.com.
- On `hotels-in-branson.htm`, the Duttons Inn "Visit Website" button pointed to a Clarion hotel page.
- On `hotels.htm`, several photos had the wrong alt text: Lynina Inn, Retro Hotel and Gobblers were all labelled "Branson Knights".
- Mamba LLC (lawn care) only appeared on the home page and has no category. Assign one in the admin.
- Names with typos were corrected during import ("Entertain Center", the On the Ball zip code 64616 → 65616). Confirm these.
- Addresses for AmericInn, Lilley's Landing, Retro Hotel and Gobblers Mountain came from Google Maps links, not from page text. Confirm these.
- Many listings date from 2019–2024. Check that each business is still open.
