<script lang="ts">
	import { onMount } from 'svelte';
	import { user } from '$lib/stores/user';
	import { fade, fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	// Animation for features on landing page
	let visible = false;

	// State for logged-in user view
	let babies = [];
	let selectedBaby = null;
	let logEntries = [];
	let loading = true;
	let error = '';
	let currentPage = 1;
	let totalPages = 1;
	let totalEntries = 0;
	let entriesPerPage = 10;
	let filterType = 'all';
	let startDate = '';
	let endDate = '';

	// Activity type icons and colors
	const activityIcons = {
		diaper: { icon: '🧷', color: 'bg-blue-100 text-blue-800' },
		feeding: { icon: '🍼', color: 'bg-green-100 text-green-800' },
		nursing: { icon: '👩‍🍼', color: 'bg-pink-100 text-pink-800' },
		sleep: { icon: '😴', color: 'bg-purple-100 text-purple-800' },
		medication: { icon: '💊', color: 'bg-red-100 text-red-800' },
		milestone: { icon: '🏆', color: 'bg-yellow-100 text-yellow-800' },
		measurement: { icon: '📏', color: 'bg-indigo-100 text-indigo-800' },
		photo: { icon: '📷', color: 'bg-gray-100 text-gray-800' }
	};

	onMount(async () => {
		// Animation for landing page
		setTimeout(() => {
			visible = true;
		}, 300);

		// If user is logged in, load babies and log entries
		if ($user) {
			await loadBabies();
		}
	});

	async function loadBabies() {
		try {
			const response = await fetch('/api/babies');
			if (!response.ok) {
				throw new Error('Failed to fetch babies');
			}
			babies = await response.json();

			if (babies.length > 0) {
				selectedBaby = babies[0];
				await loadLogEntries();
			} else {
				loading = false;
			}
		} catch (err) {
			console.error('Error loading babies:', err);
			error = 'Fehler beim Laden der Babydaten';
			loading = false;
		}
	}

	async function loadLogEntries() {
		if (!selectedBaby) return;

		loading = true;
		error = '';

		try {
			let url = `/api/baby-log?babyId=${selectedBaby.id}&page=${currentPage}&limit=${entriesPerPage}`;

			if (filterType && filterType !== 'all') {
				url += `&type=${filterType}`;
			}

			if (startDate) {
				url += `&startDate=${startDate}`;
			}

			if (endDate) {
				url += `&endDate=${endDate}`;
			}

			const response = await fetch(url);
			if (!response.ok) {
				throw new Error('Failed to fetch log entries');
			}

			const data = await response.json();
			logEntries = data.entries;
			totalPages = data.pagination.totalPages;
			totalEntries = data.pagination.totalCount;
		} catch (err) {
			console.error('Error loading log entries:', err);
			error = 'Fehler beim Laden der Protokolleinträge';
		} finally {
			loading = false;
		}
	}

	function changeBaby(event) {
		const babyId = event.target.value;
		selectedBaby = babies.find(baby => baby.id === babyId);
		currentPage = 1;
		loadLogEntries();
	}

	function applyFilters() {
		currentPage = 1;
		loadLogEntries();
	}

	function resetFilters() {
		filterType = 'all';
		startDate = '';
		endDate = '';
		currentPage = 1;
		loadLogEntries();
	}

	function goToPage(page) {
		if (page < 1 || page > totalPages) return;
		currentPage = page;
		loadLogEntries();
	}

	// Format date to a more readable format
	function formatDate(dateString) {
		const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
		return new Date(dateString).toLocaleDateString('de-DE', options);
	}

	// Get activity details based on type and data
	function getActivityDetails(entry) {
		let duration;
		let details;

		switch (entry.logType) {
			case 'diaper':
				return `Windel: ${entry.type}`;
			case 'feeding':
				return `Fütterung: ${entry.amount ? entry.amount + ' ml' : ''} ${entry.duration ? entry.duration + ' min' : ''}`;
			case 'nursing':
				return `Stillen: ${entry.duration} min (${entry.side})`;
			case 'sleep':
				duration = entry.duration ? entry.duration : 
					(entry.endTime ? Math.round((new Date(entry.endTime) - new Date(entry.startTime)) / 60000) : 'läuft noch');
				return `Schlaf: ${typeof duration === 'number' ? duration + ' min' : duration}`;
			case 'medication':
				return `Medikament: ${entry.name} (${entry.dosage} ${entry.unit})`;
			case 'milestone':
				return `Meilenstein: ${entry.title}`;
			case 'measurement':
				details = [];
				if (entry.weight) details.push(`${entry.weight} kg`);
				if (entry.height) details.push(`${entry.height} cm`);
				return `Messung: ${details.join(', ')}`;
			case 'photo':
				return 'Foto';
			default:
				return '';
		}
	}
</script>

{#if $user}
	<!-- Logged-in user view with baby logs -->
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<div class="mb-6">
			<h1 class="text-2xl font-bold text-gray-900">Baby-Protokoll</h1>
			<p class="text-sm text-gray-500">Übersicht der Aktivitäten</p>
		</div>

		{#if babies.length === 0 && !loading}
			<div class="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
				<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
				<h3 class="mt-2 text-lg font-medium text-gray-900">Keine Babys gefunden</h3>
				<p class="mt-1 text-sm text-gray-500">Füge dein erstes Baby hinzu, um loszulegen.</p>
				<div class="mt-6">
					<a href="/dashboard" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
						Zum Dashboard
					</a>
				</div>
			</div>
		{:else}
			<!-- Baby selector and filters -->
			<div class="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
				<div class="px-4 py-5 sm:p-6">
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
						<div>
							<label for="baby-select" class="block text-sm font-medium text-gray-700">Baby auswählen</label>
							<select 
								id="baby-select" 
								class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
								value={selectedBaby?.id}
								on:change={changeBaby}
							>
								{#each babies as baby (baby.id)}
									<option value={baby.id}>{baby.name}</option>
								{/each}
							</select>
						</div>

						<div>
							<label for="type-filter" class="block text-sm font-medium text-gray-700">Aktivitätstyp</label>
							<select 
								id="type-filter" 
								bind:value={filterType}
								class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
							>
								<option value="all">Alle Aktivitäten</option>
								<option value="diaper">Windel</option>
								<option value="feeding">Fütterung</option>
								<option value="nursing">Stillen</option>
								<option value="sleep">Schlaf</option>
								<option value="medication">Medikament</option>
								<option value="milestone">Meilenstein</option>
								<option value="measurement">Messung</option>
								<option value="photo">Foto</option>
							</select>
						</div>

						<div>
							<label for="start-date" class="block text-sm font-medium text-gray-700">Von</label>
							<input 
								type="date" 
								id="start-date" 
								bind:value={startDate}
								class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
							>
						</div>

						<div>
							<label for="end-date" class="block text-sm font-medium text-gray-700">Bis</label>
							<input 
								type="date" 
								id="end-date" 
								bind:value={endDate}
								class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
							>
						</div>
					</div>

					<div class="mt-4 flex justify-end space-x-3">
						<button 
							type="button" 
							on:click={resetFilters}
							class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
						>
							Zurücksetzen
						</button>
						<button 
							type="button" 
							on:click={applyFilters}
							class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
						>
							Filter anwenden
						</button>
					</div>
				</div>
			</div>

			<!-- Log entries -->
			<div class="bg-white shadow overflow-hidden sm:rounded-lg">
				<div class="px-4 py-5 sm:px-6 flex justify-between items-center">
					<div>
						<h3 class="text-lg leading-6 font-medium text-gray-900">Aktivitäten</h3>
						<p class="mt-1 max-w-2xl text-sm text-gray-500">
							{#if totalEntries > 0}
								Zeige {(currentPage - 1) * entriesPerPage + 1} bis {Math.min(currentPage * entriesPerPage, totalEntries)} von {totalEntries} Einträgen
							{:else}
								Keine Einträge gefunden
							{/if}
						</p>
					</div>
				</div>

				{#if loading}
					<div class="flex justify-center items-center p-12">
						<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
					</div>
				{:else if error}
					<div class="p-4 bg-red-50 border-l-4 border-red-400">
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
				{:else if logEntries.length === 0}
					<div class="text-center p-12">
						<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
						</svg>
						<h3 class="mt-2 text-sm font-medium text-gray-900">Keine Einträge gefunden</h3>
						<p class="mt-1 text-sm text-gray-500">
							Beginne mit dem Protokollieren von Aktivitäten für {selectedBaby?.name}.
						</p>
					</div>
				{:else}
					<ul class="divide-y divide-gray-200">
						{#each logEntries as entry, i (entry.id)}
							<li 
								in:fly={{ y: 20, duration: 300, delay: i * 50 }}
								out:fade={{ duration: 200 }}
								animate:flip={{ duration: 300 }}
								class="px-4 py-4 sm:px-6 hover:bg-gray-50"
							>
								<div class="flex items-center justify-between">
									<div class="flex items-center">
										<div class={`flex-shrink-0 h-10 w-10 rounded-full ${activityIcons[entry.logType]?.color || 'bg-gray-100'} flex items-center justify-center`}>
											<span class="text-lg">{activityIcons[entry.logType]?.icon || '📝'}</span>
										</div>
										<div class="ml-4">
											<div class="text-sm font-medium text-gray-900">
												{getActivityDetails(entry)}
											</div>
											<div class="text-sm text-gray-500">
												{formatDate(entry.timestamp)}
											</div>
											{#if entry.notes}
												<div class="text-sm text-gray-500 mt-1">
													{entry.notes}
												</div>
											{/if}
										</div>
									</div>
								</div>
							</li>
						{/each}
					</ul>

					<!-- Pagination -->
					{#if totalPages > 1}
						<div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
							<div class="flex-1 flex justify-between sm:hidden">
								<button 
									on:click={() => goToPage(currentPage - 1)}
									disabled={currentPage === 1}
									class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Zurück
								</button>
								<button 
									on:click={() => goToPage(currentPage + 1)}
									disabled={currentPage === totalPages}
									class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Weiter
								</button>
							</div>
							<div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
								<div>
									<p class="text-sm text-gray-700">
										Zeige <span class="font-medium">{(currentPage - 1) * entriesPerPage + 1}</span> bis <span class="font-medium">{Math.min(currentPage * entriesPerPage, totalEntries)}</span> von <span class="font-medium">{totalEntries}</span> Einträgen
									</p>
								</div>
								<div>
									<nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
										<button 
											on:click={() => goToPage(currentPage - 1)}
											disabled={currentPage === 1}
											class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
										>
											<span class="sr-only">Zurück</span>
											<svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
												<path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
											</svg>
										</button>

										{#each Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
											const pageNum = currentPage <= 3 
												? i + 1 
												: currentPage >= totalPages - 2 
													? totalPages - 4 + i 
													: currentPage - 2 + i;
											return { pageNum, i };
										}).filter(item => item.pageNum > 0 && item.pageNum <= totalPages) as item (item.i)}
											<button 
												on:click={() => goToPage(item.pageNum)}
												class={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
													currentPage === item.pageNum 
														? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' 
														: 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
												}`}
											>
												{item.pageNum}
											</button>
										{/each}

										<button 
											on:click={() => goToPage(currentPage + 1)}
											disabled={currentPage === totalPages}
											class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
										>
											<span class="sr-only">Weiter</span>
											<svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
												<path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
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
	</div>
{:else}
	<!-- Landing page for non-logged-in users -->
	<div class="bg-gradient-to-b from-indigo-50 to-white">
		<!-- Hero Section -->
		<div class="pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8">
			<div class="max-w-7xl mx-auto">
				<div class="text-center">
					<h1 class="text-4xl tracking-tight font-extrabold text-indigo-900 sm:text-5xl md:text-6xl">
						<span class="block">Baby-Protokoll</span>
						<span class="block text-indigo-600 mt-2">Einfach. Sicher. Übersichtlich.</span>
					</h1>
					<p class="mt-3 max-w-md mx-auto text-base text-gray-600 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
						Protokolliere einfach und sicher alle wichtigen Ereignisse deines Babys. Mit unserer App behältst du den Überblick über Fütterungen, Wickeln und mehr.
					</p>
					<div class="mt-8 flex justify-center space-x-4">
						<a href="/register" class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
							Jetzt starten
						</a>
						<a href="/login" class="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
							Anmelden
						</a>
					</div>
				</div>
			</div>
		</div>

		<!-- Features Section -->
		<div class="py-12 bg-white">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="text-center">
					<h2 class="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
						Alle Funktionen auf einen Blick
					</h2>
					<p class="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
						Unsere App bietet dir alles, was du brauchst, um den Alltag mit deinem Baby zu organisieren.
					</p>
				</div>

				<div class="mt-10">
					<div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
						<div class={`transition-all duration-500 ease-in-out transform ${visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style="transition-delay: 100ms;">
							<div class="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mx-auto">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
								</svg>
							</div>
							<div class="mt-5 text-center">
								<h3 class="text-lg font-medium text-gray-900">Aktivitäten protokollieren</h3>
								<p class="mt-2 text-base text-gray-500">
									Halte Fütterungen, Wickeln und Schlafzeiten fest und behalte den Überblick.
								</p>
							</div>
						</div>

						<div class={`transition-all duration-500 ease-in-out transform ${visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style="transition-delay: 200ms;">
							<div class="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mx-auto">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
								</svg>
							</div>
							<div class="mt-5 text-center">
								<h3 class="text-lg font-medium text-gray-900">Statistiken & Trends</h3>
								<p class="mt-2 text-base text-gray-500">
									Visualisiere die Entwicklung deines Babys mit übersichtlichen Grafiken und Statistiken.
								</p>
							</div>
						</div>

						<div class={`transition-all duration-500 ease-in-out transform ${visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style="transition-delay: 300ms;">
							<div class="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mx-auto">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
								</svg>
							</div>
							<div class="mt-5 text-center">
								<h3 class="text-lg font-medium text-gray-900">QR-Code Schnellzugriff</h3>
								<p class="mt-2 text-base text-gray-500">
									Generiere QR-Codes für schnelles Protokollieren von Aktivitäten ohne langes Navigieren.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- CTA Section -->
		<div class="bg-indigo-700">
			<div class="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
				<h2 class="text-3xl font-extrabold text-white sm:text-4xl">
					<span class="block">Bereit, loszulegen?</span>
					<span class="block">Registriere dich jetzt kostenlos.</span>
				</h2>
				<p class="mt-4 text-lg leading-6 text-indigo-200">
					Erstelle ein Konto und beginne noch heute, die Entwicklung deines Babys zu dokumentieren.
				</p>
				<div class="mt-8 flex justify-center space-x-4">
					<a href="/register" class="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-white">
						Jetzt registrieren
					</a>
					<a href="/login" class="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 bg-opacity-60 hover:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-white">
						Anmelden
					</a>
				</div>
			</div>
		</div>

		<!-- Additional Links -->
		<div class="bg-white py-8">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-center">
					<a href="/forgot-password" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
						Passwort vergessen?
					</a>
					<a href="/verify-token" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
						E-Mail verifizieren
					</a>
				</div>
			</div>
		</div>
	</div>
{/if}
