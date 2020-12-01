<script>
  export let title = 'Some button';
</script>

<style type="text/scss">
  button {
    appearance: none;
    outline: none;
    border: 1px solid black;
    background-color: white;
    color: #333;
    font-family: 'Roboto', sans-serif;
    padding: 0.5rem 2rem;
    transition: all 0.3s linear;
    cursor: pointer;

    &:hover {
      background-color: #333;
      color: white;
    }

    &:active {
      transform: scale(0.95);
    }
  }

</style>

<button on:click>{title}</button>
