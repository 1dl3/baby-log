<script lang="ts">
  import BaseForm from './BaseForm.svelte';
  import { createEventDispatcher } from 'svelte';

  export let baby: { id: string; name: string } | null = null;
  export let error: string = '';
  export let success: boolean = false;

  const dispatch = createEventDispatcher();

  // Nursing-specific form data
  let formData = {
    notes: '',
    duration: 0,
    side: 'both',
    timestamp: new Date().toISOString().slice(0, 16)
  };

  function handleSubmit() {
    dispatch('submit', { formData, type: 'nursing', babyId: baby?.id });
  }

  function handleCancel() {
    dispatch('cancel');
  }
</script>

<BaseForm {baby} type="nursing" {error} {success} {formData} on:submit={handleSubmit} on:cancel={handleCancel}>
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
    <label for="side" class="block text-sm font-medium text-gray-700">
      Side
    </label>
    <div class="mt-1">
      <select
        id="side"
        name="side"
        bind:value={formData.side}
        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        required
      >
        <option value="left">Left</option>
        <option value="right">Right</option>
        <option value="both">Both</option>
      </select>
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