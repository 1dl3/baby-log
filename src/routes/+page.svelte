<script lang="ts">
	// No logic needed for static landing page
	import { onMount } from 'svelte';

	// Animation for features
	let visible = false;
	onMount(() => {
		setTimeout(() => {
			visible = true;
		}, 300);
	});
</script>

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
