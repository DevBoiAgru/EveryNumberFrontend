<script lang="ts">
    import { StarredNumbers } from "../lib/Stores";
    import { get } from "svelte/store";
    import NumberRow from "./NumberRow.svelte";
    import { SCROLLBAR_WIDTH } from "../lib/Constants.svelte";

    let { onClose }: { onClose: () => void } = $props();
    let nums: Set<bigint> = get(StarredNumbers);
</script>

<div
    class="modal-bg"
    onclick={onClose}
    role="presentation"
    tabindex="-1"
    aria-hidden="false"
>
    <h1 style="margin-top: 3rem;">STARRED NUMBERS</h1>
    <button
        aria-label="Close starred numbers"
        class="close-btn"
        onclick={onClose}>✖</button
    >
    <div
        id="display"
        onclick={(e) => {
            e.stopPropagation();
        }}
        style="--scrollbar-thickness: {SCROLLBAR_WIDTH}px;"
        role="presentation"
        tabindex="-1"
        aria-hidden="false"
    >
        {#each nums as num (num)}
            <NumberRow
                {num}
                starred={get(StarredNumbers).has(num)}
                likeCount={null}
                onLike={() => {}}
            />
        {/each}
        {#if nums.size == 0}
            <p class="text-row">Nothing here...</p>
        {/if}
    </div>
</div>

<svelte:document
    onkeydown={(e) => {
        if (e.key == "Escape" || e.key == "Backspace") {
            onClose();
        }
    }}
/>

<style>
    .modal-bg {
        position: absolute;
        color: var(--text-color);
        top: 0px;
        left: 0px;
        height: 100vh;
        width: 100vw;
        background-color: rgba(0, 0, 0, 0.674);
        backdrop-filter: blur(10px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 10;
    }
    #display {
        overflow-x: hidden;
        flex-direction: column;
        min-height: 0px;
        display: flex;
        width: 80%;
        margin-top: 3rem;
        margin-bottom: 3rem;
        scrollbar-width: var(--scrollbar-thickness);
        scrollbar-color: var(--scrollbar-color) var(--button-bg);
    }

    #display::-webkit-scrollbar {
        width: var(--scrollbar-thickness);
    }

    #display::-webkit-scrollbar-track {
        background: var(--button-bg);
    }

    #display::-webkit-scrollbar-thumb {
        background-color: var(--scrollbar-color);
        border-radius: 0px;
        border: none;
    }

    .text-row {
        min-height: 50px;
        font-size: 1.5em;
        background-color: var(--fg-color);
        width: 100%;
        color: var(--text);
        border: none;
        border-radius: 5px;
        transition: background-color 0.1s ease-in-out;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    @media (max-width: 650px) {
        #display {
            overflow-x: hidden;
            flex: 0.95 1 0%;
            width: 98%;
        }
    }

    .close-btn {
        cursor: pointer;
        position: absolute;
        top: 10px;
        right: 10px;
        width: 3rem;
        font-size: 1.5rem;
        background-color: transparent;
        border: none;
        color: var(--text-color);
    }
    .close-btn:hover {
        background-color: var(--button-hover-bg);
    }
    .close-btn:active {
        background-color: var(--button-active-bg);
    }
</style>
