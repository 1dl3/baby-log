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
  import SizeForm from '$lib/components/forms/SizeForm.svelte';
  import WeightForm from '$lib/components/forms/WeightForm.svelte';
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
      console.log(e);
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

<div class="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
  <div class="sm:mx-auto sm:w-full sm:max-w-md">
    <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
      {#if loading}
        Loading...
      {:else if error}
        Error
      {:else if success}
        Success!
      {:else}
        Log {type} for {baby?.name}
      {/if}
    </h2>
  </div>

  <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
    <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      {#if loading}
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      {:else if error}
        <div class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                {error}
              </h3>
              <div class="mt-2 text-sm text-red-700">
                <p>Please try again or contact support if the problem persists.</p>
              </div>
              <div class="mt-4">
                <button
                  type="button"
                  class="bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  on:click={() => error = ''}
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      {:else if success}
        <div class="rounded-md bg-green-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800">
                Log entry saved successfully!
              </h3>
              <div class="mt-2 text-sm text-green-700">
                <p>The {type} log for {baby?.name} has been recorded.</p>
              </div>
              <div class="mt-4">
                <div class="-mx-2 -my-1.5 flex">
                  <button
                    type="button"
                    class="bg-green-50 px-2 py-1.5 rounded-md text-sm font-medium text-green-800 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    on:click={() => window.history.back()}
                  >
                    Go back
                  </button>
                  <button
                    type="button"
                    class="ml-3 bg-green-50 px-2 py-1.5 rounded-md text-sm font-medium text-green-800 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    on:click={() => success = false}
                  >
                    Add another log
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
