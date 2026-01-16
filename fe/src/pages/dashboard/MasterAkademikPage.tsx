import { useState } from 'react';
import { DashboardPage } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookCheck, BookOpen, Calendar, Users } from 'lucide-react';

import TahunAjaranPage from './TahunAjaranPage';
import KurikulumPage from './Kurikulum';
import AngkatanPage from './Angkatan';

export default function MasterAkademikPage() {
    const [activeTab, setActiveTab] = useState('tahun_ajaran');

    return (
        <DashboardPage
            title="Master Akademik"
            description="Konfigurasi tahun ajaran, kurikulum, dan angkatan yang berlaku."
        >
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
        </DashboardPage>
    );
}
