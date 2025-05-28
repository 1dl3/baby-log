<script lang="ts">
	import { user } from '$lib/stores/user';
</script>

{#if $user}
	<div class="user-info">
		<p>Eingeloggt als: <strong>{$user.name}</strong> ({$user.email})</p>
	</div>
{:else}
	<div class="user-info">
		<p>Nicht eingeloggt</p>
		<!-- Debug: Show when this branch is rendered -->
		<span style="display: none;">{console.log('UserInfo: Rendering "Nicht eingeloggt"')}</span>
	</div>
{/if}

<style>
    .user-info {
        padding: 0.5rem;
        font-size: 0.875rem;
        color: #4b5563;
    }
</style>
