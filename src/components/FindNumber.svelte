<script lang="ts">
    import Icon from "@iconify/svelte";
    let {
        topOffset,
        onInputChange,
        onClose,
    }: {
        topOffset: string;
        onInputChange: (num: bigint | null) => void;
        onClose: () => void;
    } = $props();
</script>

<div
    class="find-number"
    onclick={(e) => {
        e.stopPropagation();
    }}
    role="presentation"
    tabindex="-1"
    style="--offset: {topOffset};"
    aria-hidden="false"
>
    <input
        type="text"
        class="find-input"
        placeholder="Search for a number..."
        oninput={(e: any) => {
            let strNum: string = e.target.value;
            try {
                onInputChange(BigInt(strNum));
            } catch (e) {
                if (e instanceof SyntaxError) {
                    // user didnt input a valid number
                    onInputChange(null);
                } else {
                    throw e;
                }
            }
        }}
    />
    <button aria-label="Close find" class="close-btn" onclick={onClose}>✖</button>
</div>

<svelte:document
    onkeydown={(e) => {
        if (e.key == "Escape") {
            onClose();
        }
    }}
/>

<style>
    .find-number {
        transition: top 0.4s linear;
        top: var(--offset);
        right: 4rem;
        position: fixed;
        height: 3rem;
        max-width: calc(100vw - 25px);
        background-color: rgb(70, 56, 60);
        display: flex;
    }

    .find-input {
        color: var(--text-color);
        background-color: transparent;
        font-size: 1rem;
        width: 20rem;
        height: 100%;
        border: none;
        outline: none;
        padding: 15px;
    }

    .close-btn {
        cursor: pointer;
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
