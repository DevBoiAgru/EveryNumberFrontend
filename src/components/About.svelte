<script lang="ts">
    import { SCROLLBAR_WIDTH } from "../lib/Constants.svelte";
    import Icon from "@iconify/svelte";

    let { onClose }: { onClose: () => void } = $props();
</script>

<div
    class="modal-bg"
    onclick={onClose}
    role="presentation"
    tabindex="-1"
    aria-hidden="false"
>
    <button aria-label="Close about" class="close-btn" onclick={onClose}
        >✖</button
    >
    <div
        class="content"
        onclick={(e) => {
            e.stopPropagation();
        }}
        style="--scrollbar-thickness: {SCROLLBAR_WIDTH}px;"
        role="presentation"
        tabindex="-1"
        aria-hidden="false"
    >
        <div class="page-heading-container">
            <Icon icon="tabler:question-mark" width="30" height="30" />
            <h1 class="page-heading">About</h1>
        </div>

        <p>
            What is this site? Why was it made? What purpose does it serve?
            Well, I recently saw a site from <a
                class="link"
                href="https://eieio.games"
                target="_blank">eieio</a
            >
            called
            <a class="link" href="https://everyuuid.com/" target="_blank"
                >Every UUID</a
            >, and I wanted to try something similar at a smaller scale. I had
            no idea what the site would be about, but after some brainstorming I
            ended up with the idea of making a site which lists all possible
            <a
                class="link"
                href="https://developers.google.com/discovery/v1/type-format#:~:text=A%2064%2Dbit%20signed%20integer,value%20of%209%2C223%2C372%2C036%2C854%2C775%2C807%20(inclusive).&text=A%2064%2Dbit%20unsigned%20integer,64)%2D1%20(inclusive)."
                target="_blank">64-bit integers</a
            >. Why only 64 bit integers and why not something like 128-bit or
            32-bit integers I hear you ask, it's pretty simple actually, 64 bit
            sounds cooler and more people are familiar with it. The site itself
            can support any possible range of numbers, which you can try for
            yourself by modifying the
            <a
                class="link"
                href="http://github.com/devboiagru/EveryNumber"
                target="_blank">source code here.</a
            > I made this site just as a fun exercise for myself for learning svelte
            and webservers in golang, so it might be a little rough around the edges.
            Thanks for reading!
        </p>
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
        animation: float-in 0.1s ease-in-out 0s 1 forwards;
    }
    .content {
        overflow-x: hidden;
        flex-direction: column;
        min-height: 0px;
        display: flex;
        width: 80%;
        scrollbar-width: var(--scrollbar-thickness);
        scrollbar-color: var(--scrollbar-color) var(--button-bg);
        background-color: var(--bg-color-2);
        padding: 30px;
        text-wrap: pretty;
    }
    .link {
        color: var(--text-color);
    }
    .page-heading-container {
        color: var(--text-color);
        margin: 20px 0px 20px 0px;
        display: flex;
        align-items: center;
    }

    .content::-webkit-scrollbar {
        width: var(--scrollbar-thickness);
    }

    .content::-webkit-scrollbar-track {
        background: var(--button-bg);
    }

    .content::-webkit-scrollbar-thumb {
        background-color: var(--scrollbar-color);
        border-radius: 0px;
        border: none;
    }

    @media (max-width: 650px) {
        .content {
            flex: 1 1 0%;
            width: 100%;
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

    @keyframes float-in {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
</style>
