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
</script>

<BaseForm {baby} type="milestone" {error} {success} {formData} on:submit={handleSubmit} on:cancel={handleCancel}>
  <div>
    <label for="category" class="block text-sm font-medium text-gray-700">
      Category
    </label>
    <div class="mt-1">
      <select
        id="category"
        name="category"
        bind:value={formData.category}
        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        required
      >
        <option value="motor">Motor Skills</option>
        <option value="cognitive">Cognitive</option>
        <option value="social">Social</option>
        <option value="language">Language</option>
      </select>
    </div>
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

  <div>
    <label for="photo" class="block text-sm font-medium text-gray-700">
      Photo (Optional)
    </label>
    <div class="mt-1">
      <input
        type="file"
        id="photo"
        name="photo"
        accept="image/*"
        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
      />
    </div>
  </div>
</BaseForm>