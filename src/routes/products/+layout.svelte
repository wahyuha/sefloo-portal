<!-- src/routes/products/+layout.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth';
  import { browser } from '$app/environment';

  onMount(() => {
    auth.initialize();
    
    // Check if user is authenticated
    if (browser && auth.isTokenExpired()) {
      goto('/');
    }
  });
</script>

<slot />