<script lang="ts">
  import { enhance } from '$app/forms';
  
  let email = '';
  let password = '';
  let name = '';
  let error = '';
  let success = false;

  async function handleRegister(event: Event) {
    event.preventDefault();
    error = '';
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      const data = await res.json();
      if (!res.ok) {
        error = data.error || 'Registrierung fehlgeschlagen';
        return;
      }
      window.location.href = '/login';
    } catch (e) {
      error = 'Serverfehler bei der Registrierung';
    }
  }
</script>

<main class="flex items-center justify-center min-h-screen bg-gray-100">
  <div class="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
    <h2 class="text-2xl font-bold text-center text-gray-900">Registrieren</h2>
    <form on:submit|preventDefault={handleRegister} class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-700">Name</label>
        <input type="text" bind:value={name} required class="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Email</label>
        <input type="email" bind:value={email} required class="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Passwort</label>
        <input type="password" bind:value={password} required class="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
      </div>
      {#if error}
        <p class="text-sm text-red-600">{error}</p>
      {/if}
      <button type="submit" class="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Registrieren</button>
    </form>
    <a href="/login" class="block text-sm text-center text-indigo-600 hover:text-indigo-500">Bereits registriert? Login</a>
    <a href="/" class="block text-sm text-center text-gray-600 hover:text-gray-500">Zurück zur Startseite</a>
  </div>
</main> 