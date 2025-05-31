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
</script>

<BaseForm {baby} type="diaper" {error} {success} {formData} on:submit={handleSubmit} on:cancel={handleCancel}>
  <div>
    <label for="diaperType" class="block text-sm font-medium text-gray-700">
      Diaper Type
    </label>
    <div class="mt-1">
      <select
        id="diaperType"
        name="diaperType"
        bind:value={formData.diaperType}
        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        required
      >
        <option value="wet">Wet</option>
        <option value="dirty">Dirty</option>
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