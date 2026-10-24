# Custom 404 deployment

`src/pages/404.astro` builds `dist/404.html`. The repository's `nginx.conf`
maps missing routes to that document while retaining the HTTP 404 status:

```nginx
error_page 404 /404.html;
location = /404.html {
    internal;
}
```

## Why a normal code deployment is not sufficient

The current GitHub Actions workflow copies only `dist/` into
`/home/suiyi/blog/dist/`. It does **not** copy or reload `nginx.conf`.
The Compose file mounts `./nginx.conf` into the blog container, so the running
host configuration must also receive the reviewed mapping. Merely publishing
`404.astro` does not prove that the live server serves the custom error page.

## Separate, explicitly approved server step

1. Inspect the running container's mounted configuration and its host path.
   Do not assume the runner checkout is the deployed Compose directory.
2. Back up that configuration. Add only the mapping above to the existing
   `server` block, preserving any newer host changes, headers and other rules.
3. Validate with `docker compose exec blog nginx -t` from the actual deployed
   Compose directory. Reload with `docker compose exec blog nginx -s reload`
   only if validation succeeds. If a bind mount was replaced rather than
   edited in place, first verify that the container sees the updated file.
4. Request a new, nonexistent URL on the public domain. Confirm both HTTP 404
   and the custom “这一页，暂时没有找到。” body; also check the homepage,
   an article and static assets still return their expected responses.

These instructions do not authorize server changes. Local Nginx tests can
verify the proposed rule, but cannot establish the deployed host state.
No security header, TLS, HSTS, CSP or caching policy is changed by this patch.
