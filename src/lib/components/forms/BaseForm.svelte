<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let baby: { id: string; name: string } | null = null;
  export let type: string;
  export let error: string = '';
  export let success: boolean = false;
  export let enablePhotoUpload: boolean = true;

  const dispatch = createEventDispatcher();

  // Common form data that all forms might use
  export let formData = {
    notes: '',
    photos: [] as File[],
    timestamp: new Date().toISOString().slice(0, 16) // Format: YYYY-MM-DDThh:mm
  };

  // Function to handle photo change
  function handlePhotoChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      formData.photos = Array.from(input.files);
    }
  }

  // Function to remove a photo by index
  function removePhoto(index: number) {
    formData.photos = formData.photos.filter((_, i) => i !== index);
  }

  // Function to handle form submission - can be overridden by specific forms
  export function handleSubmit() {
    // Check if photo upload is enabled and photos are selected
    if (enablePhotoUpload && formData.photos.length > 0) {
      // Create FormData for file upload
      const formDataObj = new FormData();

      // Add all photos
      formData.photos.forEach(photo => {
        formDataObj.append('photos', photo);
      });

      formDataObj.append('babyId', baby?.id || '');

      // Add all other form data fields
      for (const [key, value] of Object.entries(formData)) {
        if (key !== 'photos') { // Skip the photos array as we've already added it
          formDataObj.append(key, value.toString());
        }
      }

      dispatch('submit', { formData: formDataObj, type, babyId: baby?.id, isFormData: true });
    } else {
      // Regular JSON submission
      const submissionData = { ...formData };
      delete submissionData.photos; // Remove photos array from JSON submission
      dispatch('submit', { formData: submissionData, type, babyId: baby?.id });
    }
  }
</script>

<form class="space-y-6" on:submit|preventDefault={handleSubmit}>
  <slot></slot>

  {#if enablePhotoUpload}
  <!-- Photo upload field -->
  <div>
    <label for="photos" class="block text-sm font-medium text-gray-700">
      Photos (Optional)
    </label>
    <div class="mt-1">
      <input
        type="file"
        id="photos"
        name="photos"
        accept="image/*"
        multiple
        on:change={handlePhotoChange}
        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
      />
    </div>
    <p class="mt-2 text-sm text-gray-500">
      Upload photos related to this entry (hold Ctrl/Cmd to select multiple files)
    </p>
  </div>

  <!-- Photo previews -->
  {#if formData.photos?.length > 0}
    <div class="mt-4">
      <h4 class="text-sm font-medium text-gray-700 mb-2">Selected Photos ({formData.photos.length}):</h4>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {#each formData.photos as photo, index (photo.name + index)}
          <div class="relative">
            <img 
              src={URL.createObjectURL(photo)} 
              alt="Preview" 
              class="h-24 w-full object-cover rounded-md"
            />
            <button 
              type="button" 
              class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center"
              on:click={() => removePhoto(index)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
            <p class="text-xs text-gray-500 mt-1 truncate">{photo.name}</p>
          </div>
        {/each}
      </div>
    </div>
  {/if}
  {/if}

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
