# FTC IL Grant Site: Documentation

> **Last updated:** October 22, 2026

The FTC Illinois Grant site is where the Grant Administrator reviews matching-grant applications, tracks team fundraising and checks, and follows the season's grant totals. These documents describe the site's structure, every feature, and the logic behind each one.

## Start here

| Document | What it covers |
|---|---|
| [Site Structure](site-structure.md) | Site map, how the pages connect, and the features every page shares (saving, sorting, exports, badges). |
| [Grant Rules and Calculations](grant-rules.md) | Team age, grant categories, Possible Grant Award, Unused Grant Match, Amount of Check, and every Grant Matching Totals column, with worked examples. |
| [Data and Refresh Data](data-and-refresh.md) | The two Google Sheets and which columns are used, what Refresh Data does and never changes, duplicates, saving, and fields that are saved but hidden. |
| [Behind the Scenes](behind-the-scenes.md) | Hosting, database, Google access, security, server settings and how changes are made. For whoever maintains the site. |

## The pages

| Page | Address | What it's for |
|---|---|---|
| [Sign In](sign-in.md) | `/login` | Shared `FTCAdmin` login. Every other page requires it. |
| [Dashboard](dashboard.md) | `/` | Grant Matching Totals with Refresh Data and the Excel report, the Grant Ask Tracker, Fundraising and Check Status tabs, and the grant rules. |
| [Applications](applications.md) | `/applications` | One row per grant form response, with the Grant Administrator's review columns. |
| [Email Log](email-log.md) | `/emails` | Emails sent to coaches, entered by hand. |
| [Form Responses](form-responses.md) | `/responses` | Read-only copy of the form's Google Sheet. |

## In one minute

1. Coaches apply with the Google Form. Their answers land in the form's Google Sheet.
2. **Refresh Data** (Dashboard) copies the form responses and the BioBuzz team list into the site, and starts each team's Raised by Team at the HQ grant amount from the form.
3. On **Applications**, the Grant Administrator enters School Title 1 Status, checks the letter and VRS task, adjusts Raised by Team, and sets **Grant Approved**.
4. The **Dashboard** works out each team's category and award, totals them by category, and tracks checks from the default amount through to mailed.
5. The **Email Log** records emails to coaches, and the **Grant Ask Tracker** records requests to the Donor Fund.

## Key terms

| Term | Meaning |
|---|---|
| **Team age** | Rookie (team # 35127 and up), Second Year (25609–35126) or Veteran (25608 and below). |
| **Grant category** | Team age + School Title 1 Status: Rookie 1, Rookie 1 title 1, Second Year, Second Year Title 1, Veteran Title 1, or Not Qualified (Veteran without Title 1). "Title 1 status needed" until Title 1 is entered. |
| **Raised by Team** | What the team has raised. Starts as the form's HQ grant amount and is edited on Applications. |
| **Possible Grant Award** | Raised by Team, capped at the category's max fundraising target, × its multiplier. |
| **Approved** | Grant Approved = Yes on Applications. Only approved teams count in the Dashboard totals (except Teams Applied). |
| **Duplicate** | A team number that sent the form more than once. Each response stays and is flagged. |
| **Mailed check** | A check with both Check # and Date Check Mailed filled in. Its amount is locked, and it counts in Grants Distributed to Teams. |

## Keeping these docs current

Each document ends with a **Change history**. Whenever a feature is added or changed, the document for that page, and any of the documents above that describe it, is updated in the same change.
