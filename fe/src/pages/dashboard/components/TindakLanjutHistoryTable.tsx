import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEvaluasiCPL } from "@/hooks/useEvaluasiCPL";
import { useUserRole } from "@/hooks/useUserRole";
import { CheckCircle, Clock } from "lucide-react";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface TindakLanjutHistoryTableProps {
    prodiId: string;
    cplId?: string;
    onClose?: () => void;
}

export const TindakLanjutHistoryTable: React.FC<TindakLanjutHistoryTableProps> = ({ prodiId, cplId }) => {
    const { fetchTindakLanjutHistory, updateTindakLanjutStatus } = useEvaluasiCPL();
    const { role } = useUserRole();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const loadHistory = async () => {
        setLoading(true);
        const data = await fetchTindakLanjutHistory(prodiId, { cplId });
        setHistory(data);
        setLoading(false);
    };

    useEffect(() => {
        loadHistory();
    }, [prodiId, cplId]);

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        const success = await updateTindakLanjutStatus(id, newStatus);
        if (success) {
            loadHistory();
        }
    };

    if (loading) return <LoadingScreen fullScreen={false} />;

    if (history.length === 0) {
        return <div className="text-center py-8 text-muted-foreground">Belum ada riwayat tindak lanjut.</div>;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Kode CPL</TableHead>
                    <TableHead>Angkatan</TableHead>
                    <TableHead>Akar Masalah</TableHead>
                    <TableHead>Rencana Perbaikan</TableHead>
                    <TableHead>PIC</TableHead>
                    {role !== 'dosen' ? <TableHead>Diusulkan Oleh</TableHead> : null}
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {history.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell className="whitespace-nowrap">
                            {format(new Date(item.createdAt), 'dd MMM yyyy', { locale: id })}
                        </TableCell>
                        <TableCell className="font-medium">{item.cpl?.kode || item.cpl?.kodeCpl || '-'}</TableCell>
                        <TableCell>{item.angkatan}</TableCell>
                        <TableCell className="max-w-xs truncate" title={item.akarMasalah}>{item.akarMasalah}</TableCell>
                        <TableCell className="max-w-xs truncate" title={item.rencanaPerbaikan}>{item.rencanaPerbaikan}</TableCell>
                        <TableCell>{item.penanggungJawab}</TableCell>
                        {role !== 'dosen' && (
                            <TableCell className="text-muted-foreground italic text-xs">
                                {item.creator?.profile?.namaLengkap || item.createdBy}
                            </TableCell>
                        )}
                        <TableCell>
                            <Badge variant={item.status === 'closed' ? "default" : "outline"} className={item.status === 'closed' ? "bg-green-600 hover:bg-green-700" : "text-yellow-600 border-yellow-600"}>
                                {item.status === 'closed' ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                                {item.status === 'closed' ? 'Selesai' : 'Pending'}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            {item.status !== 'closed' && role !== 'dosen' && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUpdateStatus(item.id, 'closed')}
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Tandai Selesai
                                </Button>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};
