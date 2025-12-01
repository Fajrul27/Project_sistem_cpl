// ============================================
// Real API Client - Connect to Express Backend
// ============================================

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Storage helpers
// function getToken() {
//   return localStorage.getItem('token');
// }

// export function setToken(token: string) {
//   localStorage.setItem('token', token);
// }

export function clearToken() {
  // localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function setUser(user: any) {
  localStorage.setItem('user', JSON.stringify(user));
}

export function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

// API request helper
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  // const token = getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    // ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const url = `${API_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Send cookies
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export const api = {
  get: (endpoint: string, options: any = {}) => {
    let url = endpoint;
    if (options.params) {
      const params = new URLSearchParams(options.params);
      url += `?${params.toString()}`;
    }
    return apiRequest(url, { ...options, method: 'GET' });
  },
  post: (endpoint: string, body: any, options: RequestInit = {}) => apiRequest(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint: string, body: any, options: RequestInit = {}) => apiRequest(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint: string, options: RequestInit = {}) => apiRequest(endpoint, { ...options, method: 'DELETE' }),
};

// Helper: fetch mahasiswa list with optional mataKuliahId filter for dosen
export async function fetchMahasiswaList(params?: { 
  page?: number; 
  limit?: number; 
  q?: string; 
  mataKuliahId?: string;
}) {
  // Backend endpoint: GET /api/users?role=mahasiswa
  return api.get('/users', {
    params: {
      role: 'mahasiswa',
      ...params
    }
  });
}

// Helper: fetch mata kuliah yang diampu oleh dosen
export async function fetchMataKuliahPengampu(dosenId: string) {
  return api.get(`/mata-kuliah-pengampu/dosen/${dosenId}`);
}

// Helper: fetch all users (admin only)
export async function fetchAllUsers(params?: { page?: number; limit?: number; q?: string; role?: string }) {
  // Backend endpoint: GET /api/users
  return api.get('/users', { params });
}

// Helper: update user role (admin only)
export async function updateUserRole(userId: string, role: string) {
  // Backend endpoint: PUT /api/users/:id/role
  return apiRequest(`/users/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role })
  });
}

// Helper: update profile data (admin / user)
// Helper: update profile data (admin / user)
export async function updateProfile(
  profileId: string,
  payload: {
    namaLengkap?: string;
    nim?: string | null;
    nip?: string | null;
    programStudi?: string | null;
    semester?: number | null;
    kelasId?: string | null;
  }
) {
  return apiRequest(`/profiles/${profileId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

// Helper: create user with initial role (admin only from UI)
export async function createUserWithRole(
  email: string,
  password: string,
  fullName: string,
  role: string,
  profileData?: { nim?: string; nip?: string; programStudi?: string | null; semester?: number | null; kelasId?: string }
) {
  // Register user (default role di backend: mahasiswa)
  const data = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, fullName })
  });

  const user = data.user;
  if (!user || !user.id) {
    throw new Error('User tidak tersedia pada respons register');
  }

  // Update profile jika ada data tambahan
  if (profileData && user.profile?.id) {
    await updateProfile(user.profile.id, {
      nim: profileData.nim ?? null,
      nip: profileData.nip ?? null,
      programStudi: profileData.programStudi ?? null,
      semester: profileData.semester ?? null,
      kelasId: profileData.kelasId ?? null,
    });
  }

  // Jika role yang dipilih bukan mahasiswa, update role-nya
  if (role && role !== 'mahasiswa') {
    await updateUserRole(user.id, role);
  }

  return user;
}

// Helper: update user basic info (admin only)
export async function updateUser(userId: string, payload: { email?: string; fullName?: string }) {
  return apiRequest(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

// Helper: delete user (admin only)
export async function deleteUser(userId: string) {
  return apiRequest(`/users/${userId}`, {
    method: 'DELETE',
  });
}

// Helper: fetch list of CPL from backend
export async function fetchCplList() {
  return apiRequest('/cpl');
}

// Helper: fetch list of Mata Kuliah from backend
export async function fetchMataKuliahList() {
  return apiRequest('/mata-kuliah');
}

// Helper: submit CPL score
export async function submitNilaiCpl(payload: {
  userId: string;
  cplId: string;
  mataKuliahId: string;
  nilai: number;
  semester: number;
  tahunAjaran: string;
}) {
  return apiRequest('/nilai-cpl', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Helper: fetch transkrip CPL data
export async function fetchTranskripCPL(mahasiswaId: string) {
  return api.get(`/transkrip-cpl/${mahasiswaId}`);
}

// Helper: fetch transkrip CPL data with semester and tahunAjaran filters
export async function getTranskrip(mahasiswaId: string, semester?: string, tahunAjaran?: string) {
  const params = new URLSearchParams();
  if (semester && semester !== 'all') params.append('semester', semester);
  if (tahunAjaran && tahunAjaran !== 'all') params.append('tahunAjaran', tahunAjaran);
  return api.get(`/transkrip-cpl/${mahasiswaId}?${params.toString()}`);
}

// Helper: fetch transkrip CPMK data
export async function getTranskripCPMK(mahasiswaId: string, semester?: string, tahunAjaran?: string) {
  const params = new URLSearchParams();
  if (semester && semester !== 'all') params.append('semester', semester);
  if (tahunAjaran && tahunAjaran !== 'all') params.append('tahunAjaran', tahunAjaran);
  return api.get(`/transkrip-cpmk/${mahasiswaId}?${params.toString()}`);
}

// Helper: fetch analysis data
export async function fetchAnalisisCPL(semester?: string) {
  const params = semester && semester !== "all" ? { semester } : {};
  return api.get('/transkrip-cpl/analisis', { params });
}

// Helper: fetch dashboard stats
export async function fetchDashboardStats() {
  return api.get('/dashboard/stats');
}

// Helper: fetch semesters
export async function fetchSemesters() {
  return api.get('/references/semester');
}

// Helper: fetch kelas
export async function fetchKelas() {
  return api.get('/references/kelas');
}

// Auth state change callbacks
const authCallbacks: Array<(event: string, session: any) => void> = [];

// Real API with Supabase-compatible interface
export const supabase = {
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      try {
        const data = await apiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });

        const session = {
          access_token: 'cookie', // Dummy token for frontend logic compatibility
          user: { id: data.user.id, email: data.user.email }
        };

        // setToken(data.token); // No longer needed
        setUser(data.user);

        // Trigger auth state change callbacks
        setTimeout(() => {
          authCallbacks.forEach(cb => cb('SIGNED_IN', session));
        }, 100);

        return {
          data: {
            user: { id: data.user.id, email: data.user.email },
            session
          },
          error: null
        };
      } catch (error: any) {
        return {
          data: { user: null, session: null },
          error: { message: error.message || 'Login gagal' }
        };
      }
    },

    signUp: async ({ email, password, options }: { email: string; password: string; options?: any }) => {
      try {
        const data = await apiRequest('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            email,
            password,
            fullName: options?.data?.full_name
          }),
        });

        return {
          data: {
            user: { id: data.user.id, email: data.user.email },
            session: null
          },
          error: null
        };
      } catch (error: any) {
        return {
          data: { user: null, session: null },
          error: { message: error.message || 'Registrasi gagal' }
        };
      }
    },

    signOut: async () => {
      try {
        await apiRequest('/auth/logout', { method: 'POST' });
        clearToken();
        return { error: null };
      } catch (error) {
        clearToken();
        return { error: null };
      }
    },

    getSession: async () => {
      // const token = getToken();
      const user = getUser();
      if (user) {
        return {
          data: {
            session: {
              access_token: 'cookie',
              user: { id: user.id, email: user.email }
            }
          },
          error: null
        };
      }
      return { data: { session: null }, error: null };
    },

    getUser: async () => {
      try {
        const data = await apiRequest('/auth/me');
        return {
          data: { user: data.user },
          error: null
        };
      } catch (error) {
        return { data: { user: null }, error: null };
      }
    },

    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      authCallbacks.push(callback);

      return {
        data: {
          subscription: {
            unsubscribe: () => {
              const index = authCallbacks.indexOf(callback);
              if (index > -1) {
                authCallbacks.splice(index, 1);
              }
            }
          }
        },
        error: null
      };
    }
  },

  from: (table: string) => ({
    select: (columns = '*') => {
      // Map table names to API endpoints
      const tableMap: Record<string, string> = {
        'profiles': 'auth/me',
        'cpl': 'cpl',
        'mata_kuliah': 'mata-kuliah',
        'mataKuliah': 'mata-kuliah',
        'users': 'users',
        'nilai_cpl': 'nilai-cpl'
      };

      const endpoint = tableMap[table] || table;

      const queryBuilder = {
        eq: (column: string, value: any) => ({
          ...queryBuilder,
          single: async () => {
            try {
              // Special handling for profiles
              if (table === 'profiles') {
                const data = await apiRequest('/auth/me');
                return { data: data.user?.profile || null, error: null };
              }

              const data = await apiRequest(`/${endpoint}/${value}`);
              return { data: data.data, error: null };
            } catch (error: any) {
              return { data: null, error };
            }
          }
        }),
        order: (column: string, options?: { ascending?: boolean }) => ({
          ...queryBuilder,
          then: async (resolve: any) => {
            try {
              const data = await apiRequest(`/${endpoint}`);
              resolve({ data: data.data || [], error: null });
            } catch (error: any) {
              resolve({ data: [], error });
            }
          }
        }),
        data: null,
        error: null,
        then: async (resolve: any) => {
          try {
            const data = await apiRequest(`/${endpoint}`);
            resolve({ data: data.data || [], error: null });
          } catch (error: any) {
            resolve({ data: [], error });
          }
        }
      };
      return queryBuilder;
    },

    insert: (values: any) => {
      const result = {
        select: () => ({
          single: async () => {
            try {
              const data = await apiRequest(`/${table}`, {
                method: 'POST',
                body: JSON.stringify(values),
              });
              return { data: data.data, error: null };
            } catch (error: any) {
              return { data: null, error };
            }
          }
        }),
        error: null
      };
      return result;
    },

    update: (values: any) => ({
      eq: (column: string, value: any) => {
        const result = {
          select: () => ({
            single: async () => {
              try {
                const data = await apiRequest(`/${table}/${value}`, {
                  method: 'PUT',
                  body: JSON.stringify(values),
                });
                return { data: data.data, error: null };
              } catch (error: any) {
                return { data: null, error };
              }
            }
          }),
          error: null
        };
        return result;
      }
    }),

    delete: () => ({
      eq: (column: string, value: any) => {
        const promise = async () => {
          try {
            await apiRequest(`/${table}/${value}`, { method: 'DELETE' });
            return { error: null };
          } catch (error: any) {
            return { error };
          }
        };
        return Object.assign(promise(), {
          then: (resolve: any) => promise().then(resolve)
        });
      }
    })
  })
};

export default supabase;
