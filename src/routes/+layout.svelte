<script lang="ts">
	import '../app.css';
	import Layout from '$lib/components/Layout.svelte';

	export let data;
</script>

<Layout userData={data.user}>
	<slot />
</Layout>
