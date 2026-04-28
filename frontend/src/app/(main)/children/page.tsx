'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ChildDialog } from '@/components/children/ChildDialog';
import { ChildrenTable } from '@/components/children/ChildrenTable';
import { showErrorToast } from '@/components/ErrorToast';
import { useUserRole } from '@/context/UserRoleContext';
import childService from '@/services/child.service';
import type { Child } from '@/types';
import { USER_ROLE } from '@/types/enums';

type ChildDialogState = 'none' | 'create' | 'edit';

export default function ChildrenPage() {
	const router = useRouter();
	const { role, loading: roleLoading } = useUserRole();
	const [children, setChildren] = useState<Child[]>([]);
	const [loading, setLoading] = useState(false);
	const [dialogState, setDialogState] = useState<ChildDialogState>('none');
	const [editingChild, setEditingChild] = useState<Child | null>(null);
	const isAdmin = role === USER_ROLE.ADMIN;

	const loadChildren = useCallback(async () => {
		setLoading(true);
		try {
			const children = await childService.getAllChildrenList();
			setChildren(children);
		} catch (error) {
			const err = error as Error;
			showErrorToast(err.message || 'Failed to load children');
			setChildren([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (roleLoading) {
			return;
		}

		if (!isAdmin) {
			router.replace('/dashboard');
		}
	}, [isAdmin, roleLoading, router]);

	useEffect(() => {
		if (roleLoading || !role) {
			return;
		}

		if (!isAdmin) {
			return;
		}

		void loadChildren();
	}, [isAdmin, loadChildren, role, roleLoading]);

	const handleAddChild = () => {
		if (!isAdmin) {
			return;
		}
		setEditingChild(null);
		setDialogState('create');
	};

	const handleEditChild = (child: Child) => {
		if (!isAdmin) {
			return;
		}
		setEditingChild(child);
		setDialogState('edit');
	};

	const handleCloseDialog = () => {
		setDialogState('none');
		setEditingChild(null);
	};

	if (roleLoading || !isAdmin) {
		return null;
	}

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
						Lapsed
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Hallake lapse andmeid ja uuendage teavet.
					</Typography>
				</Box>

				<Button
					variant="info"
					onClick={handleAddChild}
				>
					Lisa laps
				</Button>
			</Stack>

			<ChildrenTable
				rows={children}
				loading={loading || roleLoading}
				canManage={isAdmin}
				onEdit={handleEditChild}
			/>

			<ChildDialog
				open={dialogState === 'create' || dialogState === 'edit'}
				mode={dialogState === 'edit' ? 'edit' : 'create'}
				child={editingChild}
				onClose={handleCloseDialog}
				onSaved={loadChildren}
			/>
		</Box>
	);
}
