import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import GuestNavbar from '../../components/guest/GuestNavbar';
import { CARD_THEME, CardPattern, ChipIcon } from '../../components/member/MemberCardComponents';
import {
  MdWhatsapp,
  MdArrowUpward,
  MdCheckCircle,
  MdCalendarToday,
  MdGpsFixed,
  MdStars,
  MdCardGiftcard,
  MdVerified,
  MdSupportAgent,
  MdSend,
  MdPerson,
  MdEmail,
  MdPhone,
  MdMessage,
  MdArrowForward,
} from 'react-icons/md';

// ─── GAMBAR BENGKEL REALISTIS (Unsplash stable) ──────────────
const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&q=80',
  about: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1200&q=80',
  mechanic: 'https://images.unsplash.com/photo-1613214149922-f1809c99b414?w=1200&q=80',
  service1: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80',
  service2: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=800&q=80',
  service3: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=800&q=80',
  service4: 'https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=800&q=80',
  gallery: [
    'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=500&q=80',
    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500&q=80',
    'https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=500&q=80',
    'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=500&q=80',
    'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=500&q=80',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&q=80',
  ],
  location: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=1200&q=80',
  cta: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1600&q=80',
};

// ─── AVATAR ──────────────────────────────────────────────────────
const getAvatar = (id) => `https://i.pravatar.cc/150?img=${id}`;

// ─── MEMBERSHIP — data & komponen kartu untuk Landing Page ───
// Reuse CARD_THEME dari MemberCardComponents, urutan tertinggi → terendah
const MEMBERSHIP_TIERS = ['Platinum', 'Gold', 'Silver', 'Bronze'];

// Alias lokal agar tidak bentrok dengan nama lain di file ini
const CARD_THEME_LANDING = CARD_THEME;

// Preview sisi depan kartu — versi sederhana tanpa state, tanpa props customer.
// Identik dengan CardFront di KartuMember, tapi tanpa data member (placeholder).
function CardFrontLanding({ theme }) {
  return (
    <div
      className="relative w-full h-full rounded-2xl overflow-hidden select-none"
      style={{
        background: theme.gradient,
        border: theme.border,
        boxShadow: `0 16px 40px ${theme.accentGlow}, 0 4px 16px rgba(0,0,0,0.8)`,
      }}
    >
      <CardPattern pattern={theme.pattern} accent={theme.accent} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: theme.shimmer }} />
      <div
        className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${theme.accentGlow} 0%, transparent 65%)`, transform: 'translate(30%, -30%)' }}
      />
      <div className="relative z-10 flex flex-col h-full p-5">
        {/* Row 1: Logo + Level */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: `${theme.accent}20`, border: `1px solid ${theme.accent}40` }}
            >
              <span className="text-xs">🚗</span>
            </div>
            <div>
              <p className="text-white font-extrabold text-xs tracking-tight leading-none">Esther Garage</p>
              <p className="text-[8px] font-semibold tracking-widest uppercase leading-none mt-0.5"
                style={{ color: `${theme.accentLight}80` }}>Member Card</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-extrabold text-base tracking-wide" style={{ color: theme.textColor }}>{theme.label}</p>
            <p className="text-[9px] font-medium tracking-wider" style={{ color: `${theme.accentLight}70` }}>{theme.sublabel}</p>
          </div>
        </div>
        {/* Chip */}
        <div className="mb-3">
          <ChipIcon color={theme.chipColor} />
        </div>
        {/* Card number */}
        <div className="mb-3">
          <p className="font-mono text-sm tracking-[0.2em] font-bold"
            style={{ color: theme.textColor, textShadow: `0 0 10px ${theme.accentGlow}` }}>
            •••• •••• •••• ••••
          </p>
        </div>
        {/* Name + poin */}
        <div className="flex items-end justify-between mt-auto">
          <div>
            <p className="text-[8px] uppercase tracking-widest mb-0.5" style={{ color: `${theme.accentLight}60` }}>Nama Member</p>
            <p className="text-white font-bold text-xs tracking-wide uppercase">NAMA MEMBER</p>
            <p className="text-[8px] mt-0.5" style={{ color: `${theme.accentLight}70` }}>Berlaku sejak: —</p>
          </div>
          <div className="text-right">
            <span className="text-base">{theme.icon}</span>
            <p className="font-extrabold text-sm" style={{ color: theme.accentLight }}>0</p>
            <p className="text-[8px]" style={{ color: `${theme.accentLight}60` }}>poin</p>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-0.5"
        style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)` }} />
    </div>
  );
}

// ─── COMPONENT: Reveal on scroll ─────────────────────────────
const Reveal = ({ children, delay = 0, direction = 'up', distance = 10 }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const getTransform = () => {
    if (!visible) {
      switch (direction) {
        case 'up': return `translateY(${distance}px)`;
        case 'down': return `translateY(-${distance}px)`;
        case 'left': return `translateX(${distance}px)`;
        case 'right': return `translateX(-${distance}px)`;
        case 'scale': return 'scale(0.8)';
        default: return `translateY(${distance}px)`;
      }
    }
    return 'translate(0) scale(1)';
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        transform: getTransform(),
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

// ─── COMPONENT: Animated Counter ──────────────────────────────
const AnimatedCounter = ({ target, suffix = '', duration = 2000, trigger = false }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, trigger]);
  return <>{count.toLocaleString('id-ID')}{suffix}</>;
};

// ─── COMPONENT: Floating Animation ────────────────────────────
const FloatingElement = ({ children, delay = 0, duration = 3, distance = 10 }) => {
  return (
    <div
      className="animate-float"
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        '--float-distance': `${distance}px`,
      }}
    >
      {children}
    </div>
  );
};

// ─── COMPONENT: Glowing Pulse ──────────────────────────────────
const GlowingPulse = ({ children, color = 'blue' }) => {
  const colors = {
    blue: 'shadow-blue-500/50',
    green: 'shadow-green-500/50',
    orange: 'shadow-orange-500/50',
    purple: 'shadow-purple-500/50',
  };
  return (
    <div className={`animate-pulse-glow ${colors[color]}`}>
      {children}
    </div>
  );
};

// ─── COMPONENT: Rotating Icon ──────────────────────────────────
const RotatingIcon = ({ children, duration = 8 }) => {
  return (
    <div className="animate-spin-slow" style={{ animationDuration: `${duration}s` }}>
      {children}
    </div>
  );
};

// ─── COMPONENT: Typewriter Text ───────────────────────────────
const TypewriterText = ({ texts, delay = 3000 }) => {
  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout;
    const currentText = texts[index];
    
    if (!isDeleting) {
      if (displayText.length < currentText.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentText.slice(0, displayText.length + 1));
        }, 50);
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, delay);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(currentText.slice(0, displayText.length - 1));
        }, 30);
      } else {
        setIsDeleting(false);
        setIndex((prev) => (prev + 1) % texts.length);
      }
    }
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, index, texts, delay]);

  return (
    <span className="inline-block">
      {displayText}
      <span className="animate-blink-cursor">|</span>
    </span>
  );
};

// ─── COMPONENT: Particle Background ──────────────────────────
const ParticleBackground = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        ctx.fillStyle = `rgba(59, 130, 246, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < 50; i++) {
        particles.push(new Particle());
      }
    };
    init();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.5 }}
    />
  );
};

// ─── COMPONENT: FAQ toggle ─────────────────────────────────────
const FaqItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <button
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition"
        onClick={() => setOpen(!open)}
      >
        <span className="text-white font-medium text-sm">{question}</span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-4">
          <p className="text-gray-400 text-sm leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
};

// ─── FLOATING WHATSAPP ─────────────────────────────────────────
const FloatingWhatsApp = () => {
  return (
    <a
      href="https://wa.me/6288708230676?text=Halo%20Esther%20Garage%2C%20saya%20mau%20konsultasi"
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-50 group"
    >
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-green-500/30 animate-ping"></div>
        <div className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110 hover:rotate-12"
          style={{ background: '#25D366', boxShadow: '0 8px 24px rgba(37,211,102,0.4)' }}
        >
          <MdWhatsapp className="text-white text-3xl animate-wiggle" />
        </div>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="animate-pulse">💬 Hubungi Kami</span>
        </div>
      </div>
    </a>
  );
};

// ─── SCROLL TO TOP ─────────────────────────────────────────────
const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-24 right-6 z-50 p-3 rounded-full shadow-lg transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
      }`}
      style={{ background: 'rgba(37,99,235,0.9)', backdropFilter: 'blur(4px)' }}
    >
      <MdArrowUpward className="text-white text-xl animate-bounce-slow" />
    </button>
  );
};

// ─── CONTACT FORM ──────────────────────────────────────────────
const ContactForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [focused, setFocused] = useState(null);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Nama wajib diisi';
    if (!formData.email.trim()) newErrors.email = 'Email wajib diisi';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email tidak valid';
    if (!formData.phone.trim()) newErrors.phone = 'Nomor HP wajib diisi';
    if (!formData.message.trim()) newErrors.message = 'Pesan wajib diisi';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', phone: '', message: '' });
    setTimeout(() => setIsSubmitted(false), 4000);
  };

  return (
    <div className="max-w-2xl mx-auto glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl animate-blob" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-orange-500/10 rounded-full blur-2xl animate-blob animation-delay-2000" />
      
      <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
        <div className="animate-float">
          <MdSend className="text-blue-400" />
        </div>
        Kirim Pesan
      </h3>
      <p className="text-gray-400 text-sm mb-6 animate-fade-in-up">Kami akan merespon dalam 24 jam kerja.</p>

      <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
        <div className="transform transition-all duration-300 hover:scale-[1.01]">
          <label className="block text-gray-300 text-sm font-medium mb-1">Nama Lengkap</label>
          <div className="relative">
            <MdPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              onFocus={() => setFocused('name')}
              onBlur={() => setFocused(null)}
              className={`w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border transition-all duration-300 focus:outline-none text-white ${
                focused === 'name' ? 'border-blue-500/50 shadow-lg shadow-blue-500/20 scale-[1.02]' : 'border-white/10'
              }`}
              placeholder="Nama Anda"
            />
          </div>
          {errors.name && <p className="text-red-400 text-xs mt-1 animate-shake">{errors.name}</p>}
        </div>
        
        <div className="transform transition-all duration-300 hover:scale-[1.01]">
          <label className="block text-gray-300 text-sm font-medium mb-1">Email</label>
          <div className="relative">
            <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
              className={`w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border transition-all duration-300 focus:outline-none text-white ${
                focused === 'email' ? 'border-blue-500/50 shadow-lg shadow-blue-500/20 scale-[1.02]' : 'border-white/10'
              }`}
              placeholder="email@anda.com"
            />
          </div>
          {errors.email && <p className="text-red-400 text-xs mt-1 animate-shake">{errors.email}</p>}
        </div>
        
        <div className="transform transition-all duration-300 hover:scale-[1.01]">
          <label className="block text-gray-300 text-sm font-medium mb-1">Nomor HP</label>
          <div className="relative">
            <MdPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              onFocus={() => setFocused('phone')}
              onBlur={() => setFocused(null)}
              className={`w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border transition-all duration-300 focus:outline-none text-white ${
                focused === 'phone' ? 'border-blue-500/50 shadow-lg shadow-blue-500/20 scale-[1.02]' : 'border-white/10'
              }`}
              placeholder="0812-3456-7890"
            />
          </div>
          {errors.phone && <p className="text-red-400 text-xs mt-1 animate-shake">{errors.phone}</p>}
        </div>
        
        <div className="transform transition-all duration-300 hover:scale-[1.01]">
          <label className="block text-gray-300 text-sm font-medium mb-1">Pesan</label>
          <div className="relative">
            <MdMessage className="absolute left-3 top-3 text-gray-500" />
            <textarea
              name="message"
              rows="4"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              onFocus={() => setFocused('message')}
              onBlur={() => setFocused(null)}
              className={`w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border transition-all duration-300 focus:outline-none text-white resize-none ${
                focused === 'message' ? 'border-blue-500/50 shadow-lg shadow-blue-500/20 scale-[1.02]' : 'border-white/10'
              }`}
              placeholder="Tulis pesan Anda di sini..."
            />
          </div>
          {errors.message && <p className="text-red-400 text-xs mt-1 animate-shake">{errors.message}</p>}
        </div>
        
        <button
          type="submit"
          className="w-full py-3 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-98 relative overflow-hidden group"
          style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)' }}
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
          <MdSend className="group-hover:rotate-12 transition-transform duration-300" />
          Kirim Pesan
        </button>
      </form>

      {isSubmitted && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-5 py-2 rounded-full text-sm shadow-lg z-50 animate-fade-in-up">
          <MdCheckCircle className="inline mr-2 animate-spin-slow" />
          ✅ Pesan terkirim! Kami akan segera merespon.
        </div>
      )}
    </div>
  );
};

// ─── MAIN COMPONENT ────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(137);
  const [scrollY, setScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState('home');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // ─── Countdown ───
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => (prev <= 0 ? 3599 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ─── ScrollY for parallax ───
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ─── Mouse position for parallax ───
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // ─── Active section detection ───
  useEffect(() => {
    const sections = ['home', 'tentang', 'layanan', 'galeri', 'tim', 'faq', 'kontak'];
    const observers = sections.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { threshold: 0.3 }
      );
      observer.observe(el);
      return observer;
    });
    return () => observers.forEach((obs) => obs?.disconnect());
  }, []);

  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');

  // ─── Statistics for counter ───
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="overflow-x-hidden bg-[#0B1120] text-[#F8FAFC] font-['Inter',sans-serif] relative">
      {/* ─── PARTICLES ─── */}
      <ParticleBackground />

      {/* ─── NAVBAR ─── */}
      <GuestNavbar />

      {/* ─── HERO ─── */}
      <section id="home" className="relative min-h-screen flex items-center overflow-hidden pt-16">
        <div className="absolute inset-0">
          <img
            src={IMAGES.hero}
            alt="Esther Garage – Bengkel Modern Bukittinggi"
            className="w-full h-full object-cover object-center"
            style={{ 
              transform: `scale(1.06) translateY(${scrollY * 0.04}px) translateX(${mousePosition.x * 0.5}px)`,
            }}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B1120] via-[#0B1120]/70 to-[#0B1120]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-transparent to-[#0B1120]/40" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(37,99,235,0.08),transparent_60%)]" />
          <div className="absolute inset-0 opacity-[0.03] bg-[length:60px_60px] [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)]" />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[12%] left-[8%] w-2 h-2 rounded-full bg-blue-400/20 animate-float-particle" style={{ animationDelay: '0s' }} />
          <div className="absolute top-[28%] right-[15%] w-3 h-3 rounded-full bg-orange-400/15 animate-float-particle" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-[35%] left-[20%] w-1.5 h-1.5 rounded-full bg-blue-500/20 animate-float-particle" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[60%] right-[25%] w-2 h-2 rounded-full bg-emerald-400/15 animate-float-particle" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-[20%] right-[10%] w-1.5 h-1.5 rounded-full bg-purple-400/20 animate-float-particle" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-[40%] left-[5%] w-2.5 h-2.5 rounded-full bg-blue-400/10 animate-float-particle" style={{ animationDelay: '2.5s' }} />
          <div className="absolute bottom-[50%] left-[40%] w-1.5 h-1.5 rounded-full bg-orange-400/20 animate-float-particle" style={{ animationDelay: '0.8s' }} />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-20">
          <div className="max-w-2xl animate-hero">
            <div className="inline-flex items-center gap-2.5 mb-6 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm animate-pulse-slow">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400" />
              </span>
              <span className="text-blue-300 text-xs font-semibold tracking-widest uppercase">
                Bengkel Terpercaya Bukittinggi
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold leading-[1.04] tracking-tight mb-5">
              <span className="text-white">Bengkel</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent animate-gradient-x bg-[length:200%]">
                Modern
              </span>
              <span className="text-white"> untuk</span>
              <br />
              <span className="text-white">Kendaraan</span>
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent animate-gradient-x bg-[length:200%] animation-delay-1000">
                {' '}
                Premium
              </span>
            </h1>

            <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-lg mb-8 animate-fade-in-up animation-delay-300">
              <TypewriterText texts={[
                'Servis berkala, perbaikan mesin, dan perawatan body dengan teknologi OBD2.',
                'Mekanik tersertifikasi siap membantu kendaraan Anda.',
                'Sistem booking online 24/7 untuk kenyamanan Anda.'
              ]} />
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 mb-10 animate-fade-in-up animation-delay-500">
              <button
                onClick={() => navigate('/member/booking')}
                className="inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.02] active:scale-95 text-sm group"
              >
                🚗 Booking Service
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <a
                href="https://wa.me/6288708230676?text=Halo%20Esther%20Garage%2C%20saya%20mau%20konsultasi%20servis"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2.5 glass-dark hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 text-sm border border-white/10 hover:border-blue-500/30 hover:scale-[1.02] group"
              >
                <svg className="w-5 h-5 text-green-400 group-hover:rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Hubungi WhatsApp
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 animate-fade-in-up animation-delay-700">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  {[1, 5, 8].map((id) => (
                    <img
                      key={id}
                      src={getAvatar(id)}
                      alt="customer"
                      className="w-8 h-8 rounded-full border-2 border-[#0B1120] object-cover animate-float"
                      style={{ animationDelay: `${id * 0.2}s` }}
                    />
                  ))}
                  <span className="w-8 h-8 rounded-full border-2 border-[#0B1120] bg-blue-600/20 flex items-center justify-center text-[10px] font-bold text-blue-300">
                    +500
                  </span>
                </div>
                <span className="text-gray-400 text-xs font-medium">Pelanggan puas</span>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-4 h-4 ${i < 4 ? 'text-yellow-400' : 'text-yellow-400/40'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-gray-400 text-xs font-medium">4.9 / 5.0</span>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div className="flex items-center gap-2">
                <MdCheckCircle className="w-4 h-4 text-green-400 animate-pulse" />
                <span className="text-gray-400 text-xs font-medium">Garansi 6 bulan</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-[10px] tracking-[0.2em] uppercase text-gray-500 font-medium">Scroll</span>
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ─── TENTANG ─── */}
      <section id="tentang" className="py-24 px-6 sm:px-10 lg:px-16 bg-[#0B1120] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-600/5 rounded-full blur-3xl pointer-events-none animate-blob" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-orange-500/5 rounded-full blur-3xl pointer-events-none animate-blob animation-delay-2000" />

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <Reveal direction="left" distance={30}>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-blue-600/10 group">
                <img
                  src={IMAGES.about}
                  alt="Interior bengkel Esther Garage modern dengan lift dan peralatan"
                  className="w-full h-[420px] object-cover object-center group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-transparent to-transparent opacity-40" />
                <div className="absolute bottom-6 left-6 glass-dark rounded-xl px-5 py-3 flex items-center gap-4 animate-float" style={{ animationDelay: '0.5s' }}>
                  <div className="text-center">
                    <div className="text-2xl font-extrabold text-white">8+</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider">Tahun Pengalaman</div>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="text-center">
                    <div className="text-2xl font-extrabold text-white">5.000+</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider">Pelanggan</div>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={150} direction="right" distance={30}>
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-8 h-0.5 bg-blue-500 rounded-full" />
                <span className="text-blue-400 text-xs font-semibold tracking-widest uppercase">Tentang Kami</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
                Esther Garage — <br />
                <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent animate-gradient-x bg-[length:200%]">
                  Bengkel Modern
                </span>{' '}
                di Bukittinggi
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Didirikan pada tahun 2018, Esther Garage hadir untuk memberikan layanan servis kendaraan
                yang profesional, transparan, dan terjangkau. Dengan mekanik bersertifikat dan peralatan
                diagnostik modern, kami berkomitmen menjaga performa kendaraan Anda.
              </p>

              {/* ─── ANIMATED COUNTER STATISTICS ─── */}
              <div ref={statsRef} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { target: 5000, suffix: '+', label: 'Pelanggan', color: 'from-blue-400 to-blue-600' },
                  { target: 10, suffix: '+', label: 'Mekanik', color: 'from-orange-400 to-orange-600' },
                  { target: 8, suffix: '+', label: 'Tahun', color: 'from-white to-white' },
                  { target: 98, suffix: '%', label: 'Kepuasan', color: 'from-emerald-400 to-emerald-600' },
                ].map((stat, idx) => (
                  <div key={idx} className="glass-card rounded-xl p-4 text-center transform transition-all duration-500 hover:scale-110 hover:shadow-xl">
                    <div className={`text-2xl font-extrabold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                      <AnimatedCounter target={stat.target} suffix={stat.suffix} trigger={statsVisible} />
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-4 text-xs">
                <div className="flex-1 glass-card rounded-xl p-4 transform transition-all duration-300 hover:scale-105 hover:border-blue-500/30">
                  <span className="text-blue-400 font-bold block mb-1">Visi</span>
                  <p className="text-gray-400 leading-relaxed">Menjadi bengkel terpercaya dengan layanan premium dan teknologi terkini.</p>
                </div>
                <div className="flex-1 glass-card rounded-xl p-4 transform transition-all duration-300 hover:scale-105 hover:border-orange-500/30">
                  <span className="text-orange-400 font-bold block mb-1">Misi</span>
                  <p className="text-gray-400 leading-relaxed">Memberikan servis berkualitas, transparan, dan ramah pelanggan.</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── TIMELINE ─── */}
      <section id="timeline" className="py-24 px-6 sm:px-10 lg:px-16 bg-[#0F1A2E] relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.04),transparent_70%)]" />
        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-14">
            <Reveal>
              <span className="text-blue-400 text-xs font-semibold tracking-widest uppercase">Perjalanan Kami</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Sejarah &amp; Pencapaian</h2>
              <p className="text-gray-400 text-sm max-w-md mx-auto mt-2">Setiap langkah adalah komitmen untuk pelayanan terbaik.</p>
            </Reveal>
          </div>

          <div className="relative timeline-line">
            <div className="space-y-8 md:space-y-0 md:grid md:grid-cols-3 md:gap-6">
              {[
                { year: '2018', title: 'Bengkel Didirikan', desc: 'Berawal dari satu garasi kecil dengan 2 mekanik.', color: 'blue' },
                { year: '2020', title: '1.000 Pelanggan', desc: 'Kepercayaan publik meningkat pesat.', color: 'orange' },
                { year: '2022', title: 'Ruang Servis Baru', desc: 'Ekspansi bengkel dengan 4 lift hidrolik.', color: 'blue' },
                { year: '2024', title: 'Sistem CRM Online', desc: 'Booking & tracking real-time tersedia.', color: 'orange' },
                { year: '2026', title: '5.000+ Pelanggan Aktif', desc: 'Komitmen kami terus berlanjut.', color: 'emerald' },
              ].map((item, idx) => (
                <Reveal key={item.year} delay={idx * 100} direction="up" distance={20}>
                  <div className="relative flex md:flex-col items-start md:items-center gap-4 md:gap-3">
                    <div
                      className="w-4 h-4 rounded-full border-3 border-[#0F1A2E] shadow-[0_0_0_4px_rgba(37,99,235,0.25)] shrink-0 animate-pulse-slow"
                      style={{
                        background: item.color === 'emerald' ? '#10b981' : item.color === 'orange' ? '#f97316' : '#2563eb',
                        animationDelay: `${idx * 0.3}s`,
                      }}
                    />
                    <div className="glass-card rounded-xl p-5 w-full transform transition-all duration-500 hover:scale-105 hover:shadow-xl">
                      <div
                        className={`font-extrabold text-xl ${
                          item.color === 'emerald'
                            ? 'text-emerald-400'
                            : item.color === 'orange'
                            ? 'text-orange-400'
                            : 'text-blue-400'
                        }`}
                      >
                        {item.year}
                      </div>
                      <p className="text-white font-semibold text-sm mt-1">{item.title}</p>
                      <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── LAYANAN ─── */}
      <section id="layanan" className="py-24 px-6 sm:px-10 lg:px-16 bg-[#0B1120]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <Reveal>
              <span className="text-blue-400 text-xs font-semibold tracking-widest uppercase">Layanan Kami</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Perawatan Lengkap untuk Kendaraan Anda</h2>
              <p className="text-gray-400 text-sm max-w-lg mx-auto mt-2">Dari servis rutin hingga perbaikan mesin, semua ditangani oleh profesional.</p>
            </Reveal>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { img: IMAGES.service1, title: 'Servis Mesin', desc: 'Diagnostik OBD2, tune-up, dan perbaikan mesin oleh mekanik bersertifikat.', icon: '🔧', category: 'Performa' },
              { img: IMAGES.service2, title: 'Ganti Oli & Filter', desc: 'Pelumas berkualitas, filter original, dan cek kebocoran untuk performa optimal.', icon: '🛢️', category: 'Perawatan' },
              { img: IMAGES.service3, title: 'Tune Up & ECU', desc: 'Pengaturan ulang ECU, pembersihan injector, dan busi untuk efisiensi BBM.', icon: '⚡', category: 'Performa' },
              { img: IMAGES.service4, title: 'Pemeriksaan Total', desc: 'Cek semua sistem kendaraan secara menyeluruh dengan teknologi diagnostik modern.', icon: '🔍', category: 'Perawatan' },
            ].map((service, idx) => (
              <Reveal key={service.title} delay={idx * 100} direction="up" distance={20}>
                <div className="glass-card rounded-2xl overflow-hidden group transform transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl flex flex-col">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={service.img}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] to-transparent opacity-60" />
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-500/80 text-white px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                        {service.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 text-2xl animate-float" style={{ animationDelay: `${idx * 0.2}s` }}>
                      {service.icon}
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-white font-bold text-base group-hover:text-blue-400 transition-colors">{service.title}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed mt-1 flex-1">{service.desc}</p>
                    <button
                      onClick={() => navigate('/guest/layanan')}
                      className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 transition-all flex items-center justify-center gap-2 group-hover:gap-3 cursor-pointer"
                    >
                      Lihat Detail <MdArrowForward className="text-sm" />
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* CTA ke halaman layanan */}
          <div className="text-center mt-10">
            <Reveal delay={200}>
              <button
                onClick={() => navigate('/guest/layanan')}
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold text-sm border border-blue-500/30 hover:border-blue-400/50 px-6 py-2.5 rounded-xl transition-all bg-blue-500/10 hover:bg-blue-500/20"
              >
                Lihat Semua Layanan <MdArrowForward />
              </button>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── MEMBERSHIP ─── */}
      <section id="membership" className="py-24 px-6 sm:px-10 lg:px-16 bg-[#0F1A2E] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Heading */}
          <div className="text-center mb-14">
            <Reveal>
              <span className="text-purple-400 text-xs font-semibold tracking-widest uppercase">Program Keanggotaan</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
                Pilihan Membership <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">Eksklusif</span>
              </h2>
              <p className="text-gray-400 text-sm max-w-lg mx-auto mt-3 leading-relaxed">
                Bergabung sebagai member dan nikmati berbagai keistimewaan — dari diskon servis hingga layanan
                antar-jemput kendaraan. Kumpulkan poin dari setiap servis untuk naik tier.
              </p>
            </Reveal>
          </div>

          {/* Cards — preview kartu digital, urutan tier tertinggi ke terendah */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {MEMBERSHIP_TIERS.map((tierKey, idx) => {
              const theme = CARD_THEME_LANDING[tierKey]
              return (
                <Reveal key={tierKey} delay={idx * 80} direction="up" distance={24}>
                  <div className="flex flex-col gap-4">
                    {/* ── Preview kartu digital (reuse CardFront) ── */}
                    <div
                      className="w-full group transition-transform duration-500 hover:-translate-y-1"
                      style={{ aspectRatio: '1.586/1', position: 'relative' }}
                    >
                      {/* Glow di belakang kartu */}
                      <div
                        className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"
                        style={{ background: theme.accentGlow, transform: 'scale(0.95) translateY(8px)' }}
                      />
                      <div className="relative w-full h-full">
                        <CardFrontLanding theme={theme} />
                      </div>
                    </div>

                    {/* ── Info tier + benefit ── */}
                    <div
                      className="rounded-2xl p-4 flex flex-col gap-3"
                      style={{
                        background: `${theme.accent}08`,
                        border: `1px solid ${theme.accent}25`,
                      }}
                    >
                      {/* Tier name + min poin */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{theme.icon}</span>
                          <div>
                            <p className="text-white font-extrabold text-sm leading-none">{theme.label}</p>
                            <p className="text-[10px] mt-0.5" style={{ color: `${theme.accentLight}70` }}>{theme.sublabel}</p>
                          </div>
                        </div>
                        <span
                          className="text-[9px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider"
                          style={{ background: `${theme.accent}18`, color: theme.accentLight, border: `1px solid ${theme.accent}30` }}
                        >
                          {theme.minPoin}
                        </span>
                      </div>

                      {/* Ringkasan benefit */}
                      <ul className="space-y-1.5">
                        {theme.benefits.slice(0, 3).map((b) => (
                          <li key={b} className="flex items-start gap-1.5">
                            <div
                              className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                              style={{ background: `${theme.accent}22` }}
                            >
                              <MdCheckCircle size={9} style={{ color: theme.accent }} />
                            </div>
                            <span className="text-gray-400 text-[11px] leading-relaxed">{b}</span>
                          </li>
                        ))}
                        {theme.benefits.length > 3 && (
                          <li className="text-[10px] font-medium" style={{ color: `${theme.accentLight}70` }}>
                            +{theme.benefits.length - 3} benefit lainnya...
                          </li>
                        )}
                      </ul>

                      {/* Tombol */}
                      <button
                        onClick={() => navigate('/guest/register')}
                        className="w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 mt-1"
                        style={{
                          background: tierKey === 'Platinum'
                            ? `linear-gradient(135deg, ${theme.accent}cc, ${theme.accentLight}99)`
                            : `${theme.accent}18`,
                          color: tierKey === 'Platinum' ? '#000' : theme.accentLight,
                          border: `1px solid ${theme.accent}${tierKey === 'Platinum' ? 'cc' : '35'}`,
                        }}
                      >
                        Daftar Sekarang <MdArrowForward size={13} />
                      </button>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>

          {/* CTA bawah */}
          <div className="text-center mt-12">
            <Reveal delay={200}>
              <p className="text-gray-500 text-sm mb-4">
                Sudah punya akun? Cek tier keanggotaan Anda sekarang.
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <button
                  onClick={() => navigate('/guest/login')}
                  className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-semibold text-sm border border-purple-500/30 hover:border-purple-400/50 px-6 py-2.5 rounded-xl transition-all bg-purple-500/10 hover:bg-purple-500/20"
                >
                  <MdStars size={16} /> Lihat Status Membership Saya
                </button>
                <button
                  onClick={() => navigate('/guest/register')}
                  className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-semibold text-sm border border-amber-500/30 hover:border-amber-400/50 px-6 py-2.5 rounded-xl transition-all bg-amber-500/10 hover:bg-amber-500/20"
                >
                  Daftar Sekarang <MdArrowForward size={16} />
                </button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── GALERI ─── */}
      <section id="galeri" className="py-24 px-6 sm:px-10 lg:px-16 bg-[#0B1120]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <Reveal>
              <span className="text-orange-400 text-xs font-semibold tracking-widest uppercase">Galeri</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Suasana Bengkel Kami</h2>
              <p className="text-gray-400 text-sm max-w-md mx-auto mt-2">Lihat langsung profesionalisme dan kenyamanan di Esther Garage.</p>
            </Reveal>
          </div>

          <div className="columns-3 gap-4 space-y-4">
            {IMAGES.gallery.map((url, idx) => (
              <Reveal key={idx} delay={idx * 50} direction={idx % 2 === 0 ? 'left' : 'right'} distance={20}>
                <div className="gallery-item rounded-2xl overflow-hidden relative group">
                  <img
                    src={url}
                    alt={`Suasana bengkel Esther Garage ${idx + 1}`}
                    className="w-full block group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120]/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="text-white text-xs font-medium animate-fade-in">📸 Bengkel Esther</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MENGAPA MEMILIH ESTHER GARAGE ─── */}
      <section className="py-24 px-6 sm:px-10 lg:px-16 bg-[#0B1120] relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none animate-blob" />
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <Reveal>
              <span className="text-orange-400 text-xs font-semibold tracking-widest uppercase">Keunggulan</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Mengapa Memilih Esther Garage?</h2>
              <p className="text-gray-400 text-sm max-w-md mx-auto mt-2">Kami hadir dengan layanan terbaik untuk kendaraan Anda.</p>
            </Reveal>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: <MdCalendarToday className="text-2xl" />, title: 'Booking Online 24/7', desc: 'Pesan slot servis kapan saja tanpa antri.' },
              { icon: <MdGpsFixed className="text-2xl" />, title: 'Tracking Servis Real-Time', desc: 'Pantau progress kendaraan via smartphone.' },
              { icon: <MdStars className="text-2xl" />, title: 'Loyalty Point Member', desc: 'Kumpulkan poin setiap servis untuk reward.' },
              { icon: <MdCardGiftcard className="text-2xl" />, title: 'Promo dan Voucher', desc: 'Diskon eksklusif dan voucher ulang tahun.' },
              { icon: <MdVerified className="text-2xl" />, title: 'Mekanik Bersertifikat', desc: 'Tersertifikasi TAM, AHM, dan Bosch.' },
              { icon: <MdSupportAgent className="text-2xl" />, title: 'Dukungan WhatsApp Cepat', desc: 'CS siap membantu setiap hari kerja.' },
            ].map((item, idx) => (
              <Reveal key={item.title} delay={idx * 100} direction="up" distance={20}>
                <div className="glass-card rounded-2xl p-6 text-center group transform transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl">
                  <div className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center text-blue-400 bg-blue-500/10 group-hover:bg-blue-500/20 transition-all group-hover:scale-110 group-hover:rotate-6">
                    <RotatingIcon duration={12}>
                      {item.icon}
                    </RotatingIcon>
                  </div>
                  <h3 className="text-white font-bold text-base mb-1 group-hover:text-blue-400 transition-colors">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── KEUNGGULAN (EXISTING SECTION) ─── */}
      <section className="py-24 px-6 sm:px-10 lg:px-16 bg-[#0F1A2E] relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none animate-blob animation-delay-2000" />
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <Reveal direction="left" distance={30}>
              <div className="rounded-2xl overflow-hidden shadow-2xl shadow-blue-600/10 group">
                <img
                  src={IMAGES.mechanic}
                  alt="Mekanik profesional Esther Garage sedang memperbaiki mobil"
                  className="w-full h-[500px] object-cover object-center group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] to-transparent opacity-40" />
              </div>
            </Reveal>

            <Reveal delay={150} direction="right" distance={30}>
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-8 h-0.5 bg-orange-500 rounded-full" />
                <span className="text-orange-400 text-xs font-semibold tracking-widest uppercase">Keunggulan</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
                Kenapa Memilih <br />
                <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent animate-gradient-x bg-[length:200%] animation-delay-1000">
                  Esther Garage?
                </span>
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Kami menggabungkan teknologi modern dengan keahlian mekanik berpengalaman untuk memberikan hasil terbaik.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: '🔒', title: 'Mekanik Bersertifikat', desc: 'Tersertifikasi resmi TAM, AHM, Bosch.' },
                  { icon: '⚙️', title: 'Peralatan Modern', desc: 'OBD2, lift hidrolik, diagnostik digital.' },
                  { icon: '📅', title: 'Booking Online 24/7', desc: 'Pesan slot servis kapan saja.' },
                  { icon: '🛡️', title: 'Garansi Pekerjaan', desc: 'Garansi 6 bulan untuk setiap servis.' },
                ].map((item, idx) => (
                  <div key={item.title} className="glass-card rounded-xl p-4 flex items-start gap-3 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <span className="text-xl animate-float" style={{ animationDelay: `${idx * 0.2}s` }}>{item.icon}</span>
                    <div>
                      <h4 className="text-white text-sm font-bold">{item.title}</h4>
                      <p className="text-gray-500 text-xs">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── ALUR SERVIS ─── */}
      <section className="py-24 px-6 sm:px-10 lg:px-16 bg-[#0B1120]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Reveal>
              <span className="text-blue-400 text-xs font-semibold tracking-widest uppercase">Proses Servis</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Alur Servis Kendaraan</h2>
              <p className="text-gray-400 text-sm max-w-md mx-auto mt-2">Transparan, cepat, dan terjamin kualitasnya.</p>
            </Reveal>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
            {[
              { icon: '📋', label: 'Booking' },
              { icon: '🔍', label: 'Pemeriksaan' },
              { icon: '💰', label: 'Estimasi Biaya' },
              { icon: '🔧', label: 'Pengerjaan' },
              { icon: '✅', label: 'Quality Check' },
              { icon: '🚗', label: 'Diserahkan' },
            ].map((step, idx) => (
              <Reveal key={step.label} delay={idx * 100} direction="up" distance={20}>
                <div className="flex items-center gap-3 flow-connector">
                  <div className="glass-card rounded-2xl p-5 text-center w-40 transform transition-all duration-500 hover:scale-110 hover:shadow-2xl">
                    <div className="text-3xl mb-2 animate-float" style={{ animationDelay: `${idx * 0.2}s` }}>{step.icon}</div>
                    <div className="text-white font-bold text-sm group-hover:text-blue-400 transition-colors">{step.label}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROMO + COUNTDOWN ─── */}
      <section className="py-24 px-6 sm:px-10 lg:px-16 bg-[#0F1A2E] relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(249,115,22,0.05),transparent_70%)]" />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-14">
            <Reveal>
              <span className="text-orange-400 text-xs font-semibold tracking-widest uppercase">Promo Terbatas</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Penawaran Spesial</h2>
              <p className="text-gray-400 text-sm max-w-md mx-auto mt-2">Dapatkan diskon dan voucher menarik sebelum habis!</p>
            </Reveal>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Reveal direction="left" distance={20}>
              <div className="glass-card rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center text-3xl shrink-0 animate-float">
                  🎁
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-orange-400 text-xs font-bold uppercase tracking-wider">Diskon 15%</span>
                    <span className="text-[10px] bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full animate-pulse">Active</span>
                  </div>
                  <h3 className="text-white font-bold text-lg">Voucher Welcome</h3>
                  <p className="text-gray-500 text-xs">Untuk member baru, berlaku semua layanan.</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-extrabold text-white animate-pulse-slow">15%</div>
                  <div className="text-[10px] text-gray-500">off</div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={150} direction="right" distance={20}>
              <div className="glass-card rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 border-orange-500/20 transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center text-3xl shrink-0 animate-float" style={{ animationDelay: '0.5s' }}>
                  ⏳
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 text-xs font-bold uppercase tracking-wider">Flash Sale</span>
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full animate-pulse">Hurry!</span>
                  </div>
                  <h3 className="text-white font-bold text-lg">Servis Mesin + Tune Up</h3>
                  <p className="text-gray-500 text-xs">Paket hemat dengan diskon tambahan.</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5 text-xs font-mono">
                    <span className="bg-[#0B1120] px-2 py-1 rounded text-white font-bold animate-countdown">
                      {mins}
                    </span>
                    <span className="text-gray-500 animate-pulse">:</span>
                    <span className="bg-[#0B1120] px-2 py-1 rounded text-white font-bold animate-countdown" style={{ animationDelay: '0.2s' }}>
                      {secs}
                    </span>
                  </div>
                  <div className="text-[9px] text-gray-500 mt-0.5">tersisa</div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONI ─── */}
      <section className="py-24 px-6 sm:px-10 lg:px-16 bg-[#0B1120]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <Reveal>
              <span className="text-emerald-400 text-xs font-semibold tracking-widest uppercase">Testimoni</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Apa Kata Pelanggan Kami</h2>
            </Reveal>
          </div>

          <Reveal direction="up" distance={30}>
            <div className="glass-card rounded-2xl p-8 md:p-10 max-w-3xl mx-auto transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`w-5 h-5 ${i < 4 ? 'text-yellow-400 animate-float' : 'text-yellow-400/40'}`} style={{ animationDelay: `${i * 0.1}s` }} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-200 text-base md:text-lg leading-relaxed italic mb-6 animate-pulse-slow">
                "Servis di Esther Garage benar-benar berbeda. Mekaniknya ramah, prosesnya cepat, dan hasilnya memuaskan. Mobil saya terasa lebih responsif setelah tune up. Rekomendasi banget!"
              </p>
              <div className="flex items-center gap-4">
                <img src={getAvatar(12)} alt="Customer" className="w-12 h-12 rounded-full border-2 border-blue-500/40 object-cover animate-float" />
                <div>
                  <p className="text-white font-semibold text-sm">Budi Santoso</p>
                  <p className="text-gray-500 text-xs">Toyota Fortuner · Member Gold</p>
                </div>
                <div className="ml-auto flex items-center gap-1 text-[10px] text-gray-500">
                  <MdCheckCircle className="w-3 h-3 text-blue-400 animate-pulse" />
                  Terverifikasi
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── TIM MEKANIK ─── */}
      <section id="tim" className="py-24 px-6 sm:px-10 lg:px-16 bg-[#0F1A2E]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <Reveal>
              <span className="text-blue-400 text-xs font-semibold tracking-widest uppercase">Tim Ahli</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Mekanik Profesional</h2>
              <p className="text-gray-400 text-sm max-w-md mx-auto mt-2">Mereka adalah garda terdepan kualitas servis kami.</p>
            </Reveal>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Andi Saputra', role: 'Senior Mechanic', exp: '8 th', img: 1, badge: 'Senior' },
              { name: 'Rina Wati', role: 'Diagnostic Specialist', exp: '6 th', img: 5, badge: 'Expert' },
              { name: 'Dedi Kurniawan', role: 'Body & Paint Expert', exp: '10 th', img: 8, badge: 'Senior' },
              { name: 'Siti Rahma', role: 'Service Advisor', exp: '5 th', img: 10, badge: 'Certified' },
            ].map((m, idx) => (
              <Reveal key={m.name} delay={idx * 100} direction="up" distance={20}>
                <div className="glass-card rounded-2xl overflow-hidden text-center transform transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl">
                  <div className="relative h-56 overflow-hidden">
                    <img src={getAvatar(m.img)} alt={m.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] to-transparent opacity-40" />
                    <div className="absolute bottom-3 left-3 right-3 flex justify-between">
                      <span className="text-[10px] bg-blue-600/30 text-blue-300 px-2.5 py-0.5 rounded-full backdrop-blur-sm animate-pulse">
                        {m.badge}
                      </span>
                      <span className="text-[10px] bg-emerald-600/30 text-emerald-300 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                        {m.exp}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h4 className="text-white font-bold group-hover:text-blue-400 transition-colors">{m.name}</h4>
                    <p className="text-blue-400 text-xs font-medium">{m.role}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-24 px-6 sm:px-10 lg:px-16 bg-[#0B1120]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <Reveal>
              <span className="text-orange-400 text-xs font-semibold tracking-widest uppercase">FAQ</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Pertanyaan Umum</h2>
              <p className="text-gray-400 text-sm max-w-md mx-auto mt-2">Temukan jawaban cepat untuk pertanyaan Anda.</p>
            </Reveal>
          </div>

          <div className="space-y-3">
            <Reveal direction="left" distance={20}>
              <FaqItem
                question="Apakah harus booking terlebih dahulu?"
                answer="Booking sangat disarankan untuk memastikan slot servis tersedia. Anda bisa booking melalui website atau WhatsApp kami 24/7."
              />
            </Reveal>
            <Reveal delay={100} direction="right" distance={20}>
              <FaqItem
                question="Berapa lama servis berkala?"
                answer="Servis berkala biasanya memakan waktu 1–3 jam tergantung jenis servis. Untuk servis besar seperti tune up atau perbaikan mesin, bisa memakan waktu 4–8 jam."
              />
            </Reveal>
            <Reveal delay={200} direction="left" distance={20}>
              <FaqItem
                question="Apakah menerima semua merek kendaraan?"
                answer="Ya, kami melayani semua merek kendaraan mulai dari Toyota, Honda, Suzuki, Mitsubishi, hingga mobil Eropa seperti BMW, Mercedes, dan Audi."
              />
            </Reveal>
            <Reveal delay={300} direction="right" distance={20}>
              <FaqItem
                question="Apakah tersedia garansi servis?"
                answer="Ya, setiap pekerjaan servis kami berikan garansi selama 6 bulan. Jika ada masalah terkait pekerjaan, kami akan perbaiki tanpa biaya tambahan."
              />
            </Reveal>
            <Reveal delay={400} direction="left" distance={20}>
              <FaqItem
                question="Bagaimana cara mendapatkan poin member?"
                answer="Setiap kali Anda melakukan servis, Anda akan mendapatkan poin loyalty. Poin dapat dikumpulkan dan ditukar dengan berbagai reward menarik."
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── LOKASI & MAPS ─── */}
      <section id="lokasi" className="py-24 px-6 sm:px-10 lg:px-16 bg-[#0F1A2E] relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <Reveal>
              <span className="text-blue-400 text-xs font-semibold tracking-widest uppercase">Kunjungi Kami</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Lokasi &amp; Jam Operasional</h2>
            </Reveal>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <Reveal direction="left" distance={30}>
              <div className="rounded-2xl overflow-hidden shadow-xl shadow-blue-600/10 h-full transform transition-all duration-500 hover:scale-[1.02]">
                <img
                  src={IMAGES.location}
                  alt="Tampak depan bengkel Esther Garage"
                  className="w-full h-64 object-cover transition-transform duration-700 hover:scale-110"
                  loading="lazy"
                />
                <div className="glass-dark p-5">
                  <div className="flex items-center gap-2.5 mb-2">
                    <MdGpsFixed className="w-5 h-5 text-blue-400 animate-pulse" />
                    <span className="text-white font-bold text-sm">Alamat</span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Jl. Sudirman No. 88, Kel. Benteng Pasar Atas,<br />
                    Kec. Guguk Panjang, Bukittinggi 26113
                  </p>
                  <a
                    href="https://maps.google.com/?q=Bukittinggi+Esther+Garage"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 mt-3 text-blue-400 hover:text-blue-300 text-xs font-medium transition-all hover:gap-3"
                  >
                    Buka di Google Maps
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                </div>
              </div>
            </Reveal>

            <Reveal delay={100} direction="up" distance={30}>
              <div className="glass-card rounded-2xl p-6 h-full transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
                <div className="flex items-center gap-2.5 mb-5">
                  <svg className="w-5 h-5 text-orange-400 animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-white font-bold text-sm">Jam Operasional</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b border-white/5 pb-2 hover:bg-white/5 p-2 rounded-lg transition-all">
                    <span className="text-gray-400">Senin – Jumat</span>
                    <span className="text-white font-medium">08.00 – 18.00</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2 hover:bg-white/5 p-2 rounded-lg transition-all">
                    <span className="text-gray-400">Sabtu</span>
                    <span className="text-white font-medium">08.00 – 16.00</span>
                  </div>
                  <div className="flex justify-between hover:bg-white/5 p-2 rounded-lg transition-all">
                    <span className="text-gray-400">Minggu &amp; Libur</span>
                    <span className="text-orange-400 font-medium animate-pulse">Tutup</span>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-white/10 flex items-start gap-2.5">
                  <MdSupportAgent className="w-4 h-4 text-blue-400 shrink-0 mt-0.5 animate-float" />
                  <p className="text-gray-500 text-xs leading-relaxed">Layanan darurat? Hubungi WhatsApp kami untuk bantuan cepat.</p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={200} direction="right" distance={30}>
              <div className="rounded-2xl overflow-hidden shadow-xl shadow-blue-600/10 h-full transform transition-all duration-500 hover:scale-[1.02]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.829975739129!2d100.370128!3d-0.304922!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2fd53bc8b9f5f6c3%3A0x8c2b8d6f1e9f3b1!2sBukittinggi%2C%20Kota%20Bukittinggi%2C%20Sumatera%20Barat!5e0!3m2!1sid!2sid!4v1710000000000!5m2!1sid!2sid"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: '280px' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Google Maps Esther Garage"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── CONTACT FORM (NEW SECTION) ─── */}
      <section id="kontak" className="py-24 px-6 sm:px-10 lg:px-16 bg-[#0B1120] relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.05),transparent_70%)]" />
        <div className="max-w-4xl mx-auto relative">
          <div className="text-center mb-14">
            <Reveal>
              <span className="text-blue-400 text-xs font-semibold tracking-widest uppercase">Hubungi Kami</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Ada Pertanyaan?</h2>
              <p className="text-gray-400 text-sm max-w-md mx-auto mt-2">Kirim pesan kepada kami dan tim akan merespon secepat mungkin.</p>
            </Reveal>
          </div>
          <Reveal direction="up" distance={30}>
            <ContactForm />
          </Reveal>
        </div>
      </section>

      {/* ─── CTA PENUTUP ─── */}
      <section className="relative py-28 px-6 sm:px-10 lg:px-16 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={IMAGES.cta}
            alt="Mobil premium siap melaju"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-[#0B1120]/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1120] via-[#0B1120]/60 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(37,99,235,0.12),transparent_70%)]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <Reveal direction="up" distance={30}>
            <div className="inline-flex items-center gap-2.5 mb-5 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm animate-pulse-slow">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400" />
              </span>
              <span className="text-blue-300 text-xs font-semibold tracking-widest uppercase">Siap untuk servis?</span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4">
              Siap Merawat<br />
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent animate-gradient-x bg-[length:200%]">
                Kendaraan Anda?
              </span>
            </h2>
            <p className="text-gray-400 text-base max-w-lg mx-auto mb-8 leading-relaxed animate-fade-in-up animation-delay-300">
              Booking sekarang dan rasakan pengalaman servis modern dengan mekanik bersertifikat dan teknologi OBD2.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3.5 animate-fade-in-up animation-delay-500">
              <button
                onClick={() => navigate('/member/booking')}
                className="inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.02] active:scale-95 text-sm group"
              >
                🚗 Booking Sekarang
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <a
                href="https://wa.me/6288708230676?text=Halo%20Esther%20Garage%2C%20saya%20mau%20konsultasi"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2.5 glass-dark hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 text-sm border border-white/10 hover:border-blue-500/30 hover:scale-[1.02] group"
              >
                <svg className="w-5 h-5 text-green-400 group-hover:rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Hubungi WhatsApp
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-10 px-6 sm:px-10 lg:px-16 bg-[#080D18] border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl font-extrabold text-white animate-float">EG</span>
            <span className="text-xs text-gray-500">© 2026 Esther Garage. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <a href="#" className="hover:text-blue-400 transition hover:scale-110">Privacy</a>
            <a href="#" className="hover:text-blue-400 transition hover:scale-110">Terms</a>
            <a href="#" className="hover:text-blue-400 transition hover:scale-110">Contact</a>
          </div>
        </div>
      </footer>

      {/* ─── FLOATING BUTTONS ─── */}
      <FloatingWhatsApp />
      <ScrollToTop />

      {/* ─── GLOBAL STYLES ─── */}
      <style>{`
        .glass-dark {
          background: rgba(11, 17, 32, 0.7);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .glass-card:hover {
          background: rgba(255, 255, 255, 0.07);
          border-color: rgba(37, 99, 235, 0.25);
          transform: translateY(-6px);
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.6);
        }
        .timeline-line {
          position: relative;
        }
        .timeline-line::before {
          content: '';
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(to bottom, #2563eb, #f97316, #2563eb);
          transform: translateX(-50%);
          opacity: 0.3;
        }
        .flow-connector {
          position: relative;
        }
        .flow-connector::after {
          content: '';
          position: absolute;
          top: 50%;
          right: -20px;
          width: 32px;
          height: 2px;
          background: linear-gradient(to right, rgba(37, 99, 235, 0.3), rgba(249, 115, 22, 0.3));
          transform: translateY(-50%);
        }
        .flow-connector:last-child::after {
          display: none;
        }
        .gallery-item {
          position: relative;
          overflow: hidden;
          border-radius: 16px;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .gallery-item img {
          width: 100%;
          display: block;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .gallery-item:hover img {
          transform: scale(1.06);
        }
        .gallery-item .overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(11, 17, 32, 0.7), transparent 60%);
          opacity: 0;
          transition: opacity 0.4s;
          display: flex;
          align-items: flex-end;
          padding: 20px;
        }
        .gallery-item:hover .overlay {
          opacity: 1;
        }
        
        /* ─── ANIMATIONS ─── */
        @keyframes floatParticle {
          0% { transform: translateY(0) translateX(0); opacity: 0.05; }
          50% { opacity: 0.2; }
          100% { transform: translateY(-40px) translateX(12px); opacity: 0.05; }
        }
        @keyframes countdownPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
        .animate-countdown {
          animation: countdownPulse 1.2s ease-in-out infinite;
        }
        .animate-hero {
          animation: heroReveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes heroReveal {
          0% { opacity: 0; transform: scale(1.02); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease forwards;
        }
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease forwards;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float-particle {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          25% { opacity: 1; }
          75% { opacity: 1; }
          100% { transform: translateY(-100px) translateX(20px); opacity: 0; }
        }
        .animate-float-particle {
          animation: float-particle 8s ease-in-out infinite;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.02); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
        .animate-wiggle {
          animation: wiggle 0.5s ease-in-out infinite;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s ease-in-out infinite;
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          animation: gradient-x 3s ease-in-out infinite;
        }
        @keyframes blink-cursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-blink-cursor {
          animation: blink-cursor 0.8s step-end infinite;
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.2); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.4); }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        .animation-delay-1000 { animation-delay: 1000ms; }
        .animation-delay-2000 { animation-delay: 2000ms; }
        .animation-delay-300 { animation-delay: 300ms; }
        .animation-delay-500 { animation-delay: 500ms; }
        .animation-delay-700 { animation-delay: 700ms; }
        
        @media (max-width: 768px) {
          .flow-connector::after { display: none; }
          .columns-3 { columns: 2; }
        }
        @media (max-width: 480px) {
          .columns-3 { columns: 1; }
        }
      `}</style>
    </div>
  );
}