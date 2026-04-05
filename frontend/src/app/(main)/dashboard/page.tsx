import { Card, CardContent, Divider } from '@mui/material';
import { PageTitle } from '@/components/PageTitle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

// Mock query response
const groupPosts = [
  {
    id: 1,
    title: 'Daily description - Group name',
    message: 'Today we played outside and learned colors.',
    created_at: '2026-04-05T10:00:00.000Z',
  },
  {
    id: 2,
    title: 'Daily description - Group name',
    message: 'We painted and sang songs.',
    created_at: '2026-04-04T10:00:00.000Z',
  },
  {
    id: 3,
    title: 'Daily description - Group name',
    message:
      'We practiced numbers and listened to a story. ndustry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was ',
    created_at: '2026-04-03T10:00:00.000Z',
  },
];

// Mock query response
const absences = [
  {
    status: 'ABSENT',
    date: new Date('2026-04-04'),
  },
];

function formatDate(date: Date) {
  return date.toLocaleDateString('en-CA');
}

function getPostDate(created_at: string) {
  return created_at.split('T')[0];
}
export default function DashboardPage() {
  const feedData = groupPosts.map((post) => {
    const postDate = getPostDate(post.created_at);

    const absenceForDay = absences.find((absence) => {
      return formatDate(absence.date) === postDate;
    });

    return {
      id: post.id,
      date: postDate,
      title: post.title,
      description: post.message,
      present: !absenceForDay,
    };
  });

  return (
    <div>
      <PageTitle>Avaleht</PageTitle>
      <div className="space-y-6">
        {feedData.map((item) => (
          <Card
            key={item.id}
            sx={{
              boxShadow: 1,
            }}
          >
            <CardContent>
              <div className="space-y-4">
                {/* Date */}
                <p className="text-xs sm:text-sm  font-medium uppercase tracking-wide text-lightInk">
                  {item.date}
                </p>

                {/* Attendance */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {item.present ? (
                      <CheckCircleIcon className="text-green-600" />
                    ) : (
                      <CancelIcon className="text-red-500" />
                    )}

                    <span className="text-sm sm:text-sm font-semibold">
                      Attendance
                    </span>
                  </div>

                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      item.present
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {item.present ? 'Present' : 'Absent'}
                  </span>
                </div>

                {/* Divider */}
                <Divider />

                {/* Description */}
                <div className="space-y-2">
                  <p className="text-base sm:text-xl font-semibold text-ink">
                    {item.title}
                  </p>
                  <p className="text-sm sm:text-base leading-6 text-mediumInk">
                    {item.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
