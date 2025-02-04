type ValidationResult = { success: true } | { success: false; error: string };

// TODO: find better name
interface ApiLoadError {
    errorTitle: string;
    errorDetails?: string;
}

export type { ValidationResult, ApiLoadError };
