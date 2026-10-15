/**
 * Party flag colours, drawn as flat bands: no election symbol, no logo, same size for every party.
 * Research 2026-10-15. Party documents name colours but publish no codes, so hex values come from
 * Wikimedia Commons drawings (or the party's own logo where noted), checked against images.
 * Hex values are close readings of volunteer drawings, not official codes. Parties with no sourced
 * flag (Janata Party 1977, Janata Dal 1988-99, Socialist Party 1948) show an empty outline of the
 * same size. Their successors' flags (JD(U), Praja Socialist Party) are not borrowed for them.
 * Several flags look alike as swatches (INC and TMC; DMK and AIADMK; CPI, CPI(M) and NC; the greens),
 * so the party name is always shown next to the swatch.
 */
import { canonicalParty } from "./parties";

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
  AAP: {
    bands: h(["#fdf000", 265], ["#3e47cb", 107]),
    direction: "horizontal",
    sources: [
      "https://en.wikipedia.org/wiki/Aam_Aadmi_Party",
      "https://upload.wikimedia.org/wikipedia/commons/1/1c/Aam_Aadmi_Party_flag_%282%29.svg",
    ],
    note: "Yellow over blue, as in the Wikipedia infobox drawing. A second Commons drawing differs in shade and proportion. Broom and name not drawn.",
  },
  RJD: {
    bands: h("#008000"),
    direction: "horizontal",
    sources: [
      "https://en.wikipedia.org/wiki/Rashtriya_Janata_Dal",
      "https://upload.wikimedia.org/wikipedia/commons/3/33/RJD_Flag.svg",
    ],
    note: "Green field. Lantern not drawn.",
  },
  SS: {
    bands: h("#ff6634"),
    direction: "horizontal",
    sources: ["https://www.crwflags.com/fotw/flags/in%7Dshiv.html"],
    note: "Undivided Shiv Sena, before 2022: plain saffron swallow-tailed flag. Drawn as a rectangle. Hex read from a JPG, approximate.",
  },
  PDP: {
    bands: h("#006137"),
    direction: "horizontal",
    sources: [
      "https://www.crwflags.com/fotw/flags/in%7Djkpdp.html",
      "https://en.wikipedia.org/wiki/Jammu_and_Kashmir_Peoples_Democratic_Party",
    ],
    note: "Green field; Wikidata party colour #016138 agrees. Ink-pot and pen not drawn.",
  },
  INLD: {
    bands: h("#00923f"),
    direction: "horizontal",
    sources: ["https://www.crwflags.com/fotw/flags/in%7Dinld.html"],
    note: "Green field. Spectacles not drawn. Hex read from a shaded GIF, approximate.",
  },
};

/** Takes any spelling of a party; see parties.ts. */
export function flagFor(party: string): Flag | undefined {
  return FLAGS[canonicalParty(party)];
}
