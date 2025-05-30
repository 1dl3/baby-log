<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	// Check if coming from registration
	const fromRegistration = page.url.searchParams.get('fromRegistration') === 'true';

	onMount(() => {
		// Extract token from URL
		const token = page.url.searchParams.get('token');

		if (token) {
			// Redirect to verify-token page with token
			goto(`/verify-token?token=${token}`);
		} else {
			// If no token, just go to verify-token page
			goto('/verify-token');
		}
	});
</script>

<div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
	<div class="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md text-center">
		{#if fromRegistration}
			<div class="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
				Registrierung erfolgreich! Bitte überprüfe deine E-Mail, um dein Konto zu verifizieren.
			</div>
		{/if}
		<h2 class="text-2xl font-bold text-gray-900">E-Mail Verifizierung</h2>
		<div class="flex justify-center">
			<svg class="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
			</svg>
		</div>
		<p class="text-gray-600">Weiterleitung zur Verifizierungsseite...</p>
		<p class="text-sm text-gray-500">Du wirst automatisch weitergeleitet.</p>
	</div>
</div>
