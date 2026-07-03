let _seq = 0;

/**
 * Unique positive integer for this browser session (timestamp + counter).
 * @returns {number}
 */
export function intUnique() {
    _seq = (_seq + 1) % 10000;

    return Date.now() * 10000 + _seq + 1000;
}
