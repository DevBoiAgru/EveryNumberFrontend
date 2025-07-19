<script lang="ts">
    import NumberInfo from "./NumberInfo.svelte";
    import Icon from "@iconify/svelte";
    import { StarredNumbers } from "../lib/Stores";
    import {
        NUMBER_ROW_HEIGHT,
        NUMBER_ROW_MARGIN,
        GetNumbersSignedness,
    } from "../lib/Constants.svelte";
    import { Tween } from "svelte/motion";
    import { cubicInOut } from "svelte/easing";
    import { abbrvNumber } from "../lib/Helpers";

    let {
        num,
        starred,
        likeCount,
        onLike,
    }: {
        num: bigint;
        starred: boolean;
        likeCount: number | null;
        onLike: (num: bigint) => void;
    } = $props();

    let showNumberModal: boolean = $state(false);
    let showClipboardNotif: boolean = $state(false);

    // Likes count rolling animation
    let animatedLikeCount = new Tween(likeCount, {
        duration: 500,
        easing: cubicInOut,
    });

    // Update animated like count target value everytime likeCount is updated
    $effect(() => {
        animatedLikeCount.target = likeCount;
    });

    // Heart floating animation
    interface Heart {
        id: number;
        x: number;
        y: number;
    }

    let hearts: Array<Heart> = $state([]);
    function addHeart(x: number, y: number) {
        const newHeart: Heart = { id: Date.now() + Math.random(), x: x, y: y };
        hearts = [...hearts, newHeart];

        function removeLike(id: number) {
            hearts = hearts.filter((heart) => heart.id !== id);
        }

        // Auto-remove after 2s (matches animation duration)
        setTimeout(() => {
            removeLike(newHeart.id);
        }, 2000);
    }

    // Converting number into string for displaying it with padding
    let bigintAbs = (num: bigint) => (num < 0 ? -1n * num : num); // Helper function
    let strNum = bigintAbs(num).toString();
    // Repeat the 0 to create a 37 digit number (2**63 - 1 has 19 digits)
    let pad = "0".repeat(
        GetNumbersSignedness() ? 19 - strNum.length : 20 - strNum.length,
    );
</script>

<div
    class="num-row"
    style="--row-height: {NUMBER_ROW_HEIGHT}px; --row-padding: {NUMBER_ROW_MARGIN}px"
    onclick={() => {
        showNumberModal = true;
    }}
    aria-hidden="false"
    role="presentation"
>
    <div
        class="number"
        onclick={(e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(num.toString());
            showClipboardNotif = true;
            setTimeout(() => {
                showClipboardNotif = false;
            }, 1000);
        }}
        role="presentation"
    >
        <span class="num-padding">{num < 0n ? "-" : ""}{pad}</span><span
            >{strNum}</span
        >
    </div>

    <div class="interaction-buttons">
        <button
            title="Star this number"
            class="interact-button"
            onclick={(e) => {
                e.stopPropagation();
                StarredNumbers.update((starred_set) => {
                    // Add the current number to the starred set. If it exists, remove it.
                    const newSet = new Set(starred_set);

                    if (newSet.delete(num)) {
                        // We unstarred the number, i.e it was already starred
                        starred = false;
                    } else {
                        // Number was not starred, add it
                        starred = true;
                        newSet.add(num);
                    }
                    return newSet;
                });
            }}
        >
            {#if starred}
                <Icon
                    icon="tabler:star-filled"
                    width="20"
                    height="20"
                    color="#f5c62c"
                />
            {:else}
                <Icon
                    icon="tabler:star"
                    width="20"
                    height="20"
                    color="#f5c62c"
                />
            {/if}
        </button>
        {#if likeCount !== null}
            <button
                title="Like this number"
                class="interact-button"
                onclick={(e) => {
                    e.stopPropagation();
                    for (let i = 0; i <= 5; i++) {
                        addHeart(e.clientX, e.clientY);
                    }
                    if (likeCount != undefined) {
                        likeCount++;
                    }
                    onLike(num);
                }}
            >
                <Icon
                    icon="tabler:heart"
                    width="20"
                    height="20"
                    color="#f52c2c"
                />

                <!-- Automatically convert number into a readable string if its too long -->
                <span class="like-count"
                    >{likeCount < 10_000
                        ? Math.floor(animatedLikeCount.current!)
                        : abbrvNumber(likeCount)}</span
                >
            </button>
        {/if}
    </div>
</div>

{#if showNumberModal}
    <NumberInfo
        {num}
        onClose={() => {
            showNumberModal = false;
        }}
    />
{/if}

{#if showClipboardNotif}
    <div class="flyout">Copied to clipboard!</div>
{/if}

<!-- Hearts animation -->
{#each hearts as heart (heart.id)}
    <div
        class="heart-anim"
        style="--x: {heart.x +
            (Math.random() - 0.5) * 2 * 20}px; --y: {heart.y +
            (Math.random() - 0.5) * 2 * 20}px; --rot: {Math.random() *
            360}deg; --size: {Math.random() * 1.5}"
    >
        <Icon
            icon="tabler:heart-filled"
            width="20"
            height="20"
            color="#f52c2c"
        />
    </div>
{/each}

<style>
    .num-row {
        background-color: var(--fg-color);
        width: 100%;
        color: var(--text);
        border: none;
        border-radius: 5px;
        transition: background-color 0.1s ease-in-out;
        cursor: pointer;

        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 0px;
        align-items: center;

        min-height: var(--row-height);
        margin-bottom: var(--row-padding);
    }
    .num-row:hover {
        background-color: var(--fg-selected-color);
    }

    .number {
        display: flex;
        width: fit-content;
        padding-left: 30px;
        font-family: "JetBrains Mono", monospace;
        user-select: all;
        white-space: nowrap;
    }

    .like-count {
        font-family: "JetBrains Mono", monospace;
        color: #f52c2c;
        margin: 0px 10px 0px 2px;
        font-size: 0.9rem;
        text-align: left;

        /* Reserve space for numbers changing so that it doesnt move stuff around */
        min-width: 6ch;
    }

    .interaction-buttons {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2px;
        justify-self: end;
    }

    .interact-button {
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: transparent;
        border: none;
        transition: transform 0.1s ease-in-out;
    }
    .interact-button:hover {
        transform: translateY(-2px);
    }

    .num-padding {
        color: var(--text-secondary);
    }

    @media (max-width: 650px) {
        .number {
            padding-left: 10px;
        }
    }

    .flyout {
        position: absolute;
        padding: 10px;
        border: var(--button-active-bg) 2px solid;
        border-radius: 15px;
        background-color: var(--bg-color);
        bottom: -100px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10;
        animation:
            flyIn 1s cubic-bezier(0, 1.03, 0.58, 1),
            flyIn 1s cubic-bezier(0, 1.07, 0.2, 1.01) 1s 1 reverse;
    }
    @keyframes flyIn {
        0% {
            opacity: 0;
            bottom: -100px;
        }
        100% {
            opacity: 1;
            bottom: 100px;
        }
    }

    .heart-anim {
        animation: heartFlyIn 2s ease-out;
        opacity: 0;
        position: absolute;
        left: var(--x);
        top: var(--y);
    }
    @keyframes heartFlyIn {
        0% {
            opacity: 1;
            transform: translateY(0px) scale(var(--size)) rotate(var(--rot));
            scale: 1;
        }
        100% {
            opacity: 0;
            transform: translateY(-100px) scale(0) rotate(0);
        }
    }
</style>
