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
</script>

<BaseForm {baby} type="feeding" {error} {success} {formData} on:submit={handleSubmit} on:cancel={handleCancel}>
  <div>
    <label for="feedingType" class="block text-sm font-medium text-gray-700">
      Feeding Type
    </label>
    <div class="mt-1">
      <select
        id="feedingType"
        name="feedingType"
        bind:value={formData.feedingType}
        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        required
      >
        <option value="bottle">Bottle</option>
        <option value="nursing">Nursing</option>
        <option value="solid">Solid Food</option>
      </select>
    </div>
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
    <label for="foodType" class="block text-sm font-medium text-gray-700">
      Food Type
    </label>
    <div class="mt-1">
      <select
        id="foodType"
        name="foodType"
        bind:value={formData.foodType}
        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        required
      >
        <option value="fruit">Fruit</option>
        <option value="vegetable">Vegetable</option>
        <option value="grain">Grain</option>
        <option value="protein">Protein</option>
        <option value="dairy">Dairy</option>
        <option value="mixed">Mixed</option>
      </select>
    </div>
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
    <label for="consistency" class="block text-sm font-medium text-gray-700">
      Consistency
    </label>
    <div class="mt-1">
      <select
        id="consistency"
        name="consistency"
        bind:value={formData.consistency}
        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
      >
        <option value="puree">Puree</option>
        <option value="mashed">Mashed</option>
        <option value="small-pieces">Small Pieces</option>
        <option value="finger-food">Finger Food</option>
      </select>
    </div>
  </div>

  <div>
    <label for="reaction" class="block text-sm font-medium text-gray-700">
      Baby's Reaction
    </label>
    <div class="mt-1">
      <select
        id="reaction"
        name="reaction"
        bind:value={formData.reaction}
        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
      >
        <option value="liked">Liked</option>
        <option value="neutral">Neutral</option>
        <option value="disliked">Disliked</option>
        <option value="allergic">Allergic Reaction</option>
      </select>
    </div>
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