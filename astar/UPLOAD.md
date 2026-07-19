# Upload to HostPapa (astarmedia.net)

Same pattern as Hoops Redraft — **static files on Astar**, API on Vercel.

| Piece | Where |
|-------|--------|
| Website | `public_html/before-you-click/` on HostPapa |
| Sniff API | Vercel (`https://before-you-click.vercel.app/api/sniff`) |

No SSL proxy. No `mod_proxy`. Just upload files like hoops.

## What to upload

Upload **everything inside** this folder:

`scam-detector/astar-dist/`

into:

`public_html/before-you-click/`

(Replace whatever is there from the old proxy attempt — delete the old `.htaccess` proxy version first.)

## After upload

1. Open https://astarmedia.net/before-you-click/
2. Paste a message and hit Sniff It (API calls Vercel in the background)
3. https://before-you-click.vercel.app/ should redirect here

## Rebuild later (after code changes)

```bash
cd scam-detector
npm run export:astar
```

Then re-upload `astar-dist/` to HostPapa.
