<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fade, fly } from 'svelte/transition';

  // Import form components
  import SleepForm from './forms/SleepForm.svelte';
  import MedicationForm from './forms/MedicationForm.svelte';
  import MilestoneForm from './forms/MilestoneForm.svelte';
  import DiaperForm from './forms/DiaperForm.svelte';
  import FeedingForm from './forms/FeedingForm.svelte';
  import NursingForm from './forms/NursingForm.svelte';
  import PhotoForm from './forms/PhotoForm.svelte';
  import SizeForm from './forms/SizeForm.svelte';
  import WeightForm from './forms/WeightForm.svelte';
  import MeasurementForm from './forms/MeasurementForm.svelte';

  export let showModal = false;
  export let baby: { id: string; name: string } | null = null;
  export let error = '';
  export let success = false;

  const dispatch = createEventDispatcher();

  let selectedType = 'diaper';

  // Map for entry types
  const entryTypes = {
    diaper: { name: 'Windel wechseln', icon: '🧷' },
    feeding: { name: 'Fütterung', icon: '🍼' },
    nursing: { name: 'Stillen', icon: '👩‍🍼' },
    photo: { name: 'Foto', icon: '📷' },
    measurement: { name: 'Messung', icon: '📊' },
    sleep: { name: 'Schlaf', icon: '😴' },
    medication: { name: 'Medikament', icon: '💊' },
    milestone: { name: 'Meilenstein', icon: '🏆' }
  };

  function handleSubmit(event) {
    dispatch('submit', { ...event.detail, type: selectedType });
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

{#if showModal}
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
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
              Neuen Eintrag erstellen
            </h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                Wähle die Art des Eintrags, den du erstellen möchtest.
              </p>
            </div>
          </div>
        </div>

        {#if !success}
          <div class="mb-5">
            <label for="entry-type" class="block text-sm font-medium text-gray-700">Eintragstyp</label>
            <select
              id="entry-type"
              bind:value={selectedType}
              class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              {#each Object.entries(entryTypes) as [value, { name, icon }] (value)}
                <option value={value}>{icon} {name}</option>
              {/each}
            </select>
          </div>
        {/if}

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
          {#if selectedType === 'sleep'}
            <SleepForm {baby} {error} {success} on:submit={handleSubmit} on:cancel={handleCancel} on:error={handleError} />
          {:else if selectedType === 'medication'}
            <MedicationForm {baby} {error} {success} on:submit={handleSubmit} on:cancel={handleCancel} on:error={handleError} />
          {:else if selectedType === 'milestone'}
            <MilestoneForm {baby} {error} {success} on:submit={handleSubmit} on:cancel={handleCancel} on:error={handleError} />
          {:else if selectedType === 'diaper'}
            <DiaperForm {baby} {error} {success} on:submit={handleSubmit} on:cancel={handleCancel} on:error={handleError} />
          {:else if selectedType === 'feeding'}
            <FeedingForm {baby} {error} {success} on:submit={handleSubmit} on:cancel={handleCancel} on:error={handleError} />
          {:else if selectedType === 'nursing'}
            <NursingForm {baby} {error} {success} on:submit={handleSubmit} on:cancel={handleCancel} on:error={handleError} />
          {:else if selectedType === 'photo'}
            <PhotoForm {baby} {error} {success} on:submit={handleSubmit} on:cancel={handleCancel} on:error={handleError} />
          {:else if selectedType === 'size'}
            <SizeForm {baby} {error} {success} on:submit={handleSubmit} on:cancel={handleCancel} on:error={handleError} />
          {:else if selectedType === 'weight'}
            <WeightForm {baby} {error} {success} on:submit={handleSubmit} on:cancel={handleCancel} on:error={handleError} />
          {:else if selectedType === 'measurement'}
            <MeasurementForm {baby} {error} {success} on:submit={handleSubmit} on:cancel={handleCancel} on:error={handleError} />
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
