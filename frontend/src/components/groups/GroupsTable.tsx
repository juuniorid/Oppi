'use client';

import * as React from 'react';
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
import type { Group } from '@/types';

type GroupsTableProps = {
  rows: Group[];
  loading: boolean;
  canManage: boolean;
  onEdit: (group: Group) => void;
};

function formatTeachers(group: Group): string {
  if (!group.teachers || group.teachers.length === 0) {
    return '-';
  }
  return group.teachers
    .map((t) => [t.firstName, t.lastName].filter(Boolean).join(' ') || `User ${t.id}`)
    .join(', ');
}

export function GroupsTable({ rows, loading, canManage, onEdit }: GroupsTableProps) {
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
              <TableCell>Lapsed</TableCell>
              <TableCell>Õpetajad</TableCell>
              <TableCell>Vanus (min)</TableCell>
              <TableCell>Vanus (max)</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography variant="body2" color="text.secondary">
                    Loading groups...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : paginatedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography variant="body2" color="text.secondary">
                    No groups found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((group) => (
                <TableRow key={group.id} hover>
                  <TableCell>{group.id}</TableCell>
                  <TableCell>{group.name || '-'}</TableCell>
                  <TableCell>{group.childrenCount ?? 0}</TableCell>
                  <TableCell>{formatTeachers(group)}</TableCell>
                  <TableCell>{group.ageMin ?? '-'}</TableCell>
                  <TableCell>{group.ageMax ?? '-'}</TableCell>
                  <TableCell align="right">
                    {canManage ? (
                      <Button size="small" variant="neutral" onClick={() => onEdit(group)}>
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
