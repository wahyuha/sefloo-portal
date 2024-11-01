<!-- src/routes/products/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import Cookies from 'js-cookie';
    import { Package, Download, FileText } from 'lucide-svelte';
    
    interface ProductMedia {
      id: number;
      media_portal_url: string;
      media_type: string;
    }

    interface Product {
      id: number;
      name: string;
      description: string;
      category: string;
      product: {
        description: string;
        product_type: string;
        product_medias: ProductMedia[];
      };
    }
  
    let currentPage = 1;
    let totalPages = 1;
    let products: Product[] = [];
    let isLoading = true;
    let error: string | null = null;
  
    async function fetchProducts(page = 1) {
      isLoading = true;
      try {
        const token = Cookies.get('access_token');
        if (!token) {
          error = 'Authentication token not found';
          return;
        }
        
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/portal/products?page=${page}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
  
        const result = await response.json();
        
        if (result.meta.code === 200) {
          products = result.data.data;
          currentPage = result.data.current_page;
          totalPages = result.data.last_page;
        } else {
          error = result.meta.message || 'Failed to fetch products';
        }
      } catch (err) {
        error = 'Failed to fetch products';
      } finally {
        isLoading = false;
      }
    }
  
    function handlePageChange(page: number) {
      if (page >= 1 && page <= totalPages) {
        currentPage = page;
        fetchProducts(page);
      }
    }
  
    async function handleDownload(productId: number, mediaUrl: string) {
      const token = Cookies.get('access_token');
      if (!token) {
        error = 'Authentication token not found';
        return;
      }
      
      try {
        const response = await fetch(`https://api-v2.sefloo.com${mediaUrl}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
  
        if (!response.ok) throw new Error('Download failed');
  
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `product-${productId}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (err) {
        error = 'Failed to download product. Please try again.';
      }
    }
  
    onMount(() => {
      fetchProducts();
    });
  </script>
  
  <div class="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center space-x-3">
          <img 
            src="/images/logo-sefloo.png" 
            alt="Sefloo Logo"
            class="h-16 w-20 object-contain"
          />
          <h1 class="font-display text-3xl font-semibold text-gray-900">Products</h1>
        </div>
				<p class="mt-2 text-gray-600 text-lg">
					Access and download your purchased digital products
				</p>
      </div>
  
      <!-- Content -->
      {#if isLoading}
        <div class="flex justify-center items-center min-h-[400px]">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      {:else if error}
        <div class="bg-red-50 text-red-700 p-4 rounded-lg">
          <p>{error}</p>
          <button 
            class="mt-2 text-sm font-medium underline"
            on:click={() => {
              error = null;
              fetchProducts();
            }}
          >
            Try again
          </button>
        </div>
      {:else if products.length === 0}
        <div class="text-center py-12 bg-white rounded-lg shadow">
          <Package class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">No products found</h3>
          <p class="mt-1 text-sm text-gray-500">You haven't purchased any digital products yet.</p>
        </div>
      {:else}
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {#each products as product (product.id)}
            <div class="bg-white rounded-lg shadow overflow-hidden">
              {#if product.product.product_medias?.[0]?.media_type === 'IMAGE'}
                <img 
                  src={`https://api-v2.sefloo.com${product.product.product_medias[0].media_portal_url}`}
                  alt={product.name}
                  class="w-full h-48 object-cover"
                />
              {:else}
                <div class="w-full h-48 bg-gray-100 flex items-center justify-center">
                  <FileText class="h-12 w-12 text-gray-400" />
                </div>
              {/if}
              
              <div class="p-4">
                <h3 class="text-lg font-semibold text-gray-900">{product.name}</h3>
                <p class="mt-1 text-sm text-gray-500">{product.product.description}</p>
                
                <div class="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <span>{product.product.product_type}</span>
                  <span>{product.category}</span>
                </div>
  
                {#if product.product.product_medias?.[0]}
                  <button
                    on:click={() => handleDownload(product.id, product.product.product_medias[0].media_portal_url)}
                    class="mt-4 w-full flex items-center justify-center space-x-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <Download class="h-4 w-4" />
                    <span>
                      {product.product.product_medias[0].media_type === 'IMAGE' ? 'View Full Image' : 'Download File'}
                    </span>
                  </button>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <!-- After your products list -->
  {#if totalPages > 1}
    <div class="mt-8 flex justify-center">
      <nav class="flex items-center gap-2" aria-label="Pagination">
        <!-- Previous button -->
        <button
          class="inline-flex items-center px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentPage === 1}
          on:click={() => handlePageChange(currentPage - 1)}
        >
          Previous
        </button>

        <!-- Page numbers -->
        {#each Array(totalPages) as _, i}
          <button
            class="inline-flex items-center px-4 py-2 rounded-md border {currentPage === i + 1 
              ? 'border-primary bg-primary text-white' 
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}"
            on:click={() => handlePageChange(i + 1)}
          >
            {i + 1}
          </button>
        {/each}

        <!-- Next button -->
        <button
          class="inline-flex items-center px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentPage === totalPages}
          on:click={() => handlePageChange(currentPage + 1)}
        >
          Next
        </button>
      </nav>
    </div>
  {/if}

  <!-- Loading state -->
  {#if isLoading}
    <div class="flex justify-center my-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  {/if}