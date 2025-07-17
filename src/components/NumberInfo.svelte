<script lang="ts">
    let { num, onClose }: { num: bigint; onClose: () => void } = $props();

    let numAbs = absBigInt(num);

    // Various math functions
    function absBigInt(n: bigint): bigint {
        return n < 0n ? -n : n;
    }

    function modPow(base: bigint, exponent: bigint, modulus: bigint): bigint {
        let result = 1n;
        base %= modulus;
        while (exponent > 0n) {
            if (exponent & 1n) result = (result * base) % modulus;
            base = (base * base) % modulus;
            exponent >>= 1n;
        }
        return result;
    }

    function isPrime(num: bigint) {
        if (num <= 1n) return "No";
        if (num === 2n) return "Yes";
        if (num % 2n === 0n) return "No";

        // Accurate test for smaller numbers
        if (num < 10 ** 6) {
            const n = Number(num);

            const sqrt = Math.floor(Math.sqrt(n));
            for (let i = 3; i <= sqrt; i += 2) {
                if (n % i === 0) return "No";
            }
            return "Yes";
        }
        // Use faster, but less accurate method for larger numbers (Miller-Rabin)
        const bases = [2n, 3n, 5n, 7n, 11n, 13n, 17n];
        let d = num - 1n,
            r = 0n;
        while (d % 2n === 0n) {
            d /= 2n;
            r++;
        }

        for (const a of bases) {
            if (a >= num - 1n) continue;
            let x = modPow(a, d, num);
            if (x === 1n || x === num - 1n) continue;

            let continueOuter = false;
            for (let i = 0n; i < r - 1n; i++) {
                x = modPow(x, 2n, num);
                if (x === num - 1n) {
                    continueOuter = true;
                    break;
                }
            }
            if (!continueOuter) return "Probably not";
        }
        return "Probably";
    }
    function isPerfectSquare(n: bigint): boolean {
        if (n < 0n) return false;
        const sqrt = sqrtBigInt(n);
        return sqrt * sqrt === n;
    }
    function sqrtBigInt(n: bigint): bigint {
        if (n < 2n) return n;
        let x = n;
        let y = (x + 1n) >> 1n;
        while (y < x) {
            x = y;
            y = (x + n / x) >> 1n;
        }
        return x;
    }
</script>

<div
    class="modal-bg"
    onclick={onClose}
    role="presentation"
    tabindex="-1"
    aria-hidden="false"
>
    <button
        aria-label="Close starred numbers"
        class="close-btn"
        onclick={onClose}>✖</button
    >
    <div
        class="modal-fg"
        onclick={(e) => {
            e.stopPropagation();
        }}
        role="presentation"
        tabindex="-1"
        aria-hidden="false"
    >
        <h1 class="hero-number">{num}</h1>
        <hr color="#343434" />
        <div class="property-facts">
            <ul style="padding-inline-start: 10px;">
                <li>
                    <span class="property-name">Is even: </span><span
                        class="property-value">{num % 2n ? "No" : "Yes"}</span
                    >
                </li>
                <li>
                    <span class="property-name">Is prime: </span><span
                        class="property-value">{isPrime(num)}</span
                    >
                </li>
                <li>
                    <span class="property-name">Is perfect square: </span><span
                        class="property-value"
                        >{isPerfectSquare(num) ? "Yes" : "No"}</span
                    >
                </li>
                <li>
                    <span class="property-name">Is palindrome: </span><span
                        class="property-value"
                        >{num.toString() ===
                        num.toString().split("").reverse().join("")
                            ? "Yes"
                            : "No"}</span
                    >
                </li>
                <li>
                    <span class="property-name">Binary: </span><span
                        class="property-value"
                        >{num < 0 ? "-" : ""}0b{numAbs.toString(2)}</span
                    >
                </li>
                <li>
                    <span class="property-name">Octal: </span><span
                        class="property-value"
                        >{num < 0 ? "-" : ""}0o{numAbs.toString(8)}</span
                    >
                </li>
                <li>
                    <span class="property-name">Hexadecimal: </span><span
                        class="property-value"
                        >{num < 0 ? "-" : ""}0x{numAbs
                            .toString(16)
                            .toUpperCase()}</span
                    >
                </li>
            </ul>
        </div>
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
        z-index: 10;
        position: absolute;
        color: var(--text-color);
        top: 0px;
        left: 0px;
        height: 100vh;
        width: 100vw;
        background-color: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .modal-fg {
        position: relative;
        height: 50%;
        width: 80%;
        background-color: var(--bg-color-2);
        padding: 30px;
        border: 2px solid var(--button-active-bg);
    }
    .hero-number {
        font-family: "JetBrains Mono", monospace;
        font-size: 3em;
        padding-inline-start: 10px;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .property-facts {
        padding: 20px 0px 20px 0px;
    }
    .property-name {
        color: var(--text-secondary);
        margin-right: 10px;
    }
    .property-value {
        user-select: all;
        word-break: break-word;
        overflow-wrap: anywhere;
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
    @media (max-width: 650px) {
        .modal-fg {
            overflow-x: hidden;
            flex: 0.95 1 0%;
            width: 98%;
        }
        .hero-number {
            padding-inline-start: 0px;
        }
    }
</style>
