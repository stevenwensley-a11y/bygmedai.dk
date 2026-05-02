# bygmedai.dk — ARCHIVED

This repo is archived as of S397 (2026-05-02).

**Live source for bygmedai.dk:** [Bygmedai/bygmedai-11ty](https://github.com/Bygmedai/bygmedai-11ty)

## Why archived

- This repo and `Bygmedai/bygmedai-11ty` both had CNAME=bygmedai.dk. Live traffic was served by `bygmedai-11ty` (Cloudflare-served, 11ty-built). This repo was a parallel/legacy version.
- Strategi-page (PR #2) and cookie-consent fix (issue #3) were ported to `bygmedai-11ty` in [PR #56](https://github.com/Bygmedai/bygmedai-11ty/pull/56) and merged @ `7096dcd62f`.
- CNAME removed S397 to prevent future DNS conflicts.

## What lives here historically

- 29 vanilla HTML files (legacy hand-written version)
- `/strategi/` page from Claude Design S396 (now ported to `src/strategi.njk` on bygmedai-11ty)
- Cookie-consent patch from PR #4 (S397, superseded by bygmedai-11ty#56)

## For future work

Use `Bygmedai/bygmedai-11ty`. Do not push to this repo.

— Haruki S397