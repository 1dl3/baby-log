<script lang="ts">
	import { page } from '$app/stores';
	import UserInfo from './UserInfo.svelte';
	import { clearUser, user, setUser } from '$lib/stores/user';
	import { onMount } from 'svelte';

	export let userData: {
		id?: string;
		email?: string;
		name?: string;
		emailVerified?: boolean;
	} | null = null;

	// Initialize the user store with the user prop
	onMount(() => {
		console.log('Layout component mounted, userData:', userData);
		if (userData) {
			setUser(userData);
			console.log('User store after setUser in onMount:', $user);
		}
	});

	// Also keep the reactive statement as a backup
	$: if (userData) {
		console.log('Layout reactive statement triggered, userData:', userData);
		setUser(userData);
		console.log('User store after setUser in reactive statement:', $user);
	}

	let isMenuOpen = false;
	// Use the user prop to determine if the user is authenticated

	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}

	async function logout() {
		try {
			// Call the logout API endpoint
			await fetch('/api/auth/logout', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			// Clear the user store
			clearUser();

			// Redirect to login page
			window.location.href = '/login';
		} catch (err) {
			console.error('Logout error:', err);
		}
	}

	// Function to request a new verification email
	async function requestVerificationEmail() {
		try {
			const response = await fetch('/api/auth/resend-verification', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (response.ok) {
				alert('Verifizierungslink wurde erneut gesendet. Bitte überprüfe deinen Posteingang.');
			} else {
				const data = await response.json();
				alert(data.error || 'Fehler beim Senden des Verifizierungslinks.');
			}
		} catch (err) {
			console.error('Verification request error:', err);
			alert('Fehler beim Senden des Verifizierungslinks.');
		}
	}
</script>

<div class="min-h-screen bg-gray-50 flex flex-col">
	<!-- Header -->
	<header class="bg-white shadow-sm">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between h-16">
				<div class="flex">
					<div class="flex-shrink-0 flex items-center">
						<a href="/" class="text-2xl font-bold text-indigo-600">Baby-Protokoll</a>
					</div>
					{#if $user}
						<nav class="hidden sm:ml-6 sm:flex sm:space-x-8">
							<a
								href="/dashboard"
								class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium {$page.url.pathname.startsWith('/dashboard') ? 'border-indigo-500 text-gray-900' : ''}"
							>
								Dashboard
							</a>
							<a
								href="/log"
								class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium {$page.url.pathname.startsWith('/log') ? 'border-indigo-500 text-gray-900' : ''}"
							>
								Aktivitäten
							</a>
							<a
								href="/statistics"
								class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium {$page.url.pathname.startsWith('/statistics') ? 'border-indigo-500 text-gray-900' : ''}"
							>
								Statistiken
							</a>
						</nav>
					{/if}
				</div>
				<div class="hidden sm:ml-6 sm:flex sm:items-center">
					{#if $user}
						<button
							on:click={logout}
							class="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
						>
							Abmelden
						</button>
					{:else}
						<a
							href="/login"
							class="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
						>
							Anmelden
						</a>
						<a
							href="/register"
							class="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
						>
							Registrieren
						</a>
					{/if}
				</div>
				<div class="-mr-2 flex items-center sm:hidden">
					<button
						on:click={toggleMenu}
						class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
					>
						<span class="sr-only">Menü öffnen</span>
						<svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
								 stroke="currentColor" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
						</svg>
					</button>
				</div>
			</div>
		</div>

		<!-- Mobile menu, show/hide based on menu state -->
		{#if isMenuOpen}
			<div class="sm:hidden">
				<div class="pt-2 pb-3 space-y-1">
					{#if $user}
						<a
							href="/dashboard"
							class="bg-indigo-50 border-indigo-500 text-indigo-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium {$page.url.pathname.startsWith('/dashboard') ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'}"
						>
							Dashboard
						</a>
						<a
							href="/log"
							class="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium {$page.url.pathname.startsWith('/log') ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : ''}"
						>
							Aktivitäten
						</a>
						<a
							href="/statistics"
							class="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium {$page.url.pathname.startsWith('/statistics') ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : ''}"
						>
							Statistiken
						</a>
						<button
							on:click={logout}
							class="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left"
						>
							Abmelden
						</button>
					{:else}
						<a
							href="/login"
							class="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium {$page.url.pathname === '/login' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : ''}"
						>
							Anmelden
						</a>
						<a
							href="/register"
							class="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium {$page.url.pathname === '/register' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : ''}"
						>
							Registrieren
						</a>
					{/if}
				</div>
			</div>
		{/if}
	</header>

	<!-- Verification banner for unverified users -->
	{#if $user && $user.emailVerified === false}
		<div class="bg-yellow-50 border-b border-yellow-200">
			<div class="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
				<div class="flex items-center justify-between flex-wrap">
					<div class="w-0 flex-1 flex items-center">
						<span class="flex p-2 rounded-lg bg-yellow-100">
							<svg class="h-6 w-6 text-yellow-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
							</svg>
						</span>
						<p class="ml-3 font-medium text-yellow-700 truncate">
							<span class="md:hidden">Bitte verifiziere deine E-Mail-Adresse.</span>
							<span class="hidden md:inline">Deine E-Mail-Adresse wurde noch nicht verifiziert. Bitte überprüfe deinen Posteingang oder fordere einen neuen Verifizierungslink an.</span>
						</p>
					</div>
					<div class="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
						<button
							on:click={requestVerificationEmail}
							class="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
						>
							Neuen Link anfordern
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Main content -->
	<main class="flex-grow">
		<div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
			<slot />
		</div>
	</main>

	<!-- Footer -->
	<footer class="bg-white">
		<div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
			<div class="flex justify-between items-center">
				<p class="text-sm text-gray-500">
					&copy; {new Date().getFullYear()} Baby-Protokoll. Alle Rechte vorbehalten.
				</p>
				<div class="text-right">
					<UserInfo />
				</div>
			</div>
		</div>
	</footer>
</div>
