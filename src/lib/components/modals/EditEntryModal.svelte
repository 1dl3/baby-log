<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fade, fly } from 'svelte/transition';

  // Import form components
  import SleepForm from '$lib/components/forms/SleepForm.svelte';
  import MedicationForm from '$lib/components/forms/MedicationForm.svelte';
  import MilestoneForm from '$lib/components/forms/MilestoneForm.svelte';
  import DiaperForm from '$lib/components/forms/DiaperForm.svelte';
  import FeedingForm from '$lib/components/forms/FeedingForm.svelte';
  import NursingForm from '$lib/components/forms/NursingForm.svelte';
  import PhotoForm from '$lib/components/forms/PhotoForm.svelte';
  import MeasurementForm from '$lib/components/forms/MeasurementForm.svelte';

  export let showModal = false;
  export let baby: { id: string; name: string } | null = null;
  export let entry: {
    id: string;
    babyId: string;
    userId: string;
    timestamp: string;
    logType: string;
    notes?: string;
    photoUrl?: string;
    itemPhotos?: string[];
    // Diaper specific
    type?: 'wet' | 'dirty' | 'both';
    // Feeding specific
    amount?: number;
    foodType?: string;
    foodDetails?: string;
    consistency?: string;
    reaction?: string;
    // Nursing specific
    duration?: number;
    side?: 'left' | 'right' | 'both';
    // Sleep specific
    startTime?: string;
    endTime?: string;
    quality?: string;
    location?: string;
    // Medication specific
    name?: string;
    dosage?: string;
    unit?: string;
    reason?: string;
    administeredAt?: string;
    // Milestone specific
    category?: string;
    title?: string;
    description?: string;
    achievedAt?: string;
    // Measurement specific
    height?: number;
    weight?: number;
    headCircumference?: number;
    temperature?: number;
    teethCount?: number;
    measurementType?: string;
    measurementLocation?: string;
    [key: string]: string | number | string[] | undefined;
  } | null = null; // The entry to edit
  export let error = '';
  export let success = false;

  const dispatch = createEventDispatcher();

  function handleSubmit(event) {
    // Add the entry ID to the form data
    const formData = event.detail.formData;
    formData.id = entry.id;

    dispatch('submit', { ...event.detail, formData });
  }

  function handleCancel() {
    dispatch('cancel');
  }

  function handleError(event) {
    dispatch('error', event.detail);
  }

  function closeModal() {
    dispatch('close');
  }
</script>

{#if showModal && entry}
  <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

  <div transition:fade={{ duration: 200 }} class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">

      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <div 
        in:fly={{ y: 10, duration: 300 }}
        class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
      >
        <div class="absolute top-0 right-0 pt-4 pr-4">
          <button
            on:click={closeModal}
            type="button"
            class="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span class="sr-only">Schließen</span>
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="sm:flex sm:items-start mb-5">
          <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
            <svg class="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
              Eintrag bearbeiten
            </h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                Bearbeite die Details des Eintrags.
              </p>
            </div>
          </div>
        </div>

        {#if error}
          <div class="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded shadow-sm">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        {/if}

        {#if success}
          <div class="rounded-md bg-green-50 p-4 border border-green-100">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-green-800">
                  Eintrag erfolgreich gespeichert!
                </h3>
                <div class="mt-2 text-sm text-green-700">
                  <p>Der Eintrag wurde erfolgreich gespeichert.</p>
                </div>
                <div class="mt-4">
                  <button
                    type="button"
                    class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    on:click={closeModal}
                  >
                    Schließen
                  </button>
                </div>
              </div>
            </div>
          </div>
        {:else if baby}
          {#if entry.logType === 'sleep'}
            <SleepForm {baby} {error} {success} entry={entry} on:submit={handleSubmit} on:cancel={handleCancel} on:error={handleError} />
          {:else if entry.logType === 'medication'}
            <MedicationForm {baby} {error} {success} entry={entry} on:submit={handleSubmit} on:cancel={handleCancel} on:error={handleError} />
          {:else if entry.logType === 'milestone'}
            <MilestoneForm {baby} {error} {success} entry={entry} on:submit={handleSubmit} on:cancel={handleCancel} on:error={handleError} />
          {:else if entry.logType === 'diaper'}
            <DiaperForm {baby} {error} {success} entry={entry} on:submit={handleSubmit} on:cancel={handleCancel} on:error={handleError} />
          {:else if entry.logType === 'feeding'}
            <FeedingForm {baby} {error} {success} entry={entry} on:submit={handleSubmit} on:cancel={handleCancel} on:error={handleError} />
          {:else if entry.logType === 'nursing'}
            <NursingForm {baby} {error} {success} entry={entry} on:submit={handleSubmit} on:cancel={handleCancel} on:error={handleError} />
          {:else if entry.logType === 'photo'}
            <PhotoForm {baby} {error} {success} entry={entry} on:submit={handleSubmit} on:cancel={handleCancel} on:error={handleError} />
          {:else if entry.logType === 'measurement'}
            <MeasurementForm {baby} {error} {success} entry={entry} on:submit={handleSubmit} on:cancel={handleCancel} on:error={handleError} />
          {/if}
        {:else}
          <div class="text-center py-6">
            <p class="text-gray-500">Bitte wähle zuerst ein Baby aus.</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
