'use client';

import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import type { User } from '@/types';

type ParentsTableProps = {
    rows: User[];
    loading: boolean;
};

export function ParentsTable({ rows, loading }: ParentsTableProps) {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    React.useEffect(() => {
        const maxPage = Math.max(0, Math.ceil(rows.length / rowsPerPage) - 1);
        if (page > maxPage) {
            setPage(maxPage);
        }
    }, [page, rows.length, rowsPerPage]);

    const paginatedRows = React.useMemo(() => {
        const start = page * rowsPerPage;
        return rows.slice(start, start + rowsPerPage);
    }, [page, rows, rowsPerPage]);

    return (
        <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
            <TableContainer>
                <Table size="medium">
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Eesnimi</TableCell>
                            <TableCell>Perekonnanimi</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Telefon</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5}>
                                    <Typography variant="body2" color="text.secondary">
                                        Laadimine...
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : paginatedRows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5}>
                                    <Typography variant="body2" color="text.secondary">
                                        Lapsevanemaid ei leitud.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedRows.map((parent) => (
                                <TableRow key={parent.id} hover>
                                    <TableCell>{parent.id}</TableCell>
                                    <TableCell>{parent.firstName || '-'}</TableCell>
                                    <TableCell>{parent.lastName || '-'}</TableCell>
                                    <TableCell>{parent.email}</TableCell>
                                    <TableCell>{parent.phone || '-'}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                component="div"
                count={rows.length}
                page={page}
                onPageChange={(_event, nextPage) => setPage(nextPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(event) => {
                    setRowsPerPage(parseInt(event.target.value, 10));
                    setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25]}
                labelRowsPerPage="Ridu lehel:"
            />
        </Paper>
    );
}