const outputPath = new URL("../public/jacob-onepager.pdf", import.meta.url);
const portraitPath = new URL("../public/jacob-portrait.jpg", import.meta.url);
const encode = (value: string) => new TextEncoder().encode(value);

declare const Bun: {
  file(path: URL): { arrayBuffer(): Promise<ArrayBuffer> };
  write(path: URL, data: Uint8Array<ArrayBufferLike>): Promise<number>;
};

function text(font: "F1" | "F2", size: number, x: number, y: number, value: string, color = "0.953 0.969 0.961") {
  const escaped = value.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
  return `${color} rg BT /${font} ${size} Tf ${x} ${y} Td (${escaped}) Tj ET`;
}

function concatenate(chunks: Uint8Array<ArrayBufferLike>[]): Uint8Array<ArrayBuffer> {
  const result = new Uint8Array(chunks.reduce((total, chunk) => total + chunk.byteLength, 0));
  let offset = 0;
  chunks.forEach((chunk) => {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  });
  return result;
}

const portrait = new Uint8Array(await Bun.file(portraitPath).arrayBuffer());
const content = [
  "0.027 0.043 0.035 rg 0 0 612 792 re f",
  "0.361 1 0.753 rg 42 730 54 4 re f",
  text("F2", 10, 42, 704, "RECRUITING PROFILE / CLASS OF 2027", "0.663 0.733 0.706"),
  text("F1", 42, 42, 642, "JACOB DEJA"),
  text("F2", 15, 42, 612, "CAM / CDM    RIGHT FOOT    5'10\"", "0.361 1 0.753"),
  "q 162 0 0 202.5 408 382 cm /Im1 Do Q",
  text("F2", 9, 42, 552, "CLUB", "0.416 0.494 0.467"),
  text("F1", 18, 42, 526, "THE ISLAND FC WEST"),
  text("F2", 11, 42, 506, "MLS NEXT HG", "0.663 0.733 0.706"),
  text("F2", 9, 42, 452, "HIGH SCHOOL", "0.416 0.494 0.467"),
  text("F1", 16, 42, 426, "COMSEWOGUE HIGH SCHOOL"),
  text("F2", 9, 42, 370, "ACADEMICS", "0.416 0.494 0.467"),
  text("F1", 30, 42, 334, "4.0 GPA", "0.361 1 0.753"),
  text("F2", 9, 232, 370, "KITS", "0.416 0.494 0.467"),
  text("F1", 15, 232, 340, "WHITE / BLACK / BLUE"),
  "0.118 0.184 0.157 RG 42 296 m 570 296 l S",
  text("F2", 9, 42, 260, "FILM + UPCOMING SCHEDULE", "0.416 0.494 0.467"),
  text("F1", 20, 42, 230, "JACOBDEJA.COM"),
  text("F2", 10, 42, 208, "Current reel and fixtures publish here when available.", "0.663 0.733 0.706"),
  text("F2", 9, 42, 146, "RECRUITING CONTACT", "0.416 0.494 0.467"),
  text("F1", 18, 42, 116, "JACOB@JACOBDEJA.COM"),
  text("F2", 10, 42, 92, "Club coach reference available on request.", "0.663 0.733 0.706"),
  text("F2", 8, 42, 42, "JACOB DEJA / CAM-CDM / 2027", "0.416 0.494 0.467"),
].join("\n");

const objects: Array<string | Uint8Array> = [
  "<< /Type /Catalog /Pages 2 0 R >>",
  "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
  "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> /XObject << /Im1 6 0 R >> >> /Contents 7 0 R /Annots [8 0 R 9 0 R] >>",
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
  "<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>",
  concatenate([
    encode(`<< /Type /XObject /Subtype /Image /Width 720 /Height 900 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${portrait.byteLength} >>\nstream\n`),
    portrait,
    encode("\nendstream"),
  ]),
  `<< /Length ${encode(content).byteLength} >>\nstream\n${content}\nendstream`,
  "<< /Type /Annot /Subtype /Link /Rect [38 104 310 136] /Border [0 0 0] /A << /S /URI /URI (mailto:jacob@jacobdeja.com?subject=Recruiting%20-%20Jacob%20Deja%20CAM%2FCDM%202027) >> >>",
  "<< /Type /Annot /Subtype /Link /Rect [38 218 250 252] /Border [0 0 0] /A << /S /URI /URI (https://jacobdeja.com/) >> >>",
  "<< /Title (Jacob Deja Recruiting Profile) /Author (Jacob Deja) /Subject (Class of 2027 CAM/CDM recruiting profile) >>",
];

const chunks: Uint8Array<ArrayBufferLike>[] = [encode("%PDF-1.4\n")];
const offsets = [0];
let byteOffset = chunks[0].byteLength;

objects.forEach((object, index) => {
  const objectChunk = concatenate([
    encode(`${index + 1} 0 obj\n`),
    typeof object === "string" ? encode(object) : object,
    encode("\nendobj\n"),
  ]);
  offsets.push(byteOffset);
  chunks.push(objectChunk);
  byteOffset += objectChunk.byteLength;
});

const xrefOffset = byteOffset;
const xref = [
  `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`,
  offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join(""),
  `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info 10 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`,
].join("");
chunks.push(encode(xref));

await Bun.write(outputPath, concatenate(chunks));
console.log(`Wrote ${outputPath.pathname}`);
