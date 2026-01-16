import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface DosenAnalysisTableProps {
    data: {
        id: string;
        nama: string;
        totalKelas: number;
        avgNilai: number;
        progressInput: number;
    }[];
}

type SortField = 'nama' | 'totalKelas' | 'avgNilai' | 'progressInput';
type SortOrder = 'asc' | 'desc';

export const DosenAnalysisTable = ({ data }: DosenAnalysisTableProps) => {
    const [sortField, setSortField] = useState<SortField>('progressInput');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            // Toggle order if same field
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            // New field, default to desc for numbers, asc for name
            setSortField(field);
            setSortOrder(field === 'nama' ? 'asc' : 'desc');
        }
    };

    const sortedData = [...data].sort((a, b) => {
        let comparison = 0;

        switch (sortField) {
            case 'nama':
                comparison = a.nama.localeCompare(b.nama);
                break;
            case 'totalKelas':
                comparison = a.totalKelas - b.totalKelas;
                break;
            case 'avgNilai':
                comparison = a.avgNilai - b.avgNilai;
                break;
            case 'progressInput':
                comparison = a.progressInput - b.progressInput;
                break;
        }

        return sortOrder === 'asc' ? comparison : -comparison;
    });

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) {
            return <ArrowUpDown className="h-4 w-4 ml-1 opacity-30" />;
        }
        return sortOrder === 'asc'
            ? <ArrowUp className="h-4 w-4 ml-1" />
            : <ArrowDown className="h-4 w-4 ml-1" />;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Analisis Kinerja Dosen</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50 select-none"
                                onClick={() => handleSort('nama')}
                            >
                                <div className="flex items-center">
                                    Nama Dosen
                                    <SortIcon field="nama" />
                                </div>
                            </TableHead>
                            <TableHead
                                className="text-center cursor-pointer hover:bg-muted/50 select-none"
                                onClick={() => handleSort('totalKelas')}
                            >
                                <div className="flex items-center justify-center">
                                    Total Kelas
                                    <SortIcon field="totalKelas" />
                                </div>
                            </TableHead>
                            <TableHead
                                className="text-center cursor-pointer hover:bg-muted/50 select-none"
                                onClick={() => handleSort('avgNilai')}
                            >
                                <div className="flex items-center justify-center">
                                    Rata-rata Nilai
                                    <SortIcon field="avgNilai" />
                                </div>
                            </TableHead>
                            <TableHead
                                className="text-center cursor-pointer hover:bg-muted/50 select-none"
                                onClick={() => handleSort('progressInput')}
                            >
                                <div className="flex items-center justify-center">
                                    Progress Input
                                    <SortIcon field="progressInput" />
                                </div>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedData.length > 0 ? (
                            sortedData.map((dosen) => (
                                <TableRow key={dosen.id}>
                                    <TableCell className="font-medium">{dosen.nama}</TableCell>
                                    <TableCell className="text-center">{dosen.totalKelas}</TableCell>
                                    <TableCell className="text-center">{dosen.avgNilai.toFixed(2)}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={dosen.progressInput === 100 ? "default" : "secondary"}>
                                            {dosen.progressInput.toFixed(1)}%
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                    Tidak ada data dosen
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};
