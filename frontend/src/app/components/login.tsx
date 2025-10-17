"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';

interface LoginResult {
  role: 'member' | 'officer' | 'sga';
  name: string;
  userId: string;
}

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: (result: LoginResult) => void;
}

export function LoginModal({ open, onClose, onLogin }: LoginModalProps) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const deriveRole = (pw: string): LoginResult['role'] => {
    const val = pw.trim().toLowerCase();
    if (val === 'officer') return 'officer';
    if (val === 'sga') return 'sga';
    return 'member';
  };

  const makeUserId = () => {
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `UID-${rand}`;
  };

  const handleLogin = () => {
    const role = deriveRole(password);
    const userId = makeUserId();
    localStorage.setItem('userId', userId);
    localStorage.setItem('role', role);
    localStorage.setItem('name', name.trim() || 'Anonymous');
    onLogin({ role, name: name.trim() || 'Anonymous', userId });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a2e] border-white/10 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Login to AI Club</DialogTitle>
          <DialogDescription className="text-gray-400">
            Demo login: enter your name and a password that indicates your role.
            Use member, officer, or sga as the password to get that role.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-md border border-white/10 bg-[#0F0F19] px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#875FFF]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password (role)</Label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="member | officer | sga"
              className="w-full rounded-md border border-white/10 bg-[#0F0F19] px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#875FFF]"
            />
          </div>

          <Button
            onClick={handleLogin}
            className="w-full bg-[#875FFF] hover:bg-[#9b75ff] text-white"
            disabled={!password}
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
