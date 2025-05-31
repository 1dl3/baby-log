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
    name?: string;
    dosage?: string;
    unit?: string;
    reason?: string;
    administeredAt?: string;
    [key: string]: string | number | boolean | undefined;
  } | null = null; // Accept entry data for editing

  const dispatch = createEventDispatcher();

  // Medication-specific form data
  let formData = entry ? {
    notes: entry.notes || '',
    medicationName: entry.name || '',
    dosage: entry.dosage || '',
    unit: entry.unit || 'ml',
    reason: entry.reason || '',
    administeredAt: entry.administeredAt ? new Date(entry.administeredAt).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    timestamp: entry.timestamp ? new Date(entry.timestamp).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)
  } : {
    notes: '',
    medicationName: '',
    dosage: '',
    unit: 'ml',
    reason: '',
    administeredAt: new Date().toISOString().slice(0, 16),
    timestamp: new Date().toISOString().slice(0, 16)
  };

  function handleSubmit() {
    dispatch('submit', { formData, type: 'medication', babyId: baby?.id });
  }

  function handleCancel() {
    dispatch('cancel');
  }

  // Common medication types for autocomplete
  const commonMedications = [
    'Paracetamol',
    'Ibuprofen',
    'Vitamin D',
    'Fiebersaft',
    'Nasentropfen',
    'Hustensaft'
  ];
</script>

<BaseForm {baby} type="medication" {error} {success} {formData} on:submit={handleSubmit} on:cancel={handleCancel}>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="md:col-span-2">
      <label for="medicationName" class="block text-sm font-medium text-gray-700">
        Medikamentenname
      </label>
      <div class="mt-1">
        <input
          type="text"
          id="medicationName"
          name="medicationName"
          bind:value={formData.medicationName}
          class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          required
          placeholder="z.B. Paracetamol, Ibuprofen"
          list="medication-suggestions"
        />
        <datalist id="medication-suggestions">
          {#each commonMedications as medication (medication)}
            <option value={medication} />
          {/each}
        </datalist>
      </div>
      <p class="mt-1 text-xs text-gray-500">Gib den Namen des verabreichten Medikaments ein</p>
    </div>

    <div>
      <label for="dosage" class="block text-sm font-medium text-gray-700">
        Dosierung
      </label>
      <div class="mt-1">
        <input
          type="text"
          id="dosage"
          name="dosage"
          bind:value={formData.dosage}
          class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          required
          placeholder="z.B. 5, 2.5"
        />
      </div>
    </div>

    <div>
      <label for="unit" class="block text-sm font-medium text-gray-700">
        Einheit
      </label>
      <div class="mt-1">
        <select
          id="unit"
          name="unit"
          bind:value={formData.unit}
          class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          required
        >
          <option value="ml">ml</option>
          <option value="mg">mg</option>
          <option value="drops">Tropfen</option>
          <option value="tablet">Tablette</option>
          <option value="teaspoon">Teelöffel</option>
        </select>
      </div>
    </div>

    <div class="md:col-span-2">
      <label for="reason" class="block text-sm font-medium text-gray-700">
        Grund
      </label>
      <div class="mt-1">
        <input
          type="text"
          id="reason"
          name="reason"
          bind:value={formData.reason}
          class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          placeholder="z.B. Fieber, Erkältung, Husten"
        />
      </div>
      <p class="mt-1 text-xs text-gray-500">Warum wurde das Medikament verabreicht?</p>
    </div>

    <div class="md:col-span-2">
      <label for="administeredAt" class="block text-sm font-medium text-gray-700">
        Verabreicht am
      </label>
      <div class="mt-1">
        <input
          type="datetime-local"
          id="administeredAt"
          name="administeredAt"
          bind:value={formData.administeredAt}
          class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          required
        />
      </div>
    </div>
  </div>
</BaseForm>
