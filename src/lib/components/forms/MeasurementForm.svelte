<script lang="ts">
  import BaseForm from './BaseForm.svelte';
  import { createEventDispatcher } from 'svelte';

  export let baby: { id: string; name: string } | null = null;
  export let error: string = '';
  export let success: boolean = false;

  const dispatch = createEventDispatcher();

  // Measurement-specific form data
  let formData = {
    notes: '',
    height: 0,
    weight: 0,
    headCircumference: 0,
    temperature: 0,
    teethCount: 0,
    measurementType: 'routine',
    measurementLocation: 'home',
    timestamp: new Date().toISOString().slice(0, 16)
  };

  function handleSubmit() {
    dispatch('submit', { formData, type: 'measurement', babyId: baby?.id });
  }

  function handleCancel() {
    dispatch('cancel');
  }
</script>

<BaseForm {baby} type="measurement" {error} {success} {formData} on:submit={handleSubmit} on:cancel={handleCancel}>
  <div>
    <label for="measurementType" class="block text-sm font-medium text-gray-700">
      Measurement Type
    </label>
    <div class="mt-1">
      <select
        id="measurementType"
        name="measurementType"
        bind:value={formData.measurementType}
        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        required
      >
        <option value="routine">Routine Check</option>
        <option value="sick">Sick Visit</option>
        <option value="doctor">Doctor Visit</option>
      </select>
    </div>
  </div>

  <div>
    <label for="measurementLocation" class="block text-sm font-medium text-gray-700">
      Measurement Location
    </label>
    <div class="mt-1">
      <select
        id="measurementLocation"
        name="measurementLocation"
        bind:value={formData.measurementLocation}
        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
      >
        <option value="home">Home</option>
        <option value="doctor">Doctor's Office</option>
        <option value="hospital">Hospital</option>
      </select>
    </div>
  </div>

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
        min="0"
        step="0.1"
      />
    </div>
  </div>

  <div>
    <label for="weight" class="block text-sm font-medium text-gray-700">
      Weight (kg)
    </label>
    <div class="mt-1">
      <input
        type="number"
        id="weight"
        name="weight"
        bind:value={formData.weight}
        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        min="0"
        step="0.01"
      />
    </div>
  </div>

  <div>
    <label for="headCircumference" class="block text-sm font-medium text-gray-700">
      Head Circumference (cm)
    </label>
    <div class="mt-1">
      <input
        type="number"
        id="headCircumference"
        name="headCircumference"
        bind:value={formData.headCircumference}
        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        min="0"
        step="0.1"
      />
    </div>
  </div>

  <div>
    <label for="temperature" class="block text-sm font-medium text-gray-700">
      Temperature (°C)
    </label>
    <div class="mt-1">
      <input
        type="number"
        id="temperature"
        name="temperature"
        bind:value={formData.temperature}
        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        min="35"
        max="42"
        step="0.1"
      />
    </div>
  </div>

  <div>
    <label for="teethCount" class="block text-sm font-medium text-gray-700">
      Teeth Count
    </label>
    <div class="mt-1">
      <input
        type="number"
        id="teethCount"
        name="teethCount"
        bind:value={formData.teethCount}
        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        min="0"
        max="20"
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