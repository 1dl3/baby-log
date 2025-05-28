<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';
  import { fade, fly } from 'svelte/transition';
  import { flip } from 'svelte/animate';

  // Define types for our data
  interface Baby {
    id: number;
    name: string;
    birthDate: string;
    gender: 'male' | 'female' | 'diverse';
  }

  interface QRCode {
    id: number;
    babyId: number;
    type: string;
    code: string;
  }

  export let data: PageData;
  let babies: Baby[] = [];
  let loading = true;
  let error = '';
  let selectedBaby: Baby | null = null;
  let showAddBabyModal = false;
  let showQrModal = false;
  let newBabyName = '';
  let newBabyBirthDate = '';
  let newBabyGender: 'male' | 'female' | 'diverse' = 'male';
  let qrCodes: QRCode[] = [];
  let selectedQrType = 'diaper';
  let addingBaby = false;
  let generatingQR = false;
  let successMessage = '';
  let showSuccessMessage = false;

  // Map for gender icons and colors
  const genderIcons = {
    male: { icon: '👦', color: 'bg-blue-100 text-blue-800' },
    female: { icon: '👧', color: 'bg-pink-100 text-pink-800' },
    diverse: { icon: '👶', color: 'bg-purple-100 text-purple-800' }
  };

  // Map for QR code types
  const qrTypes = {
    diaper: { name: 'Windel wechseln', icon: '🧷' },
    feeding: { name: 'Fütterung', icon: '🍼' },
    nursing: { name: 'Stillen', icon: '👩‍🍼' }
  };

  onMount(async () => {
    try {
      const res = await fetch('/api/babies');
      if (!res.ok) {
        if (res.status === 401) {
          goto('/login');
          return;
        }
        throw new Error('Failed to fetch babies');
      }
      babies = await res.json();
    } catch {
      error = 'Fehler beim Laden der Babydaten';
    } finally {
      loading = false;
    }
  });

  async function handleAddBaby() {
    if (addingBaby) return;

    addingBaby = true;
    error = '';

    try {
      const res = await fetch('/api/babies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newBabyName,
          birthDate: newBabyBirthDate,
          gender: newBabyGender
        })
      });

      if (!res.ok) throw new Error('Failed to add baby');

      const newBaby = await res.json();
      babies = [...babies, newBaby];
      showAddBabyModal = false;
      newBabyName = '';
      newBabyBirthDate = '';
      newBabyGender = 'male';

      // Show success message
      successMessage = 'Baby erfolgreich hinzugefügt!';
      showSuccessMessage = true;
      setTimeout(() => {
        showSuccessMessage = false;
      }, 3000);

    } catch {
      error = 'Fehler beim Hinzufügen des Babys';
    } finally {
      addingBaby = false;
    }
  }

  function openQrModal(baby) {
    selectedBaby = baby;
    showQrModal = true;
  }

  async function generateQrCode() {
    if (!selectedBaby || generatingQR) return;

    generatingQR = true;
    error = '';

    try {
      const response = await fetch('/api/qr-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          babyId: selectedBaby.id,
          type: selectedQrType
        })
      });

      if (!response.ok) throw new Error('Failed to generate QR code');

      const data = await response.json();
      qrCodes = [...qrCodes, data];

      // Show success message
      successMessage = 'QR-Code erfolgreich generiert!';
      showSuccessMessage = true;
      setTimeout(() => {
        showSuccessMessage = false;
      }, 3000);

      showQrModal = false;
    } catch {
      error = 'Fehler beim Generieren des QR-Codes';
    } finally {
      generatingQR = false;
    }
  }

  // Format date to a more readable format
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('de-DE', options);
  }

  // Calculate age in months or days
  function calculateAge(birthDate) {
    const birth = new Date(birthDate);
    const now = new Date();

    const diffTime = Math.abs(now - birth);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `${diffDays} Tage alt`;
    } else {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'Monat' : 'Monate'} alt`;
    }
  }
</script>

<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <!-- Page header -->
  <div class="md:flex md:items-center md:justify-between mb-8">
    <div class="flex-1 min-w-0">
      <h1 class="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">Dashboard</h1>
      <p class="mt-1 text-sm text-gray-500">Verwalte deine Babys und generiere QR-Codes für schnelles Protokollieren.</p>
    </div>
    <div class="mt-4 flex md:mt-0 md:ml-4">
      <button
        on:click={() => (showAddBabyModal = true)}
        class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Neues Baby hinzufügen
      </button>
    </div>
  </div>

  <!-- Success message -->
  {#if showSuccessMessage}
    <div transition:fade={{ duration: 300 }} class="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded shadow-sm">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-green-700">{successMessage}</p>
        </div>
      </div>
    </div>
  {/if}

  <!-- Error message -->
  {#if error}
    <div transition:fade={{ duration: 300 }} class="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded shadow-sm">
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

  <!-- Loading state -->
  {#if loading}
    <div class="flex flex-col items-center justify-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      <p class="mt-4 text-sm text-gray-500">Lade Babydaten...</p>
    </div>
  <!-- Empty state -->
  {:else if babies.length === 0}
    <div class="bg-white shadow overflow-hidden sm:rounded-lg">
      <div class="px-4 py-16 sm:px-6 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-2 text-lg font-medium text-gray-900">Keine Babys gefunden</h3>
        <p class="mt-1 text-sm text-gray-500">Füge dein erstes Baby hinzu, um loszulegen.</p>
        <div class="mt-6">
          <button
            on:click={() => (showAddBabyModal = true)}
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            Neues Baby hinzufügen
          </button>
        </div>
      </div>
    </div>
  <!-- Baby cards -->
  {:else}
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {#each babies as baby, i (baby.id)}
        <div 
          in:fly={{ y: 20, duration: 300, delay: i * 100 }} 
          out:fade={{ duration: 200 }}
          animate:flip={{ duration: 300 }}
          class="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200 transition-all duration-200 hover:shadow-md"
        >
          <div class="px-4 py-5 sm:px-6 flex items-center">
            <div class={`flex-shrink-0 rounded-full p-2 ${genderIcons[baby.gender]?.color || 'bg-gray-100'}`}>
              <span class="text-2xl">{genderIcons[baby.gender]?.icon || '👶'}</span>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium leading-6 text-gray-900">{baby.name}</h3>
              <p class="text-sm text-gray-500">
                {formatDate(baby.birthDate)} · {calculateAge(baby.birthDate)}
              </p>
            </div>
          </div>
          <div class="px-4 py-4 sm:px-6">
            <div class="grid grid-cols-2 gap-4">
              <a
                href="/baby/{baby.id}/details"
                class="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg class="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                </svg>
                Details
              </a>
              <button
                on:click={() => openQrModal(baby)}
                class="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg class="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z" clip-rule="evenodd" />
                  <path d="M11 4a1 1 0 10-2 0v1a1 1 0 002 0V4zM10 7a1 1 0 011 1v1h2a1 1 0 110 2h-3a1 1 0 01-1-1V8a1 1 0 011-1zM16 9a1 1 0 100 2 1 1 0 000-2zM9 13a1 1 0 011-1h1a1 1 0 110 2v2a1 1 0 11-2 0v-3zM7 11a1 1 0 100-2H4a1 1 0 100 2h3zM17 13a1 1 0 01-1 1h-2a1 1 0 110-2h2a1 1 0 011 1zM16 17a1 1 0 100-2h-3a1 1 0 100 2h3z" />
                </svg>
                QR-Code
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</main>

<!-- Add Baby Modal -->
{#if showAddBabyModal}
  <div transition:fade={{ duration: 200 }} class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">

      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <div 
        in:fly={{ y: 10, duration: 300 }}
        class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 z-20"
      >
        <div class="absolute top-0 right-0 pt-4 pr-4">
          <button 
            on:click={() => (showAddBabyModal = false)}
            type="button" 
            class="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span class="sr-only">Schließen</span>
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="sm:flex sm:items-start">
          <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
            <svg class="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
              Neues Baby hinzufügen
            </h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                Fülle die folgenden Informationen aus, um ein neues Baby hinzuzufügen.
              </p>
            </div>
          </div>
        </div>

        <form on:submit|preventDefault={handleAddBaby} class="mt-5 sm:mt-6 space-y-4">
          <div>
            <label for="baby-name" class="block text-sm font-medium text-gray-700">Name</label>
            <input
              id="baby-name"
              type="text"
              bind:value={newBabyName}
              required
              placeholder="Name des Babys"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label for="birth-date" class="block text-sm font-medium text-gray-700">Geburtsdatum</label>
            <input
              id="birth-date"
              type="date"
              bind:value={newBabyBirthDate}
              required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label for="gender" class="block text-sm font-medium text-gray-700">Geschlecht</label>
            <select
              id="gender"
              bind:value={newBabyGender}
              required
              class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="male">Männlich</option>
              <option value="female">Weiblich</option>
              <option value="diverse">Divers</option>
            </select>
          </div>
          <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <button
              type="submit"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
              disabled={addingBaby}
            >
              {#if addingBaby}
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Wird hinzugefügt...
              {:else}
                Hinzufügen
              {/if}
            </button>
            <button
              type="button"
              on:click={() => (showAddBabyModal = false)}
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
            >
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
{/if}

<!-- QR Code Modal -->
{#if showQrModal}
  <div transition:fade={{ duration: 200 }} class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">

      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <div 
        in:fly={{ y: 10, duration: 300 }}
        class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 z-20"
      >
        <div class="absolute top-0 right-0 pt-4 pr-4">
          <button 
            on:click={() => (showQrModal = false)}
            type="button" 
            class="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span class="sr-only">Schließen</span>
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="sm:flex sm:items-start">
          <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
            <svg class="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
              QR-Code generieren
            </h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                Wähle die Art der Aktivität, für die du einen QR-Code generieren möchtest.
              </p>
            </div>
          </div>
        </div>

        <div class="mt-5">
          <label for="qr-type" class="block text-sm font-medium text-gray-700">Aktivitätstyp</label>
          <select
            id="qr-type"
            bind:value={selectedQrType}
            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="diaper">{qrTypes.diaper.icon} {qrTypes.diaper.name}</option>
            <option value="feeding">{qrTypes.feeding.icon} {qrTypes.feeding.name}</option>
            <option value="nursing">{qrTypes.nursing.icon} {qrTypes.nursing.name}</option>
          </select>
        </div>

        <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
          <button
            type="button"
            on:click={generateQrCode}
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
            disabled={generatingQR}
          >
            {#if generatingQR}
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Wird generiert...
            {:else}
              Generieren
            {/if}
          </button>
          <button
            type="button"
            on:click={() => (showQrModal = false)}
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
