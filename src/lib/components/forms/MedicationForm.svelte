<script lang="ts">
  import BaseForm from './BaseForm.svelte';
  import { createEventDispatcher } from 'svelte';

  export let baby: { id: string; name: string } | null = null;
  export let error: string = '';
  export let success: boolean = false;

  const dispatch = createEventDispatcher();

  // Medication-specific form data
  let formData = {
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
</script>

<BaseForm {baby} type="medication" {error} {success} {formData} on:submit={handleSubmit} on:cancel={handleCancel}>
  <div>
    <label for="medicationName" class="block text-sm font-medium text-gray-700">
      Medication Name
    </label>
    <div class="mt-1">
      <input
        type="text"
        id="medicationName"
        name="medicationName"
        bind:value={formData.medicationName}
        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        required
        placeholder="e.g., Paracetamol, Ibuprofen"
      />
    </div>
  </div>

  <div>
    <label for="dosage" class="block text-sm font-medium text-gray-700">
      Dosage
    </label>
    <div class="mt-1">
      <input
        type="text"
        id="dosage"
        name="dosage"
        bind:value={formData.dosage}
        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        required
        placeholder="e.g., 5, 2.5"
      />
    </div>
  </div>

  <div>
    <label for="unit" class="block text-sm font-medium text-gray-700">
      Unit
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
        <option value="drops">drops</option>
        <option value="tablet">tablet</option>
        <option value="teaspoon">teaspoon</option>
      </select>
    </div>
  </div>

  <div>
    <label for="reason" class="block text-sm font-medium text-gray-700">
      Reason
    </label>
    <div class="mt-1">
      <input
        type="text"
        id="reason"
        name="reason"
        bind:value={formData.reason}
        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        placeholder="e.g., Fever, Cold, Cough"
      />
    </div>
  </div>

  <div>
    <label for="administeredAt" class="block text-sm font-medium text-gray-700">
      Administered At
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
</BaseForm>