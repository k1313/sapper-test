<script>
    import {flip} from 'svelte/animate';
    import {fade, scale, fly} from 'svelte/transition';
    import Card from './Card.svelte';
    import CardDropZone from './CardDropZone.svelte';
    import {executeServerAction} from "../client-api";

    export let cards = [];

    let draggingOverIndex;
    let draggingIndex;
    let cells = []
    let animateLock = null;
    let dropzonePosition = undefined;

    $: totalCards = cards.length;

    $: {
        animateLock = true;
        let res = cards.map((c, i) => ({index: i, data: c, key: c.id}));
        if (draggingIndex !== undefined) {
            if (draggingOverIndex === undefined) {
                res.push({data: 'dropzone', index: res.length - 1, key: `dz:${res.length - 1}`})
            } else {
                if (!!dropzonePosition) {
                    if (dropzonePosition.left) {
                        if (draggingIndex + 1 !== draggingOverIndex) {
                            const index = Math.max(draggingOverIndex - (draggingIndex > draggingOverIndex ? 0 : 1), 0);
                            res.splice(draggingOverIndex, 0, {data: 'dropzone', index, key: `dz:${index}`})
                        }

                    } else {
                        if (draggingIndex - 1 !== draggingOverIndex) {
                            const index = draggingOverIndex;
                            res.splice(draggingOverIndex + 1, 0, {data: 'dropzone', index, key: `dz:${index}`})
                        }

                    }
                }
            }
            setTimeout(() => animateLock = null, 100);
        }
        cells = res;
    }



    function handleDragOverCell(e, index) {
        if (animateLock) return;
        if (index === draggingIndex) return;
        const cellEl = e.target;
        if (!cellEl) return;
        const {x, y, width, height} = cellEl.getBoundingClientRect();
        const left = e.clientX - x < width / 2;
        const top = e.clientY - y < height / 2;
        draggingOverIndex = index;
        dropzonePosition = {left, top};
    }


    function handleCardDrag(e) {
        const {index} = e.detail;
        console.log('on:dragCard', index);
        draggingIndex = index;
    }

    async function handleCardDrop(e) {
        const {newIndex} = e.detail;
        console.log(`${draggingIndex} => ${newIndex}`)
        const {ok} = await executeServerAction({action: 'move', from: draggingIndex, to: newIndex});
        if (ok) {
            const f = draggingIndex;
            const tmp = cards.splice(f, 1);
            cards.splice(newIndex, 0, tmp[0]);
            cards = [...cards];
        }
        draggingIndex = undefined
        dropzonePosition = undefined
    }

    function handleCardDragEnd() {
        setTimeout(() => {
            draggingIndex = undefined
            dropzonePosition = undefined
        }, 50);
    }
</script>

<style type="text/scss">
  .cell {
    justify-self: stretch;
    height: 100%;
  }

  .CardsContainer {
    margin-top: 70px;
    display: grid;
    grid-gap: 1rem;
    grid-template-columns: repeat(6, 1fr);
    justify-content: space-between;
    align-items: flex-start;
    transition: all 0.25s linear;
    @media (max-width: 1650px) {
      grid-template-columns: repeat(5, 1fr);
    }
    @media (max-width: 1420px) {
      grid-template-columns: repeat(4, 1fr);
    }
    @media (max-width: 1140px) {
      grid-template-columns: repeat(3, 1fr);
    }
    @media (max-width: 860px) {
      grid-template-columns: repeat(2, 1fr);
    }
    @media (max-width: 580px) {
      grid-template-columns: 1fr;
    }
  }
</style>


<div class="CardsContainer">
  {#each cells as cell, index (cell.key)}
    <div class="cell"
         animate:flip={{duration: 100}}
         out:fade={{duration: cell.data === 'dropzone' ? 0 : 250}}
         in:scale={{duration: cell.data === 'dropzone' ? 0 : 750}}
    >
      {#if (cell.data === 'dropzone')}
        <CardDropZone index={cell.index} on:cardDrop="{handleCardDrop}"/>
      {:else}
        <Card data="{cell.data}" index="{cell.index}"
              on:dragCard="{handleCardDrag}"
              on:deleteCard
              on:dragEnd={handleCardDragEnd}
              on:dragover="{e => handleDragOverCell(e, cell.index)}"
        />
      {/if}
    </div>
  {/each}
</div>

