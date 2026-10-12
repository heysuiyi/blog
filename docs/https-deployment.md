# HTTPS and static-site deployment

The public site is https://putl.online. Astro builds static files into `dist`.
The Compose service publishes Nginx only on `127.0.0.1:4321` on the deployment
machine. Keep this loopback binding when the tunnel runs on that same host.

## Why redirects were downgrading to HTTP

Nginx receives HTTP on its internal port 80. Its default absolute directory
redirects therefore emitted `http://putl.online/blog/` for `/blog`, even when
the visitor used HTTPS. `absolute_redirect off` in `nginx.conf` emits `/blog/`
instead, preserving the visitor's scheme. Cloudflare Always Use HTTPS remains
responsible for upgrading requests initially made over HTTP.

The configuration also disables directory listings, denies hidden paths, and
adds MIME-sniffing and framing protections. Its CSP intentionally does not
restrict script/style sources; a full injection-mitigation CSP needs separate
testing of Astro's inline scripts and styles. HSTS is not enabled here.

## Apply on the deployment machine

The current GitHub Actions workflow copies only `dist` into `/home/suiyi/blog`.
It does not synchronize Compose or Nginx configuration. Updating the repository
alone therefore does not activate these Nginx changes.

1. Back up the deployment machine's existing Compose file and any custom Nginx
   configuration. Compare with the repository before replacing local settings.
2. Place this repository's `compose.yaml` and `nginx.conf` together in
   `/home/suiyi/blog`, next to the existing `dist` directory. Ensure `nginx.conf`
   exists as a regular file before running Compose.
3. From `/home/suiyi/blog`, validate the configuration:

   ```sh
   docker compose config --quiet
   docker compose run --rm --no-deps blog nginx -t
   ```

4. Apply the new mount by recreating the service (a restart alone does not add
   mounts). This can cause a brief interruption:

   ```sh
   docker compose up -d --force-recreate blog
   ```

5. Deploy rebuilt `dist` through the usual workflow to update canonical, RSS,
   and sitemap URLs. Verify the public endpoints:

   ```sh
   curl -I http://putl.online/
   curl -I https://putl.online/blog
   curl -I https://putl.online/about
   curl -IL --max-redirs 5 https://putl.online/blog
   ```

   HTTP must redirect to HTTPS. Directory redirects should have relative
   `Location: /blog/` / `/about/` values (or HTTPS if rewritten by the edge),
   never `http://`. The final response must be 200 and include the new headers.

If configuration validation fails, do not recreate the running service. To
roll back an applied change, restore the backed-up configuration and recreate
the service with its previous Compose settings.
