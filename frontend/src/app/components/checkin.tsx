"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import MessageBox from "../ui/MessageBox";
import AccentButton from "../ui/AccentButton";

type Message = { title: string; body: string };

// Simple client-side check-in component (no Firebase)
// Reads the userId from localStorage (set by the login modal) and stores a local check-in record.
export default function CheckInPage({ clubId = "1" }: { clubId?: string }) {
  const [message, setMessage] = useState<Message | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    try {
      const id = typeof window !== "undefined" ? window.localStorage.getItem("userId") : null;
      setUserId(id);
    } catch {
      setUserId(null);
    }
  }, []);

  const canSubmit = useMemo(() => {
    // Allow if userId exists (logged-in demo) OR both name and email provided
    return Boolean(userId) || (name.trim() && email.trim());
  }, [userId, name, email]);

  const handleCheckIn = useCallback(async () => {
    if (!canSubmit) {
      setMessage({ title: "Missing info", body: "Enter your name and email to check in, or log in first." });
      return;
    }

    try {
      // Call backend check-in API
      const meetingName = `Fall 2025 Meeting Check-In at ${new Date().toLocaleTimeString()}`;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001'}/api/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          userId
            ? { userId, clubId, meetingName }
            : { name: name.trim(), email: email.trim(), clubId, meetingName }
        )
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Request failed with ${res.status}`);
      }

  await res.json();
      setMessage({ title: "Success!", body: "You have successfully checked into the meeting! Attendance recorded on server." });
      if (!userId) {
        setName("");
        setEmail("");
      }
    } catch (error) {
      console.error("Check-in error:", error);
      setMessage({ title: "Error", body: "Failed to record check-in. Please try again." });
    }
  }, [userId, name, email, clubId, canSubmit]);

  return (
    <div className="text-white min-h-[60vh] flex flex-col items-center justify-center p-8">
      {message && (
        <MessageBox title={message.title} message={message.body} onClose={() => setMessage(null)} />
      )}
      <h1 className="text-4xl font-bold mb-6 text-[#875FFF]">Meeting Check-In</h1>
      <p className="text-lg text-gray-400 max-w-xl text-center mb-8">
        Click the button below to register your attendance for the current meeting.
      </p>

      {!userId && (
        <div className="w-full max-w-md bg-[#0F0F19] border border-white/10 rounded-lg p-4 mb-4">
          <div className="mb-3">
            <label className="block text-sm mb-1" htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full rounded-md border border-white/10 bg-[#0F0F19] px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#875FFF]"
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-md border border-white/10 bg-[#0F0F19] px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#875FFF]"
            />
          </div>
        </div>
      )}

      <AccentButton onClick={handleCheckIn} disabled={!canSubmit}>
        <span className="text-xl font-extrabold py-2 px-6">CHECK IN NOW</span>
      </AccentButton>
      <p className="mt-8 text-sm text-gray-500">
        {userId ? (
          <>Logged in as: <span className="text-gray-300 break-all">{userId}</span></>
        ) : (
          <>Not logged in: enter your name & email to check in</>
        )}
      </p>
    </div>
  );
}