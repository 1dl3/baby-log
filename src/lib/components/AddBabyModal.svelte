<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	// Props
	export let showModal = false;
	export let addingBaby = false;
	export let error = '';

	// State variables
	let newBabyName = '';
	let newBabyBirthDate = '';
	let newBabyGender: 'male' | 'female' | 'diverse' = 'male';
	let addBabyMode: 'create' | 'share' = 'create';
	let shareLink = '';
	let photoFile: File | null = null;
	let photoPreview: string | null = null;

	const dispatch = createEventDispatcher();

	function handlePhotoChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			photoFile = input.files[0];
			
			// Create a preview
			const reader = new FileReader();
			reader.onload = (e) => {
				photoPreview = e.target?.result as string;
			};
			reader.readAsDataURL(photoFile);
		}
	}

	function handleAddBaby() {
		if (addingBaby) return;

		const formData = new FormData();
		formData.append('name', newBabyName);
		formData.append('birthDate', newBabyBirthDate);
		formData.append('gender', newBabyGender);
		
		if (photoFile) {
			formData.append('photo', photoFile);
		}

		dispatch('addBaby', { formData });
	}

	function handleAddBabyByShareCode() {
		if (addingBaby) return;

		// Extract the share code from the input
		let shareCode = shareLink.trim();

		// If it's a URL, extract the code from it
		if (shareCode.includes('/')) {
			const parts = shareCode.split('/');
			shareCode = parts[parts.length - 1];
		}

		dispatch('addBabyByShareCode', { shareCode });
	}

	function closeModal() {
		// Reset form values
		newBabyName = '';
		newBabyBirthDate = '';
		newBabyGender = 'male';
		addBabyMode = 'create';
		shareLink = '';
		photoFile = null;
		photoPreview = null;
		
		dispatch('close');
	}
</script>

{#if showModal}
	<div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

	<div transition:fade={{ duration: 200 }} class="fixed z-10 backdrop:backdrop-blur-2xl inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">

		<div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">

			<span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

			<div
				in:fly={{ y: 10, duration: 300 }}
				class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 z-20"
			>
				<div class="absolute top-0 right-0 pt-4 pr-4">
					<button
						on:click={closeModal}
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
								Füge ein neues Baby hinzu oder verwende einen Teilungscode.
							</p>
						</div>
					</div>
				</div>

				<!-- Tabs -->
				<div class="mt-4 border-b border-gray-200">
					<div class="flex -mb-px">
						<button
							type="button"
							class={"w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm " + 
								(addBabyMode === 'create' 
									? "border-indigo-500 text-indigo-600" 
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300")}
							on:click={() => addBabyMode = 'create'}
						>
							Neues Baby erstellen
						</button>
						<button
							type="button"
							class={"w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm " + 
								(addBabyMode === 'share' 
									? "border-indigo-500 text-indigo-600" 
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300")}
							on:click={() => addBabyMode = 'share'}
						>
							Teilungscode verwenden
						</button>
					</div>
				</div>

				{#if addBabyMode === 'create'}
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
						<div>
							<label for="photo" class="block text-sm font-medium text-gray-700">Foto (optional)</label>
							<div class="mt-2 flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
								<div class="flex-shrink-0">
									{#if photoPreview}
										<div class="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 shadow-sm">
											<img src={photoPreview} alt="Vorschau" class="w-full h-full object-cover" />
											<button 
												type="button" 
												on:click={() => { photoFile = null; photoPreview = null; }}
												class="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
											>
												×
											</button>
										</div>
									{:else}
										<div class="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center shadow-sm">
											<svg class="h-12 w-12 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
												<path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
											</svg>
										</div>
									{/if}
								</div>
								<div class="flex-grow w-full">
									<div class="flex items-center justify-center w-full">
										<label for="photo" class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors">
											<div class="flex flex-col items-center justify-center pt-5 pb-6">
												<svg class="w-8 h-8 mb-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
												</svg>
												<p class="mb-2 text-sm text-gray-500"><span class="font-semibold">Klicke zum Hochladen</span> oder ziehe eine Datei hierher</p>
												<p class="text-xs text-gray-500">PNG, JPG oder JPEG (max. 10MB)</p>
											</div>
											<input
												id="photo"
												type="file"
												accept="image/*"
												on:change={handlePhotoChange}
												class="hidden"
											/>
										</label>
									</div>
									{#if photoFile}
										<div class="mt-2 flex items-center text-sm text-gray-500">
											<svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
												<path fill-rule="evenodd" d="M8 4a3 3 0 00-3 3v4a3 3 0 006 0V7a1 1 0 112 0v4a5 5 0 01-10 0V7a5 5 0 0110 0v1.5a1.5 1.5 0 01-3 0V7a1 1 0 012 0v1.5a.5.5 0 001 0V7a3 3 0 00-3-3z" clip-rule="evenodd" />
											</svg>
											{photoFile.name}
										</div>
									{/if}
								</div>
							</div>
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
								on:click={closeModal}
								class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
							>
								Abbrechen
							</button>
						</div>
					</form>
				{:else}
					<form on:submit|preventDefault={handleAddBabyByShareCode} class="mt-5 sm:mt-6 space-y-4">
						<div>
							<label for="share-link" class="block text-sm font-medium text-gray-700">Teilungscode oder Link</label>
							<input
								id="share-link"
								type="text"
								bind:value={shareLink}
								required
								placeholder="z.B. https://Baby Log.de/baby/share/abc123 oder abc123"
								class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
							/>
							<p class="mt-1 text-xs text-gray-500">
								Gib den Teilungscode oder den vollständigen Link ein, den du erhalten hast.
							</p>
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
								on:click={closeModal}
								class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
							>
								Abbrechen
							</button>
						</div>
					</form>
				{/if}
			</div>
		</div>
	</div>
{/if}