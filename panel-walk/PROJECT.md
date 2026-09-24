# Panel Walk — project record

Status: LIVE; online core workflow verified; physical-device field use pending.
Version: 3.0.0
Updated: 2026-09-24

## Purpose and delivery

A low-reading-load field estimator for a 100A-to-200A electrical panel upgrade. One question / answer field at a time, large controls, Back / Next / Skip, saved progress, private pricing, and a client-only estimate. The normal delivery is the hosted HTTPS page, not a ChatGPT HTML attachment or a simulated form in chat.

Live app: https://jaycarrish.github.io/LETS-FUCKING-GO/panel-walk/
Continuation entry: https://jaycarrish.github.io/LETS-FUCKING-GO/panel-walk/#resume-bc

The continuation entry initializes the capacity-increase and new-equipment goals and opens the equipment question on a first visit. It does not overwrite an existing saved walk. New walks start from the goals question. Preserve confirmed answers rather than restarting the interview.

## Ownership and source

This file owns Panel Walk project status, requirements, known limitations and next actions. Source is isolated under panel-walk/ in jaycarrish/LETS-FUCKING-GO. Existing Pages publishing infrastructure is reused; other applications and their source files are unchanged.

App introduction commit: 3125833e232c7bac9293da8510ab334846fab2f3
index.html blob: 1d3338e8bf08724d1c9c18ccc082d19263aa1a77
Test harness revision: 4930778c18eabcdcb4c6c63ea5f09383467c1f16

## Verified evidence

- Existing Pages publishing run 35969534180 completed successfully.
- Hosted acceptance run 35969834492 completed successfully with an explicitly recorded offline limitation, not an all-features pass.
- The downloaded acceptance.json reports CORE_PASS_WITH_OFFLINE_LIMITATION and 55 passed assertions across actual hosted Chromium and WebKit at mobile viewport sizes.
- Both browser engines received HTTPS 200, opened the equipment field with the two selected goals, completed the button-by-button interview, restored answers and pricing through actual reloads, validated inputs, calculated the expected test price, and excluded private costs and notes from client text / print output.
- Chromium offline reopening passed. WebKit offline reopening failed in the test runner with an internal navigation error; online reopening afterward restored the saved walk. Do not advertise verified iPhone offline support.
- Live phone-size screenshots were downloaded and visually inspected. The local app bytes match the repository blob listed above.
- Acceptance artifact: panel-walk-phone-screens, artifact ID 10795149737, run 35969834492. Artifact retention is seven days; the workflow and assertions remain in the repository.

## Pricing and data boundaries

Costs and labor inputs have no invented completed-job values. Overhead, contingency and target-margin percentages are clearly labeled editable starter choices. Price applies margin once to direct costs plus overhead and reserve; no double material markup. Unknown essential costs block a complete quote. Unresolved technical scope remains visible as estimate conditions. The app is not an electrical design calculation, contract or payment request; no deposit is assumed.

Answers stay in browser local storage, not a server database. Private JSON backup / restore is available; clearing browser data can remove the saved walk. Client text and print output use an explicit public-field selection. The app requires no account. No client estimate was sent during testing.

## Remaining limitations / next action

A physical iPhone, the native iOS share sheet and an actual onsite estimate have not been tested. The share API payload was tested with a controlled stub; CSS print privacy was tested without claiming a physical printer test. Keep an internet connection for the iPhone workflow until offline behavior is field-verified.

Next action: open the continuation link, record the new equipment, and proceed through the walk. Use actual field findings and cost inputs; do not treat the earlier generated render or speculative purchasing list as an approved electrical design.
