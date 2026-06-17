import React, { useState, useEffect, useRef } from 'react';
import GuestNavbar from '../../components/guest/GuestNavbar';
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

// ─── COMPONENT: Reveal on scroll ─────────────────────────────
const Reveal = ({ children, delay = 0 }) => {
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

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
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
        <div className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110"
          style={{ background: '#25D366', boxShadow: '0 8px 24px rgba(37,211,102,0.4)' }}
        >
          <MdWhatsapp className="text-white text-3xl" />
        </div>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(0,0,0,0.8)' }}>
          Hubungi Kami
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
      <MdArrowUpward className="text-white text-xl" />
    </button>
  );
};

// ─── CONTACT FORM ──────────────────────────────────────────────
const ContactForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

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
    <div className="max-w-2xl mx-auto glass-card rounded-2xl p-6 md:p-8">
      <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
        <MdSend className="text-blue-400" /> Kirim Pesan
      </h3>
      <p className="text-gray-400 text-sm mb-6">Kami akan merespon dalam 24 jam kerja.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-1">Nama Lengkap</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-blue-500/50 focus:outline-none text-white transition-all"
            placeholder="Nama Anda"
          />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-blue-500/50 focus:outline-none text-white transition-all"
            placeholder="email@anda.com"
          />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-1">Nomor HP</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-blue-500/50 focus:outline-none text-white transition-all"
            placeholder="0812-3456-7890"
          />
          {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-1">Pesan</label>
          <textarea
            name="message"
            rows="4"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-blue-500/50 focus:outline-none text-white transition-all resize-none"
            placeholder="Tulis pesan Anda di sini..."
          />
          {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}
        </div>
        <button
          type="submit"
          className="w-full py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-98"
          style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)' }}
        >
          <MdSend /> Kirim Pesan
        </button>
      </form>

      {isSubmitted && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-5 py-2 rounded-full text-sm shadow-lg z-50 animate-fade-in">
          ✅ Pesan terkirim! Kami akan segera merespon.
        </div>
      )}
    </div>
  );
};

// ─── MAIN COMPONENT ────────────────────────────────────────────
export default function LandingPage() {
  const [seconds, setSeconds] = useState(137);
  const [scrollY, setScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState('home');

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
    <div className="overflow-x-hidden bg-[#0B1120] text-[#F8FAFC] font-['Inter',sans-serif]">
      {/* ─── NAVBAR ─── */}
      <GuestNavbar />

      {/* ─── HERO ─── */}
      <section id="home" className="relative min-h-screen flex items-center overflow-hidden pt-16">
        <div className="absolute inset-0">
          <img
            src={IMAGES.hero}
            alt="Esther Garage – Bengkel Modern Bukittinggi"
            className="w-full h-full object-cover object-center"
            style={{ transform: `scale(1.06) translateY(${scrollY * 0.04}px)` }}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B1120] via-[#0B1120]/70 to-[#0B1120]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-transparent to-[#0B1120]/40" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(37,99,235,0.08),transparent_60%)]" />
          <div className="absolute inset-0 opacity-[0.03] bg-[length:60px_60px] [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)]" />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[12%] left-[8%] w-2 h-2 rounded-full bg-blue-400/20 animate-[floatParticle_6s_ease-in-out_infinite]" />
          <div className="absolute top-[28%] right-[15%] w-3 h-3 rounded-full bg-orange-400/15 animate-[floatParticle_8s_ease-in-out_infinite_1s]" />
          <div className="absolute bottom-[35%] left-[20%] w-1.5 h-1.5 rounded-full bg-blue-500/20 animate-[floatParticle_7s_ease-in-out_infinite_2s]" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-20">
          <div className="max-w-2xl animate-hero">
            <div className="inline-flex items-center gap-2.5 mb-6 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm">
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
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Modern
              </span>
              <span className="text-white"> untuk</span>
              <br />
              <span className="text-white">Kendaraan</span>
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                {' '}
                Premium
              </span>
            </h1>

            <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-lg mb-8">
              Servis berkala, perbaikan mesin, dan perawatan body dengan teknologi OBD2, mekanik
              tersertifikasi, serta sistem booking online 24/7.
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 mb-10">
              <a
                href="#booking"
                className="inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.02] active:scale-95 text-sm"
              >
                🚗 Booking Service
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              <a
                href="https://wa.me/6288708230676?text=Halo%20Esther%20Garage%2C%20saya%20mau%20konsultasi%20servis"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2.5 glass-dark hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 text-sm border border-white/10 hover:border-blue-500/30 hover:scale-[1.02]"
              >
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Hubungi WhatsApp
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  <img src={getAvatar(1)} alt="customer" className="w-8 h-8 rounded-full border-2 border-[#0B1120] object-cover" />
                  <img src={getAvatar(5)} alt="customer" className="w-8 h-8 rounded-full border-2 border-[#0B1120] object-cover" />
                  <img src={getAvatar(8)} alt="customer" className="w-8 h-8 rounded-full border-2 border-[#0B1120] object-cover" />
                  <span className="w-8 h-8 rounded-full border-2 border-[#0B1120] bg-blue-600/20 flex items-center justify-center text-[10px] font-bold text-blue-300">
                    +500
                  </span>
                </div>
                <span className="text-gray-400 text-xs font-medium">Pelanggan puas</span>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-gray-400 text-xs font-medium">4.9 / 5.0</span>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
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
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <Reveal>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-blue-600/10">
                <img
                  src={IMAGES.about}
                  alt="Interior bengkel Esther Garage modern dengan lift dan peralatan"
                  className="w-full h-[420px] object-cover object-center"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-transparent to-transparent opacity-40" />
                <div className="absolute bottom-6 left-6 glass-dark rounded-xl px-5 py-3 flex items-center gap-4">
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

            <Reveal delay={150}>
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-8 h-0.5 bg-blue-500 rounded-full" />
                <span className="text-blue-400 text-xs font-semibold tracking-widest uppercase">Tentang Kami</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
                Esther Garage — <br />
                <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
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
                <div className="glass-card rounded-xl p-4 text-center">
                  <div className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                    <AnimatedCounter target={5000} suffix="+" trigger={statsVisible} />
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Pelanggan</div>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                  <div className="text-2xl font-extrabold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                    <AnimatedCounter target={10} suffix="+" trigger={statsVisible} />
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Mekanik</div>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                  <div className="text-2xl font-extrabold text-white">
                    <AnimatedCounter target={8} suffix="+" trigger={statsVisible} />
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Tahun</div>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                  <div className="text-2xl font-extrabold text-emerald-400">
                    <AnimatedCounter target={98} suffix="%" trigger={statsVisible} />
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Kepuasan</div>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-4 text-xs">
                <div className="flex-1 glass-card rounded-xl p-4">
                  <span className="text-blue-400 font-bold block mb-1">Visi</span>
                  <p className="text-gray-400 leading-relaxed">Menjadi bengkel terpercaya dengan layanan premium dan teknologi terkini.</p>
                </div>
                <div className="flex-1 glass-card rounded-xl p-4">
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
                <Reveal key={item.year} delay={idx * 100}>
                  <div className="relative flex md:flex-col items-start md:items-center gap-4 md:gap-3">
                    <div
                      className="w-4 h-4 rounded-full border-3 border-[#0F1A2E] shadow-[0_0_0_4px_rgba(37,99,235,0.25)] shrink-0"
                      style={{
                        background: item.color === 'emerald' ? '#10b981' : item.color === 'orange' ? '#f97316' : '#2563eb',
                      }}
                    />
                    <div className="glass-card rounded-xl p-5 w-full">
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
              { img: IMAGES.service1, title: 'Servis Mesin', desc: 'Diagnostik OBD2, tune-up, dan perbaikan mesin.' },
              { img: IMAGES.service2, title: 'Ganti Oli & Filter', desc: 'Pelumas berkualitas, filter original, dan cek kebocoran.' },
              { img: IMAGES.service3, title: 'Tune Up & ECU', desc: 'Pengaturan ulang ECU, pembersihan injector, dan busi.' },
              { img: IMAGES.service4, title: 'Pemeriksaan Total', desc: 'Cek semua sistem kendaraan secara menyeluruh.' },
            ].map((service, idx) => (
              <Reveal key={service.title} delay={idx * 100}>
                <div className="glass-card rounded-2xl overflow-hidden group">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={service.img}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] to-transparent opacity-60" />
                  </div>
                  <div className="p-5">
                    <h3 className="text-white font-bold text-base">{service.title}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed mt-1">{service.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── GALERI ─── */}
      <section id="galeri" className="py-24 px-6 sm:px-10 lg:px-16 bg-[#0F1A2E]">
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
              <Reveal key={idx} delay={idx * 50}>
                <div className="gallery-item rounded-2xl overflow-hidden relative group">
                  <img
                    src={url}
                    alt={`Suasana bengkel Esther Garage ${idx + 1}`}
                    className="w-full block group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120]/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="text-white text-xs font-medium">📸 Bengkel Esther</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MENGAPA MEMILIH ESTHER GARAGE (NEW SECTION) ─── */}
      <section className="py-24 px-6 sm:px-10 lg:px-16 bg-[#0B1120] relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
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
              <Reveal key={item.title} delay={idx * 100}>
                <div className="glass-card rounded-2xl p-6 text-center group hover:-translate-y-2 transition-all duration-300">
                  <div className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center text-blue-400 bg-blue-500/10 group-hover:bg-blue-500/20 transition-all">
                    {item.icon}
                  </div>
                  <h3 className="text-white font-bold text-base mb-1">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── KEUNGGULAN (EXISTING SECTION) ─── */}
      <section className="py-24 px-6 sm:px-10 lg:px-16 bg-[#0F1A2E] relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <Reveal>
              <div className="rounded-2xl overflow-hidden shadow-2xl shadow-blue-600/10">
                <img
                  src={IMAGES.mechanic}
                  alt="Mekanik profesional Esther Garage sedang memperbaiki mobil"
                  className="w-full h-[500px] object-cover object-center"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] to-transparent opacity-40" />
              </div>
            </Reveal>

            <Reveal delay={150}>
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-8 h-0.5 bg-orange-500 rounded-full" />
                <span className="text-orange-400 text-xs font-semibold tracking-widest uppercase">Keunggulan</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
                Kenapa Memilih <br />
                <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
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
                  <div key={item.title} className="glass-card rounded-xl p-4 flex items-start gap-3">
                    <span className="text-xl">{item.icon}</span>
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
              <Reveal key={step.label} delay={idx * 100}>
                <div className="flex items-center gap-3 flow-connector">
                  <div className="glass-card rounded-2xl p-5 text-center w-40">
                    <div className="text-3xl mb-2">{step.icon}</div>
                    <div className="text-white font-bold text-sm">{step.label}</div>
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
            <Reveal>
              <div className="glass-card rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center text-3xl shrink-0">
                  🎁
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-orange-400 text-xs font-bold uppercase tracking-wider">Diskon 15%</span>
                    <span className="text-[10px] bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full">Active</span>
                  </div>
                  <h3 className="text-white font-bold text-lg">Voucher Welcome</h3>
                  <p className="text-gray-500 text-xs">Untuk member baru, berlaku semua layanan.</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-extrabold text-white">15%</div>
                  <div className="text-[10px] text-gray-500">off</div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={150}>
              <div className="glass-card rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 border-orange-500/20">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center text-3xl shrink-0">
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
                    <span className="text-gray-500">:</span>
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

          <Reveal>
            <div className="glass-card rounded-2xl p-8 md:p-10 max-w-3xl mx-auto">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`w-5 h-5 ${i < 4 ? 'text-yellow-400' : 'text-yellow-400/40'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-200 text-base md:text-lg leading-relaxed italic mb-6">
                "Servis di Esther Garage benar-benar berbeda. Mekaniknya ramah, prosesnya cepat, dan hasilnya memuaskan. Mobil saya terasa lebih responsif setelah tune up. Rekomendasi banget!"
              </p>
              <div className="flex items-center gap-4">
                <img src={getAvatar(12)} alt="Customer" className="w-12 h-12 rounded-full border-2 border-blue-500/40 object-cover" />
                <div>
                  <p className="text-white font-semibold text-sm">Budi Santoso</p>
                  <p className="text-gray-500 text-xs">Toyota Fortuner · Member Gold</p>
                </div>
                <div className="ml-auto flex items-center gap-1 text-[10px] text-gray-500">
                  <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
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
              <Reveal key={m.name} delay={idx * 100}>
                <div className="glass-card rounded-2xl overflow-hidden text-center">
                  <div className="relative h-56 overflow-hidden">
                    <img src={getAvatar(m.img)} alt={m.name} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] to-transparent opacity-40" />
                    <div className="absolute bottom-3 left-3 right-3 flex justify-between">
                      <span className="text-[10px] bg-blue-600/30 text-blue-300 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                        {m.badge}
                      </span>
                      <span className="text-[10px] bg-emerald-600/30 text-emerald-300 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                        {m.exp}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h4 className="text-white font-bold">{m.name}</h4>
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
            <Reveal>
              <FaqItem
                question="Apakah harus booking terlebih dahulu?"
                answer="Booking sangat disarankan untuk memastikan slot servis tersedia. Anda bisa booking melalui website atau WhatsApp kami 24/7."
              />
            </Reveal>
            <Reveal delay={100}>
              <FaqItem
                question="Berapa lama servis berkala?"
                answer="Servis berkala biasanya memakan waktu 1–3 jam tergantung jenis servis. Untuk servis besar seperti tune up atau perbaikan mesin, bisa memakan waktu 4–8 jam."
              />
            </Reveal>
            <Reveal delay={200}>
              <FaqItem
                question="Apakah menerima semua merek kendaraan?"
                answer="Ya, kami melayani semua merek kendaraan mulai dari Toyota, Honda, Suzuki, Mitsubishi, hingga mobil Eropa seperti BMW, Mercedes, dan Audi."
              />
            </Reveal>
            <Reveal delay={300}>
              <FaqItem
                question="Apakah tersedia garansi servis?"
                answer="Ya, setiap pekerjaan servis kami berikan garansi selama 6 bulan. Jika ada masalah terkait pekerjaan, kami akan perbaiki tanpa biaya tambahan."
              />
            </Reveal>
            <Reveal delay={400}>
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
            <Reveal>
              <div className="rounded-2xl overflow-hidden shadow-xl shadow-blue-600/10 h-full">
                <img
                  src={IMAGES.location}
                  alt="Tampak depan bengkel Esther Garage"
                  className="w-full h-64 object-cover"
                  loading="lazy"
                />
                <div className="glass-dark p-5">
                  <div className="flex items-center gap-2.5 mb-2">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
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

            <Reveal delay={100}>
              <div className="glass-card rounded-2xl p-6 h-full">
                <div className="flex items-center gap-2.5 mb-5">
                  <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-white font-bold text-sm">Jam Operasional</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-400">Senin – Jumat</span>
                    <span className="text-white font-medium">08.00 – 18.00</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-400">Sabtu</span>
                    <span className="text-white font-medium">08.00 – 16.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Minggu &amp; Libur</span>
                    <span className="text-orange-400 font-medium">Tutup</span>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-white/10 flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-500 text-xs leading-relaxed">Layanan darurat? Hubungi WhatsApp kami untuk bantuan cepat.</p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="rounded-2xl overflow-hidden shadow-xl shadow-blue-600/10 h-full">
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
          <Reveal>
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
          <Reveal>
            <div className="inline-flex items-center gap-2.5 mb-5 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400" />
              </span>
              <span className="text-blue-300 text-xs font-semibold tracking-widest uppercase">Siap untuk servis?</span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4">
              Siap Merawat<br />
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Kendaraan Anda?
              </span>
            </h2>
            <p className="text-gray-400 text-base max-w-lg mx-auto mb-8 leading-relaxed">
              Booking sekarang dan rasakan pengalaman servis modern dengan mekanik bersertifikat dan teknologi OBD2.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3.5">
              <a
                href="#booking"
                className="inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.02] text-sm"
              >
                🚗 Booking Sekarang
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              <a
                href="https://wa.me/6288708230676?text=Halo%20Esther%20Garage%2C%20saya%20mau%20konsultasi"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2.5 glass-dark hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 text-sm border border-white/10 hover:border-blue-500/30 hover:scale-[1.02]"
              >
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
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
            <span className="text-2xl font-extrabold text-white">EG</span>
            <span className="text-xs text-gray-500">© 2026 Esther Garage. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <a href="#" className="hover:text-blue-400 transition">Privacy</a>
            <a href="#" className="hover:text-blue-400 transition">Terms</a>
            <a href="#" className="hover:text-blue-400 transition">Contact</a>
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
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease forwards;
        }
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