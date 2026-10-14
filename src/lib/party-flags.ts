/**
 * Party flag colours, drawn as flat bands: no election symbol, no logo, same size for every party.
 * Research 2026-10-15. Party documents name colours but publish no codes, so hex values come from
 * Wikimedia Commons drawings (or the party's own logo where noted), checked against images.
 * Only flags with layout and colours at medium confidence or better are drawn. Parties with no
 * sourced flag (Janata Party, Janata Dal, Socialist Party) or a low-confidence one (AAP, RJD) or no
 * sourced colour (undivided Shiv Sena, PDP, INLD) show an empty outline of the same size.
 * Several flags look alike as swatches (INC and TMC; DMK and AIADMK; CPI, CPI(M) and NC; the greens),
 * so the party name is always shown next to the swatch.
 */

export type Flag = {
  /** Bands, in order from top (horizontal) or from the hoist (vertical). `share` defaults to equal. */
  bands: { hex: string; share?: number }[];
  direction: "horizontal" | "vertical";
  sources: string[];
  note?: string;
};

const h = (...bands: (string | [string, number])[]) =>
  bands.map((b) => (Array.isArray(b) ? { hex: b[0], share: b[1] } : { hex: b }));

const FLAGS: Record<string, Flag> = {
  BJP: {
    bands: h(["#046a38", 1], ["#ff671f", 2]),
    direction: "vertical",
    sources: [
      "https://www.crwflags.com/fotw/flags/in%7Dbjp.html",
      "https://commons.wikimedia.org/wiki/File:BJP_Flag.svg",
    ],
    note: "Party constitution: saffron and green, 2:1, green near the mast. Symbol (lotus) not drawn.",
  },
  INC: {
    bands: h("#ff671f", "#ffffff", "#046a38"),
    direction: "horizontal",
    sources: [
      "https://inc.in/inc-constitution",
      "https://commons.wikimedia.org/wiki/File:Indian_National_Congress_Flag.svg",
    ],
    note: "Constitution Art. II(A): saffron, white and green. Symbol not drawn.",
  },
  "CPI(M)": {
    bands: h("#de0000"),
    direction: "horizontal",
    sources: ["https://cpim.org/constitution/", "https://commons.wikimedia.org/wiki/File:CPI-M-flag.svg"],
    note: "Red field. Hammer and sickle not drawn.",
  },
  CPI: {
    bands: h("#de0000"),
    direction: "horizontal",
    sources: [
      "https://www.crwflags.com/fotw/flags/in%7Dcomm.html",
      "https://commons.wikimedia.org/wiki/File:CPI-banner.svg",
    ],
  },
  BJD: {
    bands: h("#01a319"),
    direction: "horizontal",
    sources: [
      "https://www.crwflags.com/fotw/flags/in%7Dbjd.html",
      "https://commons.wikimedia.org/wiki/File:Biju_Janata_Dal_flag.svg",
    ],
  },
  AIADMK: {
    bands: h("#000000", "#da0000"),
    direction: "horizontal",
    sources: [
      "https://www.crwflags.com/fotw/flags/in%7Dadmk.html",
      "https://commons.wikimedia.org/wiki/File:AIADMK_Flag.svg",
    ],
    note: "Official flag per party constitution Art. 4. Portrait not drawn.",
  },
  NC: {
    bands: h("#ff0000"),
    direction: "horizontal",
    sources: ["https://www.crwflags.com/fotw/flags/in-jk.html"],
    note: "Red field, adopted 1939. Plough not drawn.",
  },
  TMC: {
    bands: h("#f97a23", "#ffffff", "#23b24a"),
    direction: "horizontal",
    sources: [
      "https://www.crwflags.com/fotw/flags/in%7Daitc.html",
      "https://commons.wikimedia.org/wiki/File:All_India_Trinamool_Congress_flag_(5).svg",
    ],
  },
  BRS: {
    bands: h("#f84797"),
    direction: "horizontal",
    sources: ["https://commons.wikimedia.org/wiki/File:Flag_of_Bharat_Rashtra_Samithi_new.svg"],
    note: "Pink field. Map not drawn. The field was pink under the TRS name too.",
  },
  DMK: {
    bands: h("#000000", "#eb232d"),
    direction: "horizontal",
    sources: [
      "https://www.crwflags.com/fotw/flags/in%7Ddmk.html",
      "https://commons.wikimedia.org/wiki/File:Flag_DMK.svg",
    ],
  },
  "JD(U)": {
    bands: h("#228b22", "#ffffff", "#228b22"),
    direction: "horizontal",
    sources: [
      "https://www.crwflags.com/fotw/flags/in%7Djanp.html",
      "https://commons.wikimedia.org/wiki/File:Janata_Dal_(United)_Flag.svg",
    ],
  },
  JMM: {
    bands: h("#20b04a"),
    direction: "horizontal",
    sources: [
      "https://www.crwflags.com/fotw/flags/in-jh.html",
      "https://commons.wikimedia.org/wiki/File:Jharkhand_Mukti_Morcha_flag.svg",
    ],
  },
  PMK: {
    bands: h("#0000fe", "#ffff33", "#fe0000"),
    direction: "horizontal",
    sources: ["https://www.crwflags.com/fotw/flags/in%7D.html", "https://commons.wikimedia.org/wiki/File:PMK.svg"],
  },
  TDP: {
    bands: h("#ffed00"),
    direction: "horizontal",
    sources: ["https://www.crwflags.com/fotw/flags/in%7Dtel.html", "https://www.telugudesam.org/"],
    note: "Yellow matches the party's own logo.",
  },
  BSP: {
    bands: h("#22409a"),
    direction: "horizontal",
    sources: [
      "https://www.crwflags.com/fotw/flags/in%7Dbsp.html",
      "https://commons.wikimedia.org/wiki/File:Bahujan_Samaj_Party_Flag.svg",
    ],
  },
};

/** Content uses a few spellings for the same party. */
const ALIASES: Record<string, string> = {
  "Pattali Makkal Katchi (PMK)": "PMK",
  "other (Pattali Makkal Katchi)": "PMK",
};

export function flagFor(party: string): Flag | undefined {
  return FLAGS[ALIASES[party] ?? party];
}
