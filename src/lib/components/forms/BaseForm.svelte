<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let baby: { id: string; name: string } | null = null;
  export let type: string;
  export let error: string = '';
  export let success: boolean = false;

  const dispatch = createEventDispatcher();

  // Common form data that all forms might use
  export let formData = {
    notes: '',
    timestamp: new Date().toISOString().slice(0, 16) // Format: YYYY-MM-DDThh:mm
  };

  // Function to handle form submission - can be overridden by specific forms
  export function handleSubmit() {
    dispatch('submit', { formData, type, babyId: baby?.id });
  }
</script>

<form class="space-y-6" on:submit|preventDefault={handleSubmit}>
  <slot></slot>
  
  <!-- Common notes field that most forms have -->
  <div>
    <label for="notes" class="block text-sm font-medium text-gray-700">
      Notes
    </label>
    <div class="mt-1">
      <textarea
        id="notes"
        name="notes"
        rows="3"
        bind:value={formData.notes}
        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        placeholder="Any additional notes"
      ></textarea>
    </div>
  </div>

  <!-- Common form buttons -->
  <div class="flex space-x-4">
    <button
      type="button"
      class="w-1/2 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      on:click={() => dispatch('cancel')}
    >
      Cancel
    </button>
    <button
      type="submit"
      class="w-1/2 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      Save
    </button>
  </div>
</form>