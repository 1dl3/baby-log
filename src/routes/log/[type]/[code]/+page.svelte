<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  let type = $page.params.type;
  let code = $page.params.code;
  let baby = null;
  let loading = true;
  let error = '';
  let success = false;

  let formData = {
    notes: '',
    duration: 0,
    amount: 0,
    side: 'both'
  };

  onMount(async () => {
    try {
      const response = await fetch(`/api/qr-codes/${code}`);
      if (!response.ok) {
        throw new Error('Invalid QR code');
      }
      const data = await response.json();
      baby = data.baby;
    } catch (e) {
      error = 'Invalid or expired QR code';
    } finally {
      loading = false;
    }
  });

  async function handleSubmit() {
    try {
      const endpoint = `/api/logs/${type}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          babyId: baby.id,
          ...formData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save log');
      }

      success = true;
    } catch (e) {
      error = 'Failed to save log entry';
    }
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
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                {error}
              </h3>
            </div>
          </div>
        </div>
      {:else if success}
        <div class="rounded-md bg-green-50 p-4">
          <div class="flex">
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800">
                Log entry saved successfully!
              </h3>
            </div>
          </div>
        </div>
      {:else}
        <form class="space-y-6" on:submit|preventDefault={handleSubmit}>
          {#if type === 'diaper'}
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
                ></textarea>
              </div>
            </div>
          {:else if type === 'feeding'}
            <div>
              <label for="amount" class="block text-sm font-medium text-gray-700">
                Amount (ml)
              </label>
              <div class="mt-1">
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  bind:value={formData.amount}
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div>
              <label for="duration" class="block text-sm font-medium text-gray-700">
                Duration (minutes)
              </label>
              <div class="mt-1">
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  bind:value={formData.duration}
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
          {:else if type === 'nursing'}
            <div>
              <label for="duration" class="block text-sm font-medium text-gray-700">
                Duration (minutes)
              </label>
              <div class="mt-1">
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  bind:value={formData.duration}
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div>
              <label for="side" class="block text-sm font-medium text-gray-700">
                Side
              </label>
              <div class="mt-1">
                <select
                  id="side"
                  name="side"
                  bind:value={formData.side}
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>
          {/if}

          <div>
            <button
              type="submit"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save
            </button>
          </div>
        </form>
      {/if}
    </div>
  </div>
</div> 