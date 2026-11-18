# Transcribe text in old ad images

The old Advertise page had 17 sample ads. Most were images with their text baked in. The URLs are listed in
`data/scraped/pages.json` under `pages["/advertise.htm"].image_text_needed`, and two hotel badges are listed under
`pages["/hotels.htm"].image_text_needed`.

To do:
- Transcribe any taglines or offers worth keeping into each business's `tagline` or `description` in the admin.
- Ask advertisers for new, high-resolution logos. Most old images are low-res raster files.
