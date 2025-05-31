<script lang="ts">
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
