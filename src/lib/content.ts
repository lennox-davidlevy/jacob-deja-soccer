export interface ScheduleItem {
  date: string;
  event: string;
  location: string;
  kit?: string;
  notes?: string;
}

export interface ContentLink {
  label: string;
  url: string;
}

export interface BioItem {
  key: string;
  label: string;
  value: string;
  detail?: string;
}

export interface SiteContent {
  schedule: ScheduleItem[];
  bio: BioItem[] | null;
  links: ContentLink[];
}

type ContentTab = keyof typeof SHEET_CSV_URLS;

const SHEET_CSV_URLS = {
  schedule: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQll-_z-2-UPk9rYSMvMGcle0nyFDyiT-5w9-LRCUu3o-6CoRmLtQ1gNmSP0D1pDV8bx3TWjjUf67Rh/pub?gid=1122464326&single=true&output=csv",
  bio: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQll-_z-2-UPk9rYSMvMGcle0nyFDyiT-5w9-LRCUu3o-6CoRmLtQ1gNmSP0D1pDV8bx3TWjjUf67Rh/pub?gid=0&single=true&output=csv",
  links: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQll-_z-2-UPk9rYSMvMGcle0nyFDyiT-5w9-LRCUu3o-6CoRmLtQ1gNmSP0D1pDV8bx3TWjjUf67Rh/pub?gid=68748327&single=true&output=csv",
} as const;

function parseCsv(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];

    if (character === '"') {
      if (quoted && csv[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(field.trim());
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && csv[index + 1] === "\n") index += 1;
      row.push(field.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function recordsFrom(csv: string): Record<string, string>[] {
  const [rawHeaders, ...rows] = parseCsv(csv.replace(/^\uFEFF/, ""));
  if (!rawHeaders) return [];

  const headers = rawHeaders.map((header) => header.trim().toLowerCase());
  return rows.map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index]?.trim() ?? ""])));
}

function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().startsWith(value);
}

function parseSchedule(csv: string, today: string): ScheduleItem[] {
  return recordsFrom(csv)
    .filter(({ date, event, location }) => isCalendarDate(date) && date >= today && Boolean(event && location))
    .map(({ date, event, location, kit, notes }) => ({
      date,
      event,
      location,
      ...(kit && { kit }),
      ...(notes && { notes }),
    }))
    .sort((left, right) => left.date.localeCompare(right.date));
}

function parseBio(csv: string): BioItem[] {
  const knownLabels: Record<string, string> = { gpa: "GPA" };
  return recordsFrom(csv).flatMap(({ key, value }) => {
    if (!key || !value) return [];
    const normalizedKey = key.toLowerCase().replace(/[\s-]+/g, "_");
    const label = knownLabels[normalizedKey]
      ?? key.replace(/[_-]+/g, " ").replace(/^./, (character) => character.toUpperCase());
    return [{ key: normalizedKey, label, value }];
  });
}

function parseLinks(csv: string): ContentLink[] {
  return recordsFrom(csv).flatMap(({ label, url, show }) => {
    if (!label || !show || !["yes", "true", "1"].includes(show.toLowerCase())) return [];

    try {
      const parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) return [];
      return [{ label, url: parsedUrl.toString() }];
    } catch {
      return [];
    }
  });
}

async function fetchTab(tab: ContentTab): Promise<string | null> {
  const url = SHEET_CSV_URLS[tab];
  if (!url) return null;

  try {
    const response = await fetch(url);
    return response.ok ? await response.text() : null;
  } catch {
    return null;
  }
}

export async function loadSiteContent(today = new Date()): Promise<SiteContent> {
  const [scheduleCsv, bioCsv, linksCsv] = await Promise.all([
    fetchTab("schedule"),
    fetchTab("bio"),
    fetchTab("links"),
  ]);
  const todayKey = today.toISOString().slice(0, 10);

  return {
    schedule: scheduleCsv === null ? [] : parseSchedule(scheduleCsv, todayKey),
    bio: bioCsv === null ? null : parseBio(bioCsv),
    links: linksCsv === null ? [] : parseLinks(linksCsv),
  };
}
