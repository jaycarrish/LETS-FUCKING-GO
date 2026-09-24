# Panel Walk — project record

Status: LIVE. Offline-capable release published and browser-tested; physical iPhone installation / airplane-mode test pending.
Offline release: 3.1.1. Estimator core: 3.0.0, unchanged.
Updated: 2026-09-24

## Purpose and delivery

A low-reading-load field estimator for a 100A-to-200A electrical panel upgrade. One question / answer field at a time, large controls, Back / Next / Skip, saved progress, private pricing and a client-only estimate. Deliver the hosted working entry point, not a ChatGPT HTML attachment or simulated form in chat.

Offline / installable entry: https://jaycarrish.github.io/LETS-FUCKING-GO/panel-walk/offline.html#resume-bc
Original entry remains available: https://jaycarrish.github.io/LETS-FUCKING-GO/panel-walk/

The continuation fragment initializes capacity-increase and new-equipment goals on a first visit and opens the equipment question. It does not overwrite an existing saved walk. New walks start from the goals question.

## Ownership and source

This file owns Panel Walk project status, requirements, known limitations and next actions. Source is isolated under panel-walk/ in jaycarrish/LETS-FUCKING-GO. Existing Pages publishing infrastructure is reused; other applications and their source are unchanged.

App introduction commit: 3125833e232c7bac9293da8510ab334846fab2f3
Unchanged index.html blob: 1d3338e8bf08724d1c9c18ccc082d19263aa1a77
Offline release commit: 15be79680609139b7172692f986857c9f84e3f03

## Offline implementation

- offline.html adds a small install/readiness surface around the original same-origin estimator. The estimator logic and localStorage key panel-walk-v3 are unchanged.
- The service worker precaches the app, offline entry, manifest and icons, then serves those assets cache-first. No successful origin response is needed for cached reopening or calculations.
- Readiness is based on a versioned worker response that confirms every required asset exists, not merely registration success. Failed network refreshes do not override a verified ready cache.
- A standalone web-app manifest and Home Screen icons are supplied. One online setup is required on the browser / installed app that will be used onsite.
- iPhone procedure: open the offline entry in Safari; Share > Add to Home Screen; enable Open as Web App if shown; Add. Open the new icon while online and wait for Ready offline. Then test reopening with Wi-Fi and cellular unavailable before relying on it onsite.
- The same-browser upgrade preserves existing answers. Safari and a separately installed Home Screen app may have separate data stores; do not promise automatic migration. Private backup export / restore is provided. Never delete the old walk or clear browser data to perform the upgrade.
- Questions, inputs, pricing, local save, client estimate generation and backup creation do not require a backend. Sending an estimate requires connectivity. Browser data deletion or cache eviction can remove local files / notes; keep a private backup.

## Verified evidence — offline release

Offline acceptance run: 36052897363; job 107812617806; completed successfully.
Artifact: panel-walk-offline-evidence, ID 10830868804 (seven-day GitHub retention).
Downloaded offline-acceptance.json: PASS, release 3.1.1, 34 passing assertions. Source hashes in the report match both the published assets and downloaded local copies. Phone-sized WebKit screenshots were visually inspected.

Chromium testing: actual hosted HTTPS app; browser network disabled with uncached-request negative control; full interview, price calculation, client-only estimate, printable content and private backup; tab close/reopen and full browser process restart with networking still disabled; saved data retained.

WebKit testing: actual hosted HTTPS installation / readiness verified first. Then identical hash-verified source was served by a local test origin, the server was stopped and uncached requests were confirmed to fail. The complete interview, pricing, client estimate, printable content, backup, reload and tab close/reopen passed with zero successful origin requests throughout the outage. No WebKit offline-emulation flag was used for this accepted test.

The original hosted-core regression also completed successfully in run 36052897310. This is additional regression evidence, not a substitute for the new offline acceptance test.

Test calculation fixture: direct cost $3,200; overhead $320; reserve $352; planned cost $3,872; 30% target margin and $50 upward rounding yield $5,550. These are synthetic test inputs, not this client's estimate or suggested labor rates.

## Limits and prior failures

Version 3.0.0 online testing passed 55 checks in run 35969834492 but WebKit offline emulation failed. Initial 3.1.0 diagnostics showed that this Playwright WebKit persistent-profile configuration failed to register workers; an ephemeral WebKit context registered and verified all assets. Neither initial failure is silently relabeled as a pass.

Playwright issue https://github.com/microsoft/playwright/issues/42775 documents a similar offline-emulation failure even for service-worker literal responses, with origin-stopped controls passing. The accepted WebKit test therefore uses a stopped real origin and records that this is not identical to device airplane mode.

Physical iPhone Home Screen installation, a full WebKit/iPhone process restart while offline, and native iOS share/print dialogs remain unverified. Chromium process restart is verified. The browser acceptance result must not be described as a physical iPhone test or a permanent-storage guarantee.

## Pricing and data boundaries

No invented completed-job labor or material values are supplied. Overhead, contingency and target margin are labeled editable starter choices. Margin is applied once to direct costs plus overhead and reserve; no double material markup. Unknown essential costs block a complete quote. Unresolved technical scope remains explicit as estimate conditions. This tool is not an electrical design calculation, contract or payment request; no deposit is assumed.

Answers remain in browser local storage, not a server database. Client text and print output use explicit selected fields and exclude private costs / margin / purchasing notes. No client estimate was sent during testing.

## Next action

Install / open the offline entry once while connected, wait for Ready offline, then verify opening the Home Screen icon with Wi-Fi and cellular disabled. Continue from the new-equipment question using actual field findings and costs. Do not treat earlier renders or speculative purchasing lists as approved electrical design.
