'use client';

import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useState } from 'react';

type ExampleCardProps = {
  title: string;
  description: string;
  code: string;
  children: React.ReactNode;
};

function CodeBlock({ code }: { code: string }) {
  return (
    <Box
      component="pre"
      sx={{
        m: 0,
        overflowX: 'auto',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: '#111827',
        p: 2,
      }}
    >
      <Box
        component="code"
        sx={{
          color: '#e5e7eb',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: '0.875rem',
          lineHeight: 1.7,
          whiteSpace: 'pre',
        }}
      >
        {code}
      </Box>
    </Box>
  );
}

function ExampleCard({ title, description, code, children }: ExampleCardProps) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h5" sx={{ mb: 1 }}>
              {title}
            </Typography>
            <Typography color="text.secondary">{description}</Typography>
          </Box>
          <Box
            sx={{
              borderRadius: 4,
              border: '1px dashed',
              borderColor: 'divider',
              bgcolor: 'background.default',
              p: 3,
            }}
          >
            {children}
          </Box>
          <CodeBlock code={code} />
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function DocsPage() {
  const [group, setGroup] = useState('sparrows');
  const [view, setView] = useState('preview');

  return (
    <Stack spacing={4}>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h1">Material UI Docs</Typography>
            <Typography color="text.secondary">
              Shared component examples for Oppi. Each section shows a live
              preview and the TSX used to render it. Best to look it up from
              their homepage though.
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <ExampleCard
        title="Button"
        description="Primary and secondary actions using the app theme defaults."
        code={`import Button from '@mui/material/Button';

<Stack direction="row" spacing={2}>
  <Button>Primary action</Button>
  <Button color="secondary">Secondary action</Button>
</Stack>`}
      >
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <Button>Primary action</Button>
          <Button color="secondary">Secondary action</Button>
        </Stack>
      </ExampleCard>

      <ExampleCard
        title="Card"
        description="A content surface for grouped information."
        code={`import { Card, CardContent, Typography } from '@mui/material';

<Card sx={{ maxWidth: 360 }}>
  <CardContent>
    <Typography variant="h6">Weekly recap</Typography>
    <Typography color="text.secondary">
      Three new announcements, one unread message, and two upcoming events.
    </Typography>
  </CardContent>
</Card>`}
      >
        <Card sx={{ maxWidth: 360 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Weekly recap
            </Typography>
            <Typography color="text.secondary">
              Three new announcements, one unread message, and two upcoming
              events.
            </Typography>
          </CardContent>
        </Card>
      </ExampleCard>

      <ExampleCard
        title="Select"
        description="A controlled select field for switching between groups."
        code={`import { MenuItem, Select } from '@mui/material';

const [group, setGroup] = useState('sparrows');

<Select
  value={group}
  onChange={(event) => setGroup(event.target.value)}
  sx={{ minWidth: 220 }}
>
  <MenuItem value="sparrows">Sparrows</MenuItem>
  <MenuItem value="owls">Owls</MenuItem>
  <MenuItem value="foxes">Foxes</MenuItem>
</Select>`}
      >
        <Select
          value={group}
          onChange={(event) => setGroup(event.target.value)}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="sparrows">Sparrows</MenuItem>
          <MenuItem value="owls">Owls</MenuItem>
          <MenuItem value="foxes">Foxes</MenuItem>
        </Select>
      </ExampleCard>

      <ExampleCard
        title="Avatar"
        description="Avatar for staff or child identity in lists and cards."
        code={`import Avatar from '@mui/material/Avatar';

<Stack direction="row" spacing={2}>
  <Avatar>AL</Avatar>
  <Avatar src="/images/avatar-demo.png" alt="Anna Liis" />
</Stack>`}
      >
        <Stack direction="row" spacing={2}>
          <Avatar>AL</Avatar>
          <Avatar sx={{ bgcolor: 'secondary.main', color: 'black' }}>KR</Avatar>
        </Stack>
      </ExampleCard>

      <ExampleCard
        title="List"
        description="A simple communication-oriented list with avatars and metadata."
        code={`import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';

<List>
  <ListItem>
    <ListItemAvatar>
      <Avatar>EL</Avatar>
    </ListItemAvatar>
    <ListItemText
      primary="Eliise Laas"
      secondary="Parent message about pickup time"
    />
  </ListItem>
</List>`}
      >
        <List sx={{ width: '100%', maxWidth: 480 }}>
          <ListItem>
            <ListItemAvatar>
              <Avatar>EL</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary="Eliise Laas"
              secondary="Parent message about pickup time"
            />
          </ListItem>
          <ListItem>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: 'secondary.main', color: 'black' }}>
                MK
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary="Marta Kask"
              secondary="Announcement acknowledged"
            />
          </ListItem>
        </List>
      </ExampleCard>

      <ExampleCard
        title="Text Field"
        description="Basic form field for quick admin and message inputs."
        code={`import TextField from '@mui/material/TextField';

<TextField
  label="Announcement title"
  placeholder="Spring field trip update"
  fullWidth
/>`}
      >
        <Box sx={{ width: '100%', maxWidth: 480 }}>
          <TextField
            label="Announcement title"
            placeholder="Spring field trip update"
            fullWidth
          />
        </Box>
      </ExampleCard>

      <ExampleCard
        title="Toggle Button"
        description="Compact mode switch for preview or edit states."
        code={`import { ToggleButton, ToggleButtonGroup } from '@mui/material';

const [view, setView] = useState('preview');

<ToggleButtonGroup
  value={view}
  exclusive
  onChange={(_, nextView) => {
    if (nextView) {
      setView(nextView);
    }
  }}
>
  <ToggleButton value="preview">Preview</ToggleButton>
  <ToggleButton value="edit">Edit</ToggleButton>
</ToggleButtonGroup>`}
      >
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(_, nextView) => {
            if (nextView) {
              setView(nextView);
            }
          }}
        >
          <ToggleButton value="preview">Preview</ToggleButton>
          <ToggleButton value="edit">Edit</ToggleButton>
        </ToggleButtonGroup>
      </ExampleCard>
    </Stack>
  );
}
