<script lang="ts">
  import BaseForm from './BaseForm.svelte';
  import { createEventDispatcher } from 'svelte';

  export let baby: { id: string; name: string } | null = null;
  export let error: string = '';
  export let success: boolean = false;

  const dispatch = createEventDispatcher();

  // Size-specific form data
  let formData = {
    notes: '',
    height: 0,
    timestamp: new Date().toISOString().slice(0, 16)
  };

  function handleSubmit() {
    dispatch('submit', { formData, type: 'size', babyId: baby?.id });
  }

  function handleCancel() {
    dispatch('cancel');
  }
</script>

<BaseForm {baby} type="size" {error} {success} {formData} on:submit={handleSubmit} on:cancel={handleCancel}>
  <div>
    <label for="height" class="block text-sm font-medium text-gray-700">
      Height (cm)
    </label>
    <div class="mt-1">
      <input
        type="number"
        id="height"
        name="height"
        bind:value={formData.height}
        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        required
        min="0"
        step="0.1"
      />
    </div>
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