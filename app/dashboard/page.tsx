"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { User, LogOut, Users, Plus, Key, Copy, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function DashboardPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Team creation/join state
  const [teamAction, setTeamAction] = useState<'none' | 'create' | 'join'>('none');
  const [teamInput, setTeamInput] = useState('');
  const [teamError, setTeamError] = useState('');
  const [isTeamSubmitting, setIsTeamSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/user");
      if (res.ok) {
        const data = await res.json();
        setUserData(data.user);
      } else {
        router.push("/");
      }
    } catch (error) {
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const handleTeamAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeamError('');
    setIsTeamSubmitting(true);

    try {
      if (teamAction === 'create') {
        const res = await fetch('/api/team/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: teamInput }),
        });
        const data = await res.json();
        if (res.ok) {
          await fetchUserData();
          setTeamAction('none');
        } else setTeamError(data.error);
      } else if (teamAction === 'join') {
        const res = await fetch('/api/team/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teamId: teamInput }),
        });
        const data = await res.json();
        if (res.ok) {
          await fetchUserData();
          setTeamAction('none');
        } else setTeamError(data.error);
      }
    } catch (error) {
      setTeamError("An unexpected error occurred.");
    } finally {
      setIsTeamSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F3EE] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#D8D0C8] border-t-[#B93A32] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!userData) return null;

  return (
    <div className="relative min-h-screen bg-[#F7F3EE] text-[#111111] font-sans selection:bg-[#B93A32] selection:text-white pb-24">
      {/* Paper Grain Overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03] mix-blend-multiply"
        style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}
      />
      
      <Navbar />

      <main className="relative z-10 container mx-auto px-6 pt-32 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <h1 className="font-serif text-4xl lg:text-5xl font-semibold text-[#111111]">
              Welcome, <span className="font-onari font-normal text-[#8A2722]">{userData.name}</span>
            </h1>
            <p className="text-[#777777] mt-2 font-sans tracking-wide">Developer Dashboard</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-2 border border-[#D8D0C8] hover:border-[#B93A32] hover:text-[#B93A32] rounded-lg transition-colors bg-white/50 backdrop-blur-sm"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Basic Details */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white/80 backdrop-blur-md border border-[#D8D0C8] rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#B93A32]/10 flex items-center justify-center text-[#B93A32]">
                  <User className="w-5 h-5" />
                </div>
                <h2 className="font-sans font-bold text-xl">Profile</h2>
              </div>
              
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-[#777777] mb-1">Email</p>
                  <p className="font-medium">{userData.email}</p>
                </div>
                <div>
                  <p className="text-[#777777] mb-1">Role</p>
                  <p className="font-medium">{userData.role || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-[#777777] mb-1">College/Dept</p>
                  <p className="font-medium">{userData.college} ({userData.department})</p>
                </div>
                <div>
                  <p className="text-[#777777] mb-1">Discord</p>
                  <p className="font-medium">{userData.discord}</p>
                </div>
              </div>
            </div>
            
            {/* Theme Decoration */}
            <div className="hidden lg:flex justify-center opacity-40">
              <div className="w-12 h-12 border border-[#8A2722] text-[#8A2722] flex items-center justify-center rounded-sm">
                <span className="font-serif text-xl">道</span>
              </div>
            </div>
          </div>

          {/* Right Column: Team Management */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/80 backdrop-blur-md border border-[#D8D0C8] rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#B93A32]/10 flex items-center justify-center text-[#B93A32]">
                  <Users className="w-5 h-5" />
                </div>
                <h2 className="font-sans font-bold text-xl">Team Management</h2>
              </div>

              {userData.team ? (
                // Has a team
                <div className="animate-fade-in">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#FAF8F4] border border-[#D8D0C8] p-5 rounded-xl mb-6 gap-4">
                    <div>
                      <p className="text-xs text-[#777777] uppercase tracking-wider font-semibold mb-1">Team Name</p>
                      <h3 className="font-onari text-3xl text-[#8A2722] font-normal uppercase">{userData.team.name}</h3>
                    </div>
                    <div className="bg-white px-4 py-3 rounded-lg border border-[#D8D0C8] flex flex-col items-center">
                      <p className="text-[10px] text-[#777777] uppercase tracking-wider font-semibold mb-1">Team Code</p>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xl tracking-widest font-bold">{userData.team.id}</span>
                        <button 
                          onClick={() => copyToClipboard(userData.team.id)}
                          className="text-[#4A4A4A] hover:text-[#B93A32] transition-colors"
                          title="Copy Team Code"
                        >
                          {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-sans font-semibold mb-4 text-[#4A4A4A]">Members ({userData.team.members.length}/3)</h4>
                    <div className="space-y-3">
                      {userData.team.members.map((member: any) => (
                        <div key={member.id} className="flex items-center justify-between p-4 border border-[#D8D0C8] rounded-lg bg-white/50">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-xs uppercase">
                              {member.name.substring(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {member.name} {member.id === userData.team.leaderId && <span className="text-xs bg-[#B93A32]/10 text-[#B93A32] px-2 py-0.5 rounded-full ml-2">Leader</span>}
                              </p>
                              <p className="text-xs text-[#777777]">{member.email}</p>
                            </div>
                          </div>
                          <div className="text-xs text-[#777777] hidden sm:block">
                            {member.role}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // Does NOT have a team
                <div className="animate-fade-in">
                  <p className="text-[#4A4A4A] mb-8">You are not part of any team yet. Join an existing team with a code or start your own!</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <button 
                      onClick={() => { setTeamAction('create'); setTeamError(''); setTeamInput(''); }}
                      className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${teamAction === 'create' ? 'border-[#B93A32] bg-[#FAF8F4] text-[#8A2722]' : 'border-[#D8D0C8] hover:border-[#C8B8A8] bg-white text-[#111111]'}`}
                    >
                      <Plus className="w-5 h-5" />
                      <span className="font-semibold">Create a Team</span>
                    </button>
                    <button 
                      onClick={() => { setTeamAction('join'); setTeamError(''); setTeamInput(''); }}
                      className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${teamAction === 'join' ? 'border-[#B93A32] bg-[#FAF8F4] text-[#8A2722]' : 'border-[#D8D0C8] hover:border-[#C8B8A8] bg-white text-[#111111]'}`}
                    >
                      <Key className="w-5 h-5" />
                      <span className="font-semibold">Join a Team</span>
                    </button>
                  </div>

                  {teamAction !== 'none' && (
                    <form onSubmit={handleTeamAction} className="bg-[#FAF8F4] p-6 rounded-xl border border-[#D8D0C8] animate-slide-up-fade">
                      <div className="space-y-4">
                        <label className="block text-sm font-semibold text-[#111111]">
                          {teamAction === 'create' ? "Team Name" : "6-Digit Team Code"}
                        </label>
                        <input
                          type="text"
                          value={teamInput}
                          onChange={(e) => setTeamInput(teamAction === 'create' ? e.target.value : e.target.value.toUpperCase())}
                          placeholder={teamAction === 'create' ? "Enter your new team name" : "Enter 6-digit code"}
                          required
                          className="w-full h-[48px] px-4 bg-white border border-[#D8D0C8] rounded-lg text-[#111111] focus:outline-none focus:border-[#B93A32] focus:ring-2 focus:ring-[rgba(185,58,50,0.1)] transition-all"
                        />
                        
                        {teamError && (
                          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md text-center border border-red-100">
                            {teamError}
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={isTeamSubmitting || !teamInput}
                          className="w-full h-[48px] bg-[#111111] hover:bg-[#B93A32] text-white rounded-lg font-sans font-medium transition-all duration-300 disabled:opacity-50"
                        >
                          {isTeamSubmitting ? "Processing..." : (teamAction === 'create' ? "Create Team" : "Join Team")}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
