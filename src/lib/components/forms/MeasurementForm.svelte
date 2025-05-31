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
    height?: number;
    weight?: number;
    headCircumference?: number;
    temperature?: number;
    teethCount?: number;
    measurementType?: string;
    measurementLocation?: string;
    [key: string]: string | number | boolean | undefined;
  } | null = null; // Accept entry data for editing

  const dispatch = createEventDispatcher();

  // Measurement-specific form data
  let formData = entry ? {
    notes: entry.notes || '',
    height: entry.height || 0,
    weight: entry.weight || 0,
    headCircumference: entry.headCircumference || 0,
    temperature: entry.temperature || 0,
    teethCount: entry.teethCount || 0,
    measurementType: entry.measurementType || 'routine',
    measurementLocation: entry.measurementLocation || 'home',
    timestamp: entry.timestamp ? new Date(entry.timestamp).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)
  } : {
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

  function setMeasurementType(type: string) {
    formData.measurementType = type;
  }

  function setMeasurementLocation(location: string) {
    formData.measurementLocation = location;
  }
</script>

<BaseForm {baby} type="measurement" {error} {success} {formData} on:submit={handleSubmit} on:cancel={handleCancel}>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1">
      Measurement Type
    </label>
    <div class="flex flex-col sm:flex-row gap-2">
      <button
        type="button"
        on:click={() => setMeasurementType('routine')}
        class={`flex-1 py-3 px-4 border rounded-md text-sm font-medium flex items-center justify-center
               ${formData.measurementType === 'routine'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        Routine Check
      </button>
      <button
        type="button"
        on:click={() => setMeasurementType('sick')}
        class={`flex-1 py-3 px-4 border rounded-md text-sm font-medium flex items-center justify-center
               ${formData.measurementType === 'sick'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Sick Visit
      </button>
      <button
        type="button"
        on:click={() => setMeasurementType('doctor')}
        class={`flex-1 py-3 px-4 border rounded-md text-sm font-medium flex items-center justify-center
               ${formData.measurementType === 'doctor'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Doctor Visit
      </button>
    </div>
    <input type="hidden" name="measurementType" bind:value={formData.measurementType} required />
  </div>

  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1">
      Measurement Location
    </label>
    <div class="flex flex-col sm:flex-row gap-2">
      <button
        type="button"
        on:click={() => setMeasurementLocation('home')}
        class={`flex-1 py-3 px-4 border rounded-md text-sm font-medium flex items-center justify-center
               ${formData.measurementLocation === 'home'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Home
      </button>
      <button
        type="button"
        on:click={() => setMeasurementLocation('doctor')}
        class={`flex-1 py-3 px-4 border rounded-md text-sm font-medium flex items-center justify-center
               ${formData.measurementLocation === 'doctor'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        Doctor's Office
      </button>
      <button
        type="button"
        on:click={() => setMeasurementLocation('hospital')}
        class={`flex-1 py-3 px-4 border rounded-md text-sm font-medium flex items-center justify-center
               ${formData.measurementLocation === 'hospital'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        Hospital
      </button>
    </div>
    <input type="hidden" name="measurementLocation" bind:value={formData.measurementLocation} />
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
