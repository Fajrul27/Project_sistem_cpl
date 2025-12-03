import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StudentEvaluationTableProps {
    data: {
        id: string;
        nama: string;
        nim: string;
        avgCpl: number;
        lowCplCount: number;
    }[];
}

export const StudentEvaluationTable = ({ data }: StudentEvaluationTableProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Evaluasi Mahasiswa (Perlu Perhatian)</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nama Mahasiswa</TableHead>
                            <TableHead>NIM</TableHead>
                            <TableHead className="text-center">Rata-rata CPL</TableHead>
                            <TableHead className="text-center">CPL Rendah (&lt;55)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length > 0 ? (
                            data.map((mhs) => (
                                <TableRow key={mhs.id}>
                                    <TableCell className="font-medium">{mhs.nama}</TableCell>
                                    <TableCell>{mhs.nim}</TableCell>
                                    <TableCell className="text-center">{mhs.avgCpl}</TableCell>
                                    <TableCell className="text-center">
                                        {mhs.lowCplCount > 0 ? (
                                            <span className="text-red-500 font-bold">{mhs.lowCplCount}</span>
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
            </CardContent>
        </Card>
    );
};
