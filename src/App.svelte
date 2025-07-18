<script lang="ts">
    import { onMount } from "svelte";
    import { SvelteMap } from "svelte/reactivity";
    import NumberList from "./components/NumberList.svelte";
    import Scrollbar from "./components/Scrollbar.svelte";
    import FindNumber from "./components/FindNumber.svelte";
    import StarredList from "./components/StarredList.svelte";
    import Navbar from "./components/Navbar.svelte";
    import About from "./components/About.svelte";
    import {
        BACKEND_URL,
        MIN_64BIT_INT,
        NUMBER_ROW_HEIGHT,
        NUMBER_ROW_MARGIN,
    } from "./lib/Constants";
    import { NumberIndex } from "./lib/Stores";
    import { MAX_64BIT_INT } from "./lib/Constants";
    import { StarredNumbers } from "./lib/Stores";
    import { clamp } from "./lib/Helpers";

    // Number of numbers shown on screen
    let numbersShown = $state(0);

    // Number of likes for each number on the screen
    let likesCountMap = new SvelteMap<bigint, number>();

    // Current number
    let currentIndex = $state(0n);

    // Modals and dialogs
    let showStarred = $state(false);
    let showFindBox = $state(false);
    let showAbout = $state(false);

    // Focus on the find input on opening find dialog
    $effect(() => {
        if (showFindBox) {
            // Focus only if we are opening the box, not closing it
            document.getElementById("find-input-box")?.focus();
        }
    });

    // Update current number when NumberIndex changes on the store
    NumberIndex.subscribe((val) => {
        currentIndex = val;
    });

    // Save starred numbers to localstorage when it changes
    let isFirstRun = $state(true);
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

        // Update like count periodically
        setInterval(() => {
            if (!scrolling) {
                updateLikesCount(currentIndex);
            }
        }, 15000);

        // Initialise number of likes in the beginning
        updateLikesCount(currentIndex);

        // Event listeners
        function screenResized() {
            // Recalculate how many numbers we can fit on the screen
            numbersShown = Math.floor(
                display.clientHeight / (NUMBER_ROW_HEIGHT + NUMBER_ROW_MARGIN),
            );
        }

        new ResizeObserver(screenResized).observe(display);

        // Initialise the number of numbers shown
        screenResized();

        // Touch scrolling and swiping
        display.addEventListener("wheel", onScroll);
        document.addEventListener("touchstart", touchStart);
        document.addEventListener("touchend", touchEnd);
        document.addEventListener("touchcancel", touchEnd);
        document.addEventListener("touchmove", touchMove, { passive: false });

        return () => {
            display.removeEventListener("wheel", onScroll);
            document.removeEventListener("touchstart", touchStart);
            document.removeEventListener("touchend", touchEnd);
            document.removeEventListener("touchcancel", touchEnd);
            document.removeEventListener("touchmove", touchMove);
        };
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
            if (num > MAX_64BIT_INT - BigInt(numbersShown)) {
                // Bottom limit
                return MAX_64BIT_INT - BigInt(numbersShown);
            } else if (num < MIN_64BIT_INT) {
                // Top limit
                return MIN_64BIT_INT;
            }
            return num;
        });
    }

    // Update likes
    function likeNumber(number: bigint) {
        // Send like to the backend
        fetch(`${BACKEND_URL}/api/numberlike`, {
            method: "POST",
            headers: {
                "Content-Type": "application/text",
            },
            body: number.toString(),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data: { [key: string]: number }) => {
                // Clear map so that over time we dont have a whole copy of the db on the browser
                likesCountMap.clear();

                Object.entries(data).forEach(([number, likeCount]) => {
                    likesCountMap.set(BigInt(number), likeCount);
                });
            });
    }

    function updateLikesCount(number: bigint) {
        fetch(`${BACKEND_URL}/api/numberlike?n=${number.toString()}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data: { [key: string]: number }) => {
                // Clear map so that over time we dont have a whole copy of the db on the browser
                likesCountMap.clear();

                Object.entries(data).forEach(([number, likeCount]) => {
                    likesCountMap.set(BigInt(number), likeCount);
                });
            });
    }

    // Swiping and scrolling
    function scrollDisplay(delta: bigint) {
        scrolling = true;
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            scrolling = false;
            updateLikesCount(currentIndex);
        }, 1000);

        NumberIndex.update((n) => {
            // Bounds check
            let result = n + delta;

            if (result <= MIN_64BIT_INT) {
                return MIN_64BIT_INT;
            } else if (result + BigInt(numbersShown) > MAX_64BIT_INT) {
                return MAX_64BIT_INT - BigInt(numbersShown);
            } else {
                return result;
            }
        });

        // The user scrolled, but is the scrollbar updating?
        // The answer: It isn't. It would be very very hard to scroll so much that there's
        // even 1px of movement in the scrollbar. If someone manages to do that however,
        // it'll be quite impressive I must say
    }

    let lastTouchY: number | null = 0;

    // Used for debouncing scroll
    let timeout: number | undefined = $state();
    let scrolling: boolean = $state(false);

    function touchStart(e: TouchEvent) {
        lastTouchY = e.touches[0].clientY;
    }
    function touchEnd(e: TouchEvent) {
        lastTouchY = null;
    }
    function touchMove(e: TouchEvent) {
        // e.preventDefault();
        let touchY = e.touches[0].clientY;
        let touchDelta = 0;

        if (lastTouchY !== null) {
            touchDelta = lastTouchY - touchY;

            let scrollAmount = BigInt(
                Math.floor(clamp(touchDelta * 2, -10, 10)), // Prevent overscrolling by clamping the delta
            );
            scrollDisplay(scrollAmount);
        }
        lastTouchY = touchY;
    }
    function onScroll(e: WheelEvent) {
        scrollDisplay(BigInt(Math.floor(e.deltaY)));
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

            <NumberList
                currentNumber={currentIndex}
                limit={numbersShown}
                onLike={likeNumber}
            />

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
                        showFindBox = !showFindBox;
                    }}>Find numbers</button
                >
            </div>
        </div>

        <!-- Scrollbar -->
        <Scrollbar
            onChange={(frac) => {
                let res = mapNumberToSigned64Bit(frac);
                scrollToNumber(res);
            }}
        />
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
        topOffset={showFindBox ? "0px" : "-100%"}
        onClose={() => {
            showFindBox = false;
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
            showFindBox = !showFindBox;
        }
        // Hotkeys
        switch (e.key) {
            case "ArrowUp":
                scrollDisplay(-1n);
                break;
            case "ArrowDown":
                scrollDisplay(1n);
                break;
            case "PageUp":
                scrollDisplay(BigInt(numbersShown) * -1n - 1n);
                break;
            case "PageDown":
                scrollDisplay(BigInt(numbersShown) + 1n);
                break;
            default:
                break;
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
