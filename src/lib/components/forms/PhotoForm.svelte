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
    photoUrl?: string;
    [key: string]: string | number | boolean | undefined;
  } | null = null; // Accept entry data for editing

  const dispatch = createEventDispatcher();

  // Photo-specific form data
  let formData = {
    notes: entry?.notes || '',
    photos: [] as File[],
    timestamp: entry?.timestamp ? new Date(entry.timestamp).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)
  };

  function handlePhotoChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      formData.photos = Array.from(input.files);
    }
  }

  function removePhoto(index: number) {
    formData.photos = formData.photos?.filter((_, i) => i !== index);
  }

  // Let BaseForm handle the submit to properly process photos
  // The validation is now handled in BaseForm

  function handleCancel() {
    dispatch('cancel');
  }
</script>

<BaseForm {baby} type="photo" {error} {success} {formData} on:submit on:cancel={handleCancel}>
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
        on:change={handlePhotoChange}
        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        required
      />
    </div>
    <p class="mt-2 text-sm text-gray-500">
      Upload photos of your baby (hold Ctrl/Cmd to select multiple files)
    </p>
  </div>

  <!-- Photo previews -->
  {#if formData.photos?.length > 0}
    <div class="mt-4">
      <h4 class="text-sm font-medium text-gray-700 mb-2">Selected Photos ({formData.photos?.length}):</h4>
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
