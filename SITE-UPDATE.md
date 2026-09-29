# C³ Executive Suite — site update

## Rationale

The site now presents C³ as an executive services firm with two clear practices: Executive Leadership and Financial Services. Seven capabilities establish breadth, while situations, engagement models and selected work show how the firm operates. The existing restrained visual system remains, with clearer navigation and direct paths for both executive leadership and accounting needs. Recent approved facts take precedence over older figures in the brief: the $200 million+ transaction range, the ten-week global recovery and audit, and Mark’s operational leadership in education and solar remain prominent.

## Complete source files

1. [index.html](./index.html) — firm homepage
2. [model.html](./model.html) — Executive Leadership
3. [accounting.html](./accounting.html) — Financial Services
4. [privacy.html](./privacy.html) — unchanged policy text with shared navigation and presentation

Each is a complete standalone HTML document with the same inline stylesheet. No build step or new production dependency is required.

## Changelog

| Change | Reason |
| --- | --- |
| Reframed homepage and metadata around interim and fractional C-suite leadership | Establish the firm’s breadth immediately |
| Added seven capabilities, two practices, situations, industries and engagement models | Give customers clear paths by business need |
| Shared six-item header navigation, expanded footer, practice breadcrumbs and related-practice links | Make both practices easy to find |
| Added six homepage routes to Financial Services | Make accounting work accessible from multiple entry points |
| Retained $25M–$200M+ transaction experience | Preserve the latest approved figure |
| Retained the global, multi-entity professional services case | Preserve approximately $100M revenue, 18 months of unclosed books, the NetSuite and legacy-record problems, an entirely new team, executive ownership, cleanup and audit within ten weeks, and due diligence leadership |
| Retained the education and solar accounts and operational CFO biography | Preserve cleanup, the education sale, one year as interim CFO through permanent onboarding, and significant operational responsibilities in both businesses |
| Kept the SaaS, nonprofit and reconciliation examples | Retain existing approved work without client names |
| Rebuilt shared CSS and fixed malformed case-card and screen-reader selectors | Restore intended styling and accessibility behavior |
| Preserved privacy policy text, commercial terms, contact endpoint and analytics | Retain approved policies and integrations |
| Kept the assessment form and its endpoints removed | Preserve the previous removal request |
| Updated legacy timing.html to mirror the leadership page with its canonical URL | Avoid a stale page with obsolete positioning or navigation |

## QA checklist

- [x] Four pages checked at 375, 768, 1024 and 1440 pixels: no horizontal overflow; one H1; unique IDs.
- [x] Header/footer links and local anchor destinations checked on every page.
- [x] Mobile menus include all links; initial focus, forward/reverse focus loop, Escape and same-page navigation checked.
- [x] Accounting query selects `Accounting & CFO services` and changes the contact heading.
- [x] Contact validation, disabled/pending state, error/retry and success checked with mocked responses. The original five payload keys and `/api/contact` endpoint remain unchanged. No test inquiry was sent.
- [x] Calendly labels, destination, new-tab behavior and rel attributes checked.
- [x] Breadcrumbs, practice cross-links and six homepage Financial Services routes present.
- [x] Case borders render correctly; shared inline CSS matches across pages.
- [x] Desktop and mobile visual review completed. Automated axe WCAG A/AA checks, including text contrast, found zero violations on all four pages at 375 and 1440 pixels.
- [x] Privacy policy text compared with the previous version and is unchanged.
- [x] Vercel Insights, Clarity, Google Analytics and the existing Tidio URL retained on every page; Tidio remains scheduled two seconds after window load.
- [x] No new runtime libraries; no client names or placeholder credentials introduced.
- [ ] Lighthouse Performance 90+ and Accessibility 95+: targets retained; numeric Lighthouse scores were not measured in this environment. Axe results are not a substitute for a Lighthouse score.
