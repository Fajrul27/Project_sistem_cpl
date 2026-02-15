
import { useState } from "react";
import { DashboardPage } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StaffList } from "./users/StaffList";
import { StudentList } from "./users/StudentList";

const UsersPage = () => {
  const [activeTab, setActiveTab] = useState("staff");

  return (
    <DashboardPage
      title="Akun Pengguna"
      description="Konfigurasi hak akses dan kredensial pengguna"
    >
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100 dark:bg-muted p-1 rounded-xl gap-2 h-auto">
            <TabsTrigger
              value="staff"
              className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-muted-foreground/10 transition-all duration-300 ease-in-out rounded-lg font-medium"
            >
              Dosen & Tenaga Kependidikan
            </TabsTrigger>
            <TabsTrigger
              value="mahasiswa"
              className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-muted-foreground/10 transition-all duration-300 ease-in-out rounded-lg font-medium"
            >
              Mahasiswa
            </TabsTrigger>
          </TabsList>

          <TabsContent value="staff" className="animate-in fade-in slide-in-from-top-4 duration-500">
            <StaffList />
          </TabsContent>

          <TabsContent value="mahasiswa" className="animate-in fade-in slide-in-from-top-4 duration-500">
            <StudentList />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardPage>
  );
};

export default UsersPage;
