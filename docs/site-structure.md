# Site Structure

> **Applies to:** every page · **Last updated:** October 23, 2026

How the grant site is laid out, how its pages connect, and the features every page shares.

## Who uses the site

The whole site is for the **Grant Administrator** (and other FIRST Illinois staff with the login). There are no public pages. Coaches apply through the Google Form and never see this site.

## Site map

```
Sign In  (/login)
└── after signing in, the blue menu bar links to:
    ├── Dashboard        (/)
    │     ├── Grant Matching Totals   + Ask Period filter, Refresh Data, ⤓ Grant Matching Report
    │     ├── Grant Ask Tracker
    │     ├── Fundraising Status      tabs: Fundraising Status | Check Status, ⤓ Export
    │     └── Grant Rules
    ├── Applications     (/applications)   ⤓ Export
    ├── Email Log        (/emails)
    └── Form Responses   (/responses)
```

| Page | What it's for | Grant Administrator enters |
|---|---|---|
| [Sign In](sign-in.md) | Shared login for the whole site. | — |
| [Dashboard](dashboard.md) | Season totals, fundraising and checks, asks to the Donor Fund, the grant rules. | Ask Period, Amount of Check, Check #, Date Check Mailed; ask names and dates in the Grant Ask Tracker. |
| [Applications](applications.md) | Review each grant application. | Raised by Team, School Title 1 Status, Fundraising Letter Rec'd, VRS Task Completed, Grant Approved, Review Notes. |
| [Email Log](email-log.md) | Record emails sent to coaches. | Each email (date, team, recipient, purpose, notes). |
| [Form Responses](form-responses.md) | Read-only copy of the grant form's Google Sheet. | — |

## How the pages connect

```
Google Form ──► Form Responses sheet ─┐
                                      ├─► Refresh Data (Dashboard) ─► site's saved copy
BioBuzz team list sheet ──────────────┘                                     │
                                                                            ▼
  Applications ── Raised by Team, Title 1, Grant Approved ──► Dashboard totals & Fundraising Status
       ▲                                                              │
       │  Dashboard note "XX applications not fully reviewed" ────────┘ (opens Applications, filtered)
       │
  Email Log ── "Additional Info Needed" ──► Applications: Add'l Info Email Sent
            └─ "Grant Award" ────────────► Check Status: Grant Award Email Sent
```

- **Refresh Data** brings in new form responses and team names for every page. See [Data and Refresh Data](data-and-refresh.md).
- **Applications → Dashboard:** School Title 1 Status sets the category, Grant Approved decides which teams count in the totals, and Raised by Team drives Possible Grant Award, Unused Grant Match and the default Amount of Check. Fundraising Status shows Raised by Team read-only.
- **Dashboard → Applications:** the yellow "XX applications not fully reviewed/complete" link opens Applications showing only applications that aren't reviewed yet or are Under Review.
- **Grant Ask Tracker ↔ Check Status ↔ Grant Matching Totals:** asks with both dates become choices in **Ask Period** on Check Status. Each ask's amounts add up the teams assigned to it, and the **Ask Period** filter on Grant Matching Totals shows the totals for one ask (or the unassigned teams).
- **Email Log → Applications and Check Status:** each team's latest "Additional Info Needed" and "Grant Award" emails fill in the two "Email Sent" date columns.
- **Rookie/Veteran Status \*** on Grant Matching Totals jumps to the explanation in Grant Rules at the bottom of the Dashboard.

## On every page

- **Top bar:** "FIRST Tech Challenge · Illinois" and a link to firstillinoisrobotics.org.
- **Blue menu bar:** Dashboard, Applications, Email Log, Form Responses (the current page is highlighted), "Signed in as FTCAdmin" and **Sign out**.
- **Footer:** "Grant questions" with the contact email jweiland@firstillinoisrobotics.org.

## Shared features

| Feature | How it works | Where |
|---|---|---|
| **Yellow headings** | The Grant Administrator fills in these columns. Plain headings come from the form or are calculated. A key above the Applications and Fundraising Status tables says so. | Applications, Fundraising Status, Check Status, Grant Ask Tracker |
| **Saving as you go** | No Save button. Changes save about half a second after you stop typing. "Saving… / All changes saved" shows near the page title, or a red message if a save failed. | Dashboard, Applications, Email Log |
| **Sorting** | Headings with ↕ sort when clicked; click again to reverse. Blank values sort last. | Applications, Fundraising Status, Check Status |
| **Frozen headings** | Wide tables scroll inside their own box, no taller than the window. Headings stay at the top, with an extra sideways scrollbar under them. | Applications, Fundraising Status, Form Responses |
| **Frozen Team #** | Team # stays at the left when scrolling sideways. | Applications |
| **Frozen Total row** | The Total row stays at the bottom of the box. | Fundraising Status, Check Status |
| **Ask Period subtotals** | Below the box, outside the scrolling: the Total split by ask, lined up under the Total's amounts. The box leaves room so the headings and every subtotal fit on screen. | Fundraising Status, Check Status |
| **Row counts** | "*N* rows" under the table, counting what's shown after search and filters. | Applications, Fundraising Status |
| **Hover notes (ⓘ)** | Hover a heading with ⓘ, or a badge, for an explanation. | Throughout |
| **Dollar amounts** | Shown as $1,050. Click a dollar box to type a plain number ("$" and commas are ignored). | Throughout |
| **Exports** | Download a CSV file that opens in Excel (Applications), or an Excel file (Fundraising Status, Grant Matching Report). Exports include changes not yet saved. | Applications, Fundraising Status, Dashboard |
| **Badges** | Small colored labels: yellow for things to check (Dup, form says …, Title 1 status needed, Ends before it starts), red for problems (not found, not in BioBuzz, not one team #, error, No), green for Yes. | Applications, Dashboard |

## Downloads

| Button | File | Contents |
|---|---|---|
| Applications → **⤓ Export** | `grant-applications-YYYY-MM-DD.csv` | Every application, ignoring search and filter, in the Applications column order plus Coach Email, file links and number of submissions. |
| Fundraising Status → **⤓ Export** | `grant-fundraising-YYYY-MM-DD.xlsx` | The rows shown, in their current order, with the columns of both tabs and whole-dollar formatting, then the Total and Ask Period subtotals. |
| Dashboard → **⤓ Grant Matching Report** | `grant-matching-report-YYYY-MM-DD.xlsx` | The Grant Matching Totals table with an "as of" title, dollar formatting and the green highlight. |

## Change history

- **Oct 23, 2026:** Ask Period subtotals; badges list updated.
- **Oct 23, 2026:** Ask periods connect the Grant Ask Tracker, Check Status and Grant Matching Totals.
- **Oct 22, 2026:** Document created.
