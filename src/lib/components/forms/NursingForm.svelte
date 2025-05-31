<script lang="ts">
  import BaseForm from './BaseForm.svelte';
  import { createEventDispatcher } from 'svelte';

  export let baby: { id: string; name: string } | null = null;
  export let error: string = '';
  export let success: boolean = false;
  export let entry: {
    id?: string;
    babyId?: string;
    userId?: string;
    timestamp?: string;
    logType?: string;
    notes?: string;
    duration?: number;
    side?: string;
    [key: string]: string | number | boolean | undefined;
  } | null = null; // Accept entry data for editing

  const dispatch = createEventDispatcher();

  // Nursing-specific form data
  let formData = entry ? {
    notes: entry.notes || '',
    duration: entry.duration || 0,
    side: entry.side || 'both',
    timestamp: entry.timestamp ? new Date(entry.timestamp).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)
  } : {
    notes: '',
    duration: 0,
    side: 'both',
    timestamp: new Date().toISOString().slice(0, 16)
  };

  // Let BaseForm handle the submit to properly process photos

  function handleCancel() {
    dispatch('cancel');
  }

  function setSide(side: string) {
    formData.side = side;
  }
</script>

<BaseForm {baby} type="nursing" {error} {success} {formData} on:submit on:cancel={handleCancel}>
  <div>
    <label for="duration" class="block text-sm font-medium text-gray-700">
      Duration (minutes)
    </label>
    <div class="mt-1">
      <input
        type="number"
        id="duration"
        name="duration"
        bind:value={formData.duration}
        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        required
        min="0"
      />
    </div>
  </div>

  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1">
      Side
    </label>
    <div class="flex space-x-2">
      <button
        type="button"
        on:click={() => setSide('left')}
        class={`flex-1 py-3 px-4 border rounded-md text-sm font-medium flex items-center justify-center
               ${formData.side === 'left'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Left
      </button>
      <button
        type="button"
        on:click={() => setSide('right')}
        class={`flex-1 py-3 px-4 border rounded-md text-sm font-medium flex items-center justify-center
               ${formData.side === 'right'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
        Right
      </button>
      <button
        type="button"
        on:click={() => setSide('both')}
        class={`flex-1 py-3 px-4 border rounded-md text-sm font-medium flex items-center justify-center
               ${formData.side === 'both'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        Both
      </button>
    </div>
    <input type="hidden" name="side" bind:value={formData.side} required />
  </div>

  <div>
    <label for="timestamp" class="block text-sm font-medium text-gray-700">
      Date & Time
    </label>
    <div class="mt-1">
      <input
        type="datetime-local"
        id="timestamp"
        name="timestamp"
        bind:value={formData.timestamp}
        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        required
      />
    </div>
  </div>
</BaseForm>
