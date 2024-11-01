<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { Mail, Key, Download } from 'lucide-svelte';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  
  let email = '';
  let password = '';
  let isLoading = false;
  let status: { type: string; message: string } | null = null;

  onMount(() => {
    // Initialize auth store
    auth.initialize();
    
    // Check if already logged in
    if (browser && !auth.isTokenExpired()) {
      goto('/products');
    }
  });

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    isLoading = true;
    status = null;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/portal/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (data.meta.code === 200) {
        // Update auth store with user data and token
        auth.login(
          data.data.access_token.token,
          {
            email: data.data.user.email,
            exp: data.data.access_token.expires_at
          }
        );
        
        status = {
          type: 'success',
          message: 'Login successful! Redirecting...'
        };

        // Redirect to products page
        await goto('/products');
      } else {
        status = {
          type: 'error',
          message: data.meta.message || 'Login failed. Please try again.'
        };
      }
    } catch (error) {
      status = {
        type: 'error',
        message: error instanceof Error ? error.message : 'An error occurred. Please try again.'
      };
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
  <div class="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
    <!-- Header -->
    <div class="p-6">
      <div class="flex flex-col items-center text-center space-y-4">
        <img 
          src="/images/logo-sefloo.png" 
          alt="Sefloo Logo"
          class="h-16 w-26 object-contain"
        />
        <div>
          <h1 class="font-display text-3xl font-semibold text-gray-900">Member Login</h1>
          <p class="mt-2 text-gray-600 text-lg">
            Access your purchased digital product
          </p>
        </div>
      </div>
    </div>

    <!-- Form -->
    <form on:submit={handleSubmit} class="p-6 pt-0 space-y-4">
      <div class="space-y-2">
        <div class="relative">
          <Mail class="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="email"
            placeholder="Enter your email"
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            bind:value={email}
            required
          />
        </div>
      </div>

      <div class="space-y-2">
        <div class="relative">
          <Key class="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="password"
            placeholder="Enter password"
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            bind:value={password}
            required
          />
        </div>
      </div>

      {#if status}
        <div 
          class="p-4 rounded-md {status.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}"
          role="alert"
        >
          {status.message}
        </div>
      {/if}

      <button
        type="submit"
        class="w-full flex items-center justify-center space-x-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {#if isLoading}
          <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          <span>Logging in...</span>
        {:else}
          <Download class="h-4 w-4" />
          <span>Access Products</span>
        {/if}
      </button>
    </form>
  </div>
</div>