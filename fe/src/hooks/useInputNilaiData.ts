import { useState, useEffect } from 'react';
import { fetchMahasiswaList, fetchCplList, fetchMataKuliahList } from '@/lib/api';
import { toast } from 'sonner';

export function useInputNilaiData() {
  const [mahasiswaList, setMahasiswaList] = useState<any[]>([]);
  const [cplList, setCplList] = useState<any[]>([]);
  const [mkList, setMkList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [mahasiswaRes, cplRes, mkRes] = await Promise.all([
          fetchMahasiswaList(),
          fetchCplList(),
          fetchMataKuliahList(),
        ]);

        setMahasiswaList(mahasiswaRes.data || []);
        setCplList(cplRes.data || []);
        setMkList(mkRes.data || []);

      } catch (err: any) {
        const errorMessage = err.message || 'Gagal memuat data esensial';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { mahasiswaList, cplList, mkList, loading, error };
}
