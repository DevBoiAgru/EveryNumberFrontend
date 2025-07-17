<script lang="ts">
    import { onMount } from "svelte";
    import {
        SCROLLBAR_WIDTH,
        SCROLLBAR_THUMB_HEIGHT,
        BUTTON_SCROLL_AMOUNT,
    } from "../lib/Constants";
    import Icon from "@iconify/svelte";

    let fraction = $state(0.5); // 0-1, how much we have scrolled
    let position = $state(0); // Position of the thumb on the track

    let dragging = $state(false);
    let scrollbarTrack: HTMLDivElement;
    let scrollbarThumb: HTMLDivElement;
    let maxTravel: number;

    let { onChange }: { onChange: (fraction: number) => void } = $props();

    onMount(() => {
        function bodyResized() {
            if (!scrollbarTrack) {
                return
            }
            let trackRect = scrollbarTrack.getBoundingClientRect();
            maxTravel = trackRect.bottom - 2 * SCROLLBAR_THUMB_HEIGHT;
        }

        new ResizeObserver(bodyResized).observe(document.body);

        // Initialise values
        bodyResized();
    });

    $effect(() => {
        if (fraction < 0 || fraction > 1){
            console.error("Scrollbar fraction is out of bounds (0 to 1)! Please reset.")
        }
        
        // Update position whenever the fraction changes
        position = maxTravel * fraction;

        onChange(fraction);
    });

    function dragStart() {
        dragging = true;
    }

    function dragEnd() {
        if (dragging) {
            dragging = false;
        }
    }

    function drag(e: MouseEvent) {
        if (dragging) {
            fraction =
                Math.min(Math.max(0, position + e.movementY), maxTravel) /
                maxTravel;
            position = fraction * maxTravel;
        }
    }

    function onClickTrack(e: MouseEvent) {
        if (e.target == scrollbarThumb) {
            return; // User clicked the thumb, dont do anything
        }
        let trackRect = scrollbarTrack.getBoundingClientRect();
        let clickedPos = (e.clientY - trackRect.top) / (trackRect.bottom - trackRect.top);
        
        fraction = Math.min(Math.max(clickedPos, 0), 1);
    }
</script>

<div class="scrollbar" style="--scrollbar-width: {SCROLLBAR_WIDTH}px">
    <button
        class="scroll-buttons btn-top"
        onclick={() => {
            fraction = Math.max(0, fraction - BUTTON_SCROLL_AMOUNT);
        }}
        ><Icon
            icon="tabler:triangle-filled"
            width="12"
            height="12"
            color="#9a9a9a"
        /></button
    >
    <div class="track" bind:this={scrollbarTrack} onclick={onClickTrack} role="presentation">
        <div
            class="thumb"
            bind:this={scrollbarThumb}
            onpointerdown={dragStart}
            style="--thumb-height: {SCROLLBAR_THUMB_HEIGHT}px; --position: {position}px"
        ></div>
    </div>
    <button
        class="scroll-buttons btn-bottom"
        onclick={() => {
            fraction = Math.min(1, fraction + BUTTON_SCROLL_AMOUNT);
        }}
        ><Icon
            icon="tabler:triangle-inverted-filled"
            width="12"
            height="12"
            color="#9a9a9a"
        /></button
    >
</div>

<svelte:body onpointerup={dragEnd} onpointermove={drag} />

<style>
    .scrollbar {
        width: var(--scrollbar-width);
        display: flex;
        flex-direction: column;
        background-color: var(--button-bg);
    }

    .track {
        cursor: pointer;
        height: 100%;
        position: relative;
    }

    .thumb {
        position: absolute;
        left: 0;
        right: 0;
        top: var(--position);
        height: var(--thumb-height);
        cursor: grab;
        background-color: var(--scrollbar-color);
    }
    .thumb:active {
        cursor: grabbing;
        background-color: var(--scrollbar-active);
    }

    .scroll-buttons {
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        background-color: var(--button-bg);
        height: var(--scrollbar-width);
        width: var(--scrollbar-width);
    }
    .scroll-buttons:hover {
        background-color: var(--button-hover-bg);
    }
    .scroll-buttons:active {
        background-color: var(--button-active-bg);
    }
</style>
