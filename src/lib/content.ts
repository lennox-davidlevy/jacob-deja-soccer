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

export interface SiteContent {
  schedule: ScheduleItem[];
  bio: Record<string, string>;
  links: ContentLink[];
}

type ContentTab = keyof typeof SHEET_CSV_URLS;

// [TBD] Replace these with each tab's public "Publish to web" CSV URL.
const SHEET_CSV_URLS = {
  schedule: "",
  bio: "",
  links: "",
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

function parseBio(csv: string): Record<string, string> {
  return Object.fromEntries(
    recordsFrom(csv)
      .filter(({ key, value }) => Boolean(key && value))
      .map(({ key, value }) => [key.toLowerCase().replace(/[\s-]+/g, "_"), value]),
  );
}

function parseLinks(csv: string): ContentLink[] {
  return recordsFrom(csv).flatMap(({ label, url, show }) => {
    if (!label || !["yes", "true", "1"].includes(show.toLowerCase())) return [];

    try {
      const parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) return [];
      return [{ label, url: parsedUrl.toString() }];
    } catch {
      return [];
    }
  });
}

async function fetchTab(tab: ContentTab): Promise<string> {
  const url = SHEET_CSV_URLS[tab];
  if (!url) return "";

  try {
    const response = await fetch(url);
    return response.ok ? await response.text() : "";
  } catch {
    return "";
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
    schedule: parseSchedule(scheduleCsv, todayKey),
    bio: parseBio(bioCsv),
    links: parseLinks(linksCsv),
  };
}
