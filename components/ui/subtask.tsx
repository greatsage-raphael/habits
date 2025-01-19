'use client'

import { useState, useEffect } from 'react'
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import dynamic from 'next/dynamic'

const Confetti = dynamic(() => import('react-confetti'), { ssr: false })

interface SubTask {
  habitId: string
  subTaskName: string
}

interface SubTaskListProps {
  subtasks: SubTask[]
}

export default function SubTaskList({ subtasks }: SubTaskListProps) {
  const [checkedTasks, setCheckedTasks] = useState<Set<number>>(new Set())
  const [showConfetti, setShowConfetti] = useState(false)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  // Reset checked tasks whenever subtasks change
  useEffect(() => {
    setCheckedTasks(new Set())
    setShowConfetti(false)
  }, [subtasks])

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleCheckboxChange = (index: number) => {
    setCheckedTasks(prev => {
      const newCheckedTasks = new Set(prev)
      if (newCheckedTasks.has(index)) {
        newCheckedTasks.delete(index)
      } else {
        newCheckedTasks.add(index)
      }
      return newCheckedTasks
    })
  }

  const progress = subtasks.length > 0 ? (checkedTasks.size / subtasks.length) * 100 : 0

  useEffect(() => {
    if (progress === 100 && subtasks.length > 0) {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [progress, subtasks.length])

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Subtasks</h2>
      <Progress value={progress} className="mb-4" />
      <p className="mb-4 ">Progress: {progress.toFixed(0)}%</p>
      <ul className="space-y-2">
        {subtasks.map((task, index) => (
          <li key={index} className="flex items-center space-x-2">
            <Checkbox
              id={`task-${index}`}
              checked={checkedTasks.has(index)}
              onCheckedChange={() => handleCheckboxChange(index)}
            />
            <label
              htmlFor={`task-${index}`}
              className={`flex-grow ${checkedTasks.has(index) ? 'line-through text-gray-500' : ''}`}
            >
              {task.subTaskName}
            </label>
          </li>
        ))}
      </ul>
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
        />
      )}
    </div>
  )
}