<script lang="ts">
  import BaseForm from './BaseForm.svelte';
  import { createEventDispatcher } from 'svelte';

  export let baby: { id: string; name: string } | null = null;
  export let error: string = '';
  export let success: boolean = false;

  const dispatch = createEventDispatcher();

  // Feeding-specific form data
  let formData = {
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
          class={`py-2 px-2 border rounded-md text-xs sm:text-sm font-medium
               ${formData.foodType === 'fruit'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          Fruit
        </button>
        <button
          type="button"
          on:click={() => setFoodType('vegetable')}
          class={`py-2 px-2 border rounded-md text-xs sm:text-sm font-medium
               ${formData.foodType === 'vegetable'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          Vegetable
        </button>
        <button
          type="button"
          on:click={() => setFoodType('grain')}
          class={`py-2 px-2 border rounded-md text-xs sm:text-sm font-medium
               ${formData.foodType === 'grain'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          Grain
        </button>
        <button
          type="button"
          on:click={() => setFoodType('protein')}
          class={`py-2 px-2 border rounded-md text-xs sm:text-sm font-medium
               ${formData.foodType === 'protein'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          Protein
        </button>
        <button
          type="button"
          on:click={() => setFoodType('dairy')}
          class={`py-2 px-2 border rounded-md text-xs sm:text-sm font-medium
               ${formData.foodType === 'dairy'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          Dairy
        </button>
        <button
          type="button"
          on:click={() => setFoodType('mixed')}
          class={`py-2 px-2 border rounded-md text-xs sm:text-sm font-medium
               ${formData.foodType === 'mixed'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
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
          class={`py-2 px-2 border rounded-md text-xs sm:text-sm font-medium
               ${formData.consistency === 'puree'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          Puree
        </button>
        <button
          type="button"
          on:click={() => setConsistency('mashed')}
          class={`py-2 px-2 border rounded-md text-xs sm:text-sm font-medium
               ${formData.consistency === 'mashed'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          Mashed
        </button>
        <button
          type="button"
          on:click={() => setConsistency('small-pieces')}
          class={`py-2 px-2 border rounded-md text-xs sm:text-sm font-medium
               ${formData.consistency === 'small-pieces'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          Small Pieces
        </button>
        <button
          type="button"
          on:click={() => setConsistency('finger-food')}
          class={`py-2 px-2 border rounded-md text-xs sm:text-sm font-medium
               ${formData.consistency === 'finger-food'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
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
          class={`py-2 px-2 border rounded-md text-xs sm:text-sm font-medium
               ${formData.reaction === 'liked'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          Liked
        </button>
        <button
          type="button"
          on:click={() => setReaction('neutral')}
          class={`py-2 px-2 border rounded-md text-xs sm:text-sm font-medium
               ${formData.reaction === 'neutral'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          Neutral
        </button>
        <button
          type="button"
          on:click={() => setReaction('disliked')}
          class={`py-2 px-2 border rounded-md text-xs sm:text-sm font-medium
               ${formData.reaction === 'disliked'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          Disliked
        </button>
        <button
          type="button"
          on:click={() => setReaction('allergic')}
          class={`py-2 px-2 border rounded-md text-xs sm:text-sm font-medium
               ${formData.reaction === 'allergic'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
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
