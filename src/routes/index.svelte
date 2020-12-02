<svelte:head>
  <title>Sapper test task project</title>
</svelte:head>

<script>
    import Button from '../components/Button.svelte';
    import CardsContainer from '../components/CardsContainer.svelte';
    import {executeServerAction} from "../client-api";

    export let cards;


    async function createNewCollection() {
        cards = await executeServerAction({action: 'create'});
    }

    async function handleDeleteCard(e) {
        const {id} = e.detail;
        const {ok} = await executeServerAction({action: 'delete', id});
        if (ok) {
            cards = cards.filter(x => x.id !== id);
        }
    }

    async function loadMore() {
        const newCards = await executeServerAction({action: 'load-more'});
        cards = [...cards, ...newCards];
        setTimeout(() => {
            window.scrollTo({top: document.body.scrollHeight, left: 0, behavior: 'smooth'});
        }, 50);
    }

    $: collectionIsEmpty = cards.length === 0;
</script>

<script context="module">
    export async function preload(page, session) {
        const res = await this.fetch(`/api/collection?userId=${session.userId}`);
        return {cards: await res.json()}
    }
</script>

<style>
    .emptyWrap {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        display: grid;
        place-content: center;
    }

    .topWrap {
        z-index: 1;
        left: 0;
        top: 0;
        right: 0;
        position: fixed;
        padding: 1rem;
        background-color: #fffe;
    }
</style>


{#if collectionIsEmpty}
  <div class="emptyWrap">
    <Button title="Create new collection" on:click={createNewCollection}/>
  </div>
{:else}
  <div class="topWrap">
    <Button title="Load More" on:click={loadMore}/>
  </div>
  <CardsContainer bind:cards on:deleteCard={handleDeleteCard}/>
{/if}
