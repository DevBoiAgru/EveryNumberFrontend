<script lang="ts">
    import { onMount } from "svelte";
    import NumberList from "./components/NumberList.svelte";
    import Scrollbar from "./components/Scrollbar.svelte";
    import FindNumber from "./components/FindNumber.svelte";
    import StarredList from "./components/StarredList.svelte";
    import Navbar from "./components/Navbar.svelte";
    import {
        MIN_64BIT_INT,
        NUMBER_ROW_HEIGHT,
        NUMBER_ROW_MARGIN,
    } from "./lib/Constants";
    import { NumberIndex } from "./lib/Stores";
    import { MAX_64BIT_INT } from "./lib/Constants";
    import { StarredNumbers } from "./lib/Stores";
    import About from "./components/About.svelte";

    let limit = $state(0);
    let displayHeight = $state(0);
    let isFirstRun = $state(true);
    let findOn = $state(false);
    let showAbout = $state(false);
    let showStarred = $state(false);

    // Save starred numbers to localstorage when it changes
    StarredNumbers.subscribe((starred) => {
        if (isFirstRun) {
            isFirstRun = false;
            return;
        }
        const starredArr = [...starred];
        if (starredArr) {
            const bigintStrArray = [];
            for (let i = 0; i < starredArr.length; i++) {
                bigintStrArray.push(starredArr[i].toString());
            }
            localStorage.setItem(
                "starred-nums",
                JSON.stringify(bigintStrArray),
            );
        }
    });

    onMount(() => {
        let display = document.getElementById("num-display")!;

        // Event listener for window resizing, same as NumberList.svelte
        function screenResized() {
            // Recalculate how many numbers we can fit on the screen
            limit = Math.floor(
                display.clientHeight / (NUMBER_ROW_HEIGHT + NUMBER_ROW_MARGIN),
            );
        }

        function bodyResized() {
            displayHeight = document.body.clientHeight;
        }

        new ResizeObserver(screenResized).observe(display);
        new ResizeObserver(bodyResized).observe(document.body);

        // Calculate how many numbers we can fit on the screen initially
        limit = Math.floor(display.clientHeight / 50);
    });

    // Helper function to map the scrollbar 0-1 value to big numbers
    function mapNumberToSigned64Bit(value: number) {
        if (value == 0) {
            return MIN_64BIT_INT;
        }
        // This method has a limitation that it does
        // not return the minimum 64 bit integer on
        // inputting 0, hence the special if check.
        const SCALE = BigInt(1_000_000);
        const t = BigInt(Math.round(value * 1_000_000));
        const numerator = (2n * t - SCALE) * MAX_64BIT_INT;
        const interpolated = numerator / SCALE;
        return interpolated;
    }

    function scrollToNumber(num: bigint) {
        NumberIndex.update(() => {
            // Bounds check
            if (num > MAX_64BIT_INT - BigInt(limit)) {
                // Bottom limit
                return MAX_64BIT_INT - BigInt(limit);
            }
            return num;
        });
    }

    function onScrollbarChange(fraction: number) {
        let res = mapNumberToSigned64Bit(fraction);
        scrollToNumber(res);
    }
</script>

<main>
    <Navbar
        onClickAbout={() => {
            showAbout = !showAbout;
        }}
    />
    <div class="app-wrapper">
        <!-- Main app -->
        <div class="main-app">
            <header class="header">
                <div class="heading-text" title="Every 64-bit integer">
                    Every <span class="nerd-title">64-bit Integer</span>
                    <span class="normie-title">Number*</span>
                </div>
                <p class="tagline-text">
                    Possibly every number you'll ever need
                </p>
            </header>
            <NumberList />
            <div class="qol-buttons">
                <button
                    aria-label="Show starred numbers"
                    onclick={() => {
                        showStarred = !showStarred;
                    }}>Show starred</button
                >
                <button
                    aria-label="Open find dialog"
                    onclick={() => {
                        findOn = !findOn;
                    }}>Find numbers</button
                >
            </div>
        </div>

        <!-- Scrollbar -->
        <Scrollbar onChange={onScrollbarChange} />
    </div>

    <!-- Starred numbers -->
    {#if showStarred}
        <StarredList
            onClose={() => {
                showStarred = false;
            }}
        />
    {/if}

    <!-- About section -->
    {#if showAbout}
        <About
            onClose={() => {
                showAbout = false;
            }}
        />
    {/if}

    <!-- Find -->
    <FindNumber
        topOffset={findOn ? "0px" : "-100%"}
        onClose={() => {
            findOn = false;
        }}
        onInputChange={(num) => {
            if (num !== null) {
                scrollToNumber(num - 1n);
            }
        }}
    />

    <div class="disclaimer">
        *Every number here refers to every signed 64-bit integer
    </div>
</main>

<svelte:document
    onkeydown={(e) => {
        if (e.key == "f" && e.ctrlKey) {
            e.preventDefault();
            findOn = !findOn;
        }
    }}
/>

<style>
    .app-wrapper {
        display: flex;
        flex-direction: row;
        height: 100dvh;
        max-height: 100dvh;
        overflow: hidden;
        overscroll-behavior: none;
    }
    .main-app {
        position: relative;
        display: flex;
        flex-direction: column;
        flex: 1 1 0%;
        min-height: 0px;
        align-items: center;
    }
    .header {
        width: 80%;
        padding: 30px;
        text-align: center;
    }
    .qol-buttons {
        width: 80%;
        display: flex;
        position: relative;
        justify-content: end;
        gap: 20px;
    }
    .qol-buttons > button {
        font-family: "Poppins", sans-serif;
        color: var(--text-color);
        background-color: var(--fg-color);
        cursor: pointer;
        padding: 1px 15px 1px 15px;
        border-radius: 0px 0px 10px 10px;
        border: none;
    }
    .qol-buttons > button:hover {
        background-color: var(--fg-selected-color);
    }
    .qol-buttons > button:active {
        background-color: var(--fg-selected-color);
    }
    .heading-text {
        width: 100%;
        margin: 0px;
        font-size: 3em;
        font-weight: 600;
        display: flex;
        align-items: center;
        margin: 20px 0px 5px 0px;
    }

    .tagline-text {
        color: var(--text-secondary);
        margin: 5px 0px 5px 0px;
        text-align: left;
    }

    .nerd-title {
        margin-left: 2px;
        margin-right: 10px;
        overflow: hidden;
        display: inline-block;
        white-space: nowrap;
        max-width: 0px;
        transition: all 0.5s ease-in-out;
        color: var(--text-secondary);
    }

    .normie-title {
        transition: all 0.3s 0.1s ease-in-out;
        max-width: 250px;
        overflow: hidden;
    }

    .heading-text:hover .nerd-title {
        opacity: 1;
        max-width: 500px;
        margin-left: 10px;
    }
    .heading-text:hover .normie-title {
        opacity: 0;
        max-width: 0px;
    }

    .disclaimer {
        color: var(--text-secondary);
        position: absolute;
        bottom: 2px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 11px;
    }

    @media (max-width: 650px) {
        .heading-text:hover .normie-title {
            opacity: 1;
            max-width: 250px;
        }
        .heading-text:hover .nerd-title {
            opacity: 0;
            max-width: 0px;
            margin-left: 2px;
            margin-right: 10px;
        }
        .heading-text {
            font-size: 2.2em;
            align-items: start;
            margin: 25px 5px 5px 5px;
        }
        .tagline-text {
            text-align: left;
            margin: 5px 5px 5px 5px;
        }
        .header {
            width: 100%;
        }
        .disclaimer {
            display: none;
        }
    }
</style>
