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
    startTime?: string;
    endTime?: string;
    quality?: string;
    location?: string;
    [key: string]: string | number | boolean | undefined;
  } | null = null; // Accept entry data for editing

  const dispatch = createEventDispatcher();

  // Sleep-specific form data
  let formData = entry ? {
    notes: entry.notes || '',
    startTime: entry.startTime ? new Date(entry.startTime).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    endTime: entry.endTime ? new Date(entry.endTime).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    quality: entry.quality || 'good',
    location: entry.location || 'crib',
    timestamp: entry.timestamp ? new Date(entry.timestamp).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)
  } : {
    notes: '',
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date().toISOString().slice(0, 16),
    quality: 'good',
    location: 'crib',
    timestamp: new Date().toISOString().slice(0, 16)
  };

  function handleSubmit() {
    dispatch('submit', { formData, type: 'sleep', babyId: baby?.id });
  }

  function handleCancel() {
    dispatch('cancel');
  }

  function setQuality(quality: string) {
    formData.quality = quality;
  }
</script>

<BaseForm {baby} type="sleep" {error} {success} {formData} on:submit={handleSubmit} on:cancel={handleCancel}>
  <div>
    <label for="startTime" class="block text-sm font-medium text-gray-700">
      Start Time
    </label>
    <div class="mt-1">
      <input
        type="datetime-local"
        id="startTime"
        name="startTime"
        bind:value={formData.startTime}
        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        required
      />
    </div>
  </div>

  <div>
    <label for="endTime" class="block text-sm font-medium text-gray-700">
      End Time
    </label>
    <div class="mt-1">
      <input
        type="datetime-local"
        id="endTime"
        name="endTime"
        bind:value={formData.endTime}
        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
      />
    </div>
    <p class="mt-1 text-sm text-gray-500">Leave empty if sleep is ongoing</p>
  </div>

  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1">
      Sleep Quality
    </label>
    <div class="flex space-x-2">
      <button
        type="button"
        on:click={() => setQuality('good')}
        class={`flex-1 py-3 px-4 border rounded-md text-sm font-medium flex items-center justify-center
               ${formData.quality === 'good'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Good
      </button>
      <button
        type="button"
        on:click={() => setQuality('fair')}
        class={`flex-1 py-3 px-4 border rounded-md text-sm font-medium flex items-center justify-center
               ${formData.quality === 'fair'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Fair
      </button>
      <button
        type="button"
        on:click={() => setQuality('poor')}
        class={`flex-1 py-3 px-4 border rounded-md text-sm font-medium flex items-center justify-center
               ${formData.quality === 'poor'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Poor
      </button>
    </div>
    <input type="hidden" name="quality" bind:value={formData.quality} />
  </div>

  <div>
    <label for="location" class="block text-sm font-medium text-gray-700">
      Sleep Location
    </label>
    <div class="mt-1">
      <select
        id="location"
        name="location"
        bind:value={formData.location}
        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
      >
        <option value="crib">Crib</option>
        <option value="bed">Bed</option>
        <option value="stroller">Stroller</option>
        <option value="car-seat">Car Seat</option>
        <option value="parents-bed">Parents' Bed</option>
        <option value="other">Other</option>
      </select>
    </div>
  </div>
</BaseForm>
