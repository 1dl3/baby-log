<script lang="ts">
  import BaseForm from './BaseForm.svelte';
  import { createEventDispatcher } from 'svelte';

  export let baby: { id: string; name: string } | null = null;
  export let error: string = '';
  export let success: boolean = false;

  const dispatch = createEventDispatcher();

  // Photos-specific form data
  let formData = {
    notes: '',
    photos: [] as File[],
    timestamp: new Date().toISOString().slice(0, 16)
  };

  function handlePhotoChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      formData.photos = Array.from(input.files);
    }
  }

  function handleSubmit() {
    if (formData.photos.length === 0) {
      dispatch('error', 'Please select at least one photo to upload');
      return;
    }

    const itemIdInput = document.getElementById('itemId') as HTMLInputElement;
    const itemTypeInput = document.getElementById('itemType') as HTMLSelectElement;

    if (!itemIdInput.value || !itemTypeInput.value) {
      dispatch('error', 'Please provide item ID and type');
      return;
    }

    const formDataObj = new FormData();
    formData.photos.forEach(photo => {
      formDataObj.append('photos', photo);
    });
    formDataObj.append('itemId', itemIdInput.value);
    formDataObj.append('itemType', itemTypeInput.value);
    formDataObj.append('babyId', baby.id);
    formDataObj.append('notes', formData.notes);
    formDataObj.append('timestamp', formData.timestamp);

    dispatch('submit', { formData: formDataObj, type: 'photos', babyId: baby?.id, isFormData: true });
  }

  function handleCancel() {
    dispatch('cancel');
  }
</script>

<BaseForm {baby} type="photos" {error} {success} {formData} enablePhotoUpload={false} on:submit={handleSubmit} on:cancel={handleCancel}>
  <div>
    <label for="photos" class="block text-sm font-medium text-gray-700">
      Photos
    </label>
    <div class="mt-1">
      <input
        type="file"
        id="photos"
        name="photos"
        accept="image/*"
        multiple
        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        on:change={handlePhotoChange}
      />
    </div>
    <p class="mt-2 text-sm text-gray-500">
      Upload multiple photos (hold Ctrl/Cmd to select multiple files)
    </p>
  </div>

  <div>
    <label for="itemId" class="block text-sm font-medium text-gray-700">
      Item ID
    </label>
    <div class="mt-1">
      <input
        type="text"
        id="itemId"
        name="itemId"
        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
      />
    </div>
  </div>

  <div>
    <label for="itemType" class="block text-sm font-medium text-gray-700">
      Item Type
    </label>
    <div class="mt-1">
      <select
        id="itemType"
        name="itemType"
        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
      >
        <option value="diaperChange">Diaper Change</option>
        <option value="feeding">Feeding</option>
        <option value="nursing">Nursing</option>
        <option value="measurement">Measurement</option>
        <option value="sleep">Sleep</option>
        <option value="medication">Medication</option>
        <option value="milestone">Milestone</option>
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
