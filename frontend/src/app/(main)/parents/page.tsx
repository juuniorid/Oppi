'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ParentsTable } from '@/components/parents/ParentsTable';
import { showErrorToast } from '@/components/ErrorToast';
import { useUserRole } from '@/context/UserRoleContext';
import parentService from '@/services/parent.service';
import type { User } from '@/types';
import { USER_ROLE } from '@/types/enums';

export default function ParentsPage() {
    const router = useRouter();
    const { role, loading: roleLoading } = useUserRole();
    const [parents, setParents] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    const hasAccess = role === USER_ROLE.ADMIN || role === USER_ROLE.TEACHER;

    const loadParents = useCallback(async () => {
        setLoading(true);
        try {
            const data = await parentService.getAllParentsList();
            setParents(data);
        } catch (error) {
            const err = error as Error;
            showErrorToast(err.message || 'Failed to load parents');
            setParents([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (roleLoading) return;
        if (!hasAccess) router.replace('/dashboard');
    }, [hasAccess, roleLoading, router]);

    useEffect(() => {
        if (roleLoading || !hasAccess) return;
        void loadParents();
    }, [hasAccess, loadParents, roleLoading]);

    if (roleLoading || !hasAccess) return null;

    return (
        <Box sx={{ display: 'grid', gap: 3 }}>
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={2}
            >
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        Lapsevanemad
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Sirvige platvormi lapsevanemaid ja nende kontaktandmeid.
                    </Typography>
                </Box>
            </Stack>

            <ParentsTable rows={parents} loading={loading || roleLoading} />
        </Box>
    );
}