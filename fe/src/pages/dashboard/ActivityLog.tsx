import { useState, useEffect } from "react";
import { DashboardPage } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { Search, RefreshCw, Undo, Eye, Filter, Download, Calendar as CalendarIcon, Activity, Users, FileText } from "lucide-react";
import { Pagination } from "@/components/common/Pagination";

interface AuditLog {
    id: string;
    action: string;
    tableName: string;
    recordId: string;
    oldData: string | null;
    newData: string | null;
    createdAt: string;
    user: {
        email: string;
        profile: {
            namaLengkap: string;
        } | null;
    } | null;
}

interface ActivityStats {
    totalToday: number;
    totalWeek: number;
    actions: { action: string; count: number }[];
    topUsers: { name: string; email: string; count: number }[];
}

interface UserOption {
    id: string;
    name: string;
    email: string;
}

// Helper to safely parse JSON
const safeParseJSON = (jsonString: string | null) => {
    if (!jsonString) return null;
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        return jsonString; // Return as string if parse fails
    }
};

// Component to render data recursively with sensitive field masking and diff highlighting
const DataViewer = ({ data, compareWith }: { data: any, compareWith?: any }) => {
    const parsedData = typeof data === 'string' ? safeParseJSON(data) : data;
    const parsedCompare = typeof compareWith === 'string' ? safeParseJSON(compareWith) : compareWith;

    if (!parsedData) return <span className="text-muted-foreground italic">null</span>;

    if (typeof parsedData !== 'object') {
        return <span className="font-mono text-xs break-all">{String(parsedData)}</span>;
    }

    // List of keys to mask
    const SENSITIVE_KEYS = ['password', 'token', 'hash', 'secret', 'otp', 'credential'];
    // List of keys to hide (metadata/noise)
    const HIDDEN_KEYS = ['id', 'createdat', 'updatedat', 'createdby', 'updatedby', 'deletedat'];

    const formatKey = (key: string) => {
        // Convert camelCase to Title Case
        const result = key.replace(/([A-Z])/g, " $1");
        return result.charAt(0).toUpperCase() + result.slice(1);
    };

    const isKeyHidden = (key: string) => {
        const lowerKey = key.toLowerCase();
        if (HIDDEN_KEYS.includes(lowerKey)) return true;
        // Hide foreign keys (ending in 'Id' or '_id') unless it's just 'id' (already covered)
        if (lowerKey.length > 2 && (lowerKey.endsWith('id') || lowerKey.endsWith('_id'))) return true;
        return false;
    };

    const renderValue = (key: string, value: any, compareTo: any) => {
        if (value === null) return <span className="text-muted-foreground italic">null</span>;

        // Mask sensitive data
        if (SENSITIVE_KEYS.some(k => key.toLowerCase().includes(k))) {
            return <span className="font-mono text-xs text-muted-foreground select-none">••••••••</span>;
        }

        const hasChanged = compareTo !== undefined && JSON.stringify(value) !== JSON.stringify(compareTo);
        const style = hasChanged ? "bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded -ml-1" : "";

        if (typeof value === 'object') {
            return (
                <div className={`pl-4 border-l-2 border-muted mt-1 ${style}`}>
                    {Object.entries(value).map(([k, v]) => {
                        if (isKeyHidden(k)) return null;
                        return (
                            <div key={k} className="my-1">
                                <span className="text-xs font-semibold text-muted-foreground mr-2">{formatKey(k)}:</span>
                                {renderValue(k, v, compareTo?.[k])}
                            </div>
                        );
                    })}
                </div>
            );
        }

        // Boolean
        if (typeof value === 'boolean') {
            return (
                <span className={style}>
                    <Badge variant={value ? "outline" : "secondary"} className="h-5 text-[10px] px-1">{value ? 'true' : 'false'}</Badge>
                </span>
            );
        }

        return <span className={`font-mono text-xs break-all ${style}`}>{String(value)}</span>;
    };

    return (
        <div className="space-y-1">
            {Object.entries(parsedData).map(([key, value]) => {
                // Filter out hidden keys
                if (isKeyHidden(key)) return null;

                const compareToValue = parsedCompare?.[key];
                const hasChanged = parsedCompare && JSON.stringify(value) !== JSON.stringify(compareToValue);

                return (
                    <div key={key} className={`flex flex-col py-1 border-b border-border/50 last:border-0 hover:bg-muted/20 ${hasChanged ? 'bg-yellow-50/50 dark:bg-yellow-900/10' : ''}`}>
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold text-foreground/80 mb-0.5 ${hasChanged ? 'text-yellow-700 dark:text-yellow-400' : ''}`}>{formatKey(key)}</span>
                            {hasChanged && <span className="text-[10px] bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-1 rounded-sm">Changed</span>}
                        </div>
                        <div className="pl-1">
                            {renderValue(key, value, compareToValue)}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const ActivityLogPage = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [stats, setStats] = useState<ActivityStats | null>(null);
    const [users, setUsers] = useState<UserOption[]>([]);
    const [filters, setFilters] = useState({
        action: "all",
        tableName: "",
        userId: "all",
        startDate: "",
        endDate: ""
    });

    // Alert Dialog State
    const [restoreId, setRestoreId] = useState<string | null>(null);
    const [isRestoring, setIsRestoring] = useState(false);

    const fetchStats = async () => {
        try {
            const res = await api.get('/audit-logs/stats');
            setStats(res.data || res);
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            const userData = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
            setUsers(userData.map((u: any) => ({
                id: u.id,
                name: u.profile?.namaLengkap || 'Unknown',
                email: u.email
            })));
        } catch (error) {
            console.error("Failed to fetch users:", error);
        }
    };

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "20",
            });

            if (filters.action !== "all") params.append("action", filters.action);
            if (filters.userId !== "all") params.append("userId", filters.userId);
            if (filters.tableName) params.append("tableName", filters.tableName);
            if (filters.startDate) params.append("startDate", filters.startDate);
            if (filters.endDate) params.append("endDate", filters.endDate);

            const response = await api.get(`/audit-logs?${params.toString()}`);

            setLogs(response.data || []);
            setTotalPages(response.meta?.totalPages || 1);
        } catch (error: any) {
            console.error("Failed to fetch logs:", error);
            toast.error("Gagal memuat log aktivitas");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchUsers();
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [page, filters]);

    const handleRestore = async () => {
        if (!restoreId) return;
        setIsRestoring(true);
        try {
            await api.post(`/audit-logs/${restoreId}/restore`, {});
            toast.success("Data berhasil dikembalikan");
            fetchLogs(); // Refresh
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.error || "Gagal mengembalikan data");
        } finally {
            setIsRestoring(false);
            setRestoreId(null);
        }
    };

    const handleExport = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.action !== "all") params.append("action", filters.action);
            if (filters.userId !== "all") params.append("userId", filters.userId);
            if (filters.tableName) params.append("tableName", filters.tableName);
            if (filters.startDate) params.append("startDate", filters.startDate);
            if (filters.endDate) params.append("endDate", filters.endDate);

            // Use window.open because we want browser to handle download
            // But we need auth token, so window.open might fail if cookie not present/sufficient.
            // Better to fetch blob.
            const response = await api.get(`/audit-logs/export?${params.toString()}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data as any]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (error) {
            console.error("Export failed:", error);
            toast.error("Gagal mengunduh data");
        }
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'CREATE': return 'bg-green-100 text-green-800 hover:bg-green-100';
            case 'UPDATE': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
            case 'DELETE': return 'bg-red-100 text-red-800 hover:bg-red-100';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <DashboardPage title="Log Aktivitas Pengguna" description="Pantau aktivitas pengguna dan kelola riwayat perubahan data.">

            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Aktivitas Hari Ini</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalToday}</div>
                            <p className="text-xs text-muted-foreground">
                                +{stats.totalWeek} dalam 7 hari terakhir
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pengguna Teraktif</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold truncate text-sm" title={stats.topUsers[0]?.name}>
                                {stats.topUsers[0]?.name || "-"}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.topUsers[0]?.count || 0} aktivitas
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Aksi Terbanyak</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.actions[0]?.action || "-"}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.actions[0]?.count || 0} kali
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="flex flex-col justify-center items-center p-6 bg-muted/20 border-dashed">
                        <Button variant="outline" className="w-full" onClick={handleExport}>
                            <Download className="mr-2 h-4 w-4" /> Export CSV
                        </Button>
                    </Card>
                </div>
            )}

            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                        <div className="grid grid-cols-2 gap-4 flex-1">
                            {/* Date Filters */}
                            <div className="flex flex-col space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground">Dari Tanggal</label>
                                <Input
                                    type="date"
                                    value={filters.startDate}
                                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                                />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground">Sampai Tanggal</label>
                                <Input
                                    type="date"
                                    value={filters.endDate}
                                    onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 flex-1">
                            <div className="flex flex-col space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground">User</label>
                                <Select
                                    value={filters.userId}
                                    onValueChange={(v) => setFilters(prev => ({ ...prev, userId: v }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Semua User" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua User</SelectItem>
                                        {users.map(u => (
                                            <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground">Aksi</label>
                                <Select
                                    value={filters.action}
                                    onValueChange={(v) => setFilters(prev => ({ ...prev, action: v }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Semua Aksi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Aksi</SelectItem>
                                        <SelectItem value="CREATE">Create</SelectItem>
                                        <SelectItem value="UPDATE">Update</SelectItem>
                                        <SelectItem value="DELETE">Delete</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex flex-col space-y-1.5 w-full md:w-auto">
                            <label className="text-xs font-semibold text-muted-foreground">&nbsp;</label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Cari Table..."
                                    value={filters.tableName}
                                    onChange={(e) => setFilters(prev => ({ ...prev, tableName: e.target.value }))}
                                    className="w-32 lg:w-40"
                                />
                                <Button variant="secondary" onClick={fetchLogs}>
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Riwayat Aktivitas</CardTitle>
                    <CardDescription>Menampilkan 20 item per halaman</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Waktu</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Aksi</TableHead>
                                    <TableHead>Resource</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
                                    </TableRow>
                                ) : logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8">Tidak ada data aktivitas</TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="whitespace-nowrap">
                                                {format(new Date(log.createdAt), "dd MMM yyyy HH:mm")}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{log.user?.profile?.namaLengkap || 'Unknown/System'}</span>
                                                    <span className="text-xs text-muted-foreground">{log.user?.email || 'N/A'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={getActionColor(log.action)}>
                                                    {log.action}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <code className="bg-muted px-1 py-0.5 rounded text-xs font-semibold">{log.tableName}</code>
                                                <span className="text-xs text-muted-foreground ml-2" title={log.recordId}>
                                                    #{log.recordId ? log.recordId.substring(0, 8) : 'N/A'}...
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
                                                        <DialogHeader>
                                                            <DialogTitle>Detail Perubahan</DialogTitle>
                                                            <DialogDescription>
                                                                {log.action} on <span className="font-mono font-medium text-primary">{log.tableName}</span> (#{log.recordId})
                                                            </DialogDescription>
                                                        </DialogHeader>

                                                        <div className="flex-1 grid grid-cols-2 gap-4 min-h-0 mt-2">
                                                            <div className="flex flex-col border rounded-md overflow-hidden bg-muted/30">
                                                                <div className="px-4 py-2 border-b bg-muted/50 flex items-center justify-between">
                                                                    <h4 className="font-semibold text-sm text-red-600 flex items-center gap-2">
                                                                        <div className="w-2 h-2 rounded-full bg-red-500" />
                                                                        Sebelum (Old)
                                                                    </h4>
                                                                    {log.oldData === null && <Badge variant="outline" className="text-[10px] h-5">Empty</Badge>}
                                                                </div>
                                                                <ScrollArea className="flex-1 p-0">
                                                                    <div className="p-4">
                                                                        {log.oldData ? (
                                                                            <DataViewer data={log.oldData} />
                                                                        ) : (
                                                                            <div className="text-muted-foreground text-sm italic py-8 text-center">Tidak ada data sebelumnya</div>
                                                                        )}
                                                                    </div>
                                                                </ScrollArea>
                                                            </div>

                                                            <div className="flex flex-col border rounded-md overflow-hidden bg-muted/30">
                                                                <div className="px-4 py-2 border-b bg-muted/50 flex items-center justify-between">
                                                                    <h4 className="font-semibold text-sm text-green-600 flex items-center gap-2">
                                                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                                                        Sesudah (New)
                                                                    </h4>
                                                                    {log.newData === null && <Badge variant="outline" className="text-[10px] h-5">Empty</Badge>}
                                                                </div>
                                                                <ScrollArea className="flex-1 p-0">
                                                                    <div className="p-4">
                                                                        {log.newData ? (
                                                                            <DataViewer data={log.newData} compareWith={log.oldData} />
                                                                        ) : (
                                                                            <div className="text-muted-foreground text-sm italic py-8 text-center">Tidak ada data baru</div>
                                                                        )}
                                                                    </div>
                                                                </ScrollArea>
                                                            </div>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                                {log.action === 'DELETE' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                        onClick={() => setRestoreId(log.id)}
                                                    >
                                                        <Undo className="w-4 h-4 mr-1" />
                                                        Restore
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />
                </CardContent>
            </Card>

            <AlertDialog open={!!restoreId} onOpenChange={(open) => !open && setRestoreId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Konfirmasi Restore Data</AlertDialogTitle>
                        <AlertDialogDescription>
                            Anda akan mengembalikan data yang telah dihapus. Pastikan data yang berhubungan (parent data) masih ada, atau proses ini mungkin gagal.
                            <br /><br />
                            Apakah Anda yakin ingin melanjutkan?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isRestoring}>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={(e) => { e.preventDefault(); handleRestore(); }} disabled={isRestoring}>
                            {isRestoring ? 'Memproses...' : 'Ya, Restore Data'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardPage>
    );
};

export default ActivityLogPage;
