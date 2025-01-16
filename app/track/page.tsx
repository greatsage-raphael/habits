'use client';

import { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AddHabitForm } from '@/components/ui/AddHabitForm';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tool-tip';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/scripts/admin';

interface Habit {
  id: string;
  name: string;
  color: string;
}

interface HabitLog {
  id: string;
  habit_id: string;
  week_number: number;
  day: number;
  completed: boolean;
}

const DAYS = ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'];
const WEEKS = Array.from({ length: 52 }, (_, i) => i + 1);

export default function HabitTracker() {
  const [habits, setHabits] = useState<Record<string, Record<string, boolean>>>(
    {},
  );
  const [habitList, setHabitList] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);
  const [habitId, setHabitId] = useState('');
  const { user } = useUser();

  const toggleHabit = async (week: number, habit: string, day: number) => {
    // Find if there's an existing log
    const existingLog = habitLogs.find(
      (log) =>
        log.habit_id === habit && log.week_number === week && log.day === day,
    );

    if (existingLog) {
      // Update existing log
      const { data, error } = await supabase
        .from('habit_logs')
        .update({ completed: !existingLog.completed })
        .eq('id', existingLog.id)
        .select();

      if (error) {
        console.error('Error updating habit log:', error);
        return;
      }

      setHabitLogs((prev) =>
        prev.map((log) =>
          log.id === existingLog.id
            ? { ...log, completed: !log.completed }
            : log,
        ),
      );
    } else {
      // Create new log
      const { data, error } = await supabase
        .from('habit_logs')
        .insert([
          {
            habit_id: habit,
            week_number: week,
            day: day,
            completed: true,
          },
        ])
        .select();

      if (error) {
        console.error('Error creating habit log:', error);
        return;
      }

      if (data) {
        setHabitLogs((prev) => [...prev, data[0]]);
      }
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchHabits();
    }
  }, [user?.id]);

  useEffect(() => {
    if (habitList.length > 0) {
      fetchHabitLogs();
    }
  }, [habitList]);


const fetchHabitLogs = async () => {
  // Only proceed if we have habits
  if (habitList.length === 0) {
    setHabitLogs([]);
    return;
  }

  const { data, error } = await supabase
    .from('habit_logs')
    .select('*')
    .in('habit_id', habitList.map(h => h.id));

  if (error) {
    console.error('Error fetching habit logs:', error);
    return;
  }

  if (data) {
    setHabitLogs(data);
  }
};


  const fetchHabits = async () => {
    const { data: habits, error } = await supabase
      .from('habits')
      .select('id, name, color')
      .eq('user_id', user?.id);

    if (error) {
      console.error('Error fetching habits:', error.message);
      return;
    }

    if (habits) {
      setHabitList(habits);
      setHabitId(habits[0].id);
    }
  };

  const addHabit = (newHabit: { name: string; color: string }) => {
    const id = newHabit.name.toLowerCase().replace(/\s+/g, '-');
    setHabitList((prev) => [...prev, { ...newHabit, id }]);
    setIsAddHabitOpen(false);
  };

  const deleteHabit = async (habitId: string) => {
    const { error } = await supabase.from('habits').delete().eq('id', habitId);

    if (error) {
      console.error('Error deleting habit:', error.message);
      return;
    }

    setHabitList((prev) => prev.filter((habit) => habit.id !== habitId));
    setHabits((prev) => {
      const newHabits = { ...prev };
      Object.keys(newHabits).forEach((key) => {
        if (key.includes(habitId)) {
          delete newHabits[key];
        }
      });
      return newHabits;
    });
  };

  const nextWeek = () => setCurrentWeek((prev) => Math.min(prev + 1, 52));
  const prevWeek = () => setCurrentWeek((prev) => Math.max(prev - 1, 1));

  const isHabitCompleted = (week: number, habitId: string, day: number) => {
    return habitLogs.some(
      log => 
        log.habit_id === habitId && 
        log.week_number === week && 
        log.day === day && 
        log.completed
    );
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-white font-sans">
      <div className="flex items-center justify-between bg-[#F7F0E6] p-4">
        <h1 className="text-xl font-bold text-[#8B7355] sm:text-2xl md:text-3xl">
          New Beginnings
        </h1>
        <button
          className="rounded-full p-2 text-[#8B7355] hover:bg-[#E6E1F7]"
          onClick={() => setIsAddHabitOpen(true)}
          aria-label="Add new habit"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>
  
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full w-full">
          <div className="space-y-6 p-4">
            {/* Week Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={prevWeek}
                disabled={currentWeek === 1}
                className="text-[#8B7355] disabled:opacity-50"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <h2 className="text-xl font-bold text-[#8B7355] sm:text-2xl md:text-3xl">
                WEEK {currentWeek}
              </h2>
              <button
                onClick={nextWeek}
                disabled={currentWeek === 52}
                className="text-[#8B7355] disabled:opacity-50"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
  
            {/* Habits Grid */}
            <div className="space-y-4">
              {/* Days Header */}
              <div className="grid grid-cols-[minmax(100px,1fr)_repeat(7,minmax(30px,1fr))] items-center gap-2">
                <div className="text-sm font-medium text-[#8B7355] sm:text-base">
                  Habit
                </div>
                {DAYS.map((day, index) => (
                  <div
                    key={`${day}-${index}`}
                    className="text-center text-xs font-medium text-[#8B7355] sm:text-sm"
                  >
                    {day}
                  </div>
                ))}
              </div>
  
              {/* Habits Rows */}
              {habitList.map((habit) => (
                <div
                  key={habit.id}
                  className="group grid grid-cols-[minmax(100px,1fr)_repeat(7,minmax(30px,1fr))] items-center gap-2"
                >
                  <div className="flex items-center space-x-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`${habit.color} flex-grow truncate rounded-md px-2 py-1 text-xs font-medium text-[#8B7355] sm:text-sm`}
                          >
                            {habit.name}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{habit.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => deleteHabit(habit.id)}
                      aria-label={`Delete ${habit.name} habit`}
                    >
                      <Trash2 className="h-4 w-4 text-[#8B7355]" />
                    </Button>
                  </div>
                  {DAYS.map((_, dayIndex) => (
                    <div key={dayIndex} className="flex justify-center">
                      <Checkbox
                        className="h-5 w-5 rounded-full border-2 border-[#8B7355] data-[state=checked]:bg-[#8B7355] data-[state=checked]:text-white sm:h-6 sm:w-6 md:h-8 md:w-8"
                        checked={isHabitCompleted(currentWeek, habit.id, dayIndex)}
                        onCheckedChange={() =>
                          toggleHabit(currentWeek, habit.id, dayIndex)
                        }
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
  
      {/* Add Habit Dialog */}
      <Dialog open={isAddHabitOpen} onOpenChange={setIsAddHabitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Habit</DialogTitle>
          </DialogHeader>
          <AddHabitForm
            onSubmit={addHabit}
            onCancel={() => setIsAddHabitOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
