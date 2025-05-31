<script lang="ts">
  import BaseForm from './BaseForm.svelte';
  import { createEventDispatcher } from 'svelte';

  export let baby: { id: string; name: string } | null = null;
  export let error: string = '';
  export let success: boolean = false;

  const dispatch = createEventDispatcher();

  // Diaper-specific form data
  let formData = {
    notes: '',
    diaperType: 'both',
    timestamp: new Date().toISOString().slice(0, 16)
  };

  function handleSubmit() {
    dispatch('submit', { formData, type: 'diaper', babyId: baby?.id });
  }

  function handleCancel() {
    dispatch('cancel');
  }

  function setDiaperType(type: string) {
    formData.diaperType = type;
  }
</script>

<BaseForm {baby} type="diaper" {error} {success} {formData} on:submit={handleSubmit} on:cancel={handleCancel}>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1">
      Diaper Type
    </label>
    <div class="flex space-x-2">
      <button
        type="button"
        on:click={() => setDiaperType('wet')}
        class={`flex-1 py-2 px-4 border rounded-md text-sm font-medium
               ${formData.diaperType === 'wet'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
      >
        Wet
      </button>
      <button
        type="button"
        on:click={() => setDiaperType('dirty')}
        class={`flex-1 py-2 px-4 border rounded-md text-sm font-medium
               ${formData.diaperType === 'dirty'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
      >
        Dirty
      </button>
      <button
        type="button"
        on:click={() => setDiaperType('both')}
        class={`flex-1 py-2 px-4 border rounded-md text-sm font-medium
               ${formData.diaperType === 'both'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
      >
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