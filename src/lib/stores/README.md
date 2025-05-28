# User Store

This directory contains Svelte stores that are used throughout the application.

## User Store

The user store provides access to the currently logged-in user's data from anywhere in the application.

### Usage

```svelte
<script>
  import { user } from '$lib/stores/user';
</script>

{#if $user}
  <p>Hello, {$user.name}!</p>
{:else}
  <p>Not logged in</p>
{/if}
```

### API

The user store exports the following:

- `user`: A Svelte writable store containing the user data
- `setUser(userData)`: A function to set the user data in the store
- `clearUser()`: A function to clear the user data from the store

### User Data Structure

The user data has the following structure:

```typescript
type User = {
  id?: string;
  email?: string;
  name?: string;
} | null;
```

### Initialization

The user store is automatically initialized with the user data from the server in the root layout component (`src/routes/+layout.svelte`).