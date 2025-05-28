<script lang="ts">
	let token = '';
	let message = '';
	let error = '';

	async function handleVerify(event: Event) {
		event.preventDefault();
		// TODO: Call verify token API
	}
</script>

<main class="auth">
	<h2>E-Mail verifizieren</h2>
	<form on:submit|preventDefault={handleVerify}>
		<label>Verifizierungs-Token
			<input type="text" bind:value={token} required />
		</label>
		{#if error}
			<p class="error">{error}</p>
		{/if}
		{#if message}
			<p class="message">{message}</p>
		{/if}
		<button type="submit">Verifizieren</button>
	</form>
	<a href="/">Zurück zur Startseite</a>
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