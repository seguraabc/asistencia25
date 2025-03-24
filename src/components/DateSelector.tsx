
import React from 'react';
import { cancelClass } from '@/utils/googleSheetsApi';
import { toast } from "sonner";
import DateNavigation from './DateNavigation';
import DateAdder from './DateAdder';

interface DateSelectorProps {
  courseId: string;
  dates: string[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onRefresh: () => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({
  courseId,
  dates,
  selectedDate,
  onDateChange,
  onRefresh
}) => {
  
  const handleCancelClass = async () => {
    try {
      const success = await cancelClass(courseId, selectedDate);
      if (success) {
        toast.success('Clase cancelada correctamente');
        onRefresh();
      } else {
        toast.error('Error al cancelar la clase');
      }
    } catch (error) {
      console.error('Error cancelling class', error);
      toast.error('Error al cancelar la clase');
    }
  };
  
  return (
    <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
      <DateNavigation 
        dates={dates}
        selectedDate={selectedDate}
        onDateChange={onDateChange}
        onCancelClass={handleCancelClass}
      />
      
      <DateAdder 
        courseId={courseId}
        dates={dates}
        onRefresh={onRefresh}
      />
    </div>
  );
};

export default DateSelector;
