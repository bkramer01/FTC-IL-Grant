"use server";

import { z } from "zod";
import { getDb } from "@/db";
import { APPROVAL_OPTIONS, EMAIL_PURPOSES, VRS_OPTIONS } from "@/lib/applications";
import { requireAdmin } from "@/lib/auth";
import { fetchSheets } from "@/lib/sheets";
import * as store from "@/lib/store";

// Server actions behind every edit on the admin pages. Each one checks the admin session
// and validates its input before touching the database.

const yesNo = z.enum(["Yes", "No"]).nullable();
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable();
const dollars = z.number().int().min(0).max(10_000_000).nullable();

const reviewPatch = z
  .object({
    title1: yesNo,
    letterReceived: yesNo,
    volunteering: yesNo,
    qualifiedPurchase: yesNo,
    vrsCompleted: z.enum(VRS_OPTIONS).nullable(),
    approved: z.enum(APPROVAL_OPTIONS).nullable(),
    notes: z.string().max(5000),
    raised: dollars,
    raisedUpdatedOn: isoDate,
    // Sent with every Raised by Team edit, so later refreshes don't copy the form's amount over it.
    raisedSet: z.literal(true),
    checkAmount: dollars,
    checkAmountFor: dollars,
    checkNumber: z.string().max(50).nullable(),
    checkMailedOn: isoDate,
    checkPaid: z.boolean(),
    askId: z.number().int().positive().nullable(),
  })
  .partial()
  .strict();

export async function saveReviewAction(responseTimestamp: string, patch: unknown) {
  await requireAdmin();
  const ts = z.string().min(1).max(40).parse(responseTimestamp);
  await store.saveReview(getDb(), ts, reviewPatch.parse(patch));
}

const newEmail = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  teamNumber: z.number().int().positive(),
  recipient: z.string().trim().min(1).max(200),
  purpose: z.enum(EMAIL_PURPOSES),
  notes: z.string().max(5000),
});

export async function addEmailAction(entry: unknown) {
  await requireAdmin();
  return store.addEmail(getDb(), newEmail.parse(entry));
}

export async function deleteEmailAction(id: number) {
  await requireAdmin();
  await store.deleteEmail(getDb(), z.number().int().positive().parse(id));
}

const askPatch = z
  .object({
    name: z.string().max(100),
    start: isoDate,
    end: isoDate,
  })
  .partial()
  .strict();

export async function addAskAction(name: string) {
  await requireAdmin();
  return store.addAsk(getDb(), z.string().max(100).parse(name));
}

export async function updateAskAction(id: number, patch: unknown) {
  await requireAdmin();
  await store.updateAsk(getDb(), z.number().int().positive().parse(id), askPatch.parse(patch));
}

export async function removeAskAction(id: number) {
  await requireAdmin();
  await store.removeAsk(getDb(), z.number().int().positive().parse(id));
}

/**
 * Refresh Data: reads both Google Sheets and replaces the saved copies. If either sheet
 * can't be read, nothing is changed and the reason comes back for the page to show.
 */
export async function refreshSheetsAction(): Promise<{ ok: true; refreshedAt: string } | { ok: false; error: string }> {
  await requireAdmin();
  try {
    const tables = await fetchSheets();
    const at = await store.saveSnapshots(getDb(), tables);
    return { ok: true, refreshedAt: at.toISOString() };
  } catch (err) {
    console.error(err);
    return { ok: false, error: err instanceof Error ? err.message : "Refresh failed." };
  }
}
