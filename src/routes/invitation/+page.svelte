<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData } from './$types';
  
  export let data: PageData;
</script>

<div class="max-w-2xl mx-auto px-4 py-8">
  <div class="bg-white shadow rounded-lg p-6">
    <div class="text-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Einladung zu Baby Log</h1>
      
      <div class="mt-4 text-gray-600">
        <p class="text-lg">
          Sie wurden eingeladen, auf das Baby-Profil von <span class="font-semibold">{data.baby.name}</span> zuzugreifen.
        </p>
      </div>
    </div>
    
    {#if !data.isAuthenticated}
      <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-yellow-700">
              Sie müssen sich anmelden oder registrieren, um diese Einladung anzunehmen.
            </p>
          </div>
        </div>
      </div>
      
      <div class="flex flex-col space-y-4">
        <a href="/login?returnTo={encodeURIComponent(`/invitation?code=${data.invitationCode}`)}" class="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Anmelden
        </a>
        
        <a href="/register?returnTo={encodeURIComponent(`/invitation?code=${data.invitationCode}`)}" class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Registrieren
        </a>
      </div>
    {:else}
      <form method="POST" action="?/accept" use:enhance class="mt-6">
        <input type="hidden" name="code" value={data.invitationCode} />
        
        <div class="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-green-700">
                Sie sind angemeldet und können die Einladung jetzt annehmen.
              </p>
            </div>
          </div>
        </div>
        
        <button type="submit" class="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Einladung annehmen
        </button>
      </form>
    {/if}
  </div>
</div>