<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { fade, fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { user } from '$lib/stores/user';

	// Define types for our data
	interface Baby {
		id: string;
		name: string;
		birthDate: string;
		gender: 'male' | 'female' | 'diverse';
		photoUrl?: string;
	}

	// State variables
	let babies: Baby[] = [];
	let loading = true;
	let error = '';
	let showAddBabyModal = false;
	let newBabyName = '';
	let newBabyBirthDate = '';
	let newBabyGender: 'male' | 'female' | 'diverse' = 'male';
	let addBabyMode: 'create' | 'share' = 'create';
	let shareLink = '';
	let addingBaby = false;
	let successMessage = '';
	let showSuccessMessage = false;
	let photoFile: File | null = null;
	let photoPreview: string | null = null;

	// Map for gender icons and colors
	const genderIcons = {
		male: { icon: '👦', color: 'bg-blue-100 text-blue-800' },
		female: { icon: '👧', color: 'bg-pink-100 text-pink-800' },
		diverse: { icon: '👶', color: 'bg-purple-100 text-purple-800' }
	};

	onMount(async () => {
		if (!$user) {
			goto('/login');
			return;
		}
		
		await loadBabies();
	});

	async function loadBabies() {
		try {
			const res = await fetch('/api/babies');
			if (!res.ok) {
				if (res.status === 401) {
					goto('/login');
					return;
				}
				throw new Error('Failed to fetch babies');
			}
			babies = await res.json();
		} catch (err) {
			console.error('Error loading babies:', err);
			error = 'Fehler beim Laden der Babydaten';
		} finally {
			loading = false;
		}
	}

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

	async function handleAddBaby() {
		if (addingBaby) return;

		addingBaby = true;
		error = '';

		try {
			const formData = new FormData();
			formData.append('name', newBabyName);
			formData.append('birthDate', newBabyBirthDate);
			formData.append('gender', newBabyGender);
			
			if (photoFile) {
				formData.append('photo', photoFile);
			}

			const res = await fetch('/api/babies', {
				method: 'POST',
				body: formData
			});

			if (!res.ok) throw new Error('Failed to add baby');

			const newBaby = await res.json();
			babies = [...babies, newBaby];
			showAddBabyModal = false;
			newBabyName = '';
			newBabyBirthDate = '';
			newBabyGender = 'male';
			photoFile = null;
			photoPreview = null;

			// Show success message
			successMessage = 'Baby erfolgreich hinzugefügt!';
			showSuccessMessage = true;
			setTimeout(() => {
				showSuccessMessage = false;
			}, 3000);

		} catch (err) {
			console.error('Error adding baby:', err);
			error = 'Fehler beim Hinzufügen des Babys';
		} finally {
			addingBaby = false;
		}
	}

	async function handleAddBabyByShareCode() {
		if (addingBaby) return;

		addingBaby = true;
		error = '';

		try {
			// Extract the share code from the input
			let shareCode = shareLink.trim();

			// If it's a URL, extract the code from it
			if (shareCode.includes('/')) {
				const parts = shareCode.split('/');
				shareCode = parts[parts.length - 1];
			}

			// Make API request to add the baby using the share code
			const res = await fetch('/api/babies/share', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ shareCode })
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.error || 'Failed to add baby');
			}

			// Refresh the babies list
			await loadBabies();

			// Close modal and reset form
			showAddBabyModal = false;
			shareLink = '';
			addBabyMode = 'create';

			// Show success message
			successMessage = 'Baby erfolgreich hinzugefügt!';
			showSuccessMessage = true;
			setTimeout(() => {
				showSuccessMessage = false;
			}, 3000);

		} catch (err) {
			console.error('Error adding baby by share code:', err);
			error = err.message || 'Fehler beim Hinzufügen des Babys';
		} finally {
			addingBaby = false;
		}
	}

	async function deleteBaby(id: string) {
		if (!confirm('Bist du sicher, dass du dieses Baby löschen möchtest? Alle zugehörigen Daten werden unwiderruflich gelöscht.')) {
			return;
		}

		try {
			const res = await fetch(`/api/babies/${id}`, {
				method: 'DELETE'
			});

			if (!res.ok) throw new Error('Failed to delete baby');

			// Remove the deleted baby from the list
			babies = babies.filter(baby => baby.id !== id);

			// Show success message
			successMessage = 'Baby erfolgreich gelöscht!';
			showSuccessMessage = true;
			setTimeout(() => {
				showSuccessMessage = false;
			}, 3000);
		} catch (err) {
			console.error('Error deleting baby:', err);
			error = 'Fehler beim Löschen des Babys';
		}
	}

	// Format date to a more readable format
	function formatDate(dateString: string) {
		const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
		return new Date(dateString).toLocaleDateString('de-DE', options);
	}

	// Calculate age in months or days
	function calculateAge(birthDate: string) {
		const birth = new Date(birthDate);
		const now = new Date();

		const diffTime = Math.abs(now.getTime() - birth.getTime());
		const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays < 30) {
			return `${diffDays} Tage alt`;
		} else {
			const months = Math.floor(diffDays / 30);
			return `${months} ${months === 1 ? 'Monat' : 'Monate'} alt`;
		}
	}
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Page header -->
	<div class="md:flex md:items-center md:justify-between mb-8">
		<div class="flex-1 min-w-0">
			<h1 class="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">Einstellungen</h1>
			<p class="mt-1 text-sm text-gray-500">Verwalte deine Babys und Kontoeinstellungen.</p>
		</div>
	</div>

	<!-- Success message -->
	{#if showSuccessMessage}
		<div transition:fade={{ duration: 300 }} class="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded shadow-sm">
			<div class="flex">
				<div class="flex-shrink-0">
					<svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
					</svg>
				</div>
				<div class="ml-3">
					<p class="text-sm text-green-700">{successMessage}</p>
				</div>
			</div>
		</div>
	{/if}

	<!-- Error message -->
	{#if error}
		<div transition:fade={{ duration: 300 }} class="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded shadow-sm">
			<div class="flex">
				<div class="flex-shrink-0">
					<svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
					</svg>
				</div>
				<div class="ml-3">
					<p class="text-sm text-red-700">{error}</p>
				</div>
			</div>
		</div>
	{/if}

	<!-- Baby Management Section -->
	<div class="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
		<div class="px-4 py-5 sm:px-6 flex justify-between items-center">
			<div>
				<h3 class="text-lg leading-6 font-medium text-gray-900">Baby-Verwaltung</h3>
				<p class="mt-1 max-w-2xl text-sm text-gray-500">Verwalte deine Babys und deren Einstellungen.</p>
			</div>
			<div>
				<button
					on:click={() => (showAddBabyModal = true)}
					class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
				>
					<svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
						<path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
					</svg>
					Neues Baby hinzufügen
				</button>
			</div>
		</div>

		{#if loading}
			<div class="flex flex-col items-center justify-center h-64">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
				<p class="mt-4 text-sm text-gray-500">Lade Babydaten...</p>
			</div>
		{:else if babies.length === 0}
			<div class="px-4 py-16 sm:px-6 text-center">
				<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
				<h3 class="mt-2 text-lg font-medium text-gray-900">Keine Babys gefunden</h3>
				<p class="mt-1 text-sm text-gray-500">Füge dein erstes Baby hinzu, um loszulegen.</p>
				<div class="mt-6">
					<button
						on:click={() => (showAddBabyModal = true)}
						class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
					>
						<svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
							<path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
						</svg>
						Neues Baby hinzufügen
					</button>
				</div>
			</div>
		{:else}
			<ul class="divide-y divide-gray-200">
				{#each babies as baby, i (baby.id)}
					<li 
						in:fly={{ y: 20, duration: 300, delay: i * 100 }}
						out:fade={{ duration: 200 }}
						animate:flip={{ duration: 300 }}
						class="px-4 py-4 sm:px-6 hover:bg-gray-50"
					>
						<div class="flex items-center justify-between">
							<div class="flex items-center">
								<div class={`flex-shrink-0 h-12 w-12 rounded-full ${genderIcons[baby.gender]?.color || 'bg-gray-100'} flex items-center justify-center`}>
									{#if baby?.photoUrl}
										<div class="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100">
											<img src={baby.photoUrl} alt={baby.name} class="w-full h-full object-cover" />
										</div>
									{:else}
										<span class="text-2xl">{genderIcons[baby.gender]?.icon || '👶'}</span>
									{/if}
								</div>
								<div class="ml-4">
									<h4 class="text-lg font-medium text-gray-900">{baby.name}</h4>
									<p class="text-sm text-gray-500">
										{formatDate(baby.birthDate)} · {calculateAge(baby.birthDate)}
									</p>
								</div>
							</div>
							<div class="flex space-x-2">
								<a 
									href="/baby/{baby.id}/details" 
									class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
								>
									<svg class="-ml-0.5 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
										<path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
										<path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
									</svg>
									Details
								</a>
								<button 
									on:click={() => deleteBaby(baby.id)}
									class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
								>
									<svg class="-ml-0.5 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
										<path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
									</svg>
									Löschen
								</button>
							</div>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	<!-- Account Settings Section (placeholder for future expansion) -->
	<div class="bg-white shadow overflow-hidden sm:rounded-lg">
		<div class="px-4 py-5 sm:px-6">
			<h3 class="text-lg leading-6 font-medium text-gray-900">Kontoeinstellungen</h3>
			<p class="mt-1 max-w-2xl text-sm text-gray-500">Verwalte deine persönlichen Einstellungen.</p>
		</div>
		<div class="border-t border-gray-200 px-4 py-5 sm:px-6">
			<dl class="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
				<div class="sm:col-span-1">
					<dt class="text-sm font-medium text-gray-500">Name</dt>
					<dd class="mt-1 text-sm text-gray-900">{$user?.name || 'Nicht angegeben'}</dd>
				</div>
				<div class="sm:col-span-1">
					<dt class="text-sm font-medium text-gray-500">E-Mail</dt>
					<dd class="mt-1 text-sm text-gray-900">{$user?.email}</dd>
				</div>
				<div class="sm:col-span-2">
					<dt class="text-sm font-medium text-gray-500">E-Mail-Verifizierung</dt>
					<dd class="mt-1 text-sm text-gray-900">
						{#if $user?.emailVerified}
							<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
								Verifiziert
							</span>
						{:else}
							<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
								Nicht verifiziert
							</span>
						{/if}
					</dd>
				</div>
			</dl>
		</div>
	</div>
</div>

<!-- Add Baby Modal -->
{#if showAddBabyModal}
	<div transition:fade={{ duration: 200 }} class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
		<div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
<!--			<div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>-->

			<span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

			<div
				in:fly={{ y: 10, duration: 300 }}
				class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 z-20"
			>
				<div class="absolute top-0 right-0 pt-4 pr-4">
					<button
						on:click={() => {
							showAddBabyModal = false;
							photoFile = null;
							photoPreview = null;
						}}
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
							<div class="mt-1 flex items-center">
								{#if photoPreview}
									<div class="relative h-12 w-12 rounded-full overflow-hidden bg-gray-100">
										<img src={photoPreview} alt="Preview" class="h-full w-full object-cover" />
										<button 
											type="button" 
											on:click={() => { photoFile = null; photoPreview = null; }}
											class="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
										>
											×
										</button>
									</div>
								{:else}
									<span class="h-12 w-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
										<svg class="h-8 w-8 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
											<path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
										</svg>
									</span>
								{/if}
								<input
									id="photo"
									name="photo"
									type="file"
									accept="image/*"
									on:change={handlePhotoChange}
									class="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
								/>
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
								on:click={() => {
									showAddBabyModal = false;
									photoFile = null;
									photoPreview = null;
								}}
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
								on:click={() => (showAddBabyModal = false)}
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