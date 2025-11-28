// ============================================
// API Client - Temporary Stub
// ============================================
// This is a temporary stub to replace Supabase
// Full implementation will be in Express backend

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Mock data for development
const mockData = {
  users: [
    {
      id: '1',
      email: 'admin@sistem-cpl.ac.id',
      role: 'admin',
      profile: {
        nama_lengkap: 'Administrator System',
        nip: '198800000001'
      }
    },
    {
      id: '2',
      email: 'dosen1@sistem-cpl.ac.id',
      role: 'dosen',
      profile: {
        nama_lengkap: 'Dr. Budi Santoso, M.Kom',
        nip: '198801010001'
      }
    },
    {
      id: '3',
      email: 'mahasiswa1@student.ac.id',
      role: 'mahasiswa',
      profile: {
        nama_lengkap: 'Ahmad Rizki Wijaya',
        nim: '2101010001'
      }
    }
  ],
  cpl: [
    {
      id: '1',
      kode_cpl: 'CPL-01',
      deskripsi: 'Mampu menerapkan pemikiran logis, kritis, sistematis',
      kategori: 'Sikap',
      bobot: 1.0,
      is_active: true
    }
  ],
  mataKuliah: [
    {
      id: '1',
      kode_mk: 'IF-101',
      nama_mk: 'Pemrograman Dasar',
      sks: 3,
      semester: 1,
      is_active: true
    }
  ]
};

// Storage helpers
function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token: string) {
  localStorage.setItem('token', token);
}

export function clearToken() {
  localStorage.removeItem('token');
}

export function setUser(user: any) {
  localStorage.setItem('user', JSON.stringify(user));
}

export function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

// Temporary supabase-like interface for backward compatibility
// Auth state change callbacks
const authCallbacks: Array<(event: string, session: any) => void> = [];

export const supabase = {
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      // Mock authentication
      const user = mockData.users.find(u => u.email === email);
      if (user && password === 'admin123') {
        const token = 'mock-token-' + Date.now();
        const session = {
          access_token: token,
          user: { id: user.id, email: user.email }
        };
        setToken(token);
        setUser(user);

        // Trigger auth state change callbacks
        setTimeout(() => {
          authCallbacks.forEach(cb => cb('SIGNED_IN', session));
        }, 100);

        return {
          data: {
            user: { id: user.id, email: user.email },
            session
          },
          error: null
        };
      }
      return {
        data: { user: null, session: null },
        error: { message: 'Email atau password salah' }
      };
    },

    signUp: async ({ email, password, options }: { email: string; password: string; options?: any }) => {
      // Check if user already exists
      const existing = mockData.users.find(u => u.email === email);
      if (existing) {
        return {
          data: { user: null, session: null },
          error: { message: 'Email sudah terdaftar' }
        };
      }

      const newUser = {
        id: String(mockData.users.length + 1),
        email,
        role: 'mahasiswa',
        profile: {
          nama_lengkap: options?.data?.full_name || 'User Baru',
          nip: ''
        }
      };
      mockData.users.push(newUser);

      // Don't auto-login after signup, just return success
      return {
        data: {
          user: { id: newUser.id, email: newUser.email },
          session: null // Supabase doesn't auto-login on signup
        },
        error: null
      };
    },

    signOut: async () => {
      clearToken();
      localStorage.removeItem('user');
      return { error: null };
    },

    getSession: async () => {
      const token = getToken();
      const user = getUser();
      if (token && user) {
        return {
          data: {
            session: {
              access_token: token,
              user: { id: user.id, email: user.email }
            }
          },
          error: null
        };
      }
      return { data: { session: null }, error: null };
    },

    getUser: async () => {
      const user = getUser();
      if (user) {
        return {
          data: { user: { id: user.id, email: user.email } },
          error: null
        };
      }
      return { data: { user: null }, error: null };
    },

    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      // Register callback
      authCallbacks.push(callback);

      // Return subscription object with unsubscribe
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
      const queryBuilder = {
        eq: (column: string, value: any) => ({
          ...queryBuilder,
          single: async () => {
            const data = (mockData as any)[table];
            if (!data) return { data: null, error: null };
            const result = data.find((item: any) => item[column] === value);
            return { data: result || null, error: null };
          }
        }),
        not: (column: string, op: string, value: any) => ({
          ...queryBuilder,
          then: async (resolve: any) => {
            const data = (mockData as any)[table] || [];
            const filtered = data.filter((item: any) => item[column] !== value);
            resolve({ data: filtered, error: null });
          }
        }),
        order: (column: string, options?: { ascending?: boolean }) => ({
          ...queryBuilder,
          then: async (resolve: any) => {
            const data = [...((mockData as any)[table] || [])];
            data.sort((a, b) => {
              if (options?.ascending === false) return b[column] > a[column] ? 1 : -1;
              return a[column] > b[column] ? 1 : -1;
            });
            resolve({ data, error: null });
          }
        }),
        data: null,
        error: null,
        then: async (resolve: any) => {
          const data = (mockData as any)[table] || [];
          resolve({ data, error: null });
        }
      };
      return queryBuilder;
    },

    insert: (values: any) => {
      const result = {
        select: () => ({
          single: async () => {
            const data = (mockData as any)[table];
            if (data) {
              const newItem = { id: String(data.length + 1), ...values };
              data.push(newItem);
              return { data: newItem, error: null };
            }
            return { data: null, error: null };
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
              const data = (mockData as any)[table];
              if (data) {
                const index = data.findIndex((item: any) => item[column] === value);
                if (index !== -1) {
                  data[index] = { ...data[index], ...values };
                  return { data: data[index], error: null };
                }
              }
              return { data: null, error: null };
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
          const data = (mockData as any)[table];
          if (data) {
            const index = data.findIndex((item: any) => item[column] === value);
            if (index !== -1) {
              data.splice(index, 1);
            }
          }
          return { error: null };
        };
        return Object.assign(promise(), {
          then: (resolve: any) => promise().then(resolve)
        });
      }
    })
  })
};

// Export for compatibility
export default supabase;
