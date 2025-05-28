<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart } from 'chart.js/auto';

	let selectedBaby: any = null;
	let babies: any[] = [];
	let diaperStats = {
		labels: [],
		data: []
	};
	let feedingStats = {
		labels: [],
		data: []
	};
	let nursingStats = {
		labels: [],
		data: []
	};

	onMount(async () => {
		await loadBabies();
	});

	async function loadBabies() {
		try {
			const response = await fetch('/api/babies');
			babies = await response.json();
			if (babies.length > 0) {
				selectedBaby = babies[0];
				await loadStats();
			}
		} catch (error) {
			console.error('Error loading babies:', error);
		}
	}

	async function loadStats() {
		if (!selectedBaby) return;

		try {
			// Load diaper stats
			const diaperResponse = await fetch(`/api/statistics/diaper/${selectedBaby.id}`);
			const diaperData = await diaperResponse.json();
			diaperStats = processStats(diaperData);

			// Load feeding stats
			const feedingResponse = await fetch(`/api/statistics/feeding/${selectedBaby.id}`);
			const feedingData = await feedingResponse.json();
			feedingStats = processStats(feedingData);

			// Load nursing stats
			const nursingResponse = await fetch(`/api/statistics/nursing/${selectedBaby.id}`);
			const nursingData = await nursingResponse.json();
			nursingStats = processStats(nursingData);

			renderCharts();
		} catch (error) {
			console.error('Error loading statistics:', error);
		}
	}

	function processStats(data: any) {
		const labels = data.map((item: any) => new Date(item.date).toLocaleDateString());
		const values = data.map((item: any) => item.count);
		return { labels, data: values };
	}

	function renderCharts() {
		// Diaper Chart
		new Chart(document.getElementById('diaperChart') as HTMLCanvasElement, {
			type: 'bar',
			data: {
				labels: diaperStats.labels,
				datasets: [{
					label: 'Diaper Changes',
					data: diaperStats.data,
					backgroundColor: 'rgba(54, 162, 235, 0.5)',
					borderColor: 'rgba(54, 162, 235, 1)',
					borderWidth: 1
				}]
			},
			options: {
				responsive: true,
				scales: {
					y: {
						beginAtZero: true
					}
				}
			}
		});

		// Feeding Chart
		new Chart(document.getElementById('feedingChart') as HTMLCanvasElement, {
			type: 'line',
			data: {
				labels: feedingStats.labels,
				datasets: [{
					label: 'Feedings',
					data: feedingStats.data,
					fill: false,
					borderColor: 'rgba(75, 192, 192, 1)',
					tension: 0.1
				}]
			},
			options: {
				responsive: true,
				scales: {
					y: {
						beginAtZero: true
					}
				}
			}
		});

		// Nursing Chart
		new Chart(document.getElementById('nursingChart') as HTMLCanvasElement, {
			type: 'line',
			data: {
				labels: nursingStats.labels,
				datasets: [{
					label: 'Nursing Duration (minutes)',
					data: nursingStats.data,
					fill: false,
					borderColor: 'rgba(153, 102, 255, 1)',
					tension: 0.1
				}]
			},
			options: {
				responsive: true,
				scales: {
					y: {
						beginAtZero: true
					}
				}
			}
		});
	}
</script>

<div class="min-h-screen bg-gray-100">
	<div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
		<div class="px-4 py-6 sm:px-0">
			<div class="flex justify-between items-center mb-6">
				<h1 class="text-2xl font-semibold text-gray-900">Statistics</h1>
				<select
					bind:value={selectedBaby}
					on:change={loadStats}
					class="mt-1 block w-64 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
				>
					{#each babies as baby}
						<option value={baby}>{baby.name}</option>
					{/each}
				</select>
			</div>

			<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<div class="bg-white overflow-hidden shadow rounded-lg">
					<div class="px-4 py-5 sm:p-6">
						<h3 class="text-lg leading-6 font-medium text-gray-900">
							Diaper Changes
						</h3>
						<div class="mt-2">
							<canvas id="diaperChart"></canvas>
						</div>
					</div>
				</div>

				<div class="bg-white overflow-hidden shadow rounded-lg">
					<div class="px-4 py-5 sm:p-6">
						<h3 class="text-lg leading-6 font-medium text-gray-900">
							Feedings
						</h3>
						<div class="mt-2">
							<canvas id="feedingChart"></canvas>
						</div>
					</div>
				</div>

				<div class="bg-white overflow-hidden shadow rounded-lg">
					<div class="px-4 py-5 sm:p-6">
						<h3 class="text-lg leading-6 font-medium text-gray-900">
							Nursing Duration
						</h3>
						<div class="mt-2">
							<canvas id="nursingChart"></canvas>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div> 