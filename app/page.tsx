"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

type Event = {
  id: string
  title: string
  date: string
  country: string
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase.from("events").select("*")
      if (error) {
        console.error("Error fetching events:", error)
      } else {
        setEvents(data || [])
      }
    }

    fetchEvents()
  }, [])

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">🌏 World Time Calendar</h1>
      {events.length === 0 ? (
        <p>No events found.</p>
      ) : (
        <ul className="space-y-4">
          {events.map((event) => (
            <li key={event.id} className="bg-gray-800 p-4 rounded-lg">
              <h2 className="text-xl font-semibold">{event.title}</h2>
              <p>{event.date}</p>
              <p className="text-sm text-gray-400">{event.country}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
