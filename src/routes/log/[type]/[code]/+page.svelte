<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';

  let type = page.params.type;
  let code = page.params.code;
  let baby: { id: string; name: string } | null = null;
  let loading = true;
  let error = '';
  let success = false;

  let formData = {
    notes: '',
    duration: 0,
    amount: 0,
    side: 'both',
    photoUrl: '',
    height: 0,
    weight: 0,
    photos: [] as File[],
    diaperType: 'both',
    feedingType: 'bottle',
    // Enhanced feeding fields
    foodType: '',
    foodDetails: '',
    consistency: '',
    reaction: '',
    // Enhanced measurement fields
    headCircumference: 0,
    temperature: 0,
    teethCount: 0,
    measurementType: 'routine',
    measurementLocation: 'home',
    // Sleep tracking fields
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date().toISOString().slice(0, 16),
    quality: 'good',
    location: 'crib',
    // Medication tracking fields
    medicationName: '',
    dosage: '',
    unit: 'ml',
    reason: '',
    administeredAt: new Date().toISOString().slice(0, 16),
    // Milestone tracking fields
    category: 'motor',
    title: '',
    description: '',
    achievedAt: new Date().toISOString().slice(0, 16),
    timestamp: new Date().toISOString().slice(0, 16) // Format: YYYY-MM-DDThh:mm
  };

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

  function handlePhotoChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      formData.photos = Array.from(input.files);
    }
  }

  async function handleSubmit() {
    try {
      const endpoint = `/api/baby-log/${type}`;
      let response;

      if (type === 'photo') {
        // Handle photo upload with FormData
        const photoInput = document.getElementById('photo') as HTMLInputElement;
        if (!photoInput.files || photoInput.files.length === 0) {
          error = 'Please select a photo to upload';
          return;
        }

        const formDataObj = new FormData();
        formDataObj.append('photo', photoInput.files[0]);
        formDataObj.append('babyId', baby.id);
        formDataObj.append('notes', formData.notes);

        response = await fetch(endpoint, {
          method: 'POST',
          body: formDataObj
        });
      } else if (type === 'photos') {
        // Handle multiple photos upload with FormData
        if (formData.photos.length === 0) {
          error = 'Please select at least one photo to upload';
          return;
        }

        const itemIdInput = document.getElementById('itemId') as HTMLInputElement;
        const itemTypeInput = document.getElementById('itemType') as HTMLSelectElement;

        if (!itemIdInput.value || !itemTypeInput.value) {
          error = 'Please provide item ID and type';
          return;
        }

        const formDataObj = new FormData();
        formData.photos.forEach(photo => {
          formDataObj.append('photos', photo);
        });
        formDataObj.append('itemId', itemIdInput.value);
        formDataObj.append('itemType', itemTypeInput.value);
        formDataObj.append('babyId', baby.id);
        formDataObj.append('notes', formData.notes);

        response = await fetch(endpoint, {
          method: 'POST',
          body: formDataObj
        });
      } else {
        // Handle other log types with JSON
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            babyId: baby.id,
            ...formData
          })
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save log');
      }

      success = true;
    } catch (e) {
      console.log(e)
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
                    on:click={() => {
                      success = false;
                      formData = {
                        ...formData,
                        notes: '',
                        timestamp: new Date().toISOString().slice(0, 16)
                      };
                    }}
                  >
                    Add another log
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      {:else}
        <form class="space-y-6" on:submit|preventDefault={handleSubmit}>
          {#if type === 'sleep'}
            <div>
              <label for="startTime" class="block text-sm font-medium text-gray-700">
                Start Time
              </label>
              <div class="mt-1">
                <input
                  type="datetime-local"
                  id="startTime"
                  name="startTime"
                  bind:value={formData.startTime}
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            <div>
              <label for="endTime" class="block text-sm font-medium text-gray-700">
                End Time
              </label>
              <div class="mt-1">
                <input
                  type="datetime-local"
                  id="endTime"
                  name="endTime"
                  bind:value={formData.endTime}
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <p class="mt-1 text-sm text-gray-500">Leave empty if sleep is ongoing</p>
            </div>

            <div>
              <label for="quality" class="block text-sm font-medium text-gray-700">
                Sleep Quality
              </label>
              <div class="mt-1">
                <select
                  id="quality"
                  name="quality"
                  bind:value={formData.quality}
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
            </div>

            <div>
              <label for="location" class="block text-sm font-medium text-gray-700">
                Sleep Location
              </label>
              <div class="mt-1">
                <select
                  id="location"
                  name="location"
                  bind:value={formData.location}
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="crib">Crib</option>
                  <option value="bed">Bed</option>
                  <option value="stroller">Stroller</option>
                  <option value="car-seat">Car Seat</option>
                  <option value="parents-bed">Parents' Bed</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

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
                  placeholder="Any additional details about the sleep session"
                ></textarea>
              </div>
            </div>
          {:else if type === 'medication'}
            <div>
              <label for="medicationName" class="block text-sm font-medium text-gray-700">
                Medication Name
              </label>
              <div class="mt-1">
                <input
                  type="text"
                  id="medicationName"
                  name="medicationName"
                  bind:value={formData.medicationName}
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  required
                  placeholder="e.g., Paracetamol, Ibuprofen"
                />
              </div>
            </div>

            <div>
              <label for="dosage" class="block text-sm font-medium text-gray-700">
                Dosage
              </label>
              <div class="mt-1">
                <input
                  type="text"
                  id="dosage"
                  name="dosage"
                  bind:value={formData.dosage}
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  required
                  placeholder="e.g., 5, 2.5"
                />
              </div>
            </div>

            <div>
              <label for="unit" class="block text-sm font-medium text-gray-700">
                Unit
              </label>
              <div class="mt-1">
                <select
                  id="unit"
                  name="unit"
                  bind:value={formData.unit}
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  required
                >
                  <option value="ml">ml</option>
                  <option value="mg">mg</option>
                  <option value="drops">drops</option>
                  <option value="tablet">tablet</option>
                  <option value="teaspoon">teaspoon</option>
                </select>
              </div>
            </div>

            <div>
              <label for="reason" class="block text-sm font-medium text-gray-700">
                Reason
              </label>
              <div class="mt-1">
                <input
                  type="text"
                  id="reason"
                  name="reason"
                  bind:value={formData.reason}
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="e.g., Fever, Cold, Cough"
                />
              </div>
            </div>

            <div>
              <label for="administeredAt" class="block text-sm font-medium text-gray-700">
                Administered At
              </label>
              <div class="mt-1">
                <input
                  type="datetime-local"
                  id="administeredAt"
                  name="administeredAt"
                  bind:value={formData.administeredAt}
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

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
                  placeholder="Any additional details about the medication"
                ></textarea>
              </div>
            </div>
          {:else if type === 'milestone'}
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
                  placeholder="Any additional notes about this milestone"
                ></textarea>
              </div>
            </div>
          {:else if type === 'diaper'}
            <div>
              <label for="diaperType" class="block text-sm font-medium text-gray-700">
                Diaper Type
              </label>
              <div class="mt-1">
                <select
                  id="diaperType"
                  name="diaperType"
                  bind:value={formData.diaperType}
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  required
                >
                  <option value="wet">Wet</option>
                  <option value="dirty">Dirty</option>
                  <option value="both">Both</option>
                </select>
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
                  required
                  min="0"
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
                  required
                >
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                  <option value="both">Both</option>
                </select>
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
          {:else if type === 'photo'}
            <div>
              <label for="photo" class="block text-sm font-medium text-gray-700">
                Photo
              </label>
              <div class="mt-1">
                <input
                  type="file"
                  id="photo"
                  name="photo"
                  accept="image/*"
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  required
                />
              </div>
              <p class="mt-2 text-sm text-gray-500">
                Upload a photo of your baby
              </p>
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
          {:else if type === 'photos'}
            <div>
              <label for="photos" class="block text-sm font-medium text-gray-700">
                Photos
              </label>
              <div class="mt-1">
                <input
                  type="file"
                  id="photos"
                  name="photos"
                  accept="image/*"
                  multiple
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  on:change={handlePhotoChange}
                />
              </div>
              <p class="mt-2 text-sm text-gray-500">
                Upload multiple photos (hold Ctrl/Cmd to select multiple files)
              </p>
            </div>
            <div>
              <label for="itemId" class="block text-sm font-medium text-gray-700">
                Item ID
              </label>
              <div class="mt-1">
                <input
                  type="text"
                  id="itemId"
                  name="itemId"
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div>
              <label for="itemType" class="block text-sm font-medium text-gray-700">
                Item Type
              </label>
              <div class="mt-1">
                <select
                  id="itemType"
                  name="itemType"
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="diaperChange">Diaper Change</option>
                  <option value="feeding">Feeding</option>
                  <option value="nursing">Nursing</option>
                  <option value="measurement">Measurement</option>
                  <option value="sleep">Sleep</option>
                  <option value="medication">Medication</option>
                  <option value="milestone">Milestone</option>
                </select>
              </div>
            </div>
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
          {:else if type === 'size'}
            <div>
              <label for="height" class="block text-sm font-medium text-gray-700">
                Height (cm)
              </label>
              <div class="mt-1">
                <input
                  type="number"
                  id="height"
                  name="height"
                  bind:value={formData.height}
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  required
                  min="0"
                  step="0.1"
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
          {:else if type === 'weight'}
            <div>
              <label for="weight" class="block text-sm font-medium text-gray-700">
                Weight (kg)
              </label>
              <div class="mt-1">
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  bind:value={formData.weight}
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  required
                  min="0"
                  step="0.01"
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
          {:else if type === 'measurement'}
            <div>
              <label for="measurementType" class="block text-sm font-medium text-gray-700">
                Measurement Type
              </label>
              <div class="mt-1">
                <select
                  id="measurementType"
                  name="measurementType"
                  bind:value={formData.measurementType}
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  required
                >
                  <option value="routine">Routine Check</option>
                  <option value="sick">Sick Visit</option>
                  <option value="doctor">Doctor Visit</option>
                </select>
              </div>
            </div>

            <div>
              <label for="measurementLocation" class="block text-sm font-medium text-gray-700">
                Measurement Location
              </label>
              <div class="mt-1">
                <select
                  id="measurementLocation"
                  name="measurementLocation"
                  bind:value={formData.measurementLocation}
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="home">Home</option>
                  <option value="doctor">Doctor's Office</option>
                  <option value="hospital">Hospital</option>
                </select>
              </div>
            </div>

            <div>
              <label for="height" class="block text-sm font-medium text-gray-700">
                Height (cm)
              </label>
              <div class="mt-1">
                <input
                  type="number"
                  id="height"
                  name="height"
                  bind:value={formData.height}
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>

            <div>
              <label for="weight" class="block text-sm font-medium text-gray-700">
                Weight (kg)
              </label>
              <div class="mt-1">
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  bind:value={formData.weight}
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label for="headCircumference" class="block text-sm font-medium text-gray-700">
                Head Circumference (cm)
              </label>
              <div class="mt-1">
                <input
                  type="number"
                  id="headCircumference"
                  name="headCircumference"
                  bind:value={formData.headCircumference}
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>

            <div>
              <label for="temperature" class="block text-sm font-medium text-gray-700">
                Temperature (°C)
              </label>
              <div class="mt-1">
                <input
                  type="number"
                  id="temperature"
                  name="temperature"
                  bind:value={formData.temperature}
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  min="35"
                  max="42"
                  step="0.1"
                />
              </div>
            </div>

            <div>
              <label for="teethCount" class="block text-sm font-medium text-gray-700">
                Teeth Count
              </label>
              <div class="mt-1">
                <input
                  type="number"
                  id="teethCount"
                  name="teethCount"
                  bind:value={formData.teethCount}
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  min="0"
                  max="20"
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
          {/if}

          <div class="flex space-x-4">
            <button
              type="button"
              class="w-1/2 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              on:click={() => window.history.back()}
            >
              Cancel
            </button>
            <button
              type="submit"
              class="w-1/2 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save
            </button>
          </div>
        </form>
      {/if}
    </div>
  </div>
</div> 
