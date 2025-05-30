<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart } from 'chart.js/auto';
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { user } from '$lib/stores/user';

	// Define types for our data
	interface Baby {
		id: string;
		name: string;
		birthDate: string;
		gender: 'male' | 'female' | 'diverse';
	}

	interface StatisticsData {
		date: string;
		count: number;
		totalDuration: number;
	}

	// State variables
	let selectedBaby: Baby | null = null;
	let babies: Baby[] = [];
	let loading = true;
	let error = '';
	let statsType = 'diaper';
	let startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Last 30 days
	let endDate = new Date().toISOString().split('T')[0]; // Today

	// Chart instances
	let chartInstance: Chart | null = null;

	// Stats data
	let statsData: StatisticsData[] = [];

	// Activity type options
	const activityTypes = [
		{ value: 'diaper', label: 'Windel', color: 'rgba(54, 162, 235, 0.5)', borderColor: 'rgba(54, 162, 235, 1)' },
		{ value: 'feeding', label: 'Fütterung', color: 'rgba(75, 192, 192, 0.5)', borderColor: 'rgba(75, 192, 192, 1)' },
		{ value: 'nursing', label: 'Stillen', color: 'rgba(153, 102, 255, 0.5)', borderColor: 'rgba(153, 102, 255, 1)' },
		{ value: 'sleep', label: 'Schlaf', color: 'rgba(255, 159, 64, 0.5)', borderColor: 'rgba(255, 159, 64, 1)' },
		{ value: 'medication', label: 'Medikament', color: 'rgba(255, 99, 132, 0.5)', borderColor: 'rgba(255, 99, 132, 1)' },
		{ value: 'milestone', label: 'Meilenstein', color: 'rgba(255, 205, 86, 0.5)', borderColor: 'rgba(255, 205, 86, 1)' }
	];

	onMount(async () => {
		if (!$user) {
			goto('/login');
			return;
		}

		await loadBabies();
	});

	async function loadBabies() {
		try {
			const response = await fetch('/api/babies');
			if (!response.ok) {
				if (response.status === 401) {
					goto('/login');
					return;
				}
				throw new Error('Failed to fetch babies');
			}

			babies = await response.json();
			if (babies.length > 0) {
				selectedBaby = babies[0];
				await loadStats();
			} else {
				loading = false;
			}
		} catch (err) {
			console.error('Error loading babies:', err);
			error = 'Fehler beim Laden der Babydaten';
			loading = false;
		}
	}

	async function loadStats() {
		if (!selectedBaby) return;

		loading = true;
		error = '';

		// Destroy previous chart if it exists
		if (chartInstance) {
			chartInstance.destroy();
			chartInstance = null;
		}

		try {
			const response = await fetch(`/api/statistics?babyId=${selectedBaby.id}&type=${statsType}&startDate=${startDate}&endDate=${endDate}`);

			if (!response.ok) {
				throw new Error(`Failed to fetch ${statsType} statistics`);
			}

			statsData = await response.json();
			renderChart();
		} catch (err) {
			console.error('Error loading statistics:', err);
			error = `Fehler beim Laden der ${getActivityTypeLabel(statsType)} Statistiken`;
		} finally {
			loading = false;
		}
	}

	function getActivityTypeLabel(type: string): string {
		const activityType = activityTypes.find(t => t.value === type);
		return activityType ? activityType.label : type;
	}

	function getActivityTypeColors(type: string): { color: string, borderColor: string } {
		const activityType = activityTypes.find(t => t.value === type);
		return activityType 
			? { color: activityType.color, borderColor: activityType.borderColor }
			: { color: 'rgba(201, 203, 207, 0.5)', borderColor: 'rgba(201, 203, 207, 1)' };
	}

	function renderChart() {
		const ctx = document.getElementById('statsChart') as HTMLCanvasElement;
		if (!ctx) return;

		const { color, borderColor } = getActivityTypeColors(statsType);

		const labels = statsData.map(item => new Date(item.date).toLocaleDateString('de-DE', { 
			month: 'short', 
			day: 'numeric' 
		}));

		const values = statsData.map(item => item.count);
		const durations = statsData.map(item => item.totalDuration / 60); // Convert to hours if in minutes

		const datasets = [];

		// Add count dataset
		datasets.push({
			label: `Anzahl ${getActivityTypeLabel(statsType)}`,
			data: values,
			backgroundColor: color,
			borderColor: borderColor,
			borderWidth: 1,
			yAxisID: 'y'
		});

		// Add duration dataset for activities that have duration
		if (['nursing', 'feeding', 'sleep'].includes(statsType) && durations.some(d => d > 0)) {
			datasets.push({
				label: `Dauer (Stunden)`,
				data: durations,
				backgroundColor: 'rgba(255, 99, 132, 0.5)',
				borderColor: 'rgba(255, 99, 132, 1)',
				borderWidth: 1,
				type: 'line',
				yAxisID: 'y1'
			});
		}

		chartInstance = new Chart(ctx, {
			type: 'bar',
			data: {
				labels,
				datasets
			},
			options: {
				responsive: true,
				scales: {
					y: {
						beginAtZero: true,
						title: {
							display: true,
							text: 'Anzahl'
						}
					},
					...(datasets.length > 1 ? {
						y1: {
							beginAtZero: true,
							position: 'right',
							grid: {
								drawOnChartArea: false
							},
							title: {
								display: true,
								text: 'Dauer (Stunden)'
							}
						}
					} : {})
				}
			}
		});
	}

	function applyFilters() {
		loadStats();
	}

	function resetFilters() {
		startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
		endDate = new Date().toISOString().split('T')[0];
		loadStats();
	}

	function changeBaby(event: Event) {
		const select = event.target as HTMLSelectElement;
		const babyId = select.value;
		selectedBaby = babies.find(baby => baby.id === babyId) || null;
		loadStats();
	}
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Page header -->
	<div class="md:flex md:items-center md:justify-between mb-8">
		<div class="flex-1 min-w-0">
			<h1 class="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">Statistiken</h1>
			<p class="mt-1 text-sm text-gray-500">Analysiere die Aktivitäten deines Babys.</p>
		</div>
	</div>

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

	{#if babies.length === 0 && !loading}
		<div class="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
			<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
			</svg>
			<h3 class="mt-2 text-lg font-medium text-gray-900">Keine Babys gefunden</h3>
			<p class="mt-1 text-sm text-gray-500">Füge dein erstes Baby hinzu, um Statistiken zu sehen.</p>
			<div class="mt-6">
				<a href="/settings" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
					Zu den Einstellungen
				</a>
			</div>
		</div>
	{:else}
		<!-- Filters -->
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
							bind:value={statsType}
							class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
						>
							{#each activityTypes as type (type.value)}
								<option value={type.value}>{type.label}</option>
							{/each}
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

		<!-- Chart -->
		<div class="bg-white overflow-hidden shadow rounded-lg">
			<div class="px-4 py-5 sm:p-6">
				<h3 class="text-lg leading-6 font-medium text-gray-900">
					{getActivityTypeLabel(statsType)} Statistik
				</h3>

				{#if loading}
					<div class="flex justify-center items-center h-64">
						<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
					</div>
				{:else if statsData.length === 0}
					<div class="flex flex-col items-center justify-center h-64 text-center">
						<svg class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
						</svg>
						<p class="mt-2 text-sm text-gray-500">
							Keine Daten für den ausgewählten Zeitraum gefunden.
						</p>
					</div>
				{:else}
					<div class="mt-4 h-80">
						<canvas id="statsChart"></canvas>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
