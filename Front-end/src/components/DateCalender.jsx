import * as React from "react";
import dayjs, { Dayjs } from "dayjs";
import Badge from "@mui/material/Badge";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { div } from "framer-motion/client";

// Fake data fetching function
const fetchAvailability = async () => {
  const response = {
    availability: [
      {
        date: 24,
        month: 9,
        slots: [
          {
            _id: "slot_1",
            start: "10:00 AM",
            end: "10:12 AM",
          },
          {
            _id: "slot_2",
            start: "10:30 AM",
            end: "10:45 AM",
          },
        ],
      },
      {
        date: 25,
        month: 9,
        slots: [
          {
            _id: "slot_3",
            start: "09:00 AM",
            end: "09:30 AM",
          },
        ],
      },
      {
        date: 27,
        month: 9,
        slots: [
          {
            _id: "slot_4",
            start: "03:00 PM",
            end: "03:15 PM",
          },
          {
            _id: "slot_5",
            start: "03:30 PM",
            end: "03:45 PM",
          },
        ],
      },
      {
        date: 1,
        month: 10,
        slots: [
          {
            _id: "slot_6",
            start: "12:00 PM",
            end: "12:30 PM",
          },
        ],
      },
    ],
  };

  return response.availability;
};

/*const ServerDay = (props) => {
  const { availableDays = [], day, outsideCurrentMonth, ...other } = props;

  // Check if the current day is available by matching date and month
  const availableData = availableDays.find(
    (d) => d.date === day.date() && d.month === day.month() + 1
  );

  const isAvailable = !!availableData;

  return (
    <Badge 
      key={day.toString()}
      overlap="circular"
      badgeContent={isAvailable ? "SH" : undefined}
      sx={{
        ".MuiBadge-badge": {
          backgroundColor: isAvailable ? "red" : "transparent",
          color: isAvailable ? "white" : "transparent",
        },
      }}
    >
      <PickersDay
        onClick={() => {
          if (isAvailable) {
            console.log("Availability Object for:", day.format("YYYY-MM-DD"));
            console.log(availableData); // Log the entire availability object
          }
        }}
        {...other}
        day={day}
        outsideCurrentMonth={outsideCurrentMonth}
        disabled={isAvailable}
      />
    </Badge>
  );
};*/
const ServerDay = (props) => {
  const { availableDays = [], day, outsideCurrentMonth, ...other } = props;

  const today = dayjs(); // Get today's date
  const isPast =
    day.isBefore(today, 'day') && !outsideCurrentMonth; // Check if the date has passed

  // Check if the current day is available by matching date and month
  const availableData = availableDays.find(
    (d) => d.date === day.date() && d.month === day.month() + 1
  );

  const isAvailable = !!availableData;

  return (
    <Badge
      key={day.toString()}
      overlap="circular"
      badgeContent={isAvailable ? "SH" : undefined}
      sx={{
        ".MuiBadge-badge": {
          backgroundColor: isAvailable ? "red" : "transparent",
          color: isAvailable ? "white" : "transparent",
        },
      }}
    >
      <PickersDay
        {...other}
        day={day}
        outsideCurrentMonth={outsideCurrentMonth}
        disabled={isAvailable || isPast} // Disable past dates and unavailable dates
        onClick={() => {
          if (isAvailable) {
            console.log("Availability Object for:", day.format("YYYY-MM-DD"));
            console.log(availableData); // Log the entire availability object
          }
        }}
      />
    </Badge>
  );
};


export function MeetingSchedulerCalendar() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [availableDays, setAvailableDays] = React.useState([]);

  React.useEffect(() => {
    const loadAvailability = async () => {
      setIsLoading(true);
      try {
        const data = await fetchAvailability();
        setAvailableDays(data);
      } catch (error) {
        console.error("Error fetching availability:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAvailability();
  }, []);

  return (
    <div    style={{
      border:'13px solid grey',borderRadius:"20px",
      width:'30%',margin:"auto",fontSize:"30px"}}>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateCalendar 
       
        loading={isLoading}
        renderLoading={() => <p>Loading...</p>}
        slots={{
          day: ServerDay,
        }}
        slotProps={{
          day: {
            availableDays, // Pass available days to the day component
          },
        }}
      />
    </LocalizationProvider>
    </div>
  );
}

