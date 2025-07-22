<script lang="ts">
    import Logo from "../public/Logo.svelte";
    import { SCROLLBAR_WIDTH } from "../lib/Constants.svelte";
    import Icon from "@iconify/svelte";

    let { onClickAbout }: { onClickAbout: () => void } = $props();
</script>

<nav class="navbar" style="--scrollbar-width: {SCROLLBAR_WIDTH}px">
    <Logo size={35} />
    <p class="title-name">DevBoiAgru</p>
    <div class="horizontal-spacer"></div>

    <button
        class="icon-btn"
        onclick={() => {
            window.open(
                "https://devboiagru.vercel.app/blogs/every_number_site",
                "_blank",
            );
        }}
    >
        <Icon icon="tabler:pencil" width="30" height="30" />
    </button>

    <button class="icon-btn" onclick={onClickAbout}>
        <Icon icon="tabler:question-mark" width="30" height="30" />
    </button>

    <button
        class="icon-btn"
        onclick={() => {
            window.open("https://devboiagru.vercel.app/", "_blank");
        }}
    >
        <Icon icon="tabler:world" width="30" height="30" />
    </button>

    <button
        class="icon-btn"
        onclick={() => {
            window.open("http://github.com/DevBoiAgru/EveryNumber", "_blank");
        }}
    >
        <Icon icon="tabler:brand-github" width="30" height="30" />
    </button>
</nav>

<style>
    .navbar {
        display: flex;
        position: absolute;
        width: calc(100% - var(--scrollbar-width));
        height: 60px;
        align-items: center;
        padding: 15px 5% 10px 5%;
        color: var(--text-secondary);
        z-index: 3;
    }
    .title-name {
        margin: 0px 5px 0px 5px;
        font-weight: 400;
        font-size: 20px;
    }
    .horizontal-spacer {
        flex: 1;
    }
    .icon-btn {
        background-color: transparent;
        border: none;
        color: var(--text-secondary);
        transition: all 0.1s ease-in-out;
        filter: drop-shadow(0px 0px 0px rgba(255, 255, 255, 0));
    }
    .icon-btn:hover {
        filter: drop-shadow(0px 3px 2px rgba(255, 255, 255, 0.356));
        transform: translateY(-3px);
    }

    @media (max-width: 650px) {
        .title-name {
            display: none;
        }
    }
</style>
