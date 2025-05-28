<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  export let user: { id?: string; email?: string } | null = null;
  let isMenuOpen = false;
  let isAuthenticated = false;

  onMount(() => {
    // Check if user is authenticated by looking for a token in localStorage
    // This is a simple check and should be replaced with a proper auth check
    isAuthenticated = !!localStorage.getItem('token');
  });

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }

  function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
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
          {#if isAuthenticated}
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
          {#if isAuthenticated}
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
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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
          {#if isAuthenticated}
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

  <!-- Main content -->
  <main class="flex-grow">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <slot />
    </div>
  </main>

  <!-- Footer -->
  <footer class="bg-white">
    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
      <p class="text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Baby-Protokoll. Alle Rechte vorbehalten.
      </p>
    </div>
  </footer>
</div>
