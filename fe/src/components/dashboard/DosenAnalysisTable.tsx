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

interface DosenAnalysisTableProps {
    data: {
        id: string;
        nama: string;
        totalKelas: number;
        avgNilai: number;
        progressInput: number;
    }[];
}

export const DosenAnalysisTable = ({ data }: DosenAnalysisTableProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Analisis Kinerja Dosen</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nama Dosen</TableHead>
                            <TableHead className="text-center">Total Kelas</TableHead>
                            <TableHead className="text-center">Rata-rata Nilai</TableHead>
                            <TableHead className="text-center">Progress Input</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length > 0 ? (
                            data.map((dosen) => (
                                <TableRow key={dosen.id}>
                                    <TableCell className="font-medium">{dosen.nama}</TableCell>
                                    <TableCell className="text-center">{dosen.totalKelas}</TableCell>
                                    <TableCell className="text-center">{dosen.avgNilai}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={dosen.progressInput === 100 ? "default" : "secondary"}>
                                            {dosen.progressInput}%
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
