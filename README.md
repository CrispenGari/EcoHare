# EcoHare

EcoHare is an AI-assisted bilingual mobile platform for reporting, mapping and tracking dumped waste and visible water leaks at the University of Fort Hare Alice campus.

[staff -> [admin|thrash|water]] ---> [auth] || python, fast-api, jwt tokens, MySQL [reports|staff], AI, report
[student] ->

Please share your views and suggestions.

_Proposed project:_
Co-designing an AI-assisted bilingual environmental issue reporting and tracking app for the University of Fort Hare Alice campus.

The app will help students report two environmental problems:

1. Dumped waste/illegal dumping.
2. Visible water leaks.

A student will select the issue, take or upload a photo, and confirm the location using GPS or a map pin. A lightweight MobileNetV3 AI model will check whether the photo provides evidence of the selected issue.
The AI may produce the following outcomes:

- Issue confirmed – the report is submitted.
- Different issue detected – the app suggests correcting the category.
- Uncertain – the student can take another photo, mark the problem area or request staff review.
- No clear evidence – the app explains how to take a better photo.
  The app will not accuse the student of submitting a false report because the AI may be wrong. Instead, it will say that it could not clearly confirm the issue.

Accepted reports will appear as markers on the campus map. Cleaning or waste-management staff will receive dumped-waste reports, while maintenance staff will receive water-leak reports. They can update each report as acknowledged, assigned, in progress or resolved. Students will receive a reference number and track the progress. Resolved reports will be removed from the active map but kept in the report history.

The app will support English and isiXhosa. For the HCI component, we will involve students, cleaners and maintenance staff through interviews, campus walk-throughs, paper sketches, co-design workshops and Figma usability testing. Participants will help decide the reporting process, map design, AI feedback messages, language and report statuses.

The AI will support user participation by suggesting categories, checking photographic evidence, explaining uncertainty and allowing users to correct its decisions.

Please share your thoughts on:

- Is the problem relevant and manageable?
- Do you agree with using UFH Alice campus as our selected community?
