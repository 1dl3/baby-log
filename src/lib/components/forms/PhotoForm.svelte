<script lang="ts">
  import BaseForm from './BaseForm.svelte';
  import { createEventDispatcher } from 'svelte';

  export let baby: { id: string; name: string } | null = null;
  export let error: string = '';
  export let success: boolean = false;

  const dispatch = createEventDispatcher();

  // Photo-specific form data
  let formData = {
    notes: '',
    timestamp: new Date().toISOString().slice(0, 16)
  };

  function handleSubmit() {
    const photoInput = document.getElementById('photo') as HTMLInputElement;
    if (!photoInput.files || photoInput.files.length === 0) {
      dispatch('error', 'Please select a photo to upload');
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append('photo', photoInput.files[0]);
    formDataObj.append('babyId', baby.id);
    formDataObj.append('notes', formData.notes);
    formDataObj.append('timestamp', formData.timestamp);

    dispatch('submit', { formData: formDataObj, type: 'photo', babyId: baby?.id, isFormData: true });
  }

  function handleCancel() {
    dispatch('cancel');
  }
</script>

<BaseForm {baby} type="photo" {error} {success} {formData} enablePhotoUpload={false} on:submit={handleSubmit} on:cancel={handleCancel}>
  <div>
    <label for="photo" class="block text-sm font-medium text-gray-700">
      Photo
    </label>
    <div class="mt-1">
      <input
        type="file"
        id="photo"
        name="photo"
        accept="image/*"
        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        required
      />
    </div>
    <p class="mt-2 text-sm text-gray-500">
      Upload a photo of your baby
    </p>
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
