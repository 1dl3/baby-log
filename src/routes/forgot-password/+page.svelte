<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';

	let error: string | null = null;
	let success = false;

	async function handleSubmit(event: SubmitEvent) {
		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);

		try {
			const response = await fetch('/api/auth/forgot-password', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					email: formData.get('email')
				})
			});

			const data = await response.json();

			if (!response.ok) {
				error = data.error;
				return;
			}

			success = true;
			setTimeout(() => {
				goto('/login');
			}, 2000);
		} catch (err) {
			error = 'Ein Fehler ist aufgetreten';
		}
	}
</script>

<div class="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-md">
		<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
			Passwort vergessen
		</h2>
		<p class="mt-2 text-center text-sm text-gray-600">
			Geben Sie Ihre E-Mail-Adresse ein, um einen Link zum Zurücksetzen Ihres Passworts zu erhalten.
		</p>
	</div>

	<div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
		<div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
			{#if success}
				<div class="rounded-md bg-green-50 p-4">
					<div class="flex">
						<div class="flex-shrink-0">
							<svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
							</svg>
						</div>
						<div class="ml-3">
							<p class="text-sm font-medium text-green-800">
								Wenn die E-Mail-Adresse registriert ist, erhalten Sie eine E-Mail mit Anweisungen zum Zurücksetzen des Passworts.
							</p>
						</div>
					</div>
				</div>
			{:else}
				<form class="space-y-6" on:submit|preventDefault={handleSubmit} use:enhance>
					{#if error}
						<div class="rounded-md bg-red-50 p-4">
							<div class="flex">
								<div class="flex-shrink-0">
									<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
										<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
									</svg>
								</div>
								<div class="ml-3">
									<p class="text-sm font-medium text-red-800">{error}</p>
								</div>
							</div>
						</div>
					{/if}

					<div>
						<label for="email" class="block text-sm font-medium text-gray-700">
							E-Mail-Adresse
						</label>
						<div class="mt-1">
							<input
								id="email"
								name="email"
								type="email"
								required
								class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
							/>
						</div>
					</div>

					<div>
						<button
							type="submit"
							class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
						>
							Link zum Zurücksetzen senden
						</button>
					</div>
				</form>
			{/if}
		</div>
	</div>
</div>

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