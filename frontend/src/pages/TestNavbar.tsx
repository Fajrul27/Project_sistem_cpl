import { DashboardPage } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestNavbar() {
  return (
    <DashboardPage
      title="🎨 Test Navbar Baru"
      description="Halaman test untuk memastikan navbar baru berfungsi"
      actions={
        <Button variant="default">
          Test Action
        </Button>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Navbar Baru Berhasil!</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-lg">
              ✅ Jika Anda melihat halaman ini dengan navbar yang baru, berarti berhasil!
            </p>
            
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Cek Navbar Anda:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>✅ Avatar dengan gradient background?</li>
                <li>✅ Nama user tampil di samping avatar?</li>
                <li>✅ Role badge di dropdown menu?</li>
                <li>✅ Menu "Profil Saya" & "Pengaturan"?</li>
                <li>✅ Responsive di mobile?</li>
              </ul>
            </div>

            <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
              <p className="text-sm">
                💡 <strong>Tip:</strong> Buka browser console (F12) dan cari emoji 🎨
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardPage>
  );
}
