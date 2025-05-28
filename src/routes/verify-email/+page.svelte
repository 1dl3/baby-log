<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	onMount(() => {
		// Extract token from URL
		const token = page.url.searchParams.get('token');
		
		if (token) {
			// Redirect to verify-token page
			goto(`/verify-token?token=${token}`);
		} else {
			// If no token, just go to verify-token page
			goto('/verify-token');
		}
	});
</script>

<div class="flex items-center justify-center min-h-screen">
	<p>Weiterleitung zur Verifizierungsseite...</p>
</div>