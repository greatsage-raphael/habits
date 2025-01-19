import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { supabase } from '@/scripts/admin'
import { useUser } from '@clerk/nextjs'
import { v4 as uuidv4 } from 'uuid';



interface AddHabitFormProps {
  onSubmit: (habit: { name: string; color: string }) => void
  onCancel: () => void
}

const COLORS = [
  { value: 'bg-[#E6F3F7]', label: 'Light Blue' },
  { value: 'bg-[#F7E6CC]', label: 'Light Orange' },
  { value: 'bg-[#E6E1F7]', label: 'Light Purple' },
  { value: 'bg-[#F0F7E6]', label: 'Light Green' },
  { value: 'bg-[#F7E6E6]', label: 'Light Red' },
  { value: 'bg-[#F7F0E6]', label: 'Light Yellow' },
]

export function AddHabitForm({ onSubmit, onCancel }: AddHabitFormProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0].value)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useUser();
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsLoading(true)
    try {
      if(user === undefined || user === null) return

      const habitId = uuidv4();

      const { data, error } = await supabase
        .from('habits')
        .insert([
          {
            id: habitId,
            user_id: user.id,
            name: name.trim(),
            color,
          },
        ])
        .select()
        .single()

      if (error) throw error
      else if (data) {
        console.log(`${data.name}:`, data.color)
        onSubmit({ name: data.name, color: data.color })
      }

    } catch (error) {
      console.error('Error adding habit:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div>
        <Label htmlFor="habit-name">Habit Name</Label>
        <Input
          id="habit-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter habit name"
          required
          disabled={isLoading}
        />
      </div>
      <div>
        <Label>Color</Label>
        <RadioGroup value={color} onValueChange={setColor} className="grid grid-cols-3 gap-2">
          {COLORS.map((colorOption) => (
            <div key={colorOption.value} className="flex items-center space-x-2">
              <RadioGroupItem 
                value={colorOption.value} 
                id={colorOption.value}
                disabled={isLoading}
              />
              <Label htmlFor={colorOption.value} className="flex items-center">
                <div className={`w-4 h-4 rounded-full ${colorOption.value} mr-2`}></div>
                {colorOption.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      <div className="flex justify-end space-x-2 bg-white">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className='bg-[#8B7355] text-white'>
          {isLoading ? 'Adding...' : 'Add Habit'}
        </Button>
      </div>
    </form>
  )
}

