<script lang="ts">
  import BaseForm from './BaseForm.svelte';
  import { createEventDispatcher } from 'svelte';

  export let baby: { id: string; name: string } | null = null;
  export let error: string = '';
  export let success: boolean = false;

  const dispatch = createEventDispatcher();

  // Milestone-specific form data
  let formData = {
    notes: '',
    category: 'motor',
    title: '',
    description: '',
    achievedAt: new Date().toISOString().slice(0, 16),
    timestamp: new Date().toISOString().slice(0, 16)
  };

  function handleSubmit() {
    dispatch('submit', { formData, type: 'milestone', babyId: baby?.id });
  }

  function handleCancel() {
    dispatch('cancel');
  }

  function setCategory(category: string) {
    formData.category = category;
  }
</script>

<BaseForm {baby} type="milestone" {error} {success} {formData} on:submit={handleSubmit} on:cancel={handleCancel}>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1">
      Category
    </label>
    <div class="grid grid-cols-2 gap-2">
      <button
        type="button"
        on:click={() => setCategory('motor')}
        class={`py-3 px-4 border rounded-md text-sm font-medium flex items-center justify-center
               ${formData.category === 'motor'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Motor Skills
      </button>
      <button
        type="button"
        on:click={() => setCategory('cognitive')}
        class={`py-3 px-4 border rounded-md text-sm font-medium flex items-center justify-center
               ${formData.category === 'cognitive'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        Cognitive
      </button>
      <button
        type="button"
        on:click={() => setCategory('social')}
        class={`py-3 px-4 border rounded-md text-sm font-medium flex items-center justify-center
               ${formData.category === 'social'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        Social
      </button>
      <button
        type="button"
        on:click={() => setCategory('language')}
        class={`py-3 px-4 border rounded-md text-sm font-medium flex items-center justify-center
               ${formData.category === 'language'
                 ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                 : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        Language
      </button>
    </div>
    <input type="hidden" name="category" bind:value={formData.category} required />
  </div>

  <div>
    <label for="title" class="block text-sm font-medium text-gray-700">
      Milestone Title
    </label>
    <div class="mt-1">
      <input
        type="text"
        id="title"
        name="title"
        bind:value={formData.title}
        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        required
        placeholder="e.g., First smile, Rolls over, First word"
      />
    </div>
  </div>

  <div>
    <label for="description" class="block text-sm font-medium text-gray-700">
      Description
    </label>
    <div class="mt-1">
      <textarea
        id="description"
        name="description"
        rows="3"
        bind:value={formData.description}
        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        placeholder="Detailed description of the milestone"
      ></textarea>
    </div>
  </div>

  <div>
    <label for="achievedAt" class="block text-sm font-medium text-gray-700">
      Achieved At
    </label>
    <div class="mt-1">
      <input
        type="datetime-local"
        id="achievedAt"
        name="achievedAt"
        bind:value={formData.achievedAt}
        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        required
      />
    </div>
  </div>

</BaseForm>
