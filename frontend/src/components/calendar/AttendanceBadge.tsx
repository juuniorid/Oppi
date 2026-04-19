import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import { PickerDay, PickerDayProps } from '@mui/x-date-pickers/PickerDay';
import { useTheme } from '@mui/material/styles';
import { ATTENDANCE_STATUS, EVENT_TYPE, type AttendanceStatus, type EventType } from '@/types/enums';

type AttendanceBadgeProps = PickerDayProps & {
  dayStatusByDate?: Record<string, AttendanceStatus>;
  eventTypeByDate?: Record<string, EventType>;
};

export function AttendanceBadge(props: AttendanceBadgeProps) {
  const { dayStatusByDate = {}, eventTypeByDate = {}, day, outsideCurrentMonth, ...other } = props;
  const dayKey = day.format('YYYY-MM-DD');
  const theme = useTheme();

  const status = outsideCurrentMonth ? undefined : dayStatusByDate[dayKey];
  const eventType = outsideCurrentMonth ? undefined : eventTypeByDate[dayKey];

  const attendanceDotColor =
    status === ATTENDANCE_STATUS.ABSENT
      ? theme.palette.error.main
      : status === ATTENDANCE_STATUS.PRESENT
        ? theme.palette.success.main
        : null;

  const eventDotColor =
    eventType === EVENT_TYPE.KINDERGARTEN
      ? theme.palette.warning.main
      : eventType === EVENT_TYPE.GROUP
        ? theme.palette.info.main
        : null

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <PickerDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />

      {!outsideCurrentMonth && attendanceDotColor && (
        <Badge
          overlap="circular"
          variant="dot"
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          sx={{
            pointerEvents: 'none',
            position: 'absolute',
            inset: 0,
            '& .MuiBadge-badge': {
              backgroundColor: attendanceDotColor,
              width: 8,
              height: 8,
              minWidth: 8,
              opacity: 0.3,
              borderRadius: '50%',
              top: 8,
              left: 8,
            },
          }}
        >
          <span />
        </Badge>
      )}

      {!outsideCurrentMonth && eventDotColor && (
        <Badge
          overlap="circular"
          variant="dot"
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{
            pointerEvents: 'none',
            position: 'absolute',
            inset: 0,
            '& .MuiBadge-badge': {
              backgroundColor: eventDotColor,
              width: 8,
              height: 8,
              minWidth: 8,
              borderRadius: '50%',
              top: 6,
              right: 6,
            },
          }}
        >
          <span />
        </Badge>
      )}
    </Box>
  );
}
