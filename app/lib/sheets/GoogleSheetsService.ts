import { google } from "googleapis";
import { sheetsConfig } from "@/app/lib/env";

export abstract class GoogleSheetsService {
  protected abstract readonly sheetName: string;

  private getClient() {
    if (!sheetsConfig.success) {
      throw new Error("Google Sheets is not configured");
    }

    const { GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY } = sheetsConfig.data;

    const auth = new google.auth.JWT({
      email: GOOGLE_CLIENT_EMAIL,
      key: GOOGLE_PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    return {
      sheets: google.sheets({ version: "v4", auth }),
      spreadsheetId: sheetsConfig.data.GOOGLE_SPREADSHEET_ID,
    };
  }

  protected async appendRow(values: string[]): Promise<void> {
    const { sheets, spreadsheetId } = this.getClient();

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${this.sheetName}!A1`,
      // RAW prevents user-supplied values such as "=IMPORTXML(...)" from being
      // interpreted as spreadsheet formulas (formula injection).
      valueInputOption: "RAW",
      requestBody: {
        values: [values],
      },
    });
  }

  /**
   * Read a single column (e.g. "C") as a flat list of strings.
   * Empty cells are returned as empty strings so indexes stay meaningful.
   */
  protected async readColumn(column: string): Promise<string[]> {
    const { sheets, spreadsheetId } = this.getClient();

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${this.sheetName}!${column}:${column}`,
    });

    return (res.data.values ?? []).map((row) => String(row[0] ?? ""));
  }
}
