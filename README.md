# hosted-resumes.com

SaaS platform for hosting JOBL-formatted resumes with live preview, themes, and PDF export on personal subdomains.

## Overview

hosted-resumes.com is a multi-tenant SaaS platform that enables users to create, edit, and host professional resumes using the [JOBL (Job Lang)](https://github.com/ducks/jobl) format. Users get their own subdomain (e.g., `username.hosted-resumes.com`) where their resume is publicly accessible.

## Features

- **Structured Resume Editor**: Web-based form editor for creating JOBL-formatted resumes
- **Live Preview**: Real-time preview of resume changes while editing
- **Multiple Themes**: Choose from Classic, Modern, and Minimal themes
- **PDF Export**: Download resumes as professionally-formatted PDFs via Rust microservice
- **Subdomain Hosting**: Each user gets a personalized subdomain
- **Version History**: Track changes to resumes over time
- **Asset Management**: Upload profile photos and other assets to S3

## Tech Stack

- **Frontend**: SvelteKit with TypeScript
- **Backend**: SvelteKit API routes + PostgreSQL
- **PDF Service**: Rust microservice wrapping [SRG](https://github.com/ducks/srg) (Static Resume Generator)
- **Storage**: PostgreSQL for data, S3-compatible storage for assets
- **Hosting**: Wildcard DNS routing via Caddy

## Pricing Tiers

- **Free**: 1 resume, basic themes, subdomain hosting
- **Pro** ($5/mo): Unlimited resumes, all themes, priority support
- **Business** ($15/mo): Custom domain support, analytics, white-label options

## Architecture

Multi-tenant architecture with:
- Host-header routing to distinguish marketing site, app routes, and tenant subdomains
- Row-level tenant isolation via `user_id` foreign keys
- Session-based authentication
- Immutable version history for all resume changes

## Development Status

Currently in planning phase. See [`.finna/roadmap.arf`](./.finna/roadmap.arf) for the complete 23-step implementation roadmap.

## Related Projects

- [JOBL](https://github.com/ducks/jobl) - TOML-based resume format specification (Job Lang)
- [SRG](https://github.com/ducks/srg) - Static Resume Generator (Rust CLI)
- [finna](https://github.com/ducks/finna) - Multi-model spec writer used for architecture planning

## License

MIT
