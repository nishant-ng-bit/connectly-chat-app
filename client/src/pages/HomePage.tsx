import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  IoArrowForward,
  IoChatbubbles,
  IoCheckmarkCircle,
  IoColorPalette,
  IoFlash,
  IoImage,
  IoPeople,
  IoShieldCheckmark,
  IoSparkles,
} from "react-icons/io5";

const FeatureCard = ({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) => (
  <div className="rounded-3xl bg-white/75 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-2xl mb-5">
      {icon}
    </div>
    <h3 className="font-black text-lg text-slate-950 dark:text-white">{title}</h3>
    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2.5 leading-relaxed font-medium">{text}</p>
  </div>
);

const TypingDots = ({ compact = false }: { compact?: boolean }) => (
  <div className={`flex items-center gap-1 ${compact ? "px-2" : "px-4 py-3"}`}>
    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
  </div>
);

type DemoMessage = {
  from: "me" | "other" | "ai";
  text: string;
};

const LiveChatPreview = () => {
  const messages = useMemo<DemoMessage[]>(() => [
    { from: "other", text: "Hey, are we still planning the group call tonight?" },
    { from: "me", text: "Yes. I’ll create the room and share it here." },
    { from: "other", text: "Perfect. Also send the design notes when you can." },
    { from: "me", text: "Done. I added captions so everyone knows what changed." },
  ], []);
  const [visibleCount, setVisibleCount] = useState(1);
  const [typingUser, setTypingUser] = useState<"Aarav" | "You">("You");

  useEffect(() => {
    const interval = window.setInterval(() => {
      setVisibleCount((prev) => {
        const next = prev >= messages.length ? 1 : prev + 1;
        setTypingUser(messages[next - 1]?.from === "me" ? "You" : "Aarav");
        return next;
      });
    }, 2200);
    return () => window.clearInterval(interval);
  }, [messages]);

  return (
    <div className="rounded-[2rem] border border-white/80 dark:border-slate-800 bg-white/72 dark:bg-slate-950/72 backdrop-blur-2xl p-3 shadow-2xl shadow-slate-900/10 animate-[message-rise_0.5s_ease-out_both]">
      <div className="rounded-[1.6rem] overflow-hidden theme-wallpaper-sage border border-white/70 dark:border-slate-800">
        <div className="bg-white/78 dark:bg-slate-950/78 backdrop-blur-xl px-4 py-3 flex items-center justify-between border-b border-white/70 dark:border-slate-800">
          <div>
            <p className="text-sm font-black text-slate-950 dark:text-white">Live Team Chat</p>
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{typingUser} typing...</p>
          </div>
          <span className="rounded-full bg-white/80 dark:bg-slate-900 px-3 py-1 text-[10px] font-black text-slate-600 dark:text-slate-300">Realtime</span>
        </div>
        <div className="p-4 h-80 flex flex-col gap-3 justify-end">
          {messages.slice(0, visibleCount).map((message, index) => (
            <div
              key={`${message.text}-${index}`}
              className={`animate-message-rise max-w-[86%] rounded-3xl px-4 py-3 text-sm shadow-lg ${
                message.from === "me"
                  ? "self-end rounded-tr-md bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-semibold"
                  : "rounded-tl-md bg-white/90 dark:bg-slate-950/85 border border-white/70 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-medium"
              }`}
            >
              {message.text}
            </div>
          ))}
          <div className="max-w-[44%] rounded-3xl rounded-tl-md bg-white/90 dark:bg-slate-950/85 border border-white/70 dark:border-slate-800 shadow-lg">
            <TypingDots />
          </div>
        </div>
      </div>
    </div>
  );
};

const AiChatPreview = () => {
  const messages = useMemo<DemoMessage[]>(() => [
    { from: "me", text: "can you make this sound better: i will send update soon" },
    { from: "ai", text: "Sure. Try: I’ll send the update shortly." },
    { from: "me", text: "nice, keep it simple" },
    { from: "ai", text: "Absolutely. Clear, short, and natural." },
  ], []);
  const [visibleCount, setVisibleCount] = useState(1);
  const aiTyping = visibleCount < messages.length && messages[visibleCount]?.from === "ai";

  useEffect(() => {
    const interval = window.setInterval(() => {
      setVisibleCount((prev) => (prev >= messages.length ? 1 : prev + 1));
    }, 2400);
    return () => window.clearInterval(interval);
  }, [messages]);

  return (
    <div className="rounded-[2rem] border border-white/80 dark:border-slate-800 bg-white/72 dark:bg-slate-950/72 backdrop-blur-2xl p-3 shadow-2xl shadow-slate-900/10 animate-[message-rise_0.7s_ease-out_both]">
      <div className="rounded-[1.6rem] overflow-hidden theme-wallpaper-cyber border border-white/70 dark:border-slate-800">
        <div className="bg-white/78 dark:bg-slate-950/78 backdrop-blur-xl px-4 py-3 flex items-center justify-between border-b border-white/70 dark:border-slate-800">
          <div>
            <p className="text-sm font-black text-slate-950 dark:text-white">Connectly AI Chat</p>
            <p className="text-xs font-semibold text-teal-700 dark:text-teal-300">{aiTyping ? "AI is typing..." : "Refinement assistant"}</p>
          </div>
          <IoSparkles className="text-teal-700 dark:text-teal-300" />
        </div>
        <div className="p-4 h-80 flex flex-col gap-3 justify-end">
          {messages.slice(0, visibleCount).map((message, index) => (
            <div
              key={`${message.text}-${index}`}
              className={`animate-message-rise max-w-[88%] rounded-3xl px-4 py-3 text-sm shadow-lg ${
                message.from === "me"
                  ? "self-end rounded-tr-md bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-semibold"
                  : "rounded-tl-md bg-white/90 dark:bg-slate-950/85 border border-white/70 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-medium"
              }`}
            >
              {message.text}
            </div>
          ))}
          <div className="rounded-[1.5rem] bg-white/88 dark:bg-slate-950/85 border border-white/80 dark:border-slate-800 p-2 flex items-center gap-2 shadow-xl">
            <span className="flex-1 rounded-2xl bg-slate-100 dark:bg-slate-900 px-4 py-3 text-xs font-semibold text-slate-400">
              {aiTyping ? <TypingDots compact /> : "Write a message..."}
            </span>
            <span className="rounded-2xl bg-emerald-50 dark:bg-emerald-950 px-4 py-3 text-xs font-black text-emerald-700 dark:text-emerald-300">Refine AI</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const HomePage = () => {
  const features = [
    { icon: <IoFlash />, title: "Realtime Messaging", text: "Typing, seen states, reactions, media, and group updates feel instant." },
    { icon: <IoSparkles />, title: "Refine With AI", text: "Correct English and lightly improve a line before it leaves your composer." },
    { icon: <IoImage />, title: "Media Captions", text: "Send images and videos with clean captions in one readable media card." },
    { icon: <IoPeople />, title: "Group Chats", text: "Create groups, chat with multiple people, and keep conversations organized." },
    { icon: <IoColorPalette />, title: "Nature Themes", text: "Soft scenery wallpapers stay readable in light and dark mode." },
    { icon: <IoShieldCheckmark />, title: "Secure Access", text: "Protected routes, cookie sessions, and OTP based authentication flows." },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f7f8f5] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors relative overflow-hidden py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(134,154,121,0.18),transparent_28rem),radial-gradient(circle_at_80%_20%,rgba(148,163,184,0.14),transparent_24rem),linear-gradient(to_bottom,rgba(255,255,255,0.7),transparent)] dark:bg-[radial-gradient(circle_at_20%_10%,rgba(34,197,94,0.1),transparent_28rem),radial-gradient(circle_at_80%_20%,rgba(56,189,248,0.08),transparent_24rem)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.035)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:42px_42px]" />

      <div className="relative max-w-7xl mx-auto px-6 z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[calc(100vh-9rem)]">
          <div className="lg:col-span-5 space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 dark:border-emerald-900/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl px-4 py-2 text-xs font-black text-emerald-700 dark:text-emerald-300 shadow-sm">
              <IoCheckmarkCircle /> Built for calm, everyday messaging
            </div>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-[1.05] text-slate-950 dark:text-white">
              Chat that feels fast, natural, and actually helpful.
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium max-w-xl">
              Connectly combines realtime chats, AI message refinement, media captions, groups, reactions, and soft nature themes in one polished messaging experience.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <Link to="/chats" className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-950 font-black shadow-xl shadow-slate-900/10 transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-2">
                <IoChatbubbles /> Open Chats <IoArrowForward />
              </Link>
              <Link to="/profile" className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/80 hover:bg-white dark:bg-slate-900/80 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 font-black border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 text-center">
                Customize Profile
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 relative flex items-center justify-center">
            <div className="absolute -top-8 left-10 h-20 w-20 rounded-full bg-emerald-100/80 dark:bg-emerald-950/70 blur-sm animate-pulse" />
            <div className="absolute -bottom-8 right-10 h-24 w-24 rounded-[2rem] bg-slate-200/70 dark:bg-slate-800/70 rotate-12 animate-bounce" style={{ animationDuration: "6s" }} />
            <div className="w-full max-w-xl">
              <LiveChatPreview />
            </div>
          </div>
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pb-16">
          <div className="lg:col-span-6 order-1">
            <AiChatPreview />
          </div>
          <div className="lg:col-span-6 order-2 rounded-[2rem] bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800 p-7 sm:p-8 shadow-sm">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950/70 px-4 py-2 text-xs font-black text-emerald-700 dark:text-emerald-300">
              <IoSparkles /> AI inside your composer
            </div>
            <h2 className="mt-5 text-3xl sm:text-4xl font-black tracking-tight text-slate-950 dark:text-white">
              Chat with AI first, then send cleaner messages.
            </h2>
            <p className="mt-4 text-sm sm:text-base font-medium leading-relaxed text-slate-600 dark:text-slate-300">
              Connectly AI helps you refine casual text, fix English, keep the same tone, and make replies easier to understand before you send them.
            </p>
            <div className="mt-6 grid gap-3">
              {[
                "Correct grammar without changing your meaning",
                "Keep messages short, natural, and friendly",
                "Useful for quick replies, group updates, and captions",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/70 dark:bg-slate-950/50 border border-slate-200/70 dark:border-slate-800 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200">
                  <IoCheckmarkCircle className="text-emerald-700 dark:text-emerald-300 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-12">
          <div className="max-w-2xl mb-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">What Connectly gives you</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">Everything needed for modern chat, without visual noise.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((item) => <FeatureCard key={item.title} {...item} />)}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
