<script lang="ts">
	import '../app.css';
	import Layout from '$lib/components/Layout.svelte';
	import { setUser } from '$lib/stores/user';

	export let data;

	// Initialize the user store with the user data from the server
	$: if (data.user) {
		setUser(data.user);
	}
</script>

<Layout user={data.user}>
	<slot />
</Layout>
