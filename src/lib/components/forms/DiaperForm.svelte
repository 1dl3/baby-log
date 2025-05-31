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
    type?: string;
    [key: string]: string | number | boolean | undefined;
  } | null = null; // Accept entry data for editing

  const dispatch = createEventDispatcher();

  // Diaper-specific form data
  let formData = entry ? {
    notes: entry.notes || '',
    diaperType: entry.type || 'both',
    timestamp: entry.timestamp ? new Date(entry.timestamp).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)
  } : {
    notes: '',
    diaperType: 'both',
    timestamp: new Date().toISOString().slice(0, 16)
  };

  // Let BaseForm handle the submit to properly process photos

  function handleCancel() {
    dispatch('cancel');
  }

  function setDiaperType(type: string) {
    formData.diaperType = type;
  }
</script>

<BaseForm {baby} type="diaper" {error} {success} {formData} on:submit on:cancel={handleCancel} >
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1">
      Diaper Type
    </label>
    <div class="flex space-x-2">
      <button
        type="button"
        on:click={() => setDiaperType('wet')}
        class={`flex-1 py-3 px-4 border rounded-md text-sm font-medium flex items-center justify-center
               ${formData.diaperType === 'wet'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        Wet
      </button>
      <button
        type="button"
        on:click={() => setDiaperType('dirty')}
        class={`flex-1 py-3 px-4 border rounded-md text-sm font-medium flex items-center justify-center
               ${formData.diaperType === 'dirty'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
        Dirty
      </button>
      <button
        type="button"
        on:click={() => setDiaperType('both')}
        class={`flex-1 py-3 px-4 border rounded-md text-sm font-medium flex items-center justify-center
               ${formData.diaperType === 'both'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        Both
      </button>
    </div>
    <input type="hidden" name="diaperType" bind:value={formData.diaperType} required />
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
