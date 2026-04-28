'use client';

import * as React from 'react';
import dayjs from 'dayjs';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import type { Child } from '@/types';

type ChildrenTableProps = {
  rows: Child[];
  loading: boolean;
  canManage: boolean;
  onEdit: (child: Child) => void;
};

function getAge(dateOfBirth?: string | null): string {
  if (!dateOfBirth) {
    return '-';
  }

  const birthDate = dayjs(dateOfBirth);
  if (!birthDate.isValid()) {
    return '-';
  }

  return String(dayjs().diff(birthDate, 'year'));
}

export function ChildrenTable({ rows, loading, canManage, onEdit }: ChildrenTableProps) {
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
              <TableCell>Nimi</TableCell>
              <TableCell>Perekonnanimi</TableCell>
              <TableCell>Rühma ID</TableCell>
              <TableCell>Vanus</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography variant="body2" color="text.secondary">
                    Loading children...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : paginatedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography variant="body2" color="text.secondary">
                    No children found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((child) => (
                <TableRow key={child.id} hover>
                  <TableCell>{child.id}</TableCell>
                  <TableCell>{child.firstName || '-'}</TableCell>
                  <TableCell>{child.lastName || '-'}</TableCell>
                  <TableCell>{child.groupId ?? '-'}</TableCell>
                  <TableCell>{getAge(child.dateOfBirth)}</TableCell>
                  <TableCell align="right">
                    {canManage ? (
                      <Button size="small" variant="neutral" onClick={() => onEdit(child)}>
                        Muuda
                      </Button>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Read only
                      </Typography>
                    )}
                  </TableCell>
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
      />
    </Paper>
  );
}
