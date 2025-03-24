
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { addDateToCourse } from '@/utils/googleSheetsApi';
import { toast } from "sonner";

interface DateAdderProps {
  courseId: string;
  dates: string[];
  onRefresh: () => void;
}

const DateAdder: React.FC<DateAdderProps> = ({
  courseId,
  dates,
  onRefresh
}) => {
  const [isAddingDate, setIsAddingDate] = useState(false);
  const [newDate, setNewDate] = useState<Date | undefined>(undefined);
  
  const handleAddDate = async () => {
    if (!newDate) return;
    
    const formatted = format(newDate, 'yyyy-MM-dd');
    
    // Check if date already exists
    if (dates.includes(formatted)) {
      toast.error('Esta fecha ya existe en el curso');
      return;
    }
    
    try {
      const success = await addDateToCourse(courseId, formatted);
      if (success) {
        toast.success('Fecha añadida correctamente');
        setNewDate(undefined);
        setIsAddingDate(false);
        onRefresh();
      } else {
        toast.error('Error al añadir la fecha');
      }
    } catch (error) {
      console.error('Error adding date', error);
      toast.error('Error al añadir la fecha');
    }
  };
  
  return (
    <div>
      {isAddingDate ? (
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !newDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {newDate ? format(newDate, 'dd/MM/yyyy') : <span>Seleccionar fecha</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={newDate}
                onSelect={setNewDate}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          
          <Button onClick={handleAddDate} disabled={!newDate}>
            Añadir
          </Button>
          
          <Button variant="outline" onClick={() => setIsAddingDate(false)}>
            Cancelar
          </Button>
        </div>
      ) : (
        <Button onClick={() => setIsAddingDate(true)} className="h-9">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Fecha
        </Button>
      )}
    </div>
  );
};

export default DateAdder;
