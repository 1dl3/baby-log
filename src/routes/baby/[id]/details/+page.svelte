<script lang="ts">
 import { onMount } from 'svelte';
 import { page } from '$app/stores';
 import { fade, fly } from 'svelte/transition';

	// Define types for our data
	interface Baby {
		id: string;
		name: string;
		birthDate: string;
		gender: 'male' | 'female' | 'diverse';
	}

	interface QRCode {
		id: string;
		babyId: string;
		type: string;
		code: string;
		qrImage: string;
	}

	interface StatisticsData {
		date: string;
		count: number;
		totalDuration: number;
	}

	// State variables
	let baby: Baby | null = null;
	let qrCodes: QRCode[] = [];
	let diaperStats: StatisticsData[] = [];
	let feedingStats: StatisticsData[] = [];
	let nursingStats: StatisticsData[] = [];
	let loading = true;
	let error = '';
	let activeTab = 'settings';
	let editMode = false;
	let editedBaby = { name: '', birthDate: '', gender: 'male' as 'male' | 'female' | 'diverse' };
	let saving = false;
	let successMessage = '';
	let showSuccessMessage = false;
	let statsType = 'diaper';
	let statsStartDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
	let statsEndDate = new Date().toISOString().split('T')[0];
	let selectedQrType = 'diaper';
	let generatingQR = false;
	let showQrModal = false;
	let photoFile: File | null = null;
	let photoPreview: string | null = null;

	function openQrModal() {
		showQrModal = true;
	}

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
		nursing: { name: 'Stillen', icon: '👩‍🍼' }
	};

	onMount(async () => {
		await fetchBabyData();
		await fetchQRCodes();
		await fetchStatistics('diaper');
		await fetchStatistics('feeding');
		await fetchStatistics('nursing');
		loading = false;
	});

	async function generateQrCode() {
		if (!baby || generatingQR) return;

		generatingQR = true;
		error = '';

		try {
			const response = await fetch('/api/qr-codes', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					babyId: baby.id,
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

	async function fetchBabyData() {
		try {
			const res = await fetch(`/api/babies/${$page.params.id}`);
			if (!res.ok) {
				if (res.status === 401) {
					window.location.href = '/login';
					return;
				}
				throw new Error('Failed to fetch baby data');
			}
			baby = await res.json();
			// Initialize edited baby with current values
			if (baby) {
				editedBaby = {
					name: baby.name,
					birthDate: new Date(baby.birthDate).toISOString().split('T')[0],
					gender: baby.gender
				};
			}
		} catch (err) {
			error = 'Fehler beim Laden der Babydaten';
			console.error(err);
		}
	}

	async function fetchQRCodes() {
		try {
			const res = await fetch(`/api/qr-codes/baby/${$page.params.id}`);
			if (!res.ok) {
				throw new Error('Failed to fetch QR codes');
			}
			qrCodes = await res.json();
		} catch (err) {
			error = 'Fehler beim Laden der QR-Codes';
			console.error(err);
		}
	}

	async function deleteQrCode(id: string) {
		try {
			const res = await fetch('/api/qr-codes', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ id })
			});

			if (!res.ok) throw new Error('Failed to delete QR code');

			// Remove the deleted QR code from the list
			qrCodes = qrCodes.filter(code => code.id !== id);

			// Show success message
			successMessage = 'QR-Code erfolgreich gelöscht!';
			showSuccessMessage = true;
			setTimeout(() => {
				showSuccessMessage = false;
			}, 3000);
		} catch (err) {
			error = 'Fehler beim Löschen des QR-Codes';
			console.error(err);
		}
	}

	async function fetchStatistics(type: string) {
		try {
			const res = await fetch(`/api/statistics?babyId=${$page.params.id}&type=${type}&startDate=${statsStartDate}&endDate=${statsEndDate}`);
			if (!res.ok) {
				throw new Error(`Failed to fetch ${type} statistics`);
			}
			const data = await res.json();

			if (type === 'diaper') {
				diaperStats = data;
			} else if (type === 'feeding') {
				feedingStats = data;
			} else if (type === 'nursing') {
				nursingStats = data;
			}
		} catch (err) {
			error = `Fehler beim Laden der ${type} Statistiken`;
			console.error(err);
		}
	}

	async function updateBaby() {
		if (saving) return;

		saving = true;
		error = '';

		try {
			// Use FormData to send the photo
			const formData = new FormData();
			formData.append('name', editedBaby.name);
			formData.append('birthDate', editedBaby.birthDate);
			formData.append('gender', editedBaby.gender);

			// Add photo if selected
			if (photoFile) {
				formData.append('photo', photoFile);
			}

			const res = await fetch(`/api/babies/${$page.params.id}`, {
				method: 'PUT',
				body: formData
			});

			if (!res.ok) throw new Error('Failed to update baby');

			baby = await res.json();
			editMode = false;

			// Reset photo state
			photoFile = null;
			photoPreview = null;

			// Show success message
			successMessage = 'Baby erfolgreich aktualisiert!';
			showSuccessMessage = true;
			setTimeout(() => {
				showSuccessMessage = false;
			}, 3000);
		} catch (err) {
			error = 'Fehler beim Aktualisieren des Babys';
			console.error(err);
		} finally {
			saving = false;
		}
	}

	function handlePhotoChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			photoFile = input.files[0];

			// Create preview
			const reader = new FileReader();
			reader.onload = (e) => {
				photoPreview = e.target?.result as string;
			};
			reader.readAsDataURL(photoFile);
		}
	}

	function cancelEdit() {
		if (baby) {
			editedBaby = {
				name: baby.name,
				birthDate: new Date(baby.birthDate).toISOString().split('T')[0],
				gender: baby.gender
			};
		}
		// Reset photo state
		photoFile = null;
		photoPreview = null;
		editMode = false;
	}

	async function refreshStatistics() {
		loading = true;
		await fetchStatistics(statsType);
		loading = false;
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
</script>

<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Page header -->
	<div class="md:flex md:items-center md:justify-between mb-8">
		<div class="flex-1 min-w-0">
			<h1 class="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
				{#if baby}
					{baby.name}
				{:else}
					Baby Details
				{/if}
			</h1>
			{#if baby}
				<p class="mt-1 text-sm text-gray-500">
					{formatDate(baby.birthDate)} · {calculateAge(baby.birthDate)}
				</p>
			{/if}
		</div>
		<div class="mt-4 flex md:mt-0 md:ml-4">
			<a
				href="/dashboard"
				class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
			>
				<svg class="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
						 fill="currentColor">
					<path fill-rule="evenodd"
								d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
								clip-rule="evenodd" />
				</svg>
				Zurück zum Dashboard
			</a>
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
			<p class="mt-4 text-sm text-gray-500">Lade Daten...</p>
		</div>
	{:else if !baby}
		<div class="bg-white shadow overflow-hidden sm:rounded-lg">
			<div class="px-4 py-16 sm:px-6 text-center">
				<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"
						 aria-hidden="true">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
								d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
				<h3 class="mt-2 text-lg font-medium text-gray-900">Baby nicht gefunden</h3>
				<p class="mt-1 text-sm text-gray-500">Das angeforderte Baby konnte nicht gefunden werden.</p>
				<div class="mt-6">
					<a
						href="/dashboard"
						class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
					>
						Zurück zum Dashboard
					</a>
				</div>
			</div>
		</div>
	{:else}
		<!-- Tabs -->
		<div class="border-b border-gray-200 mb-6">
			<nav class="-mb-px flex space-x-8" aria-label="Tabs">
				<button
					on:click={() => (activeTab = 'settings')}
					class={`${
            activeTab === 'settings'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
				>
					<svg class="-ml-0.5 mr-2 h-5 w-5 inline-block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
							 fill="currentColor">
						<path fill-rule="evenodd"
									d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
									clip-rule="evenodd" />
					</svg>
					Einstellungen
				</button>
				<button
					on:click={() => (activeTab = 'statistics')}
					class={`${
            activeTab === 'statistics'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
				>
					<svg class="-ml-0.5 mr-2 h-5 w-5 inline-block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
							 fill="currentColor">
						<path
							d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
					</svg>
					Statistiken
				</button>
				<button
					on:click={() => (activeTab = 'qrcodes')}
					class={`${
            activeTab === 'qrcodes'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
				>
					<svg class="-ml-0.5 mr-2 h-5 w-5 inline-block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
							 fill="currentColor">
						<path fill-rule="evenodd"
									d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z"
									clip-rule="evenodd" />
						<path
							d="M11 4a1 1 0 10-2 0v1a1 1 0 002 0V4zM10 7a1 1 0 011 1v1h2a1 1 0 110 2h-3a1 1 0 01-1-1V8a1 1 0 011-1zM16 9a1 1 0 100 2 1 1 0 000-2zM9 13a1 1 0 011-1h1a1 1 0 110 2v2a1 1 0 11-2 0v-3zM7 11a1 1 0 100-2H4a1 1 0 100 2h3zM17 13a1 1 0 01-1 1h-2a1 1 0 110-2h2a1 1 0 011 1zM16 17a1 1 0 100-2h-3a1 1 0 100 2h3z" />
					</svg>
					QR-Codes
				</button>
			</nav>
		</div>

		<!-- Settings Tab -->
		{#if activeTab === 'settings'}
			<div class="bg-white shadow overflow-hidden sm:rounded-lg">
				<div class="px-4 py-5 sm:px-6 flex justify-between items-center">
					<div>
						<h3 class="text-lg leading-6 font-medium text-gray-900">Baby Informationen</h3>
						<p class="mt-1 max-w-2xl text-sm text-gray-500">Persönliche Details und Einstellungen.</p>
					</div>
					{#if !editMode}
						<button
							on:click={() => (editMode = true)}
							class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
						>
							<svg class="-ml-0.5 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
									 fill="currentColor">
								<path
									d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
							</svg>
							Bearbeiten
						</button>
					{/if}
				</div>
				{#if editMode}
					<div class="border-t border-gray-200 px-4 py-5 sm:p-6">
						<form on:submit|preventDefault={updateBaby} class="space-y-4">
							<div>
								<label for="baby-name" class="block text-sm font-medium text-gray-700">Name</label>
								<input
									id="baby-name"
									type="text"
									bind:value={editedBaby.name}
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
									bind:value={editedBaby.birthDate}
									required
									class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
								/>
							</div>
							<div>
								<label for="gender" class="block text-sm font-medium text-gray-700">Geschlecht</label>
								<select
									id="gender"
									bind:value={editedBaby.gender}
									required
									class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
								>
									<option value="male">Männlich</option>
									<option value="female">Weiblich</option>
									<option value="diverse">Divers</option>
								</select>
							</div>
							<div>
								<label for="photo" class="block text-sm font-medium text-gray-700">Foto</label>
								<div class="mt-1 flex items-center space-x-4">
									{#if photoPreview}
										<div class="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100">
											<img src={photoPreview} alt="Vorschau" class="w-full h-full object-cover" />
										</div>
									{:else if baby?.photoUrl}
										<div class="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100">
											<img src={baby.photoUrl} alt={baby.name} class="w-full h-full object-cover" />
										</div>
									{:else}
										<div class="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
											<svg class="h-12 w-12 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
												<path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
											</svg>
										</div>
									{/if}
									<div>
										<input
											id="photo"
											type="file"
											accept="image/*"
											on:change={handlePhotoChange}
											class="sr-only"
										/>
										<label
											for="photo"
											class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
										>
											{photoPreview || baby?.photoUrl ? 'Foto ändern' : 'Foto hochladen'}
										</label>
										{#if photoFile}
											<p class="mt-1 text-xs text-gray-500">{photoFile.name}</p>
										{/if}
									</div>
								</div>
							</div>
							<div class="flex justify-end space-x-3 pt-4">
								<button
									type="button"
									on:click={cancelEdit}
									class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
								>
									Abbrechen
								</button>
								<button
									type="submit"
									class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
									disabled={saving}
								>
									{#if saving}
										<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg"
												 fill="none" viewBox="0 0 24 24">
											<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
											<path class="opacity-75" fill="currentColor"
														d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
										</svg>
										Speichern...
									{:else}
										Speichern
									{/if}
								</button>
							</div>
						</form>
					</div>
				{:else}
					<div class="border-t border-gray-200">
						<dl>
							<div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
								<dt class="text-sm font-medium text-gray-500">Name</dt>
								<dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{baby.name}</dd>
							</div>
							<div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
								<dt class="text-sm font-medium text-gray-500">Geburtsdatum</dt>
								<dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatDate(baby.birthDate)}</dd>
							</div>
							<div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
								<dt class="text-sm font-medium text-gray-500">Alter</dt>
								<dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{calculateAge(baby.birthDate)}</dd>
							</div>
							<div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
								<dt class="text-sm font-medium text-gray-500">Geschlecht</dt>
								<dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <span
										class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${genderIcons[baby.gender]?.color || 'bg-gray-100'}`}>
                    {genderIcons[baby.gender]?.icon || '👶'}
										{baby.gender === 'male' ? 'Männlich' : baby.gender === 'female' ? 'Weiblich' : 'Divers'}
                  </span>
								</dd>
							</div>
							<div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
								<dt class="text-sm font-medium text-gray-500">Foto</dt>
								<dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
									{#if baby.photoUrl}
										<div class="flex items-center">
											<div class="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
												<img src={baby.photoUrl} alt={baby.name} class="w-full h-full object-cover" />
											</div>
										</div>
									{:else}
										<div class="flex items-center">
											<div class="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
												<svg class="h-12 w-12 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
													<path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
												</svg>
											</div>
											<span class="ml-4 text-sm text-gray-500">Kein Foto vorhanden</span>
										</div>
									{/if}
								</dd>
							</div>
						</dl>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Statistics Tab -->
		{#if activeTab === 'statistics'}
			<div class="bg-white shadow overflow-hidden sm:rounded-lg">
				<div class="px-4 py-5 sm:px-6">
					<h3 class="text-lg leading-6 font-medium text-gray-900">Statistiken</h3>
					<p class="mt-1 max-w-2xl text-sm text-gray-500">Aktivitäten und Trends.</p>
				</div>
				<div class="border-t border-gray-200 px-4 py-5 sm:p-6">
					<div class="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-6">
						<div>
							<label for="stats-type" class="block text-sm font-medium text-gray-700">Statistiktyp</label>
							<select
								id="stats-type"
								bind:value={statsType}
								class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
							>
								<option value="diaper">{qrTypes.diaper.icon} {qrTypes.diaper.name}</option>
								<option value="feeding">{qrTypes.feeding.icon} {qrTypes.feeding.name}</option>
								<option value="nursing">{qrTypes.nursing.icon} {qrTypes.nursing.name}</option>
							</select>
						</div>
						<div>
							<label for="start-date" class="block text-sm font-medium text-gray-700">Startdatum</label>
							<input
								id="start-date"
								type="date"
								bind:value={statsStartDate}
								class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
							/>
						</div>
						<div>
							<label for="end-date" class="block text-sm font-medium text-gray-700">Enddatum</label>
							<input
								id="end-date"
								type="date"
								bind:value={statsEndDate}
								class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
							/>
						</div>
					</div>
					<div class="flex justify-end mb-6">
						<button
							on:click={refreshStatistics}
							class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
						>
							<svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
									 fill="currentColor">
								<path fill-rule="evenodd"
											d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
											clip-rule="evenodd" />
							</svg>
							Aktualisieren
						</button>
					</div>

					<!-- Statistics Display -->
					{#if statsType === 'diaper' && diaperStats.length > 0}
						<div class="overflow-x-auto">
							<table class="min-w-full divide-y divide-gray-200">
								<thead class="bg-gray-50">
								<tr>
									<th scope="col"
											class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datum
									</th>
									<th scope="col"
											class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Anzahl
									</th>
								</tr>
								</thead>
								<tbody class="bg-white divide-y divide-gray-200">
								{#each diaperStats as stat (stat.date)}
									<tr>
										<td
											class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(stat.date).toLocaleDateString('de-DE')}</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.count}</td>
									</tr>
								{/each}
								</tbody>
							</table>
						</div>
					{:else if statsType === 'feeding' && feedingStats.length > 0}
						<div class="overflow-x-auto">
							<table class="min-w-full divide-y divide-gray-200">
								<thead class="bg-gray-50">
								<tr>
									<th scope="col"
											class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datum
									</th>
									<th scope="col"
											class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Anzahl
									</th>
								</tr>
								</thead>
								<tbody class="bg-white divide-y divide-gray-200">
								{#each feedingStats as stat (stat.date)}
									<tr>
										<td
											class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(stat.date).toLocaleDateString('de-DE')}</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.count}</td>
									</tr>
								{/each}
								</tbody>
							</table>
						</div>
					{:else if statsType === 'nursing' && nursingStats.length > 0}
						<div class="overflow-x-auto">
							<table class="min-w-full divide-y divide-gray-200">
								<thead class="bg-gray-50">
								<tr>
									<th scope="col"
											class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datum
									</th>
									<th scope="col"
											class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Anzahl
									</th>
									<th scope="col"
											class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gesamtdauer
										(Min)
									</th>
								</tr>
								</thead>
								<tbody class="bg-white divide-y divide-gray-200">
								{#each nursingStats as stat (stat.date)}
									<tr>
										<td
											class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(stat.date).toLocaleDateString('de-DE')}</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.count}</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.totalDuration}</td>
									</tr>
								{/each}
								</tbody>
							</table>
						</div>
					{:else}
						<div class="text-center py-10">
							<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
											d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
							<h3 class="mt-2 text-sm font-medium text-gray-900">Keine Daten verfügbar</h3>
							<p class="mt-1 text-sm text-gray-500">
								Es wurden keine Statistiken für den ausgewählten Zeitraum gefunden.
							</p>
						</div>
					{/if}
				</div>
			</div>
		{/if}

		<!-- QR Codes Tab -->
		{#if activeTab === 'qrcodes'}
			<div class="bg-white shadow overflow-hidden sm:rounded-lg">
				<div class="px-4 py-5 sm:px-6">
					<h3 class="text-lg leading-6 font-medium text-gray-900">QR-Codes</h3>
					<p class="mt-1 max-w-2xl text-sm text-gray-500">Alle QR-Codes für dieses Baby.</p>
					<div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
						<button
							type="button"
							on:click={openQrModal}
							class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
						>
							<svg class="-ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
							</svg>
							Neuen QR-Code generieren
						</button>
					</div>
				</div>
				<div class="border-t border-gray-200 px-4 py-5 sm:p-6">
					{#if qrCodes.length === 0}
						<div class="text-center py-10">
							<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
											d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
							<h3 class="mt-2 text-sm font-medium text-gray-900">Keine QR-Codes</h3>
							<p class="mt-1 text-sm text-gray-500">
								Es wurden noch keine QR-Codes für dieses Baby generiert.
							</p>
							<div class="mt-6">
								<a
									href="/dashboard"
									class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
								>
									Zurück zum Dashboard
								</a>
							</div>
						</div>
					{:else}
						<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{#each qrCodes as code (code.id)}
								<div class="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
									<div class="px-4 py-5 sm:px-6">
										<h3 class="text-lg font-medium leading-6 text-gray-900">
											{qrTypes[code.type]?.icon || '📋'} {qrTypes[code.type]?.name || code.type}
										</h3>
										<p class="mt-1 text-sm text-gray-500">
											Erstellt am {new Date(code.createdAt).toLocaleDateString('de-DE')}
										</p>
									</div>
									<div class="px-4 py-5 sm:p-6 text-center">
										{#if code.qrImage}
											<img src={code.qrImage} alt="QR Code" class="mx-auto h-48 w-48" />
										{:else}
											<div class="bg-gray-100 h-48 w-48 mx-auto flex items-center justify-center">
												<span class="text-gray-400">QR Code nicht verfügbar</span>
											</div>
										{/if}
									</div>
									<div class="px-4 py-4 sm:px-6 space-y-2">
										<button
											on:click={() => {
                        if (code.qrImage) {
                          const link = document.createElement('a');
                          link.href = code.qrImage;
                          link.download = `qrcode-${code.type}-${baby.name}.png`;
                          link.click();
                        }
                      }}
											class="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
											disabled={!code.qrImage}
										>
											<svg class="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
													 fill="currentColor">
												<path fill-rule="evenodd"
															d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
															clip-rule="evenodd" />
											</svg>
											Herunterladen
										</button>
										<button
											on:click={() => deleteQrCode(code.id)}
											class="w-full inline-flex justify-center items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
										>
											<svg class="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
													 fill="currentColor">
												<path fill-rule="evenodd"
															d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
															clip-rule="evenodd" />
											</svg>
											Löschen
										</button>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		{/if}
	{/if}
</main>
<!-- QR Code Modal -->
{#if showQrModal}
	<div transition:fade={{ duration: 200 }} class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
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
						<svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<div class="sm:flex sm:items-start">
					<div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
						<svg class="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
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
							<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
