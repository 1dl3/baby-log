<script lang="ts">
 import { onMount } from 'svelte';
 import { goto } from '$app/navigation';
 import { fade, fly } from 'svelte/transition';
 import { flip } from 'svelte/animate';
 import { user } from '$lib/stores/user';
 import AddBabyModal from '$lib/components/AddBabyModal.svelte';
 import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
 import { calculateAge } from '$lib/utils';

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
	let addingBaby = false;
	let successMessage = '';
	let showSuccessMessage = false;

	// Confirmation dialog state
	let showConfirmDialog = false;
	let babyToDelete: string | null = null;

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


	async function handleAddBaby(event: CustomEvent) {
		if (addingBaby) return;

		addingBaby = true;
		error = '';

		try {
			const { formData } = event.detail;

			const res = await fetch('/api/babies', {
				method: 'POST',
				body: formData
			});

			if (!res.ok) throw new Error('Failed to add baby');

			const newBaby = await res.json();
			babies = [...babies, newBaby];
			showAddBabyModal = false;

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

	async function handleAddBabyByShareCode(event: CustomEvent) {
		if (addingBaby) return;

		addingBaby = true;
		error = '';

		try {
			const { shareCode } = event.detail;

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

			// Close modal
			showAddBabyModal = false;

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

	function confirmDeleteBaby(id: string) {
		babyToDelete = id;
		showConfirmDialog = true;
	}

	async function deleteBaby() {
		if (!babyToDelete) return;

		const id = babyToDelete;
		babyToDelete = null;

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
									on:click={() => confirmDeleteBaby(baby.id)}
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
<AddBabyModal 
	showModal={showAddBabyModal} 
	addingBaby={addingBaby} 
	{error}
	on:addBaby={handleAddBaby}
	on:addBabyByShareCode={handleAddBabyByShareCode}
	on:close={() => showAddBabyModal = false}
/>

<!-- Confirmation Dialog -->
<ConfirmDialog
	bind:showDialog={showConfirmDialog}
	title="Baby löschen"
	message="Bist du sicher, dass du dieses Baby löschen möchtest? Alle zugehörigen Daten werden unwiderruflich gelöscht."
	confirmText="Löschen"
	cancelText="Abbrechen"
	on:confirm={deleteBaby}
/>
