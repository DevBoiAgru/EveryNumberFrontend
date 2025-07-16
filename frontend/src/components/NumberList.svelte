<script lang="ts">
    import NumberRow from "./NumberRow.svelte";
    import { onMount } from "svelte";
    import { MAX_64BIT_INT, MIN_64BIT_INT } from "../lib/Constants";
    import { NumberIndex, StarredNumbers } from "../lib/Stores";
    import { get } from "svelte/store";
    import { NUMBER_ROW_HEIGHT, NUMBER_ROW_MARGIN } from "../lib/Constants";

    let displayedNumbers: Array<bigint> = $state([]);
    let currentNumber = $state(0n);
    let dragging = $state(false);
    let limit = $state(0);

    let display: HTMLElement;

    function scrollDisplay(delta: bigint) {
        NumberIndex.update((n) => {
            // Bounds check
            let result = n + delta;

            if (result < MIN_64BIT_INT) {
                currentNumber = MIN_64BIT_INT;
                return MIN_64BIT_INT;
            } else if (result + BigInt(limit) > MAX_64BIT_INT) {
                currentNumber = MAX_64BIT_INT - BigInt(limit);
                return MAX_64BIT_INT - BigInt(limit);
            } else {
                currentNumber = result;
                return result;
            }
        });
        // The user scrolled, but where is the scrollbar updating?
        // The answer: It isn't. It would be very very hard to scroll so much that there's
        // even 1px of movement in the scrollbar. If someone manages to do that however,
        // it'll be quite impressive I must say
    }

    onMount(() => {
        // Event listener for window resizing
        function screenResized() {
            // Recalculate how many numbers we can fit on the screen
            if (!display) {
                return;
            }
            limit = Math.floor(
                display.clientHeight / (NUMBER_ROW_HEIGHT + NUMBER_ROW_MARGIN),
            );

            displayedNumbers = [];
            for (let i = 0n; i <= limit; i++) {
                // Bounds check
                if (i + currentNumber > MAX_64BIT_INT) {
                    currentNumber = MAX_64BIT_INT - i; // Reset to within bounds
                }

                displayedNumbers.push(i + currentNumber);
            }
        }

        new ResizeObserver(screenResized).observe(display);

        // Calculate how many numbers we can fit on the screen initially
        limit = Math.floor(
            display.clientHeight / (NUMBER_ROW_HEIGHT + NUMBER_ROW_MARGIN),
        );

        // Set initial value for the numbers
        for (let i = 0n; i <= limit; i++) {
            displayedNumbers.push(i);
        }

        // Update the numbers on the list whenever the value of the current number changes
        NumberIndex.subscribe((val) => {
            for (let i = 0; i <= limit; i++) {
                displayedNumbers[i] = val + BigInt(i);
            }
        });

        function onScroll(e: WheelEvent) {
            scrollDisplay(BigInt(e.deltaY));
        }

        let lastTouch: number | null = 0;

        function onSwipe(e: TouchEvent) {
            e.preventDefault();
            let touch = e.touches[0].clientY;
            let touchDelta = 0;

            if (lastTouch !== null) {
                touchDelta = lastTouch - touch;
                let scrollAmount = BigInt(Math.floor(touchDelta * 5));
                scrollDisplay(scrollAmount);
            }

            lastTouch = touch;
        }
        function onTouchStart(e: TouchEvent) {
            dragging = true;
            lastTouch = e.touches[0].clientY;
        }
        function onTouchEnd() {
            dragging = false;
            lastTouch = null;
        }

        // Event listeners
        display.addEventListener("wheel", onScroll);
        display.addEventListener("touchmove", onSwipe, { passive: false });
        display.addEventListener("touchstart", onTouchStart);
        display.addEventListener("touchend", onTouchEnd);
        return () => {
            display.removeEventListener("wheel", onScroll);
            display.removeEventListener("touchmove", onSwipe);
            display.removeEventListener("touchstart", onTouchStart);
            display.removeEventListener("touchend", onTouchEnd);
        };
    });
</script>

<div id="num-display" role="presentation" bind:this={display}>
    {#each displayedNumbers as num (num)}
        <NumberRow
            {num}
            starred={get(StarredNumbers).has(num)}
            likeCount={"143.5k"}
        />
    {/each}
</div>

<style>
    #num-display {
        overscroll-behavior: none;
        flex-direction: column;
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
