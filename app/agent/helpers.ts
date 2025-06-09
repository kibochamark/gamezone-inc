// For basic date manipulation, Date object is sufficient.
// For more complex operations like relativedelta, consider date-fns:
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { addMonths, subDays } from 'date-fns';

/**
 * Ensures a Date object is in UTC and formats it to ISO 8601 string with milliseconds and 'Z' suffix.
 * @param dt The Date object to format.
 * @returns An ISO 8601 formatted UTC string.
 */
export  function getIsoDatetime(dt: Date): string {
    // Create a new Date object from the input to avoid modifying the original
    const utcDt = new Date(dt.getTime());

    // getTime() already gives milliseconds since epoch, which is timezone agnostic.
    // toISOString() always returns a UTC string (ending with 'Z').
    // We just need to ensure the original date was treated as UTC if it didn't have timezone info,
    // but since we're directly calling toISOString(), it handles UTC conversion correctly.

    // The Python code's .replace(tzinfo=datetime.timezone.utc) or .astimezone(datetime.timezone.utc)
    // is to ensure the datetime object itself is aware of UTC.
    // In JS, toISOString() does this transformation implicitly to UTC.
    return utcDt.toISOString().replace(/\.000Z$/, 'Z'); // Ensure milliseconds are present if needed, though toISOString() usually handles it.
                                                     // toISOString() often gives .000Z already, so this regex is a safeguard/cleanup.
}

/**
 * Gets the start of the current day in UTC (00:00:00.000Z).
 * @returns An ISO 8601 formatted UTC string.
 */
export function getTodayStartUtc(): string {
    const now = new Date();
    const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    return getIsoDatetime(startOfDay);
}

/**
 * Gets the start of yesterday in UTC (00:00:00.000Z).
 * @returns An ISO 8601 formatted UTC string.
 */
export function getYesterdayStartUtc(): string {
    const now = new Date();
    const yesterday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    yesterday.setUTCDate(yesterday.getUTCDate() - 1); // Subtract one day
    return getIsoDatetime(yesterday);
}

/**
 * Gets the current UTC time (now).
 * @returns An ISO 8601 formatted UTC string.
 */
export function getCurrentUtcNow(): string {
    return getIsoDatetime(new Date());
}

/**
 * Gets the start of the last month in UTC (00:00:00.000Z on the 1st of last month).
 * @returns An ISO 8601 formatted UTC string.
 */
export function getLastMonthStartUtc(): string {
    const now = new Date();
    const firstDayOfThisMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
    const firstDayOfLastMonth = new Date(firstDayOfThisMonth);
    firstDayOfLastMonth.setUTCMonth(firstDayOfLastMonth.getUTCMonth() - 1); // Subtract one month
    return getIsoDatetime(firstDayOfLastMonth);
}

/**
 * Gets the end of the last month in UTC (23:59:59.999Z on the last day of last month).
 * @returns An ISO 8601 formatted UTC string.
 */
export function getLastMonthEndUtc(): string {
    const now = new Date();
    const firstDayOfThisMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
    // Subtract 1 millisecond from the start of the current month to get the end of last month
    const endOfLastMonth = new Date(firstDayOfThisMonth.getTime() - 1);
    return getIsoDatetime(endOfLastMonth);
}

/**
 * Gets the start of 7 days ago from the current date in UTC (00:00:00.000Z).
 * @returns An ISO 8601 formatted UTC string.
 */
export function getLast7DaysStartUtc(): string {
    const now = new Date();
    const sevenDaysAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7); // Subtract 7 days
    return getIsoDatetime(sevenDaysAgo);
}

/**
 * Parses and formats specific date placeholders into ISO 8601 UTC strings.
 * Supports relative dates (e.g., {{today_start}}) and specific date ranges (e.g., {{YYYY-MM-DD_start}}).
 * @param placeholder The date placeholder string (e.g., "{{today_start}}", "{{2023-01-15_end}}").
 * @returns The formatted ISO 8601 UTC date string, or the original placeholder if unrecognized.
 */
export function parseAndFormatDatePlaceholder(placeholder: string): string {
    switch (placeholder) {
        case "{{yesterday_start}}": return getYesterdayStartUtc();
        case "{{today_start}}": return getTodayStartUtc();
        case "{{now}}": return getCurrentUtcNow();
        case "{{last_month_start}}": return getLastMonthStartUtc();
        case "{{last_month_end}}": return getLastMonthEndUtc();
        case "{{last_7_days_start}}": return getLast7DaysStartUtc();
    }

    const matchStart = placeholder.match(/^{{ДатаСпецифическая_(\d{4}-\d{2}-\d{2})_start}}$/);
    const matchEnd = placeholder.match(/^{{ДатаСпецифическая_(\d{4}-\d{2}-\d{2})_end}}$/);

    if (matchStart) {
        const datePart = matchStart[1];
        // Parse as UTC to ensure consistency
        const dt = new Date(Date.UTC(
            parseInt(datePart.substring(0, 4)),
            parseInt(datePart.substring(5, 7)) - 1, // Month is 0-indexed
            parseInt(datePart.substring(8, 10)),
            0, 0, 0, 0
        ));
        return getIsoDatetime(dt);
    } else if (matchEnd) {
        const datePart = matchEnd[1];
        // Parse as UTC to ensure consistency, then set to end of day
        const dt = new Date(Date.UTC(
            parseInt(datePart.substring(0, 4)),
            parseInt(datePart.substring(5, 7)) - 1, // Month is 0-indexed
            parseInt(datePart.substring(8, 10)),
            23, 59, 59, 999
        ));
        return getIsoDatetime(dt);
    }

    console.warn(`Warning: Unrecognized date placeholder: ${placeholder}`);
    return placeholder;
}

/**
 * Recursively replaces date placeholders within an object, array, or string.
 * @param obj The object, array, or string to process.
 * @returns The processed object with placeholders replaced.
 */
export function replacePlaceholders<T>(obj: T): T {
    if (typeof obj === 'object' && obj !== null) {
        if (Array.isArray(obj)) {
            return obj.map(v => replacePlaceholders(v)) as T;
        } else {
            const newObj: { [key: string]: any } = {};
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    newObj[key] = replacePlaceholders((obj as any)[key]);
                }
            }
            return newObj as T;
        }
    } else if (typeof obj === 'string' && obj.startsWith("{{") && obj.endsWith("}}")) {
        return parseAndFormatDatePlaceholder(obj) as T;
    }
    return obj;
}

// Example Usage (for testing):
// console.log("Today Start UTC:", getTodayStartUtc());
// console.log("Yesterday Start UTC:", getYesterdayStartUtc());
// console.log("Current UTC Now:", getCurrentUtcNow());
// console.log("Last Month Start UTC:", getLastMonthStartUtc());
// console.log("Last Month End UTC:", getLastMonthEndUtc());
// console.log("Last 7 Days Start UTC:", getLast7DaysStartUtc());
// console.log("Specific Date Start:", parseAndFormatDatePlaceholder("{{2023-01-15_start}}"));
// console.log("Specific Date End:", parseAndFormatDatePlaceholder("{{2023-01-15_end}}"));
// console.log("Unrecognized Placeholder:", parseAndFormatDatePlaceholder("{{unrecognized}}"));

// const testObject = {
//     date1: "{{today_start}}",
//     nested: {
//         date2: "{{last_month_start}}",
//         array: ["value", "{{2024-03-10_end}}"],
//     },
//     plain: "some text"
// };

// console.log("\nOriginal Object:", JSON.stringify(testObject, null, 2));
// const processedObject = replacePlaceholders(testObject);
// console.log("Processed Object:", JSON.stringify(processedObject, null, 2));



// initialize our agent model
export const model_gemini = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0,
  apiKey: process.env.GOOGLE_GENAI_API_KEY! || ""
});