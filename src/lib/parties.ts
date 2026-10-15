/**
 * One label for one party. Entries and the government tables sometimes spell a party differently;
 * the schema maps every party field through canonicalParty, so counts and flags see one label.
 * The Congress (I) of 1978 onward is the Indian National Congress (the Election Commission
 * recognised it as such); AITC is the All India Trinamool Congress, shown as TMC.
 */
const SAME_PARTY: Record<string, string> = {
  "other (Indian National Congress (I))": "INC",
  AITC: "TMC",
  "other (Indian National Lok Dal)": "INLD",
  "other (Pattali Makkal Katchi)": "PMK",
  "Pattali Makkal Katchi (PMK)": "PMK",
};

export function canonicalParty(party: string): string {
  return SAME_PARTY[party] ?? party;
}
