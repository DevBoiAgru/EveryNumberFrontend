import { writable } from 'svelte/store';

export const NumberIndex = writable(0n);

// Initialise starred numbers from local storage. Empty set if nothing is present.
export const StarredNumbers = writable<Set<bigint>>(new Set());