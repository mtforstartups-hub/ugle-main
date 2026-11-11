import { GoogleSheetsService } from "./GoogleSheetsService";

export interface TrialRow {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  os: string;
  submittedAt: string;
}

/** Column C, matching the order used by `append`. */
const EMAIL_COLUMN = "C";

export class TrialSheetService extends GoogleSheetsService {
  // Must match the exact tab name in your Google Spreadsheet
  protected readonly sheetName = "EarlyAccess";

  /**
   * Appends an request trial row with columns:
   * [First Name, Last Name, Email, Phone, OS, Submitted At]
   */
  async append(data: TrialRow): Promise<void> {
    await this.appendRow([
      data.firstName,
      data.lastName,
      data.email,
      data.phone,
      data.os,
      data.submittedAt,
    ]);
  }

  /** Every email address already recorded in the sheet, in row order. */
  async emails(): Promise<string[]> {
    return this.readColumn(EMAIL_COLUMN);
  }
}
