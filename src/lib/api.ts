interface LoginResponse {
    meta: {
      code: number;
      status: string;
      message: string;
    };
    data: {
      user: {
        email: string;
        exp: number;
      };
      access_token: {
        token: string;
        type: string;
        expires_in: number;
      };
    };
  }
  
  export async function loginToPortal(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/portal/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
  
    if (!response.ok) {
      throw new Error('Login failed');
    }
  
    return response.json();
  }