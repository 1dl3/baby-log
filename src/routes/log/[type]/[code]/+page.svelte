<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';

  // Import form components
  import SleepForm from '$lib/components/forms/SleepForm.svelte';
  import MedicationForm from '$lib/components/forms/MedicationForm.svelte';
  import MilestoneForm from '$lib/components/forms/MilestoneForm.svelte';
  import DiaperForm from '$lib/components/forms/DiaperForm.svelte';
  import FeedingForm from '$lib/components/forms/FeedingForm.svelte';
  import NursingForm from '$lib/components/forms/NursingForm.svelte';
  import PhotoForm from '$lib/components/forms/PhotoForm.svelte';
  import PhotosForm from '$lib/components/forms/PhotosForm.svelte';
  import MeasurementForm from '$lib/components/forms/MeasurementForm.svelte';

  let type = page.params.type;
  let code = page.params.code;
  let baby: { id: string; name: string } | null = null;
  let loading = true;
  let error = '';
  let success = false;

  onMount(async () => {
    try {
      const response = await fetch(`/api/qr-codes/log/${code}`);
      if (!response.ok) {
        throw new Error('Invalid QR code');
      }
      const data = await response.json();
      baby = data.baby;
    } catch {
      error = 'Invalid or expired QR code';
    } finally {
      loading = false;
    }
  });

  async function handleSubmit(event: CustomEvent) {
    try {
      const { formData, type, babyId, isFormData } = event.detail;
      const endpoint = `/api/baby-log/${type}`;
      let response;

      if (isFormData) {
        // Handle FormData submissions (photos)
        response = await fetch(endpoint, {
          method: 'POST',
          body: formData
        });
      } else {
        // Handle JSON submissions
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            babyId,
            ...formData
          })
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save log');
      }

      success = true;
    } catch (e) {
      error = 'Failed to save log entry';
    }
  }

  function handleCancel() {
    window.history.back();
  }

  function handleError(event: CustomEvent) {
    error = event.detail;
  }
</script>

<div class="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
  <div class="sm:mx-auto sm:w-full sm:max-w-xl">
    <div class="flex justify-center">
      <a href="/dashboard" class="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        Zurück zum Dashboard
      </a>
    </div>

    <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
      {#if loading}
        <div class="flex items-center justify-center">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mr-3"></div>
          <span>Wird geladen...</span>
        </div>
      {:else if error}
        <span class="text-red-600">Fehler</span>
      {:else if success}
        <span class="text-green-600">Erfolgreich!</span>
      {:else}
        {#if type === 'diaper'}
          Windel wechseln
        {:else if type === 'feeding'}
          Fütterung
        {:else if type === 'nursing'}
          Stillen
        {:else if type === 'sleep'}
          Schlaf
        {:else if type === 'medication'}
          Medikament
        {:else if type === 'milestone'}
          Meilenstein
        {:else if type === 'measurement'}
          Messung
        {:else if type === 'photo' || type === 'photos'}
          Fotos
        {:else}
          {type}
        {/if}
        {#if baby}
          <span class="block mt-2 text-xl font-medium text-indigo-600">für {baby.name}</span>
        {/if}
      {/if}
    </h2>
  </div>

  <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
    <div class="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border border-gray-100">
      {#if loading}
        <div class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p class="mt-4 text-gray-500">QR-Code wird überprüft...</p>
        </div>
      {:else if error}
        <div class="rounded-md bg-red-50 p-6 border border-red-100">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-lg font-medium text-red-800">
                {error}
              </h3>
              <div class="mt-2 text-sm text-red-700">
                <p>Bitte versuche es erneut oder kontaktiere den Support, wenn das Problem weiterhin besteht.</p>
              </div>
              <div class="mt-4">
                <button
                  type="button"
                  class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  on:click={() => error = ''}
                >
                  Erneut versuchen
                </button>
              </div>
            </div>
          </div>
        </div>
      {:else if success}
        <div class="rounded-md bg-green-50 p-6 border border-green-100">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-lg font-medium text-green-800">
                Eintrag erfolgreich gespeichert!
              </h3>
              <div class="mt-2 text-sm text-green-700">
                <p>Der {type}-Eintrag für {baby?.name} wurde erfolgreich gespeichert.</p>
              </div>
              <div class="mt-4">
                <div class="flex flex-wrap gap-3">
                  <button
                    type="button"
                    class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    on:click={() => window.history.back()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
                    </svg>
                    Zurück
                  </button>
                  <button
                    type="button"
                    class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    on:click={() => {
                      success = false;
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                    </svg>
                    Weiteren Eintrag hinzufügen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      {:else}
        {#if type === 'sleep'}
          <SleepForm 
            {baby} 
            {error} 
            {success} 
            on:submit={handleSubmit} 
            on:cancel={handleCancel} 
            on:error={handleError} 
          />
        {:else if type === 'medication'}
          <MedicationForm 
            {baby} 
            {error} 
            {success} 
            on:submit={handleSubmit} 
            on:cancel={handleCancel} 
            on:error={handleError} 
          />
        {:else if type === 'milestone'}
          <MilestoneForm 
            {baby} 
            {error} 
            {success} 
            on:submit={handleSubmit} 
            on:cancel={handleCancel} 
            on:error={handleError} 
          />
        {:else if type === 'diaper'}
          <DiaperForm 
            {baby} 
            {error} 
            {success} 
            on:submit={handleSubmit} 
            on:cancel={handleCancel} 
            on:error={handleError} 
          />
        {:else if type === 'feeding'}
          <FeedingForm 
            {baby} 
            {error} 
            {success} 
            on:submit={handleSubmit} 
            on:cancel={handleCancel} 
            on:error={handleError} 
          />
        {:else if type === 'nursing'}
          <NursingForm 
            {baby} 
            {error} 
            {success} 
            on:submit={handleSubmit} 
            on:cancel={handleCancel} 
            on:error={handleError} 
          />
        {:else if type === 'photo'}
          <PhotoForm 
            {baby} 
            {error} 
            {success} 
            on:submit={handleSubmit} 
            on:cancel={handleCancel} 
            on:error={handleError} 
          />
        {:else if type === 'photos'}
          <PhotosForm 
            {baby} 
            {error} 
            {success} 
            on:submit={handleSubmit} 
            on:cancel={handleCancel} 
            on:error={handleError} 
          />
        {:else if type === 'size'}
          <SizeForm 
            {baby} 
            {error} 
            {success} 
            on:submit={handleSubmit} 
            on:cancel={handleCancel} 
            on:error={handleError} 
          />
        {:else if type === 'weight'}
          <WeightForm 
            {baby} 
            {error} 
            {success} 
            on:submit={handleSubmit} 
            on:cancel={handleCancel} 
            on:error={handleError} 
          />
        {:else if type === 'measurement'}
          <MeasurementForm 
            {baby} 
            {error} 
            {success} 
            on:submit={handleSubmit} 
            on:cancel={handleCancel} 
            on:error={handleError} 
          />
        {/if}
      {/if}
    </div>
  </div>
</div> 
