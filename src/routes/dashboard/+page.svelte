<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import { fade, fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';

 // Define types for our data
 interface Baby {
 	id: number;
 	name: string;
 	birthDate: string;
 	gender: 'male' | 'female' | 'diverse';
 	isShared?: boolean;
 	canEdit?: boolean;
 }

 interface LogEntry {
 	id: string;
 	babyId: string;
 	userId: string;
 	timestamp: string;
 	logType: string;
 	[key: string]: any; // For additional properties based on log type
 }

	interface QRCode {
		id: number;
		babyId: number;
		type: string;
		code: string;
	}

 export const data: PageData = {};
	let babies: Baby[] = [];
	let loading = true;
	let error = '';
	let selectedBaby: Baby | null = null;
	let showAddBabyModal = false;
	let newBabyName = '';
	let newBabyBirthDate = '';
	let newBabyGender: 'male' | 'female' | 'diverse' = 'male';
	let addBabyMode: 'create' | 'share' = 'create';
	let shareLink = '';
	let qrCodes: QRCode[] = [];
	let selectedQrType = 'diaper';
	let addingBaby = false;
	let showQrModal = false;
	let generatingQR = false;
	let successMessage = '';
	let showSuccessMessage = false;

	// Log entries state
	let logEntries: LogEntry[] = [];
	let loadingLogs = false;
	let logError = '';
	let currentPage = 1;
	let totalPages = 1;
	let logsPerPage = 10;
	let selectedLogType = 'all';

	// Map for gender icons and colors
	const genderIcons = {
		male: { icon: '👦', color: 'bg-blue-100 text-blue-800' },
		female: { icon: '👧', color: 'bg-pink-100 text-pink-800' },
		diverse: { icon: '👶', color: 'bg-purple-100 text-purple-800' }
	};

	// Map for QR code types
	const qrTypes = {
		diaper: { name: 'Windel wechseln', icon: '🧷' },
		feeding: { name: 'Fütterung', icon: '🍼' },
		nursing: { name: 'Stillen', icon: '👩‍🍼' },
		photo: { name: 'Foto', icon: '📷' },
		size: { name: 'Größe', icon: '📏' },
		weight: { name: 'Gewicht', icon: '⚖️' },
		measurement: { name: 'Messung', icon: '📊' },
		sleep: { name: 'Schlaf', icon: '😴' },
		medication: { name: 'Medikament', icon: '💊' },
		milestone: { name: 'Meilenstein', icon: '🏆' }
	};

	onMount(async () => {
		try {
			// Fetch owned babies
			const ownedRes = await fetch('/api/babies');
			if (!ownedRes.ok) {
				if (ownedRes.status === 401) {
					goto('/login');
					return;
				}
				throw new Error('Failed to fetch babies');
			}
			const ownedBabies = await ownedRes.json();

			// Fetch shared babies
			const sharedRes = await fetch('/api/babies/shared');
			let sharedBabies = [];

			if (sharedRes.ok) {
				const sharedData = await sharedRes.json();
				// Transform shared babies data to match the Baby interface
				sharedBabies = sharedData.map(item => ({
					...item.baby,
					isShared: true,
					canEdit: item.canEdit
				}));
			}

			// Combine owned and shared babies
			babies = [...ownedBabies, ...sharedBabies];
		} catch {
			error = 'Fehler beim Laden der Babydaten';
		} finally {
			loading = false;
		}
	});

	async function handleAddBaby() {
		if (addingBaby) return;

		addingBaby = true;
		error = '';

		try {
			const res = await fetch('/api/babies', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: newBabyName,
					birthDate: newBabyBirthDate,
					gender: newBabyGender
				})
			});

			if (!res.ok) throw new Error('Failed to add baby');

			const newBaby = await res.json();
			babies = [...babies, newBaby];
			showAddBabyModal = false;
			newBabyName = '';
			newBabyBirthDate = '';
			newBabyGender = 'male';

			// Select the newly added baby
			selectBaby(newBaby);

			// Show success message
			successMessage = 'Baby erfolgreich hinzugefügt!';
			showSuccessMessage = true;
			setTimeout(() => {
				showSuccessMessage = false;
			}, 3000);

		} catch {
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

			// Refresh the babies list - fetch both owned and shared babies
			const ownedRes = await fetch('/api/babies');
			if (!ownedRes.ok) {
				throw new Error('Failed to fetch babies');
			}
			const ownedBabies = await ownedRes.json();

			// Fetch shared babies
			const sharedRes = await fetch('/api/babies/shared');
			let sharedBabies = [];

			if (sharedRes.ok) {
				const sharedData = await sharedRes.json();
				// Transform shared babies data to match the Baby interface
				sharedBabies = sharedData.map(item => ({
					...item.baby,
					isShared: true,
					canEdit: item.canEdit
				}));
			}

			// Combine owned and shared babies
			babies = [...ownedBabies, ...sharedBabies];

			// Close modal and reset form
			showAddBabyModal = false;
			shareLink = '';
			addBabyMode = 'create';

			// Find and select the newly added baby (the last one added)
			// This is a simplification - in a real app, you might want to identify the specific baby that was added
			if (babies.length > 0) {
				const newlyAddedBaby = babies[babies.length - 1];
				selectBaby(newlyAddedBaby);
			}

			// Show success message
			successMessage = 'Baby erfolgreich hinzugefügt!';
			showSuccessMessage = true;
			setTimeout(() => {
				showSuccessMessage = false;
			}, 3000);

		} catch (err) {
			error = err.message || 'Fehler beim Hinzufügen des Babys';
		} finally {
			addingBaby = false;
		}
	}

	async function generateQrCode() {
		if (!selectedBaby || generatingQR) return;

		generatingQR = true;
		error = '';

		try {
			const response = await fetch('/api/qr-codes', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					babyId: selectedBaby.id,
					type: selectedQrType
				})
			});

			if (!response.ok) throw new Error('Failed to generate QR code');

			const data = await response.json();
			qrCodes = [...qrCodes, data];

			// Show success message
			successMessage = 'QR-Code erfolgreich generiert!';
			showSuccessMessage = true;
			setTimeout(() => {
				showSuccessMessage = false;
			}, 3000);

			showQrModal = false;
		} catch {
			error = 'Fehler beim Generieren des QR-Codes';
		} finally {
			generatingQR = false;
		}
	}

	// Format date to a more readable format
	function formatDate(dateString) {
		const options = { year: 'numeric', month: 'long', day: 'numeric' };
		return new Date(dateString).toLocaleDateString('de-DE', options);
	}

	// Calculate age in months or days
	function calculateAge(birthDate) {
		const birth = new Date(birthDate);
		const now = new Date();

		const diffTime = Math.abs(now - birth);
		const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays < 30) {
			return `${diffDays} Tage alt`;
		} else {
			const months = Math.floor(diffDays / 30);
			return `${months} ${months === 1 ? 'Monat' : 'Monate'} alt`;
		}
	}

	// Function to fetch log entries for the selected baby
	async function fetchLogEntries() {
		if (!selectedBaby) return;

		loadingLogs = true;
		logError = '';

		try {
			const params = new URLSearchParams({
				babyId: selectedBaby.id.toString(),
				page: currentPage.toString(),
				limit: logsPerPage.toString()
			});

			if (selectedLogType !== 'all') {
				params.append('type', selectedLogType);
			}

			const response = await fetch(`/api/baby-log?${params.toString()}`);

			if (!response.ok) {
				throw new Error('Failed to fetch log entries');
			}

			const data = await response.json();
			logEntries = data.entries;
			totalPages = data.pagination.totalPages;

		} catch (err) {
			logError = 'Fehler beim Laden der Protokolleinträge';
			console.error('Error fetching log entries:', err);
		} finally {
			loadingLogs = false;
		}
	}

	// Function to handle baby selection
	function selectBaby(baby: Baby) {
		selectedBaby = baby;
		currentPage = 1;
		fetchLogEntries();
	}
</script>

<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Page header -->
	<div class="md:flex md:items-center md:justify-between mb-8">
<!--		<div class="flex-1 min-w-0">-->
<!--			<h1 class="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">Dashboard</h1>-->
<!--			<p class="mt-1 text-sm text-gray-500">Verwalte deine Babys und generiere QR-Codes für schnelles-->
<!--				Protokollieren.</p>-->
<!--		</div>-->
		<div class="mt-4 flex md:mt-0 md:ml-4">
			<button
				on:click={() => (showAddBabyModal = true)}
				class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
			>
				<svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
						 aria-hidden="true">
					<path fill-rule="evenodd"
								d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
								clip-rule="evenodd" />
				</svg>
				Neues Baby hinzufügen
			</button>
		</div>
	</div>

	<!-- Success message -->
	{#if showSuccessMessage}
		<div transition:fade={{ duration: 300 }} class="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded shadow-sm">
			<div class="flex">
				<div class="flex-shrink-0">
					<svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
							 fill="currentColor">
						<path fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clip-rule="evenodd" />
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
						<path fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
									clip-rule="evenodd" />
					</svg>
				</div>
				<div class="ml-3">
					<p class="text-sm text-red-700">{error}</p>
				</div>
			</div>
		</div>
	{/if}

	<!-- Loading state -->
	{#if loading}
		<div class="flex flex-col items-center justify-center h-64">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
			<p class="mt-4 text-sm text-gray-500">Lade Babydaten...</p>
		</div>
		<!-- Empty state -->
	{:else if babies.length === 0}
		<div class="bg-white shadow overflow-hidden sm:rounded-lg">
			<div class="px-4 py-16 sm:px-6 text-center">
				<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"
						 aria-hidden="true">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
								d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
				<h3 class="mt-2 text-lg font-medium text-gray-900">Keine Babys gefunden</h3>
				<p class="mt-1 text-sm text-gray-500">Füge dein erstes Baby hinzu, um loszulegen.</p>
				<div class="mt-6">
					<button
						on:click={() => (showAddBabyModal = true)}
						class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
					>
						<svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
								 aria-hidden="true">
							<path fill-rule="evenodd"
										d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
										clip-rule="evenodd" />
						</svg>
						Neues Baby hinzufügen
					</button>
				</div>
			</div>
		</div>
		<!-- Baby cards -->
	{:else}
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each babies as baby, i (baby.id)}
				<div
					in:fly={{ y: 20, duration: 300, delay: i * 100 }}
					out:fade={{ duration: 200 }}
					animate:flip={{ duration: 300 }}
					class={`bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200 transition-all duration-200 hover:shadow-md ${selectedBaby?.id === baby.id ? 'ring-2 ring-indigo-500' : ''}`}
					on:click={() => selectBaby(baby)}
				>
					<div class="px-4 py-5 sm:px-6 flex items-center cursor-pointer">
						<div class={`flex-shrink-0 rounded-full p-2 ${genderIcons[baby.gender]?.color || 'bg-gray-100'}`}>
							{#if baby?.photoUrl}
								<div class="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100">
									<img src={baby.photoUrl} alt={baby.name} class="w-full h-full object-cover" />
								</div>
							{:else}
								<span class="text-2xl">{genderIcons[baby.gender]?.icon || '👶'}</span>
							{/if}
						</div>
						<div class="ml-4">
							<div class="flex items-center">
								<h3 class="text-lg font-medium leading-6 text-gray-900">{baby.name}</h3>
								{#if baby.isShared}
									<span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
										Geteilt
									</span>
								{/if}
								{#if selectedBaby?.id === baby.id}
									<span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
										Ausgewählt
									</span>
								{/if}
							</div>
							<p class="text-sm text-gray-500">
								{formatDate(baby.birthDate)} · {calculateAge(baby.birthDate)}
							</p>
						</div>
					</div>

					<div class="px-4 py-4 sm:px-6">
						<div class="grid grid-cols-2 gap-4">
							<a
								href="/baby/{baby.id}/details"
								class="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
								<svg class="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
										 fill="currentColor">
									<path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
									<path fill-rule="evenodd"
												d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
												clip-rule="evenodd" />
								</svg>
								Details
							</a>
							<button
								on:click|stopPropagation={() => selectBaby(baby)}
								class={`inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${selectedBaby?.id === baby.id ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'} text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}>
								<svg class="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
										 fill="currentColor">
									<path fill-rule="evenodd"
												d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
												clip-rule="evenodd" />
								</svg>
								{selectedBaby?.id === baby.id ? 'Ausgewählt' : 'Protokolle anzeigen'}
							</button>
						</div>
					</div>

				</div>
			{/each}
		</div>
	{/if}

	<!-- Log entries section -->
	<div class="mt-12">
		<div class="border-b border-gray-200 pb-5 mb-6">
			<h2 class="text-2xl font-bold leading-tight text-gray-900">Protokolleinträge</h2>
			<p class="mt-1 text-sm text-gray-500">Wähle ein Baby aus, um dessen Protokolleinträge anzuzeigen.</p>
		</div>

		<!-- Baby selection dropdown -->
		<div class="mb-6 flex flex-wrap items-center gap-2">
			<span class="text-sm font-medium text-gray-700">Baby auswählen:</span>
			<select
				bind:value={selectedBaby}
				on:change={() => { currentPage = 1; fetchLogEntries(); }}
				class="mt-1 block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
			>
				<option value={null} disabled>Bitte wähle ein Baby</option>
				{#each babies as baby (baby.id)}
					<option value={baby}>{baby.name}</option>
				{/each}
			</select>
		</div>
	</div>

	{#if selectedBaby}
		<div class="mt-6">
			<div class="border-b border-gray-200 pb-5 mb-6">
				<h3 class="text-xl font-bold leading-tight text-gray-900">Protokolleinträge für {selectedBaby.name}</h3>
			</div>

			<!-- Log type filter -->
			<div class="mb-6 flex flex-wrap items-center gap-2">
				<span class="text-sm font-medium text-gray-700">Filtern nach:</span>
				<select
					bind:value={selectedLogType}
					on:change={() => { currentPage = 1; fetchLogEntries(); }}
					class="mt-1 block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
				>
					<option value="all">Alle Einträge</option>
					<option value="diaper">Windel</option>
					<option value="feeding">Fütterung</option>
					<option value="nursing">Stillen</option>
					<option value="sleep">Schlaf</option>
					<option value="medication">Medikamente</option>
					<option value="milestone">Meilensteine</option>
					<option value="measurement">Messungen</option>
					<option value="photo">Fotos</option>
				</select>
			</div>

			<!-- Log error message -->
			{#if logError}
				<div class="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded shadow-sm">
					<div class="flex">
						<div class="flex-shrink-0">
							<svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
											clip-rule="evenodd" />
							</svg>
						</div>
						<div class="ml-3">
							<p class="text-sm text-red-700">{logError}</p>
						</div>
					</div>
				</div>
			{/if}

			<!-- Loading state -->
			{#if loadingLogs}
				<div class="flex flex-col items-center justify-center h-32">
					<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
					<p class="mt-2 text-sm text-gray-500">Lade Protokolleinträge...</p>
				</div>
			<!-- Empty state -->
			{:else if logEntries.length === 0}
				<div class="bg-white shadow overflow-hidden sm:rounded-lg">
					<div class="px-4 py-12 sm:px-6 text-center">
						<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"
								 aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
										d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
						<h3 class="mt-2 text-lg font-medium text-gray-900">Keine Protokolleinträge gefunden</h3>
						<p class="mt-1 text-sm text-gray-500">
							{#if selectedLogType !== 'all'}
								Es wurden keine Einträge vom Typ "{selectedLogType}" gefunden.
							{:else}
								Es wurden keine Protokolleinträge für dieses Baby gefunden.
							{/if}
						</p>
					</div>
				</div>
			<!-- Log entries list -->
			{:else}
				<div class="bg-white shadow overflow-hidden sm:rounded-lg divide-y divide-gray-200">
					{#each logEntries as entry (entry.id)}
						<div class="px-4 py-4 sm:px-6 hover:bg-gray-50">
							<div class="flex items-center justify-between">
								<div class="flex items-center">
									<!-- Icon based on log type -->
									<div class="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
										{#if entry.logType === 'diaper'}
											<span class="text-xl">🧷</span>
										{:else if entry.logType === 'feeding'}
											<span class="text-xl">🍼</span>
										{:else if entry.logType === 'nursing'}
											<span class="text-xl">👩‍🍼</span>
										{:else if entry.logType === 'sleep'}
											<span class="text-xl">😴</span>
										{:else if entry.logType === 'medication'}
											<span class="text-xl">💊</span>
										{:else if entry.logType === 'milestone'}
											<span class="text-xl">🏆</span>
										{:else if entry.logType === 'measurement'}
											<span class="text-xl">📏</span>
										{:else if entry.logType === 'photo'}
											<span class="text-xl">📷</span>
										{:else}
											<span class="text-xl">📝</span>
										{/if}
									</div>
									<div class="ml-4">
										<!-- Log type title -->
										<h4 class="text-lg font-medium text-gray-900">
											{#if entry.logType === 'diaper'}
												Windel gewechselt
											{:else if entry.logType === 'feeding'}
												Fütterung
											{:else if entry.logType === 'nursing'}
												Stillen
											{:else if entry.logType === 'sleep'}
												Schlaf
											{:else if entry.logType === 'medication'}
												Medikament: {entry.name}
											{:else if entry.logType === 'milestone'}
												Meilenstein: {entry.title}
											{:else if entry.logType === 'measurement'}
												Messung
											{:else if entry.logType === 'photo'}
												Foto
											{:else}
												Protokolleintrag
											{/if}
										</h4>
										<!-- Log details based on type -->
										<div class="mt-1">
											{#if entry.logType === 'diaper'}
												<p class="text-sm text-gray-500">
													Typ: {entry.type === 'wet' ? 'Nass' : entry.type === 'dirty' ? 'Schmutzig' : 'Beides'}
													{#if entry.notes}
														· Notizen: {entry.notes}
													{/if}
												</p>
											{:else if entry.logType === 'feeding'}
												<p class="text-sm text-gray-500">
													Typ: {entry.type === 'bottle' ? 'Flasche' : entry.type === 'nursing' ? 'Stillen' : 'Feste Nahrung'}
													{#if entry.amount}
														· Menge: {entry.amount} ml
													{/if}
													{#if entry.foodType}
														· Nahrung: {entry.foodType}
													{/if}
													{#if entry.notes}
														· Notizen: {entry.notes}
													{/if}
												</p>
											{:else if entry.logType === 'nursing'}
												<p class="text-sm text-gray-500">
													Dauer: {entry.duration} Minuten · Seite: {entry.side === 'left' ? 'Links' : entry.side === 'right' ? 'Rechts' : 'Beide'}
													{#if entry.notes}
														· Notizen: {entry.notes}
													{/if}
												</p>
											{:else if entry.logType === 'sleep'}
												<p class="text-sm text-gray-500">
													{#if entry.duration}
														Dauer: {entry.duration} Minuten
													{:else if entry.startTime && entry.endTime}
														Von: {new Date(entry.startTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
														Bis: {new Date(entry.endTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
													{/if}
													{#if entry.quality}
														· Qualität: {entry.quality}
													{/if}
													{#if entry.notes}
														· Notizen: {entry.notes}
													{/if}
												</p>
											{:else if entry.logType === 'medication'}
												<p class="text-sm text-gray-500">
													Dosis: {entry.dosage} {entry.unit}
													{#if entry.reason}
														· Grund: {entry.reason}
													{/if}
													{#if entry.notes}
														· Notizen: {entry.notes}
													{/if}
												</p>
											{:else if entry.logType === 'milestone'}
												<p class="text-sm text-gray-500">
													Kategorie: {entry.category}
													{#if entry.description}
														· {entry.description}
													{/if}
												</p>
											{:else if entry.logType === 'measurement'}
												<p class="text-sm text-gray-500">
													{#if entry.height}
														Größe: {entry.height} cm
													{/if}
													{#if entry.weight}
														{#if entry.height} · {/if}
														Gewicht: {entry.weight} kg
													{/if}
													{#if entry.headCircumference}
														{#if entry.height || entry.weight} · {/if}
														Kopfumfang: {entry.headCircumference} cm
													{/if}
													{#if entry.notes}
														· Notizen: {entry.notes}
													{/if}
												</p>
											{:else if entry.logType === 'photo'}
												<p class="text-sm text-gray-500">
													{#if entry.notes}
														Notizen: {entry.notes}
													{:else}
														Foto aufgenommen
													{/if}
												</p>
											{/if}
										</div>
									</div>
								</div>
								<div class="text-right">
									<p class="text-sm text-gray-500">
										{new Date(entry.timestamp).toLocaleDateString('de-DE', { 
											year: 'numeric', 
											month: 'long', 
											day: 'numeric',
											hour: '2-digit',
											minute: '2-digit'
										})}
									</p>
								</div>
							</div>
						</div>
					{/each}
				</div>

				<!-- Pagination -->
				{#if totalPages > 1}
					<div class="mt-6 flex items-center justify-between">
						<div class="flex-1 flex justify-between sm:hidden">
							<button
								on:click={() => { if (currentPage > 1) { currentPage--; fetchLogEntries(); } }}
								class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
								disabled={currentPage === 1}
							>
								Zurück
							</button>
							<button
								on:click={() => { if (currentPage < totalPages) { currentPage++; fetchLogEntries(); } }}
								class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
								disabled={currentPage === totalPages}
							>
								Weiter
							</button>
						</div>
						<div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
							<div>
								<p class="text-sm text-gray-700">
									Seite <span class="font-medium">{currentPage}</span> von <span class="font-medium">{totalPages}</span>
								</p>
							</div>
							<div>
								<nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
									<button
										on:click={() => { if (currentPage > 1) { currentPage = 1; fetchLogEntries(); } }}
										class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
										disabled={currentPage === 1}
									>
										<span class="sr-only">Erste Seite</span>
										<svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
											<path fill-rule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
											<path fill-rule="evenodd" d="M7.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L3.414 10l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
										</svg>
									</button>
									<button
										on:click={() => { if (currentPage > 1) { currentPage--; fetchLogEntries(); } }}
										class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
										disabled={currentPage === 1}
									>
										<span class="sr-only">Vorherige</span>
										<svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
											<path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
										</svg>
									</button>

									<!-- Page numbers -->
									{#each Array(Math.min(5, totalPages)) as _, i}
										{@const pageNum = currentPage <= 3 
											? i + 1 
											: currentPage >= totalPages - 2 
												? totalPages - 4 + i 
												: currentPage - 2 + i}
										{#if pageNum > 0 && pageNum <= totalPages}
											<button
												on:click={() => { currentPage = pageNum; fetchLogEntries(); }}
												class={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
													currentPage === pageNum 
														? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' 
														: 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
												}`}
											>
												{pageNum}
											</button>
										{/if}
									{/each}

									<button
										on:click={() => { if (currentPage < totalPages) { currentPage++; fetchLogEntries(); } }}
										class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
										disabled={currentPage === totalPages}
									>
										<span class="sr-only">Nächste</span>
										<svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
											<path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
										</svg>
									</button>
									<button
										on:click={() => { if (currentPage < totalPages) { currentPage = totalPages; fetchLogEntries(); } }}
										class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
										disabled={currentPage === totalPages}
									>
										<span class="sr-only">Letzte Seite</span>
										<svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
											<path fill-rule="evenodd" d="M4.293 15.707a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L8.586 10 4.293 14.293a1 1 0 000 1.414z" clip-rule="evenodd" />
											<path fill-rule="evenodd" d="M12.293 15.707a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L16.586 10l-4.293 4.293a1 1 0 000 1.414z" clip-rule="evenodd" />
										</svg>
									</button>
								</nav>
							</div>
						</div>
					</div>
				{/if}
			{/if}
		</div>
	{/if}
</main>

<!-- Add Baby Modal -->
{#if showAddBabyModal}
	<div transition:fade={{ duration: 200 }} class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title"
			 role="dialog" aria-modal="true">
		<div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">

			<span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

			<div
				in:fly={{ y: 10, duration: 300 }}
				class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 z-20"
			>
				<div class="absolute top-0 right-0 pt-4 pr-4">
					<button
						on:click={() => (showAddBabyModal = false)}
						type="button"
						class="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
					>
						<span class="sr-only">Schließen</span>
						<svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
								 stroke="currentColor" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<div class="sm:flex sm:items-start">
					<div
						class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
						<svg class="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
								 stroke="currentColor">
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
						<div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
							<button
								type="submit"
								class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
								disabled={addingBaby}
							>
								{#if addingBaby}
									<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
											 viewBox="0 0 24 24">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
										<path class="opacity-75" fill="currentColor"
													d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
				{:else}
					<form on:submit|preventDefault={handleAddBabyByShareCode} class="mt-5 sm:mt-6 space-y-4">
						<div>
							<label for="share-link" class="block text-sm font-medium text-gray-700">Teilungscode oder Link</label>
							<input
								id="share-link"
								type="text"
								bind:value={shareLink}
								required
								placeholder="z.B. https://baby-protokoll.de/baby/share/abc123 oder abc123"
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
									<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
											 viewBox="0 0 24 24">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
										<path class="opacity-75" fill="currentColor"
													d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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

<!-- QR Code Modal -->
{#if showQrModal}
	<div transition:fade={{ duration: 200 }} class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title"
			 role="dialog" aria-modal="true">
		<div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">

			<span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

			<div
				in:fly={{ y: 10, duration: 300 }}
				class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 z-20"
			>
				<div class="absolute top-0 right-0 pt-4 pr-4">
					<button
						on:click={() => (showQrModal = false)}
						type="button"
						class="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
					>
						<span class="sr-only">Schließen</span>
						<svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
								 stroke="currentColor" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<div class="sm:flex sm:items-start">
					<div
						class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
						<svg class="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
								 stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
										d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
						</svg>
					</div>
					<div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
						<h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
							QR-Code generieren
						</h3>
						<div class="mt-2">
							<p class="text-sm text-gray-500">
								Wähle die Art der Aktivität, für die du einen QR-Code generieren möchtest.
							</p>
						</div>
					</div>
				</div>

				<div class="mt-5">
					<label for="qr-type" class="block text-sm font-medium text-gray-700">Aktivitätstyp</label>
					<select
						id="qr-type"
						bind:value={selectedQrType}
						class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
					>
						<option value="diaper">{qrTypes.diaper.icon} {qrTypes.diaper.name}</option>
						<option value="feeding">{qrTypes.feeding.icon} {qrTypes.feeding.name}</option>
						<option value="nursing">{qrTypes.nursing.icon} {qrTypes.nursing.name}</option>
						<option value="measurement">{qrTypes.measurement.icon} {qrTypes.measurement.name}</option>
						<option value="sleep">{qrTypes.sleep.icon} {qrTypes.sleep.name}</option>
						<option value="medication">{qrTypes.medication.icon} {qrTypes.medication.name}</option>
						<option value="milestone">{qrTypes.milestone.icon} {qrTypes.milestone.name}</option>
					</select>
				</div>

				<div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
					<button
						type="button"
						on:click={generateQrCode}
						class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
						disabled={generatingQR}
					>
						{#if generatingQR}
							<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
									 viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Wird generiert...
						{:else}
							Generieren
						{/if}
					</button>
					<button
						type="button"
						on:click={() => (showQrModal = false)}
						class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
					>
						Abbrechen
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
