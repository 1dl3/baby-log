<script lang="ts">
	import '../app.css';
	import Layout from '$lib/components/Layout.svelte';

	export let data;

	// Debug the data received from the server
	console.log('Layout data received from server:', data);
</script>

<Layout userData={data.user}>
	<slot />
</Layout>
