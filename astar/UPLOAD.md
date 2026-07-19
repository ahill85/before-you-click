# Upload to astarmedia.net

Same dual-host idea as Hoops Redraft:

| Piece | Where |
|-------|--------|
| Public URL | `https://astarmedia.net/before-you-click/` |
| App + `/api/sniff` | Vercel (`before-you-click.vercel.app`) behind this proxy |

## What to upload

1. On the server, create folder: `public_html/before-you-click/`
2. Upload **only** this file into that folder:
   - `.htaccess` (from this `astar/` folder)

That’s it — no HTML build to sync. Apache reverse-proxies the Next.js app from Vercel.

## After upload — test

Open: https://astarmedia.net/before-you-click/

You should see Basil / Before You Click. Try a sniff.

Also check: https://before-you-click.vercel.app/  
→ should redirect to the astarmedia URL.

## If you get 500 / blank page

Your host may not allow `mod_proxy` (common on some shared plans). Then either:

1. Ask the host to enable `mod_proxy`, `mod_proxy_http`, `mod_headers`, and `SSLProxyEngine`, **or**
2. Tell me and we’ll switch to a Cloudflare / nginx setup instead.

## Optional: root robots note

If you maintain `https://astarmedia.net/robots.txt`, you can add:

```
Sitemap: https://astarmedia.net/before-you-click/sitemap.xml
```
