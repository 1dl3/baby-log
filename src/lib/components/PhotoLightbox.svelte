<script lang="ts">
  import { fade } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';
  import { onMount, onDestroy } from 'svelte';

  export let photos: string[] = [];
  export let currentIndex: number = 0;
  export let isOpen: boolean = false;

  const dispatch = createEventDispatcher();

  function close() {
    dispatch('close');
  }

  function next() {
    if (currentIndex < photos.length - 1) {
      currentIndex++;
    } else {
      currentIndex = 0; // Loop back to the first photo
    }
  }

  function previous() {
    if (currentIndex > 0) {
      currentIndex--;
    } else {
      currentIndex = photos.length - 1; // Loop to the last photo
    }
  }

  // Handle keyboard navigation
  function handleKeydown(event: KeyboardEvent) {
    if (!isOpen) return;

    if (event.key === 'Escape') {
      close();
    } else if (event.key === 'ArrowRight') {
      next();
    } else if (event.key === 'ArrowLeft') {
      previous();
    }
  }

  // Add and remove event listener for keyboard navigation

  onMount(() => {
    // window.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    // window.removeEventListener('keydown', handleKeydown);
  });
</script>

<svelte:head>
  {#if isOpen}
  <style>
    body {
      overflow: hidden;
    }
  </style>
  {/if}
</svelte:head>

{#if isOpen}
  <div 
    transition:fade={{ duration: 200 }}
    class="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
    on:click={close}
  >
    <!-- Close button -->
    <button 
      class="absolute top-4 right-4 text-white hover:text-gray-300 focus:outline-none z-50"
      on:click|stopPropagation={close}
    >
      <svg class="h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    <!-- Previous button -->
    {#if photos.length > 1}
      <button 
        class="absolute left-4 text-white hover:text-gray-300 focus:outline-none z-50"
        on:click|stopPropagation={previous}
      >
        <svg class="h-12 w-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    {/if}

    <!-- Photo container -->
    <div 
      class="relative max-w-4xl max-h-full p-2"
      on:click|stopPropagation={() => {}}
    >
      {#if photos[currentIndex]}
        <img 
          in:fade={{ duration: 200 }}
          src={photos[currentIndex]} 
          alt="Fullscreen photo" 
          class="max-h-[90vh] max-w-full object-contain"
        />
      {/if}

      <!-- Photo counter -->
      {#if photos.length > 1}
        <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {photos.length}
        </div>
      {/if}
    </div>

    <!-- Next button -->
    {#if photos.length > 1}
      <button 
        class="absolute right-4 text-white hover:text-gray-300 focus:outline-none z-50"
        on:click|stopPropagation={next}
      >
        <svg class="h-12 w-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    {/if}
  </div>
{/if}
