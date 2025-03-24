
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, CalendarDays } from 'lucide-react';
import { toast } from "sonner";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { createStableDate } from '@/utils/dateUtils';

interface DateManagementProps {
  dates: string[];
  onDatesChange: (dates: string[]) => void;
  onShowCalendarGenerator: () => void;
}

const DateManagement: React.FC<DateManagementProps> = ({
  dates,
  onDatesChange,
  onShowCalendarGenerator
}) => {
  const [newDate, setNewDate] = useState<Date | undefined>(undefined);
  
  const handleAddDate = () => {
    if (!newDate) {
      toast.error('Debe seleccionar una fecha');
      return;
    }
    
    const formattedDate = format(newDate, 'yyyy-MM-dd');
    
    if (dates.includes(formattedDate)) {
      toast.error('Esta fecha ya existe');
      return;
    }
    
    const newDates = [...dates, formattedDate].sort();
    onDatesChange(newDates);
    setNewDate(undefined);
  };
  
  const handleRemoveDate = (date: string) => {
    const newDates = dates.filter((d: string) => d !== date);
    onDatesChange(newDates);
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Fechas de Clase</CardTitle>
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[200px] justify-start text-left font-normal",
                  !newDate && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {newDate ? format(newDate, 'dd/MM/yyyy') : <span>Seleccionar fecha</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="single"
                selected={newDate}
                onSelect={setNewDate}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          <Button size="sm" onClick={handleAddDate} disabled={!newDate}>
            <Calendar className="h-4 w-4 mr-2" />
            Agregar
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onShowCalendarGenerator}
          >
            <CalendarDays className="h-4 w-4 mr-2" />
            Generar Fechas
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {dates.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No hay fechas. Agrega la primera usando el calendario de arriba.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {dates.map((date: string) => (
              <div 
                key={date} 
                className="flex items-center border rounded-md p-2 bg-muted/30"
              >
                <span className="mr-2">{format(new Date(date), 'dd/MM/yyyy')}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleRemoveDate(date)}
                >
                  <Calendar className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DateManagement;
