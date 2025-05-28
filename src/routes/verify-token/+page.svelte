<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	let token = '';
	let message = '';
	let error = '';
	let verifying = false;

	onMount(() => {
		// Extract token from URL if present
		const urlToken = page.url.searchParams.get('token');
		if (urlToken) {
			token = urlToken;
			// Automatically verify if token is present in URL
			handleVerify();
		}
	});

	async function handleVerify(event?: Event) {
		if (event) event.preventDefault();
		event.preventDefault();
		verifying = true;
		error = '';
		message = '';

		try {
			const response = await fetch('/api/auth/verify-email', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ token })
			});

			const data = await response.json();

			if (!response.ok) {
				error = data.error || 'Verifizierung fehlgeschlagen';
				return;
			}

			message = data.message || 'E-Mail erfolgreich verifiziert';
			token = '';
		} catch (err) {
			console.error('Verification error:', err);
			error = 'Serverfehler bei der Verifizierung';
		} finally {
			verifying = false;
		}
	}
</script>

<main class="flex items-center justify-center min-h-screen bg-gray-100">
	<div class="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
		<h2 class="text-2xl font-bold text-center text-gray-900">E-Mail verifizieren</h2>
		<form on:submit|preventDefault={handleVerify} class="space-y-6">
			<div>
				<label class="block text-sm font-medium text-gray-700">Verifizierungs-Token</label>
				<input 
					type="text" 
					bind:value={token} 
					required 
					class="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" 
				/>
			</div>
			{#if error}
				<p class="text-sm text-red-600">{error}</p>
			{/if}
			{#if message}
				<p class="text-sm text-green-600">{message}</p>
			{/if}
			<button 
				type="submit" 
				class="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
				disabled={verifying}
			>
				{#if verifying}
					<span class="inline-block mr-2 animate-spin">⟳</span> Verifiziere...
				{:else}
					Verifizieren
				{/if}
			</button>
		</form>
		<a href="/login" class="block text-sm text-center text-indigo-600 hover:text-indigo-500">Zum Login</a>
		<a href="/" class="block text-sm text-center text-gray-600 hover:text-gray-500">Zurück zur Startseite</a>
	</div>
</main>

<style>
.auth {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 80vh;
}
form {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	min-width: 250px;
}
label {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
}
.error {
	color: red;
}
.message {
	color: green;
}
</style> 
