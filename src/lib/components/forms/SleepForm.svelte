<script lang="ts">
  import BaseForm from './BaseForm.svelte';
  import { createEventDispatcher } from 'svelte';

  export let baby: { id: string; name: string } | null = null;
  export let error: string = '';
  export let success: boolean = false;

  const dispatch = createEventDispatcher();

  // Sleep-specific form data
  let formData = {
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
    <label for="quality" class="block text-sm font-medium text-gray-700">
      Sleep Quality
    </label>
    <div class="mt-1">
      <select
        id="quality"
        name="quality"
        bind:value={formData.quality}
        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
      >
        <option value="good">Good</option>
        <option value="fair">Fair</option>
        <option value="poor">Poor</option>
      </select>
    </div>
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