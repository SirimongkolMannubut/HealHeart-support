"use client";

import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { USER_ROLES, setUserRole } from '@/types';

export default function OnboardingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState('');

  const handleSubmit = async () => {
    if (!selected) return;
    await setUserRole(selected);
    router.push('/');
  };

  return (
    <div className="min-h-screen font-sans flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-orange-400 rounded-3xl flex items-center justify-center text-white shadow-lg mx-auto mb-4">
            <Heart fill="currentColor" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">ยินดีต้อนรับสู่ HealHeart</h1>
          <p className="text-slate-500">คุณเป็นใคร?</p>
        </div>

        <div className="glass-card p-6 rounded-3xl mb-6">
          <div className="grid grid-cols-2 gap-3">
            {USER_ROLES.map((role) => (
              <button
                key={role}
                onClick={() => setSelected(role)}
                className={`p-4 rounded-2xl text-sm font-medium transition-all ${
                  selected === role
                    ? 'bg-orange-500 text-white shadow-lg scale-105'
                    : 'bg-white text-slate-700 border border-orange-100 hover:border-orange-300'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!selected}
          className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold shadow-lg hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          เริ่มใช้งาน
        </button>

        <p className="text-center text-slate-400 text-xs mt-4">
          คุณสามารถเปลี่ยนแปลงได้ในภายหลัง
        </p>
      </div>
    </div>
  );
}
