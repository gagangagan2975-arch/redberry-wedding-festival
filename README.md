# REDBERRY — Wedding & Grand Fest Shoot + Edit

Landing page for REDBERRY, a photo and video studio that shoots and edits weddings and grand festivals. It has an interactive 3D "berry" hero scene, a services overview, a gallery style preview, three packages (Silver, Gold, Platinum), and a booking form.

## Tech
- Plain HTML, CSS, and vanilla JavaScript with no build step (`public/`)
- Netlify Forms collects booking requests (form name: `booking`)
- Netlify hosting (`netlify.toml` publishes `public/`)

## Run locally
```
netlify dev
```
Or open `public/index.html` in a browser. The form only submits on Netlify or under `netlify dev`.

## Next steps
- Replace the gallery style previews with real photos and videos
- Update package details and pricing to match current offers
- Set up email notifications for new bookings in the Netlify UI (Forms → Submission notifications)
