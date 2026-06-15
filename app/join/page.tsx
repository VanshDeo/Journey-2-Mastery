"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, User, GraduationCap, Link as LinkIcon, MessageSquare, Mail, Phone, Briefcase, Layers, FileText, Lightbulb, Search, Users, Plus, Key } from "lucide-react";

export default function JoinPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamAction, setTeamAction] = useState<'none' | 'create' | 'join'>('none');
  const [teamInput, setTeamInput] = useState('');
  const [teamError, setTeamError] = useState('');
  const [isTeamSubmitting, setIsTeamSubmitting] = useState(false);

  const formDataRef = useRef<Record<string, string>>({});

  const handleNextStep = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries()) as Record<string, string>;
    formDataRef.current = { ...formDataRef.current, ...data };
    
    setStep(prev => prev + 1);
  };

  const handlePreviousStep = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries()) as Record<string, string>;
    const finalData = { ...formDataRef.current, ...data };
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
      });
      
      const result = await response.json();
      if (response.ok) {
        setStep(4);
      } else {
        alert(result.error || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration Error:", error);
      alert("An error occurred during registration.");
    } finally {
      setIsSubmitting(false);
    }
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
        if (res.ok) router.push('/dashboard');
        else setTeamError(data.error);
      } else if (teamAction === 'join') {
        const res = await fetch('/api/team/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teamId: teamInput }),
        });
        const data = await res.json();
        if (res.ok) router.push('/dashboard');
        else setTeamError(data.error);
      }
    } catch (error) {
      setTeamError("An unexpected error occurred.");
    } finally {
      setIsTeamSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F7F3EE] overflow-x-hidden text-[#111111] font-sans selection:bg-[#B93A32] selection:text-white">
      {/* Paper Grain Overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03] mix-blend-multiply"
        style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}
      />

      {/* Background Artwork */}
      <div className="absolute inset-0 z-0 pointer-events-none flex justify-end">
        <div className="relative w-full lg:w-[65%] h-full animate-fade-in-slow">
          <Image
            src="/images/journey-landscape.png"
            alt="Japanese Landscape"
            fill
            className="object-cover lg:object-contain object-right-bottom lg:object-right opacity-90 mix-blend-multiply"
            priority
          />
          {/* Gradient overlay to blur left side into background */}
          <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#F7F3EE] via-[#F7F3EE]/80 to-transparent z-10" />
        </div>
      </div>

      {/* Japanese Vertical Text */}
      <div className="absolute right-8 top-24 z-10 hidden lg:flex flex-col items-center gap-6 animate-fade-in-slow">
        <div
          className="text-[#8A2722] text-xl tracking-[0.3em] font-serif opacity-80"
          style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}
        >
          開発者の道
        </div>
        {/* Seal Stamp */}
        <div className="w-8 h-8 border border-[#B93A32] text-[#B93A32] flex items-center justify-center rounded-sm opacity-80">
          <span className="font-serif text-sm">道</span>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12 lg:py-24 min-h-screen flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24">
        {/* Hero Content (Left Side) */}
        <div className="flex-1 w-full max-w-xl animate-slide-up-fade" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#B93A32] flex items-center justify-center text-[#F7F3EE]">
              <span className="font-serif font-bold text-lg">J</span>
            </div>
            <span className="font-sans uppercase tracking-[0.2em] text-sm text-[#4A4A4A] font-medium">Journey to Mastery</span>
          </div>

          <h1 className="font-serif text-5xl lg:text-7xl font-semibold leading-[1.1] mb-6 text-[#111111]">
            Begin Your <br />
            <span className="font-onari font-normal text-[#8A2722] text-6xl lg:text-8xl tracking-wider mt-2 inline-block">Journey</span>
          </h1>

          <p className="text-lg text-[#4A4A4A] max-w-md leading-relaxed font-sans mb-8">
            Join a community of builders, dreamers, and creators turning ideas into impact.
          </p>

          <div className="hidden lg:block">
            <div className="font-sans uppercase tracking-[0.1em] text-sm font-semibold text-[#8A2722] mb-2 flex items-center gap-2">
              <span className="w-8 h-px bg-[#8A2722]"></span>
              Code. Collaborate. Contribute.
            </div>
          </div>
        </div>

        {/* Registration Form Container (Right Side) */}
        <div
          className="flex-1 w-full max-w-2xl bg-gradient-to-r from-[rgba(250,248,244,0.95)] to-[rgba(250,248,244,0.85)] backdrop-blur-md border border-[#D8D0C8] rounded-2xl shadow-sm animate-slide-up-fade max-h-[85vh] overflow-y-auto custom-scrollbar"
          style={{ animationDelay: '0.4s', animationFillMode: 'both' }}
        >
          {/* Form Header */}
          <div className="p-8 pb-6 border-b border-[#D8D0C8]">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-onari text-4xl font-normal text-[#8A2722]">
                {step === 4 ? "Next Steps" : "Register Now"}
              </h2>
              <div className="text-sm font-sans font-medium text-[#B93A32]">
                {step <= 3 ? `Step ${step} of 3` : "Complete"}
              </div>
            </div>
            <p className="text-[#4A4A4A] text-sm">
              {step === 1 && "Share your personal details."}
              {step === 2 && "Share your experience and links."}
              {step === 3 && "Tell us your motivation and project ideas."}
              {step === 4 && "Join a team or start your own to continue."}
            </p>
            {/* Progress Bar */}
            <div className="w-full bg-[#D8D0C8] h-1 mt-6 rounded-full overflow-hidden">
              <div 
                className="bg-[#B93A32] h-full transition-all duration-500 ease-out" 
                style={{ width: `${Math.min((step / 3) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-8">
            
            {step === 1 && (
              <form onSubmit={handleNextStep} className="space-y-8 animate-fade-in">
                {/* Section 1: Applicant Details */}
                <div className="bg-[#FAF8F4] border border-[#D8D0C8] rounded-xl p-6 space-y-6">
                  <div className="mb-4">
                    <h3 className="font-sans font-semibold text-lg flex items-center gap-3">
                      <span className="w-1 h-5 bg-[#B93A32] rounded-full"></span>
                      1. Personal details
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput icon={<User className="w-4 h-4" />} label="Name *" id="name" placeholder="Your full name" required defaultValue={formDataRef.current.name} />
                    <FormInput icon={<Mail className="w-4 h-4" />} label="Email *" id="email" type="email" placeholder="Your email address" required defaultValue={formDataRef.current.email} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput icon={<Phone className="w-4 h-4" />} label="Phone Number *" id="phone" type="tel" placeholder="Your phone number" required defaultValue={formDataRef.current.phone} />
                    <FormInput icon={<MessageSquare className="w-4 h-4" />} label="Discord username *" id="discord" placeholder="yourusername" required defaultValue={formDataRef.current.discord} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput icon={<GraduationCap className="w-4 h-4" />} label="College name *" id="college" placeholder="Your college or institute" required defaultValue={formDataRef.current.college} />
                    <FormInput icon={<GraduationCap className="w-4 h-4" />} label="Department *" id="department" placeholder="Example: CSE" required defaultValue={formDataRef.current.department} />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="group h-[48px] px-8 bg-[#111111] hover:bg-[#B93A32] text-white rounded-lg font-sans font-medium transition-all duration-300 flex items-center gap-2"
                  >
                    Next Step <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleNextStep} className="space-y-8 animate-fade-in">
                {/* Section 2: Professional Details */}
                <div className="bg-[#FAF8F4] border border-[#D8D0C8] rounded-xl p-6 space-y-6">
                  <div className="mb-4">
                    <h3 className="font-sans font-semibold text-lg flex items-center gap-3">
                      <span className="w-1 h-5 bg-[#B93A32] rounded-full"></span>
                      2. Professional details
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormSelect icon={<Briefcase className="w-4 h-4" />} label="Role *" id="role" options={["Select your role", "Frontend Developer", "Backend Developer", "Fullstack Developer", "Designer", "Other"]} required defaultValue={formDataRef.current.role} />
                    <FormSelect icon={<Layers className="w-4 h-4" />} label="Experience Level *" id="experience" options={["Select your experience level", "Beginner (0-1 years)", "Intermediate (1-3 years)", "Advanced (3+ years)"]} required defaultValue={formDataRef.current.experience} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput icon={<LinkIcon className="w-4 h-4" />} label="Github profile link *" id="github" placeholder="https://github.com/your-handle" required defaultValue={formDataRef.current.github} />
                    <FormInput icon={<LinkIcon className="w-4 h-4" />} label="LinkedIn profile link *" id="linkedin" placeholder="https://linkedin.com/in/your-profile" required defaultValue={formDataRef.current.linkedin} />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button type="button" onClick={handlePreviousStep} className="text-[#4A4A4A] hover:text-[#111111] font-medium text-sm transition-colors">
                    &larr; Back
                  </button>
                  <button
                    type="submit"
                    className="group h-[48px] px-8 bg-[#111111] hover:bg-[#B93A32] text-white rounded-lg font-sans font-medium transition-all duration-300 flex items-center gap-2"
                  >
                    Next Step <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
                {/* Section 3: Motivation */}
                <div className="bg-[#FAF8F4] border border-[#D8D0C8] rounded-xl p-6 space-y-6">
                  <div className="mb-4">
                    <h3 className="font-sans font-semibold text-lg flex items-center gap-3">
                      <span className="w-1 h-5 bg-[#B93A32] rounded-full"></span>
                      3. Motivation
                    </h3>
                  </div>

                  <FormSelect icon={<Search className="w-4 h-4" />} label="How did you hear about us? *" id="source" options={["Select an option", "Twitter/X", "LinkedIn", "Friend/Colleague", "University", "Other"]} required defaultValue={formDataRef.current.source} />

                  <div className="pt-2">
                    <label htmlFor="why" className="block font-sans text-sm font-semibold text-[#111111] mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#777777]" />
                      Why do you want to join? *
                    </label>
                    <textarea
                      id="why"
                      name="why"
                      placeholder="Share a short introduction about your goals..."
                      required
                      defaultValue={formDataRef.current.why}
                      className="w-full bg-white border border-[#D8D0C8] rounded-lg p-4 min-h-[120px] text-[#111111] placeholder-[#A0A0A0] focus:outline-none focus:border-[#B93A32] focus:ring-2 focus:ring-[rgba(185,58,50,0.1)] transition-all resize-y"
                    />
                  </div>

                  <div className="pt-2">
                    <div className="mb-2">
                      <label htmlFor="project" className="flex items-center gap-2 font-sans text-sm font-semibold text-[#111111]">
                        <Lightbulb className="w-4 h-4 text-[#777777]" />
                        Project Idea
                      </label>
                      <p className="text-xs text-[#777777] mt-1 ml-6">Optional — You can change this later</p>
                    </div>
                    <textarea
                      id="project"
                      name="project"
                      placeholder="Briefly describe an idea you want to build..."
                      defaultValue={formDataRef.current.project}
                      className="w-full bg-white border border-[#D8D0C8] rounded-lg p-4 min-h-[100px] text-[#111111] placeholder-[#A0A0A0] focus:outline-none focus:border-[#B93A32] focus:ring-2 focus:ring-[rgba(185,58,50,0.1)] transition-all resize-y"
                    />
                  </div>
                </div>

                {/* Footer inside scroll area for seamless flow */}
                <div className="pt-6 border-t border-[#D8D0C8] flex flex-col gap-6">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-5 h-5 mt-0.5">
                      <input type="checkbox" id="agreed" name="agreed" required defaultChecked={formDataRef.current.agreed === 'on'} className="peer appearance-none w-5 h-5 border border-[#D8D0C8] rounded bg-white checked:bg-[#B93A32] checked:border-[#B93A32] transition-colors cursor-pointer" />
                      <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="text-sm text-[#4A4A4A]">
                      I agree to the <a href="#" className="text-[#B93A32] hover:text-[#8A2722] underline decoration-[0.5px] underline-offset-2">terms and conditions</a> and <a href="#" className="text-[#B93A32] hover:text-[#8A2722] underline decoration-[0.5px] underline-offset-2">privacy policy</a>. *
                    </span>
                  </label>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button type="button" onClick={handlePreviousStep} className="text-[#4A4A4A] hover:text-[#111111] font-medium text-sm transition-colors order-2 sm:order-1">
                      &larr; Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group w-full sm:w-auto h-[56px] px-8 bg-[#B93A32] hover:bg-[#8A2722] text-[#F7F3EE] rounded-lg font-sans font-medium transition-all duration-300 hover:-translate-y-[2px] flex items-center justify-center gap-3 shadow-sm order-1 sm:order-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <span className="font-onari text-xl tracking-[0.15em] font-normal pt-1">
                        {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
                      </span>
                      <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>

              </form>
            )}

            {step === 4 && (
              <div className="space-y-8 animate-fade-in">
                <div className="bg-[#FAF8F4] border border-[#D8D0C8] rounded-xl p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-[#B93A32]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="w-8 h-8 text-[#B93A32]" />
                  </div>
                  <h3 className="font-sans font-bold text-2xl text-[#111111]">Registration Successful!</h3>
                  <p className="text-[#4A4A4A] max-w-sm mx-auto">
                    You have successfully registered. To participate in the event, you must either join an existing team or create a new one. (Max 3 members per team).
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Create Team Option */}
                  <div 
                    onClick={() => { setTeamAction('create'); setTeamError(''); setTeamInput(''); }}
                    className={`cursor-pointer p-6 rounded-xl border-2 transition-all ${teamAction === 'create' ? 'border-[#B93A32] bg-[#FAF8F4]' : 'border-[#D8D0C8] hover:border-[#C8B8A8] bg-white'}`}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${teamAction === 'create' ? 'bg-[#B93A32] text-white' : 'bg-[#F7F3EE] text-[#777777]'}`}>
                        <Plus className="w-5 h-5" />
                      </div>
                      <h4 className="font-sans font-semibold text-lg">Create a Team</h4>
                    </div>
                    <p className="text-sm text-[#777777]">Start a new team and become the leader. You'll get a unique code to share with others.</p>
                  </div>

                  {/* Join Team Option */}
                  <div 
                    onClick={() => { setTeamAction('join'); setTeamError(''); setTeamInput(''); }}
                    className={`cursor-pointer p-6 rounded-xl border-2 transition-all ${teamAction === 'join' ? 'border-[#B93A32] bg-[#FAF8F4]' : 'border-[#D8D0C8] hover:border-[#C8B8A8] bg-white'}`}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${teamAction === 'join' ? 'bg-[#B93A32] text-white' : 'bg-[#F7F3EE] text-[#777777]'}`}>
                        <Key className="w-5 h-5" />
                      </div>
                      <h4 className="font-sans font-semibold text-lg">Join a Team</h4>
                    </div>
                    <p className="text-sm text-[#777777]">Have a team code? Enter it to instantly join your friends' team.</p>
                  </div>
                </div>

                {teamAction !== 'none' && (
                  <form onSubmit={handleTeamAction} className="mt-8 animate-slide-up-fade border-t border-[#D8D0C8] pt-8">
                    <div className="max-w-md mx-auto space-y-4">
                      <h4 className="font-sans font-semibold text-center mb-4">
                        {teamAction === 'create' ? "Name Your Team" : "Enter Team Code"}
                      </h4>
                      
                      <FormInput 
                        id="teamInput" 
                        label={teamAction === 'create' ? "Team Name" : "6-Digit Team ID"} 
                        placeholder={teamAction === 'create' ? "e.g. The Code Samurais" : "e.g. A1B2C3"} 
                        icon={teamAction === 'create' ? <Users className="w-4 h-4" /> : <Key className="w-4 h-4" />}
                        value={teamInput}
                        onChange={(e: any) => setTeamInput(e.target.value.toUpperCase())}
                        required
                      />

                      {teamError && (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md text-center">
                          {teamError}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isTeamSubmitting || !teamInput}
                        className="w-full h-[48px] bg-[#111111] hover:bg-[#B93A32] text-white rounded-lg font-sans font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isTeamSubmitting ? "Processing..." : (teamAction === 'create' ? "Create Team & Continue" : "Join Team & Continue")}
                      </button>
                      
                      <div className="text-center mt-4">
                        <button type="button" onClick={() => router.push('/dashboard')} className="text-sm text-[#777777] hover:text-[#111111] underline underline-offset-2">
                          Skip for now, I'll do this later from my dashboard
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #D8D0C8;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #C8B8A8;
        }
      `}} />
    </div>
  );
}

// Helper Components for Form Fields
function FormInput({ label, id, type = "text", placeholder, icon, required = false, defaultValue = "", value, onChange }: { label: string, id: string, type?: string, placeholder?: string, icon?: React.ReactNode, required?: boolean, defaultValue?: string, value?: string, onChange?: any }) {
  return (
    <div>
      <label htmlFor={id} className="block font-sans text-sm font-semibold text-[#111111] mb-2">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#777777] pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          id={id}
          name={id}
          placeholder={placeholder}
          required={required}
          defaultValue={defaultValue}
          value={value}
          onChange={onChange}
          className={`w-full h-[48px] ${icon ? 'pl-11' : 'pl-4'} pr-4 bg-white border border-[#D8D0C8] rounded-lg text-[#111111] placeholder-[#A0A0A0] focus:outline-none focus:border-[#B93A32] focus:ring-2 focus:ring-[rgba(185,58,50,0.1)] transition-all hover:border-[#C8B8A8]`}
        />
      </div>
    </div>
  );
}

function FormSelect({ label, id, options, icon, required = false, defaultValue = "" }: { label: string, id: string, options: string[], icon?: React.ReactNode, required?: boolean, defaultValue?: string }) {
  return (
    <div>
      <label htmlFor={id} className="block font-sans text-sm font-semibold text-[#111111] mb-2">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#777777] pointer-events-none">
            {icon}
          </div>
        )}
        <select
          id={id}
          name={id}
          required={required}
          defaultValue={defaultValue || ""}
          className={`w-full h-[48px] ${icon ? 'pl-11' : 'pl-4'} pr-10 appearance-none bg-white border border-[#D8D0C8] rounded-lg text-[#111111] focus:outline-none focus:border-[#B93A32] focus:ring-2 focus:ring-[rgba(185,58,50,0.1)] transition-all hover:border-[#C8B8A8] cursor-pointer invalid:text-[#A0A0A0]`}
        >
          {options.map((opt, i) => (
            <option key={i} value={i === 0 ? "" : opt} disabled={i === 0} className="text-[#111111]">
              {opt}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#777777]">
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

