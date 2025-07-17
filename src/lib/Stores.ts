import { writable } from 'svelte/store';

export const NumberIndex = writable(0n);
export const StarredNumbers = writable<Set<bigint>>(new Set());