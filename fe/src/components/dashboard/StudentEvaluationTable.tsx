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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface LowCplDetail {
    kodeCpl: string;
    nilai: number;
}

interface StudentEvaluationTableProps {
    data: {
        id: string;
        nama: string;
        nim: string;
        avgCpl: number;
        lowCplCount: number;
        lowCplDetails?: LowCplDetail[];
    }[];
}

type SortField = 'nama' | 'nim' | 'avgCpl' | 'lowCplCount';
type SortOrder = 'asc' | 'desc';

export const StudentEvaluationTable = ({ data }: StudentEvaluationTableProps) => {
    const [sortField, setSortField] = useState<SortField>('lowCplCount');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [selectedStudent, setSelectedStudent] = useState<{
        nama: string;
        details: LowCplDetail[];
    } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    const handleRowClick = (student: any) => {
        if (student.lowCplCount > 0 && student.lowCplDetails) {
            setSelectedStudent({
                nama: student.nama,
                details: student.lowCplDetails
            });
        }
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder(field === 'nama' || field === 'nim' ? 'asc' : 'desc');
        }
    };

    const sortedData = [...data].sort((a, b) => {
        let comparison = 0;

        switch (sortField) {
            case 'nama':
                comparison = a.nama.localeCompare(b.nama);
                break;
            case 'nim':
                comparison = a.nim.localeCompare(b.nim);
                break;
            case 'avgCpl':
                comparison = a.avgCpl - b.avgCpl;
                break;
            case 'lowCplCount':
                comparison = a.lowCplCount - b.lowCplCount;
                break;
        }

        return sortOrder === 'asc' ? comparison : -comparison;
    });

    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) {
            return <ArrowUpDown className="h-4 w-4 ml-1 opacity-30" />;
        }
        return sortOrder === 'asc'
            ? <ArrowUp className="h-4 w-4 ml-1" />
            : <ArrowDown className="h-4 w-4 ml-1" />;
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Evaluasi Mahasiswa (Perlu Perhatian)</CardTitle>
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
                                        Nama Mahasiswa
                                        <SortIcon field="nama" />
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-muted/50 select-none"
                                    onClick={() => handleSort('nim')}
                                >
                                    <div className="flex items-center">
                                        NIM
                                        <SortIcon field="nim" />
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="text-center cursor-pointer hover:bg-muted/50 select-none"
                                    onClick={() => handleSort('avgCpl')}
                                >
                                    <div className="flex items-center justify-center">
                                        Rata-rata CPL
                                        <SortIcon field="avgCpl" />
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="text-center cursor-pointer hover:bg-muted/50 select-none"
                                    onClick={() => handleSort('lowCplCount')}
                                >
                                    <div className="flex items-center justify-center">
                                        CPL Rendah (&lt;55)
                                        <SortIcon field="lowCplCount" />
                                    </div>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length > 0 ? (
                                paginatedData.map((mhs) => (
                                    <TableRow
                                        key={mhs.id}
                                        className={mhs.lowCplCount > 0 ? "cursor-pointer hover:bg-muted/50 transition-colors" : ""}
                                        onClick={() => handleRowClick(mhs)}
                                    >
                                        <TableCell className="font-medium">{mhs.nama}</TableCell>
                                        <TableCell>{mhs.nim}</TableCell>
                                        <TableCell className="text-center">{mhs.avgCpl}</TableCell>
                                        <TableCell className="text-center">
                                            {mhs.lowCplCount > 0 ? (
                                                <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 hover:bg-red-100">
                                                    {mhs.lowCplCount} Item
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                                        Tidak ada data mahasiswa yang perlu perhatian khusus
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {data.length > itemsPerPage && (
                        <div className="mt-4 flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                Halaman {currentPage} dari {totalPages}
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1}
                                >
                                    <span className="sr-only">Go to first page</span>
                                    «
                                </button>
                                <button
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <span className="sr-only">Go to previous page</span>
                                    ‹
                                </button>
                                <button
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    <span className="sr-only">Go to next page</span>
                                    ›
                                </button>
                                <button
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages}
                                >
                                    <span className="sr-only">Go to last page</span>
                                    »
                                </button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            Detail CPL Rendah
                        </DialogTitle>
                        <DialogDescription>
                            Daftar CPL yang belum mencapai target (Nilai &lt; 55) untuk mahasiswa <strong>{selectedStudent?.nama}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh] pr-4">
                        <div className="space-y-3 pt-2">
                            {selectedStudent?.details.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-card shadow-sm">
                                    <Badge variant="secondary" className="font-bold">
                                        {item.kodeCpl}
                                    </Badge>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">Nilai:</span>
                                        <span className="text-lg font-bold text-red-600">{item.nilai}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </>
    );
};
