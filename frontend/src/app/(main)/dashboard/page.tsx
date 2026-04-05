import { Box } from '@/components/Box';
import { PageTitle } from '@/components/PageTitle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function DashboardPage() {
  return (
    <div>
      <PageTitle>Avaleht</PageTitle>
      <Box className="mb-2">
        <CheckCircleIcon
          fontSize="large"
          className="text-green-600"
        ></CheckCircleIcon>
      </Box>
      <Box title="Daily description - group name">
        Lorem Ipsum is simply dummy text of the printing and typesetting
        industry. Lorem Ipsum has been the industry's standard dummy text ever
        since the 1500s, when an unknown printer took a galley of type and
        scrambled it to make a type specimen book. It has survived not only five
        centuries, but also the leap into electronic typesetting, remaining
        essentially unchanged. It was popularised in the 1960s with the release
        of Letraset sheets
      </Box>
    </div>
  );
}
