<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';

	export let baby: { id: string; name: string } | null = null;
	export let type: string;
	export let error: string = '';
	export let success: boolean = false;
	export let enablePhotoUpload: boolean = true;

	const dispatch = createEventDispatcher();

	// Common form data that all forms might use
	export let formData = {
		notes: '',
		photos: [] as File[],
		timestamp: new Date().toISOString().slice(0, 16) // Format: YYYY-MM-DDThh:mm
	};

	// Function to handle photo change
	function handlePhotoChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files) {
			formData.photos = Array.from(input.files);
		}
	}

	// Function to remove a photo by index
	function removePhoto(index: number) {
		formData.photos = formData.photos?.filter((_, i) => i !== index);
	}

	// Function to handle form submission - can be overridden by specific forms
	export async function handleSubmit() {
		// Check if photo upload is enabled and photos are selected
		if (enablePhotoUpload && formData.photos?.length > 0) {
			try {
				// First, upload photos to temporary folder
				const formDataObj = new FormData();

				// Add all photos
				formData.photos?.forEach(photo => {
					formDataObj.append('photos', photo);
				});

				// Upload photos to temp folder
				const response = await fetch('/api/upload-temp', {
					method: 'POST',
					body: formDataObj
				});

				if (!response.ok) {
					throw new Error('Failed to upload photos');
				}

				const result = await response.json();

				if (!result.success) {
					throw new Error(result.error || 'Failed to upload photos');
				}

				// Now create JSON submission with temp photo paths
				const submissionData: any = { ...formData };
				delete submissionData.photos; // Remove photos array from JSON submission
				submissionData.tempPhotoPaths = result.tempPaths; // Add temp photo paths

				dispatch('submit', { formData: submissionData, type, babyId: baby?.id });
			} catch (error) {
				console.error('Error uploading photos:', error);
				dispatch('error', error.message || 'Failed to upload photos');
			}
		} else {
			// Regular JSON submission without photos
			const submissionData = { ...formData };
			delete submissionData.photos; // Remove photos array from JSON submission
			dispatch('submit', { formData: submissionData, type, babyId: baby?.id });
		}
	}

	// Map for form type icons and titles
	const formTypeInfo = {
		diaper: { icon: '🧷', title: 'Windel wechseln' },
		feeding: { icon: '🍼', title: 'Fütterung' },
		nursing: { icon: '👩‍🍼', title: 'Stillen' },
		photo: { icon: '📷', title: 'Foto' },
		photos: { icon: '📷', title: 'Fotos' },
		size: { icon: '📏', title: 'Größe' },
		weight: { icon: '⚖️', title: 'Gewicht' },
		measurement: { icon: '📊', title: 'Messung' },
		sleep: { icon: '😴', title: 'Schlaf' },
		medication: { icon: '💊', title: 'Medikament' },
		milestone: { icon: '🏆', title: 'Meilenstein' }
	};

	// Get form title based on type
	const formTitle = formTypeInfo[type]?.title || type;
	const formIcon = formTypeInfo[type]?.icon || '📝';
</script>

<form class="space-y-6" on:submit|preventDefault={handleSubmit}>
	<!-- Form header with icon and title -->
	<div class="flex items-center mb-6 pb-3 border-b border-gray-200">
		<div class="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
			<span class="text-xl">{formIcon}</span>
		</div>
		<h2 class="ml-3 text-lg font-medium text-gray-900">{formTitle}
			{#if baby}für {baby.name}{/if}
		</h2>
	</div>

	<slot></slot>

	{#if enablePhotoUpload}
		<!-- Photo upload field -->
		<div class="bg-gray-50 p-4 rounded-lg">
			<label for="photos" class="block text-sm font-medium text-gray-700">
				Fotos (Optional)
			</label>
			<div class="mt-2">
				<div class="flex items-center justify-center w-full">
					<label for="photos"
								 class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50">
						<div class="flex flex-col items-center justify-center pt-5 pb-6">
							<svg class="w-8 h-8 mb-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"
									 xmlns="http://www.w3.org/2000/svg">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
											d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
							</svg>
							<p class="mb-2 text-sm text-gray-500"><span class="font-semibold">Klicke zum Hochladen</span> oder ziehe
								Dateien hierher</p>
							<p class="text-xs text-gray-500">PNG, JPG oder JPEG (max. 10MB)</p>
						</div>
						<input
							type="file"
							id="photos"
							name="photos"
							accept="image/*"
							multiple
							on:change={handlePhotoChange}
							class="hidden"
						/>
					</label>
				</div>
			</div>
			<p class="mt-2 text-xs text-gray-500">
				Halte Strg/Cmd gedrückt, um mehrere Dateien auszuwählen
			</p>
		</div>

		<!-- Photo previews -->
		{#if formData.photos?.length > 0}
			<div class="mt-4" transition:fade={{ duration: 200 }}>
				<h4 class="text-sm font-medium text-gray-700 mb-2">Ausgewählte Fotos ({formData.photos?.length}):</h4>
				<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
					{#each formData.photos as photo, index (photo.name + index)}
						<div class="relative group" transition:fade={{ duration: 200 }}>
							<img
								src={URL.createObjectURL(photo)}
								alt="Vorschau"
								class="h-24 w-full object-cover rounded-md shadow-sm group-hover:opacity-75 transition-opacity"
							/>
							<button
								type="button"
								class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center shadow-sm hover:bg-red-600 transition-colors"
								on:click={() => removePhoto(index)}
								title="Foto entfernen"
							>
								<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
									<path fill-rule="evenodd"
												d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
												clip-rule="evenodd" />
								</svg>
							</button>
							<p class="text-xs text-gray-500 mt-1 truncate">{photo.name}</p>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	{/if}

	<!-- Common notes field that most forms have -->
	<div>
		<label for="notes" class="block text-sm font-medium text-gray-700">
			Notizen
		</label>
		<div class="mt-1">
      <textarea
				id="notes"
				name="notes"
				rows="3"
				bind:value={formData.notes}
				class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
				placeholder="Zusätzliche Notizen"
			></textarea>
		</div>
	</div>

	<!-- Common form buttons -->
	<div class="flex space-x-4 pt-4">
		<button
			type="button"
			class="w-1/2 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
			on:click={() => dispatch('cancel')}
		>
			Abbrechen
		</button>
		<button
			type="submit"
			class="w-1/2 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
		>
			Speichern
		</button>
	</div>
</form>
