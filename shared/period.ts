export interface StructuredPeriod {
  period?: string | null;
  startYear?: number | null;
  startMonth?: number | null;
  endYear?: number | null;
  endMonth?: number | null;
  endPresent?: boolean | null;
}

export function formatPeriod(value: StructuredPeriod): string {
  if (value.startYear && value.startMonth) {
    const start = `${value.startYear}.${String(value.startMonth).padStart(2, "0")}`;
    if (value.endPresent) return `${start} - Present`;
    if (value.endYear && value.endMonth) {
      return `${start} - ${value.endYear}.${String(value.endMonth).padStart(2, "0")}`;
    }
  }

  return value.period || "Period not specified";
}

export function periodSortValue(value: StructuredPeriod): number {
  if (value.startYear) {
    return value.startYear * 100 + (value.startMonth || 0);
  }

  const legacyMatch = value.period?.match(/(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?\s*(\d{4})/i);
  if (!legacyMatch) return 0;

  const monthNames = [
    "jan", "feb", "mar", "apr", "may", "jun",
    "jul", "aug", "sep", "oct", "nov", "dec",
  ];
  const month = legacyMatch[1]
    ? monthNames.findIndex(name => legacyMatch[1].toLowerCase().startsWith(name)) + 1
    : 0;
  return Number(legacyMatch[2]) * 100 + month;
}