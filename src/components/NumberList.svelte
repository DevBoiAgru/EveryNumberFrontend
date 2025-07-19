<script lang="ts">
    import NumberRow from "./NumberRow.svelte";
    import { LikesMap, StarredNumbers } from "../lib/Stores";
    import { SvelteMap } from "svelte/reactivity";
    import { get } from "svelte/store";

    let {
        currentNumber,
        limit,
        onLike,
    }: {
        currentNumber: bigint;
        limit: number;
        onLike: (num: bigint) => void;
    } = $props();

    // Number of likes for each number on the screen
    let likesCountMap = $state(new SvelteMap<bigint, number>());

    LikesMap.subscribe((val) => {
        likesCountMap = val;
    });

    let display: HTMLElement;

    let displayedNumbers = $derived.by(() => {
        const nums: bigint[] = [];

        for (let i = 0n; i <= limit; i++) {
            nums.push(i + currentNumber);
        }

        return nums;
    });
</script>

<div id="num-display" role="presentation" bind:this={display}>
    {#each displayedNumbers as num (num)}
        <NumberRow
            {num}
            starred={get(StarredNumbers).has(num)}
            likeCount={likesCountMap.get(num) ?? 0}
            {onLike}
        />
    {/each}
</div>

<style>
    #num-display {
        overscroll-behavior: none;
        flex-direction: column;
        touch-action: none;
        overflow: hidden;
        flex: 0.95 1 0%;
        min-height: 0px;
        display: flex;
        width: 80%;
    }

    @media (max-width: 650px) {
        #num-display {
            overflow: hidden;
            display: flex;
            flex-direction: column;
            flex: 0.95 1 0%;
            min-height: 0px;
            width: 98%;
            overscroll-behavior: none;
        }
    }
</style>
