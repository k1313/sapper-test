<script>
    import {createEventDispatcher} from 'svelte';

    export let index;

    const dispatch = createEventDispatcher();

    function handleDrop() {
        dispatch('cardDrop', {newIndex: index});
    }

    function handleDragOver() {
        return false;
    }
</script>

<style type="text/scss">
  div {
    margin: 1rem;
    align-self: stretch;
    border: 1px dashed #ccc;
    height: 100%;
    box-sizing: border-box;
  }

</style>

<div
  on:drop|preventDefault="{handleDrop}"
  on:dragover|preventDefault="{handleDragOver}"
></div>

