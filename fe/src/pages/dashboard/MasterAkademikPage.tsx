import { useState } from 'react';
import { DashboardPage } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookCheck, BookOpen, Calendar, Users } from 'lucide-react';
import { usePermission } from "@/contexts/PermissionContext";
import { CollapsibleGuide } from "@/components/common/CollapsibleGuide";

import TahunAjaranPage from './TahunAjaranPage';
import KurikulumPage from './Kurikulum';
import AngkatanPage from './Angkatan';

export default function MasterAkademikPage() {
    const [activeTab, setActiveTab] = useState('tahun_ajaran');
    const { can } = usePermission();
    const canManage = can('access', 'kaprodi') || can('access', 'admin');

    const renderGuide = () => {
        if (!canManage) return null;

        switch (activeTab) {
            case 'tahun_ajaran':
                return (
                    <CollapsibleGuide title="Panduan Manajemen Tahun Ajaran">
                        <div className="space-y-3">
                            <p>Manajemen Tahun Ajaran digunakan untuk mengatur periode akademik yang aktif. Data ini menjadi referensi utama untuk semua aktivitas akademik (KRS, Nilai, dll).</p>
                            <ul className="list-disc pl-4 space-y-1.5 text-xs text-muted-foreground">
                                <li><strong>Aktifkan Periode:</strong> Pastikan hanya ada satu tahun ajaran yang berstatus 'Aktif' pada satu waktu.</li>
                                <li><strong>Sinkronisasi:</strong> Perubahan tahun ajaran aktif akan berdampak pada dashboard dosen dan mahasiswa.</li>
                            </ul>
                        </div>
                    </CollapsibleGuide>
                );
            case 'kurikulum':
                return (
                    <CollapsibleGuide title="Panduan Manajemen Kurikulum">
                        <div className="space-y-3">
                            <p>Kurikulum berfungsi sebagai wadah utama yang mengikat seluruh struktur akademik, mulai dari CPL, Mata Kuliah, hingga Profil Lulusan.</p>
                            <ul className="list-disc pl-4 space-y-1.5 text-xs text-muted-foreground">
                                <li><strong>Status Aktif:</strong> Hanya kurikulum berstatus aktif yang dapat digunakan dalam proses pemetaan dan penilaian.</li>
                                <li><strong>Tahun Mulai:</strong> Menentukan kapan angkatan mahasiswa mulai menggunakan kurikulum ini.</li>
                                <li><strong>Binding:</strong> Hubungan antara angkatan mahasiswa dengan kurikulum tertentu diatur pada halaman <em>Master Angkatan</em>.</li>
                            </ul>
                        </div>
                    </CollapsibleGuide>
                );
            case 'angkatan':
                return (
                    <CollapsibleGuide title="Panduan Manajemen Angkatan">
                        <div className="space-y-3">
                            <p>Halaman ini digunakan untuk mendaftarkan angkatan mahasiswa dan menentukan kurikulum yang berlaku bagi angkatan tersebut.</p>
                            <ul className="list-disc pl-4 space-y-1.5 text-xs text-muted-foreground">
                                <li><strong>Mapping Kurikulum:</strong> Memilih kurikulum akan menentukan kumpulan CPL dan Mata Kuliah yang harus ditempuh oleh angkatan tersebut.</li>
                                <li><strong>Status Aktif:</strong> Angkatan non-aktif tidak akan muncul pada pilihan filter di halaman evaluasi atau input nilai.</li>
                                <li><strong>Penyelarasan:</strong> Pastikan kurikulum yang dipilih sudah memiliki pemetaan CPL yang lengkap.</li>
                            </ul>
                        </div>
                    </CollapsibleGuide>
                );
            default:
                return null;
        }
    };

    return (
        <DashboardPage
            title="Master Akademik"
            description="Konfigurasi tahun ajaran, kurikulum, dan angkatan yang berlaku."
        >
            <div className="space-y-4">
                {renderGuide()}

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="tahun_ajaran" className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Tahun Ajaran
                        </TabsTrigger>
                        <TabsTrigger value="kurikulum" className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            Kurikulum
                        </TabsTrigger>
                        <TabsTrigger value="angkatan" className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Angkatan
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="tahun_ajaran">
                        <TahunAjaranPage isTabContent={true} />
                    </TabsContent>

                    <TabsContent value="kurikulum">
                        <KurikulumPage isTabContent={true} />
                    </TabsContent>

                    <TabsContent value="angkatan">
                        <AngkatanPage isTabContent={true} />
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardPage>
    );
}
