<script>
    import {createEventDispatcher} from 'svelte';

    import TrashButton from './TrashButton.svelte';

    let dragging = false;
    export let index = undefined;
    export let data;

    const dispatch = createEventDispatcher();

    async function handleDragStart(e) {
        e.dropEffect = 'move';
        dragging = true;
        dispatch('dragCard', {index});
    }

    function handleDelete(e) {
        console.log('trash clicked', data);
        dispatch('deleteCard', {id: data.id})
    }


    function handleDragEnd() {
        console.log('dragend');
        dragging = false;
        dispatch('draggingOver', {index: undefined});
        dispatch('drag', {index: undefined});
        dispatch('dragEnd');
    }

</script>

<style type="text/scss">
  .card {
    position: relative;
    text-align: left;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 200px;
    min-height: 200px;
    box-shadow: 0 1px 3px #0002;
    margin: 1rem;
    background-color: white;

    &:hover {
      cursor: move;

      box-shadow: 1px 2px 5px #0003;

      img {
        transform: scale(1.05);
      }

      .trash {
        opacity: 1;
      }
    }
  }

  .image {
    align-self: stretch;
    position: relative;
    overflow: hidden;
    height: 300px;
    padding: 0;
    margin: 0;
  }

  .dragging {
    opacity: 0.25;
  }

  img {
    pointer-events: none;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center center;
    transition: all 0.75s linear;
  }

  p {
    font-family: 'Roboto', sans-serif;
    margin-top: 1rem;
    font-weight: 300;
    text-align: center;
    font-size: 12px;
  }

  a {
    text-decoration: none;
    color: #555;

    &:hover {
      color: midnightblue;
    }
  }

  .trash {
    position: absolute;
    right: -1rem;
    top: -1rem;
    padding: 8px;
    border-radius: 30px;
    background-color: #7002;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.5s linear, transform 0.125s linear;

    &:active {
      transform: scale(0.9);
    }
  }
</style>

<div
  class="card"
  draggable="true"
  class:dragging
  on:dragstart="{handleDragStart}"
  on:dragend="{handleDragEnd}"
  on:dragover
>
  <slot/>
  <div class="image"><img src="{data.img}" alt="{data.title}"/></div>
  <p><a href="{data.link}" target="_blank" rel="noopener noreferrer">{data.longTitle}</a></p>

  {#if !dragging}
    <div class="trash" on:click={handleDelete}>
      <TrashButton/>
    </div>
  {/if}
</div>



