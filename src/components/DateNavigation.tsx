
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from "sonner";
import { isDateInCourse } from '@/utils/dateUtils';

interface DateNavigationProps {
  dates: string[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onCancelClass: () => void;
}

const DateNavigation: React.FC<DateNavigationProps> = ({
  dates,
  selectedDate,
  onDateChange,
  onCancelClass
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
  
  // Check if the selected date is the last in the array
  const isLastDate = dates.indexOf(selectedDate) === dates.length - 1;
  // Check if the selected date is the first in the array
  const isFirstDate = dates.indexOf(selectedDate) === 0;
  
  const handlePreviousDate = () => {
    const currentIndex = dates.indexOf(selectedDate);
    if (currentIndex > 0) {
      onDateChange(dates[currentIndex - 1]);
    }
  };
  
  const handleNextDate = () => {
    const currentIndex = dates.indexOf(selectedDate);
    if (currentIndex < dates.length - 1) {
      onDateChange(dates[currentIndex + 1]);
    }
  };
  
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePreviousDate}
        disabled={isFirstDate}
        className="h-9 w-9"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-9 gap-1 px-3"
          >
            <CalendarIcon className="h-4 w-4" />
            <span>{format(parseISO(selectedDate), 'dd/MM/yyyy')}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={parseISO(selectedDate)}
            onSelect={(date) => {
              if (date) {
                const formatted = format(date, 'yyyy-MM-dd');
                if (dates.includes(formatted)) {
                  onDateChange(formatted);
                  setIsCalendarOpen(false);
                } else {
                  toast.warning('Esta fecha no existe en el calendario del curso');
                }
              }
            }}
            disabled={(date) => !isDateInCourse(date, dates)}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
      
      <Button
        variant="outline"
        size="icon"
        onClick={handleNextDate}
        disabled={isLastDate}
        className="h-9 w-9"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      
      <Button
        variant="destructive"
        size="sm"
        onClick={onCancelClass}
        className="h-9 ml-2"
      >
        Cancelar Clase
      </Button>
    </div>
  );
};

export default DateNavigation;
