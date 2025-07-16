<script lang="ts">
    let { number, onClose }: { number: bigint; onClose: () => void } = $props();
</script>

<div
    class="modal-bg"
    onclick={onClose}
    role="presentation"
    tabindex="-1"
    aria-hidden="false"
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
        <ul>
            <li>Your number is {number}</li>
        </ul>
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
        color: black;
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
        border-radius: 20px;
        height: 40%;
        width: 80%;
        background-color: white;
    }
</style>
