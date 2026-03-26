## DNS Configuration

### Provider: Cloudflare (recommended)

Add the following DNS records for hosted-resumes.com:

| Type  | Name | Content        | Proxy |
|-------|------|----------------|-------|
| A     | @    | <server-ip>    | off   |
| A     | *    | <server-ip>    | off   |
| A     | www  | <server-ip>    | off   |

The wildcard A record (*.hosted-resumes.com) routes all subdomain
traffic to the VPS. Caddy handles TLS termination, so Cloudflare
proxy should be OFF (DNS only / grey cloud) to avoid
double-proxying and certificate conflicts.

If using Cloudflare proxy (orange cloud) instead:
- Disable Caddy's TLS entirely (Cloudflare terminates TLS).
- Set Cloudflare SSL mode to "Full (Strict)".
- Caddy still needs the wildcard block but without the tls
  directive.
- This is not recommended because Cloudflare's free tier does
  not proxy wildcard subdomains - it requires the Advanced
  Certificate Manager add-on ($10/month).

### API Token for DNS-01 Challenge

Create a Cloudflare API token at:
https://dash.cloudflare.com/profile/api-tokens

Use the "Edit zone DNS" template with:
- Permissions: Zone > DNS > Edit
- Zone Resources: Include > Specific zone > hosted-resumes.com

Set the token as CLOUDFLARE_API_TOKEN in the Caddy process
environment (systemd EnvironmentFile, .env, etc.).

### Alternative DNS Providers

If not using Cloudflare, replace the dns cloudflare plugin with
the appropriate caddy-dns plugin for your provider (e.g.,
caddy-dns/route53, caddy-dns/digitalocean). The Caddyfile tls
block syntax is the same; only the plugin name and env var change.
See https://github.com/caddy-dns for available plugins.

### Verifying DNS

After setting records, verify propagation:

    dig hosted-resumes.com +short
    dig *.hosted-resumes.com +short
    dig test.hosted-resumes.com +short

All three should return the server IP.

## Caddy Installation

Caddy must be built with the DNS provider plugin. The standard
Caddy binary from apt/dnf does not include it.

### Option A: xcaddy (recommended)

    xcaddy build --with github.com/caddy-dns/cloudflare

This produces a custom caddy binary with the Cloudflare DNS
module compiled in.

### Option B: Docker

    FROM caddy:builder AS builder
    RUN xcaddy build --with github.com/caddy-dns/cloudflare
    FROM caddy:latest
    COPY --from=builder /usr/bin/caddy /usr/bin/caddy

### Option C: Nix

Add caddy and xcaddy to shell.nix or the deploy nix expression
if deploying via NixOS.

## Running Caddy

### With systemd

    [Unit]
    Description=Caddy reverse proxy for hosted-resumes.com
    After=network-online.target
    Wants=network-online.target

    [Service]
    Type=notify
    ExecStart=/usr/bin/caddy run \
      --config /etc/caddy/Caddyfile \
      --environ
    ExecReload=/usr/bin/caddy reload \
      --config /etc/caddy/Caddyfile
    EnvironmentFile=/etc/caddy/caddy.env
    Restart=on-failure
    RestartSec=5
    LimitNOFILE=1048576

    [Install]
    WantedBy=multi-user.target

Copy deploy/Caddyfile to /etc/caddy/Caddyfile and
deploy/caddy.env to /etc/caddy/caddy.env on the server.
