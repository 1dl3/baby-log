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
    type?: string;
    amount?: number;
    foodType?: string;
    foodDetails?: string;
    consistency?: string;
    reaction?: string;
    duration?: number;
    [key: string]: string | number | boolean | undefined;
  } | null = null; // Accept entry data for editing

  const dispatch = createEventDispatcher();

  // Feeding-specific form data
  let formData = entry ? {
    notes: entry.notes || '',
    feedingType: entry.type || 'bottle',
    amount: entry.amount || 0,
    duration: entry.duration || 0,
    foodType: entry.foodType || '',
    foodDetails: entry.foodDetails || '',
    consistency: entry.consistency || '',
    reaction: entry.reaction || '',
    timestamp: entry.timestamp ? new Date(entry.timestamp).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)
  } : {
    notes: '',
    feedingType: 'bottle',
    amount: 0,
    duration: 0,
    foodType: '',
    foodDetails: '',
    consistency: '',
    reaction: '',
    timestamp: new Date().toISOString().slice(0, 16)
  };

  function handleSubmit() {
    dispatch('submit', { formData, type: 'feeding', babyId: baby?.id });
  }

  function handleCancel() {
    dispatch('cancel');
  }

  function setFeedingType(type: string) {
    formData.feedingType = type;
  }

  function setFoodType(type: string) {
    formData.foodType = type;
  }

  function setConsistency(type: string) {
    formData.consistency = type;
  }

  function setReaction(type: string) {
    formData.reaction = type;
  }
</script>

<BaseForm {baby} type="feeding" {error} {success} {formData} on:submit={handleSubmit} on:cancel={handleCancel}>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1">
      Feeding Type
    </label>
    <div class="flex flex-col sm:flex-row gap-2">
      <button
        type="button"
        on:click={() => setFeedingType('bottle')}
        class={`flex-1 py-3 px-4 border rounded-md text-sm font-medium flex items-center justify-center
               ${formData.feedingType === 'bottle'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        Bottle
      </button>
      <button
        type="button"
        on:click={() => setFeedingType('nursing')}
        class={`flex-1 py-3 px-4 border rounded-md text-sm font-medium flex items-center justify-center
               ${formData.feedingType === 'nursing'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        Nursing
      </button>
      <button
        type="button"
        on:click={() => setFeedingType('solid')}
        class={`flex-1 py-3 px-4 border rounded-md text-sm font-medium flex items-center justify-center
               ${formData.feedingType === 'solid'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        Solid Food
      </button>
    </div>
    <input type="hidden" name="feedingType" bind:value={formData.feedingType} required />
  </div>

  {#if formData.feedingType === 'bottle'}
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
          required
          min="0"
        />
      </div>
    </div>
  {/if}

  {#if formData.feedingType === 'solid'}
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Food Type
      </label>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <button
          type="button"
          on:click={() => setFoodType('fruit')}
          class={`py-3 px-2 border rounded-md text-xs sm:text-sm font-medium flex items-center justify-center
               ${formData.foodType === 'fruit'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          Fruit
        </button>
        <button
          type="button"
          on:click={() => setFoodType('vegetable')}
          class={`py-3 px-2 border rounded-md text-xs sm:text-sm font-medium flex items-center justify-center
               ${formData.foodType === 'vegetable'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Vegetable
        </button>
        <button
          type="button"
          on:click={() => setFoodType('grain')}
          class={`py-3 px-2 border rounded-md text-xs sm:text-sm font-medium flex items-center justify-center
               ${formData.foodType === 'grain'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Grain
        </button>
        <button
          type="button"
          on:click={() => setFoodType('protein')}
          class={`py-3 px-2 border rounded-md text-xs sm:text-sm font-medium flex items-center justify-center
               ${formData.foodType === 'protein'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          Protein
        </button>
        <button
          type="button"
          on:click={() => setFoodType('dairy')}
          class={`py-3 px-2 border rounded-md text-xs sm:text-sm font-medium flex items-center justify-center
               ${formData.foodType === 'dairy'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Dairy
        </button>
        <button
          type="button"
          on:click={() => setFoodType('mixed')}
          class={`py-3 px-2 border rounded-md text-xs sm:text-sm font-medium flex items-center justify-center
               ${formData.foodType === 'mixed'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          Mixed
        </button>
      </div>
      <input type="hidden" name="foodType" bind:value={formData.foodType} required />
    </div>

    <div>
      <label for="foodDetails" class="block text-sm font-medium text-gray-700">
        Food Details
      </label>
      <div class="mt-1">
        <input
          type="text"
          id="foodDetails"
          name="foodDetails"
          bind:value={formData.foodDetails}
          class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          placeholder="e.g., Banana, Carrot puree"
        />
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Consistency
      </label>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          type="button"
          on:click={() => setConsistency('puree')}
          class={`py-3 px-2 border rounded-md text-xs sm:text-sm font-medium flex items-center justify-center
               ${formData.consistency === 'puree'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          Puree
        </button>
        <button
          type="button"
          on:click={() => setConsistency('mashed')}
          class={`py-3 px-2 border rounded-md text-xs sm:text-sm font-medium flex items-center justify-center
               ${formData.consistency === 'mashed'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
          Mashed
        </button>
        <button
          type="button"
          on:click={() => setConsistency('small-pieces')}
          class={`py-3 px-2 border rounded-md text-xs sm:text-sm font-medium flex items-center justify-center
               ${formData.consistency === 'small-pieces'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
          </svg>
          Small Pieces
        </button>
        <button
          type="button"
          on:click={() => setConsistency('finger-food')}
          class={`py-3 px-2 border rounded-md text-xs sm:text-sm font-medium flex items-center justify-center
               ${formData.consistency === 'finger-food'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
          </svg>
          Finger Food
        </button>
      </div>
      <input type="hidden" name="consistency" bind:value={formData.consistency} />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Baby's Reaction
      </label>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          type="button"
          on:click={() => setReaction('liked')}
          class={`py-3 px-2 border rounded-md text-xs sm:text-sm font-medium flex items-center justify-center
               ${formData.reaction === 'liked'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Liked
        </button>
        <button
          type="button"
          on:click={() => setReaction('neutral')}
          class={`py-3 px-2 border rounded-md text-xs sm:text-sm font-medium flex items-center justify-center
               ${formData.reaction === 'neutral'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Neutral
        </button>
        <button
          type="button"
          on:click={() => setReaction('disliked')}
          class={`py-3 px-2 border rounded-md text-xs sm:text-sm font-medium flex items-center justify-center
               ${formData.reaction === 'disliked'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Disliked
        </button>
        <button
          type="button"
          on:click={() => setReaction('allergic')}
          class={`py-3 px-2 border rounded-md text-xs sm:text-sm font-medium flex items-center justify-center
               ${formData.reaction === 'allergic'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Allergic
        </button>
      </div>
      <input type="hidden" name="reaction" bind:value={formData.reaction} />
    </div>
  {/if}

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
        required
        min="0"
      />
    </div>
  </div>

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
