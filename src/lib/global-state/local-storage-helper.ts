import { browser } from "$app/environment";

/**
 * Retrieves a value from local storage.
 * If not found, or if parsing fails, returns the default value.
 * Only operates in the browser environment.
 *
 * @param key - The key under which the value is stored in local storage
 * @param defaultValue - The default value to return if the key does not exist or the value is not of the expected type
 * @returns - The value stored in local storage, or the default value if the key does not exist or the value is not of the expected type
 */
export function getLocalStorageItem<T>(key: string, defaultValue: T): T {
    if (!browser) {
        return defaultValue;
    }

    const storedValue = localStorage.getItem(key);
    if (storedValue !== null) {
        try {
            const parsedValue = JSON.parse(storedValue);
            if (typeof parsedValue === typeof defaultValue) {
                return parsedValue;
            }
        } catch (error) {
            console.error(`Error parsing ${key} from local storage:`, error);
        }
    }

    return defaultValue;
}

/**
 * Saves a value to local storage.
 * Only operates in the browser environment.
 *
 * @param key - The key under which the value is stored in local storage
 * @param value - The value to store in local storage
 */
export function setLocalStorageItem<T>(key: string, value: T) {
    if (!browser) {
        return;
    }

    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error saving ${key} to local storage:`, error);
    }
}
