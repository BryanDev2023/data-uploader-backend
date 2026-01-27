export interface Csv {
    id: string;
    name: string;
    email: string;
    age: number;
}

export interface CsvError {
    row: number;
    details: CsvDetails;
}

export type CsvDetails = Record<string, string>;

export interface CsvResponse {
    success: Csv[];
    errors: CsvError[];
}
