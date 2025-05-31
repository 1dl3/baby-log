<script lang="ts">
  import ConfirmDialog from '$lib/components/modals/ConfirmDialog.svelte';

  // Define a type for log entries
  interface LogEntry {
    id: string;
    babyId: string;
    userId: string;
    timestamp: string;
    logType: string;
    notes?: string;
    photoUrl?: string;
    itemPhotos?: string[]; // Array of item photo URLs
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
  }

  export let entry: LogEntry;
  export let onPhotoClick: (photoUrl: string, allPhotos: string[]) => void = () => {};
  export let onEdit: (entry: LogEntry) => void = () => {};
  export let onDelete: (entry: LogEntry) => void = () => {};
  export let canEdit: boolean = true;

  // State for confirm dialog
  let showDeleteConfirm = false;

  // Function to format date
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Function to handle edit button click
  function handleEdit() {
    onEdit(entry);
  }

  // Function to handle delete button click
  function handleDelete() {
    showDeleteConfirm = true;
  }

  // Function to handle confirm delete
  function confirmDelete() {
    onDelete(entry);
  }
</script>

<div class="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow w-full">
  <div class="flex items-center justify-between">
    <div class="flex items-center">
      <!-- Icon based on log type -->
      <div class="flex-shrink-0 h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
        {#if entry.logType === 'diaper'}
          <span class="text-2xl">🧷</span>
        {:else if entry.logType === 'feeding'}
          <span class="text-2xl">🍼</span>
        {:else if entry.logType === 'nursing'}
          <span class="text-2xl">👩‍🍼</span>
        {:else if entry.logType === 'sleep'}
          <span class="text-2xl">😴</span>
        {:else if entry.logType === 'medication'}
          <span class="text-2xl">💊</span>
        {:else if entry.logType === 'milestone'}
          <span class="text-2xl">🏆</span>
        {:else if entry.logType === 'measurement'}
          <span class="text-2xl">📏</span>
        {:else if entry.logType === 'photo'}
          <span class="text-2xl">📷</span>
        {:else}
          <span class="text-2xl">📝</span>
        {/if}
      </div>
      <div class="ml-4">
        <!-- Log type title -->
        <h4 class="text-lg font-medium text-gray-900">
          {#if entry.logType === 'diaper'}
            Windel gewechselt
          {:else if entry.logType === 'feeding'}
            Fütterung
          {:else if entry.logType === 'nursing'}
            Stillen
          {:else if entry.logType === 'sleep'}
            Schlaf
          {:else if entry.logType === 'medication'}
            Medikament: {entry.name}
          {:else if entry.logType === 'milestone'}
            Meilenstein: {entry.title}
          {:else if entry.logType === 'measurement'}
            Messung
          {:else if entry.logType === 'photo'}
            Foto
          {:else}
            Protokolleintrag
          {/if}
        </h4>
        <!-- Timestamp -->
        <p class="text-sm text-gray-500">
          {formatDate(entry.timestamp)}
        </p>
      </div>
    </div>

    {#if canEdit}
      <div class="flex space-x-2">
        <button 
          on:click={handleEdit}
          class="p-1 rounded-full text-blue-600 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          title="Bearbeiten"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>
        <button 
          on:click={handleDelete}
          class="p-1 rounded-full text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          title="Löschen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    {/if}
  </div>

  <!-- Log details based on type -->
  <div class="mt-4">
    {#if entry.logType === 'diaper'}
      <div class="bg-gray-50 p-3 rounded-md">
        <p class="text-sm text-gray-700">
          <span class="font-medium">Typ:</span> {entry.type === 'wet' ? 'Nass' : entry.type === 'dirty' ? 'Schmutzig' : 'Beides'}
        </p>
        {#if entry.notes}
          <p class="text-sm text-gray-700 mt-2">
            <span class="font-medium">Notizen:</span> {entry.notes}
          </p>
        {/if}

        <!-- Item Photos -->
        {#if entry.itemPhotos && entry.itemPhotos.length > 0}
          <div class="mt-3 grid grid-cols-2 gap-2">
            {#each entry.itemPhotos as photoUrl, i (photoUrl)}
              <img 
                src={photoUrl} 
                alt="Foto {i+1}" 
                class="w-full h-32 object-cover rounded-md cursor-pointer" 
                on:click={() => onPhotoClick(photoUrl, entry.itemPhotos || [])}
              />
            {/each}
          </div>
        {/if}
      </div>
    {:else if entry.logType === 'feeding'}
      <div class="bg-gray-50 p-3 rounded-md">
        <p class="text-sm text-gray-700">
          <span class="font-medium">Typ:</span> {entry.type === 'bottle' ? 'Flasche' : entry.type === 'nursing' ? 'Stillen' : 'Feste Nahrung'}
        </p>
        {#if entry.amount}
          <p class="text-sm text-gray-700 mt-1">
            <span class="font-medium">Menge:</span> {entry.amount} ml
          </p>
        {/if}
        {#if entry.foodType}
          <p class="text-sm text-gray-700 mt-1">
            <span class="font-medium">Nahrung:</span> {entry.foodType}
          </p>
        {/if}
        {#if entry.foodDetails}
          <p class="text-sm text-gray-700 mt-1">
            <span class="font-medium">Details:</span> {entry.foodDetails}
          </p>
        {/if}
        {#if entry.consistency}
          <p class="text-sm text-gray-700 mt-1">
            <span class="font-medium">Konsistenz:</span> {entry.consistency}
          </p>
        {/if}
        {#if entry.reaction}
          <p class="text-sm text-gray-700 mt-1">
            <span class="font-medium">Reaktion:</span> {entry.reaction}
          </p>
        {/if}
        {#if entry.notes}
          <p class="text-sm text-gray-700 mt-2">
            <span class="font-medium">Notizen:</span> {entry.notes}
          </p>
        {/if}

        <!-- Item Photos -->
        {#if entry.itemPhotos && entry.itemPhotos.length > 0}
          <div class="mt-3 grid grid-cols-2 gap-2">
            {#each entry.itemPhotos as photoUrl, i (photoUrl)}
              <img 
                src={photoUrl} 
                alt="Foto {i+1}" 
                class="w-full h-32 object-cover rounded-md cursor-pointer" 
                on:click={() => onPhotoClick(photoUrl, entry.itemPhotos || [])}
              />
            {/each}
          </div>
        {/if}
      </div>
    {:else if entry.logType === 'nursing'}
      <div class="bg-gray-50 p-3 rounded-md">
        <p class="text-sm text-gray-700">
          <span class="font-medium">Dauer:</span> {entry.duration} Minuten
        </p>
        <p class="text-sm text-gray-700 mt-1">
          <span class="font-medium">Seite:</span> {entry.side === 'left' ? 'Links' : entry.side === 'right' ? 'Rechts' : 'Beide'}
        </p>
        {#if entry.notes}
          <p class="text-sm text-gray-700 mt-2">
            <span class="font-medium">Notizen:</span> {entry.notes}
          </p>
        {/if}

        <!-- Item Photos -->
        {#if entry.itemPhotos && entry.itemPhotos.length > 0}
          <div class="mt-3 grid grid-cols-2 gap-2">
            {#each entry.itemPhotos as photoUrl, i (photoUrl)}
              <img 
                src={photoUrl} 
                alt="Foto {i+1}" 
                class="w-full h-32 object-cover rounded-md cursor-pointer" 
                on:click={() => onPhotoClick(photoUrl, entry.itemPhotos || [])}
              />
            {/each}
          </div>
        {/if}
      </div>
    {:else if entry.logType === 'sleep'}
      <div class="bg-gray-50 p-3 rounded-md">
        {#if entry.duration}
          <p class="text-sm text-gray-700">
            <span class="font-medium">Dauer:</span> {entry.duration} Minuten
          </p>
        {:else if entry.startTime && entry.endTime}
          <p class="text-sm text-gray-700">
            <span class="font-medium">Von:</span> {new Date(entry.startTime).toLocaleTimeString('de-DE', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          <p class="text-sm text-gray-700 mt-1">
            <span class="font-medium">Bis:</span> {new Date(entry.endTime).toLocaleTimeString('de-DE', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        {/if}
        {#if entry.quality}
          <p class="text-sm text-gray-700 mt-1">
            <span class="font-medium">Qualität:</span> {entry.quality}
          </p>
        {/if}
        {#if entry.location}
          <p class="text-sm text-gray-700 mt-1">
            <span class="font-medium">Ort:</span> {entry.location}
          </p>
        {/if}
        {#if entry.notes}
          <p class="text-sm text-gray-700 mt-2">
            <span class="font-medium">Notizen:</span> {entry.notes}
          </p>
        {/if}

        <!-- Item Photos -->
        {#if entry.itemPhotos && entry.itemPhotos.length > 0}
          <div class="mt-3 grid grid-cols-2 gap-2">
            {#each entry.itemPhotos as photoUrl, i (photoUrl)}
              <img 
                src={photoUrl} 
                alt="Foto {i+1}" 
                class="w-full h-32 object-cover rounded-md cursor-pointer" 
                on:click={() => onPhotoClick(photoUrl, entry.itemPhotos || [])}
              />
            {/each}
          </div>
        {/if}
      </div>
    {:else if entry.logType === 'medication'}
      <div class="bg-gray-50 p-3 rounded-md">
        <p class="text-sm text-gray-700">
          <span class="font-medium">Dosis:</span> {entry.dosage} {entry.unit}
        </p>
        {#if entry.reason}
          <p class="text-sm text-gray-700 mt-1">
            <span class="font-medium">Grund:</span> {entry.reason}
          </p>
        {/if}
        {#if entry.notes}
          <p class="text-sm text-gray-700 mt-2">
            <span class="font-medium">Notizen:</span> {entry.notes}
          </p>
        {/if}

        <!-- Item Photos -->
        {#if entry.itemPhotos && entry.itemPhotos.length > 0}
          <div class="mt-3 grid grid-cols-2 gap-2">
            {#each entry.itemPhotos as photoUrl, i (photoUrl)}
              <img 
                src={photoUrl} 
                alt="Foto {i+1}" 
                class="w-full h-32 object-cover rounded-md cursor-pointer" 
                on:click={() => onPhotoClick(photoUrl, entry.itemPhotos || [])}
              />
            {/each}
          </div>
        {/if}
      </div>
    {:else if entry.logType === 'milestone'}
      <div class="bg-gray-50 p-3 rounded-md">
        <p class="text-sm text-gray-700">
          <span class="font-medium">Kategorie:</span> {entry.category}
        </p>
        {#if entry.description}
          <p class="text-sm text-gray-700 mt-1">
            <span class="font-medium">Beschreibung:</span> {entry.description}
          </p>
        {/if}
        {#if entry.photoUrl}
          <div class="mt-3">
            <img 
              src={entry.photoUrl} 
              alt="Meilenstein" 
              class="w-full h-40 object-cover rounded-md cursor-pointer" 
              on:click={() => onPhotoClick(entry.photoUrl, [entry.photoUrl])}
            />
          </div>
        {/if}
        {#if entry.notes}
          <p class="text-sm text-gray-700 mt-2">
            <span class="font-medium">Notizen:</span> {entry.notes}
          </p>
        {/if}

        <!-- Item Photos -->
        {#if entry.itemPhotos && entry.itemPhotos.length > 0}
          <div class="mt-3 grid grid-cols-2 gap-2">
            {#each entry.itemPhotos as photoUrl, i (photoUrl)}
              <img 
                src={photoUrl} 
                alt="Foto {i+1}" 
                class="w-full h-32 object-cover rounded-md cursor-pointer" 
                on:click={() => onPhotoClick(photoUrl, entry.itemPhotos || [])}
              />
            {/each}
          </div>
        {/if}
      </div>
    {:else if entry.logType === 'measurement'}
      <div class="bg-gray-50 p-3 rounded-md">
        {#if entry.height}
          <p class="text-sm text-gray-700">
            <span class="font-medium">Größe:</span> {entry.height} cm
          </p>
        {/if}
        {#if entry.weight}
          <p class="text-sm text-gray-700 mt-1">
            <span class="font-medium">Gewicht:</span> {entry.weight} kg
          </p>
        {/if}
        {#if entry.headCircumference}
          <p class="text-sm text-gray-700 mt-1">
            <span class="font-medium">Kopfumfang:</span> {entry.headCircumference} cm
          </p>
        {/if}
        {#if entry.temperature}
          <p class="text-sm text-gray-700 mt-1">
            <span class="font-medium">Temperatur:</span> {entry.temperature} °C
          </p>
        {/if}
        {#if entry.teethCount}
          <p class="text-sm text-gray-700 mt-1">
            <span class="font-medium">Anzahl Zähne:</span> {entry.teethCount}
          </p>
        {/if}
        {#if entry.measurementType}
          <p class="text-sm text-gray-700 mt-1">
            <span class="font-medium">Messungstyp:</span> {entry.measurementType}
          </p>
        {/if}
        {#if entry.measurementLocation}
          <p class="text-sm text-gray-700 mt-1">
            <span class="font-medium">Messungsort:</span> {entry.measurementLocation}
          </p>
        {/if}
        {#if entry.notes}
          <p class="text-sm text-gray-700 mt-2">
            <span class="font-medium">Notizen:</span> {entry.notes}
          </p>
        {/if}

        <!-- Item Photos -->
        {#if entry.itemPhotos && entry.itemPhotos.length > 0}
          <div class="mt-3 grid grid-cols-2 gap-2">
            {#each entry.itemPhotos as photoUrl, i (photoUrl)}
              <img 
                src={photoUrl} 
                alt="Foto {i+1}" 
                class="w-full h-32 object-cover rounded-md cursor-pointer" 
                on:click={() => onPhotoClick(photoUrl, entry.itemPhotos || [])}
              />
            {/each}
          </div>
        {/if}
      </div>
    {:else if entry.logType === 'photo'}
      <div class="bg-gray-50 p-3 rounded-md">
        {#if entry.photoUrl}
          <div class="mt-1">
            <img 
              src={entry.photoUrl} 
              alt="Foto" 
              class="w-full h-48 object-cover rounded-md cursor-pointer" 
              on:click={() => onPhotoClick(entry.photoUrl, [entry.photoUrl])}
            />
          </div>
        {/if}
        {#if entry.notes}
          <p class="text-sm text-gray-700 mt-2">
            <span class="font-medium">Notizen:</span> {entry.notes}
          </p>
        {/if}
      </div>
    {/if}
  </div>
</div>

<!-- Confirm Delete Dialog -->
<ConfirmDialog
  bind:showDialog={showDeleteConfirm}
  title="Eintrag löschen"
  message="Möchten Sie diesen Eintrag wirklich löschen?"
  confirmText="Löschen"
  cancelText="Abbrechen"
  on:confirm={confirmDelete}
/>
