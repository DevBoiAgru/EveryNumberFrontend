import { SvelteMap } from 'svelte/reactivity';
import { writable } from 'svelte/store';

export const NumberIndex = writable(0n);
export const StarredNumbers = writable<Set<bigint>>(new Set());
export const LikesMap = writable(new SvelteMap<bigint, number>())