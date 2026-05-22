'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Music, 
  Volume2, 
  VolumeX, 
  Heart, 
  Calendar, 
  MapPin, 
  Navigation, 
  ChevronLeft, 
  ChevronRight, 
  X,
  MessageSquare,
  Users,
  Send,
  QrCode,
  Copy,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Story {
  id: string;
  dateString: string;
  title: string;
  description: string;
  imageUrl: string;
  sortOrder: number;
}

interface Image {
  id: string;
  url: string;
  sortOrder: number;
}

interface Wish {
  id: string;
  name: string;
  content: string;
  createdAt: Date | string;
}

interface WeddingData {
  id: string;
  slug: string;
  brideName: string;
  brideShortName: string;
  groomName: string;
  groomShortName: string;
  weddingDate: Date | string;
  locationName: string;
  locationAddress: string;
  googleMapsEmbedUrl: string;
  googleMapsDirectionUrl: string;
  musicUrl: string;
  themeColor: string;
  fontFamily: string;
  seoTitle: string;
  seoDescription: string;
  faviconUrl?: string;
  heroImage: string;
  aboutTitle: string;
  aboutText: string;
  brideAbout: string;
  groomAbout: string;
  brideImage: string;
  groomImage: string;
  groomQrUrl: string;
  groomBankName: string;
  groomAccountNumber: string;
  groomAccountName: string;
  brideQrUrl: string;
  brideBankName: string;
  brideAccountNumber: string;
  brideAccountName: string;
  timeline: Story[];
  gallery: Image[];
  wishes: Wish[];
}

const CornerOrnament = () => (
  <svg className="w-6 h-6 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M 2 22 L 2 2 L 22 2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 6 22 L 6 6 L 22 6" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
  </svg>
);

const getRgbaColor = (hex: string, alpha: number) => {
  if (!hex) return `rgba(244, 240, 230, ${alpha})`;
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(char => char + char).join('');
  }
  const num = parseInt(cleanHex, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function WeddingInvitationClient({ data }: { data: WeddingData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [particles, setParticles] = useState<{
    id: number;
    x: number;
    y: number;
    scale: number;
    color: string;
    type: 'heart' | 'flower' | 'leaf';
    duration: number;
    delay: number;
    drift: number;
    flightHeight: number;
    rotateTarget: number;
  }[]>([]);

  const [bgGlows, setBgGlows] = useState<{
    id: number;
    left: number;
    top: number;
    size: number;
    duration: number;
    delay: number;
  }[]>([]);

  useEffect(() => {
    const glows = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 6 + 3,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * -15,
    }));
    setBgGlows(glows);
  }, []);

  // Dynamically load Google Font "Great Vibes" for the soft elegant wedding header
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Lock body scroll when envelope is closed
  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
    } else {
      document.body.style.overflow = '';
      document.body.style.height = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
    };
  }, [isOpen]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [wishesList, setWishesList] = useState<Wish[]>(data.wishes);
  
  // RSVP Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [guestsCount, setGuestsCount] = useState(1);
  const [wishes, setWishes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Copy bank info States
  const [copiedGroom, setCopiedGroom] = useState(false);
  const [copiedBride, setCopiedBride] = useState(false);

  const handleCopyGroom = () => {
    navigator.clipboard.writeText(data.groomAccountNumber);
    setCopiedGroom(true);
    setTimeout(() => setCopiedGroom(false), 2000);
  };

  const handleCopyBride = () => {
    navigator.clipboard.writeText(data.brideAccountNumber);
    setCopiedBride(true);
    setTimeout(() => setCopiedBride(false), 2000);
  };

  // Countdown timer State
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Minimal YouTube Player interface (avoids @types/youtube)
  interface YTPlayer {
    playVideo(): void;
    pauseVideo(): void;
    destroy(): void;
  }
  interface YTWindow extends Window {
    YT?: { Player: new (el: HTMLDivElement, opts: object) => YTPlayer };
    onYouTubeIframeAPIReady?: () => void;
  }

  const youtubePlayerRef = useRef<YTPlayer | null>(null);
  const youtubeContainerRef = useRef<HTMLDivElement | null>(null);

  // Helper: extract YouTube video ID from various URL formats
  const getYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const isYouTubeUrl = (url: string) => !!getYouTubeVideoId(url);

  // Parse wedding date
  const targetDate = new Date(data.weddingDate);

  // Calculate countdown
  useEffect(() => {
    const calculateTime = () => {
      const difference = +targetDate - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };
    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [data.weddingDate]);

  // Audio / YouTube setup
  useEffect(() => {
    if (!data.musicUrl) return;

    if (isYouTubeUrl(data.musicUrl)) {
      // Load YouTube IFrame API
      const loadYTApi = () => {
        if ((window as unknown as YTWindow).YT?.Player) {
          initYTPlayer();
        } else {
          const tag = document.createElement('script');
          tag.src = 'https://www.youtube.com/iframe_api';
          document.head.appendChild(tag);
          (window as unknown as YTWindow).onYouTubeIframeAPIReady = initYTPlayer;
        }
      };

      const initYTPlayer = () => {
        const videoId = getYouTubeVideoId(data.musicUrl);
        if (!videoId || !youtubeContainerRef.current) return;
        const yt = (window as unknown as YTWindow).YT;
        if (!yt?.Player) return;
        youtubePlayerRef.current = new yt.Player(youtubeContainerRef.current, {
          videoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            loop: 1,
            playlist: videoId,
            rel: 0,
            modestbranding: 1,
            iv_load_policy: 3,
          },
          events: {
            onReady: () => {},
          },
        });
      };

      loadYTApi();

      return () => {
        youtubePlayerRef.current?.destroy();
        youtubePlayerRef.current = null;
      };
    } else {
      // Fallback: plain MP3 audio
      const audio = new Audio(data.musicUrl);
      audio.loop = true;
      audioRef.current = audio;
      return () => {
        audio.pause();
        audioRef.current = null;
      };
    }
  }, [data.musicUrl]);

  const handleOpenInvitation = () => {
    if (isOpening) return;
    setIsOpening(true);

    // Spawn 30 randomized floating heart & flower particles
    const colors = [
      data.themeColor || '#3b533b',
      '#ffb7b2', // pastel soft red/pink
      '#ffc6ff', // pastel purple
      '#ffd166', // warm elegant gold/yellow
      '#ffffff'  // pure white
    ];
    const types: ('heart' | 'flower' | 'leaf')[] = ['heart', 'flower', 'leaf'];
    const generated = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 40 - 20, // start X offset around center (-20px to 20px)
      y: Math.random() * 20 - 10, // start Y offset around center (-10px to 10px)
      scale: Math.random() * 0.5 + 0.4, // scale multiplier (0.4 to 0.9)
      color: colors[Math.floor(Math.random() * colors.length)],
      type: types[Math.floor(Math.random() * types.length)],
      duration: Math.random() * 1.5 + 3.8, // flight duration 1s longer (3.8s to 5.3s)
      delay: Math.random() * 0.7 + 0.55, // delayed spawn starting as card slides up (0.55s to 1.25s)
      drift: Math.random() * 240 - 120, // wider outward horizontal drift (-120px to 120px)
      flightHeight: Math.random() * 200 + 400, // pre-calculate constant height (400px to 600px)
      rotateTarget: Math.random() > 0.5 ? 360 : -360, // pre-calculate rotation target
    }));
    setParticles(generated);

    if (youtubePlayerRef.current) {
      try { youtubePlayerRef.current.playVideo(); } catch {}
      setIsPlaying(true);
    } else if (audioRef.current) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.log('Audio autoplay blocked:', err));
    }
    setTimeout(() => {
      setIsOpen(true);
    }, 2000);
  };

  const toggleMusic = () => {
    if (youtubePlayerRef.current) {
      try {
        if (isPlaying) {
          youtubePlayerRef.current.pauseVideo();
          setIsPlaying(false);
        } else {
          youtubePlayerRef.current.playVideo();
          setIsPlaying(true);
        }
      } catch { /* ignore */ }
      return;
    }
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.log('Failed to play audio:', err));
    }
  };

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: data.slug,
          name,
          phone,
          guestsCount,
          wishes
        })
      });

      if (res.ok) {
        setSubmitSuccess(true);
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: [data.themeColor, '#ffffff', '#e8d89e']
        });

        // Add submitted wish to local wall list immediately
        if (wishes && wishes.trim()) {
          const newWish: Wish = {
            id: Math.random().toString(),
            name,
            content: wishes,
            createdAt: new Date()
          };
          setWishesList([newWish, ...wishesList]);
        }

        // Reset form
        setName('');
        setPhone('');
        setGuestsCount(1);
        setWishes('');
      }
    } catch (err) {
      console.error('RSVP Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  
  const showPrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex === null) return;
    setLightboxIndex(
      lightboxIndex === 0 ? data.gallery.length - 1 : lightboxIndex - 1
    );
  };

  const showNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex === null) return;
    setLightboxIndex(
      lightboxIndex === data.gallery.length - 1 ? 0 : lightboxIndex + 1
    );
  };

  return (
    <div className="relative min-h-screen selection:bg-gold-200">
      {/* Hidden YouTube IFrame Player container */}
      {data.musicUrl && isYouTubeUrl(data.musicUrl) && (
        <div
          ref={youtubeContainerRef}
          style={{
            position: 'fixed',
            bottom: '-1px',
            right: '-1px',
            width: '1px',
            height: '1px',
            opacity: 0,
            pointerEvents: 'none',
            zIndex: -1,
          }}
        />
      )}

      {/* Background audio controller */}
      {isOpen && data.musicUrl && (
        <button 
          onClick={toggleMusic}
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-12 h-12 rounded-full border border-gold-300 bg-white/90 shadow-lg backdrop-blur-sm cursor-pointer transition hover:scale-105 active:scale-95"
          style={{ borderColor: data.themeColor }}
        >
          {isPlaying ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className="text-gold-600 flex items-center justify-center"
              style={{ color: data.themeColor }}
            >
              <Music className="w-5 h-5" />
            </motion.div>
          ) : (
            <VolumeX className="w-5 h-5 text-gray-400" />
          )}
        </button>
      )}

      <AnimatePresence>
        {/* Opening Screen Loader */}
        {!isOpen && (
          <motion.div
            key="opener"
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center text-gray-800 overflow-hidden select-none"
            style={{ backgroundColor: getRgbaColor(data.themeColor, 0.5) }}
          >
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>

            {/* Floating Background Glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {bgGlows.map((glow) => (
                <motion.div
                  key={glow.id}
                  initial={{ 
                    x: `${glow.left}vw`, 
                    y: '105vh', 
                    opacity: 0,
                    scale: 1 
                  }}
                  animate={{ 
                    y: '-10vh',
                    opacity: [0, 0.35, 0.35, 0],
                    scale: [1, 1.25, 0.75, 1]
                  }}
                  transition={{ 
                    duration: glow.duration, 
                    delay: glow.delay, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="absolute rounded-full"
                  style={{
                    width: `${glow.size}px`,
                    height: `${glow.size}px`,
                    backgroundColor: data.themeColor || '#d4af37',
                    filter: 'blur(2px)',
                  }}
                />
              ))}
            </div>
            
            {/* Elegant Header Text: Happy Wedding */}
            <motion.h1
              animate={{ 
                textShadow: [
                  `0 0 4px ${getRgbaColor(data.themeColor || '#d4af37', 0.15)}`,
                  `0 0 16px ${getRgbaColor(data.themeColor || '#d4af37', 0.45)}`,
                  `0 0 4px ${getRgbaColor(data.themeColor || '#d4af37', 0.15)}`
                ]
              }}
              transition={{ 
                textShadow: { repeat: Infinity, duration: 3.5, ease: 'easeInOut' }
              }}
              className="text-4xl sm:text-5xl md:text-6xl text-gray-800 mb-8 select-none font-medium text-center flex justify-center items-center flex-wrap"
              style={{ fontFamily: '"Great Vibes", cursive' }}
            >
              {"Happy Wedding".split(" ").map((word, wordIdx) => (
                <motion.span
                  key={wordIdx}
                  className="inline-block whitespace-nowrap"
                  style={{ marginRight: wordIdx === 0 ? '0.3em' : '0px' }}
                  variants={{
                    initial: {},
                    animate: {
                      transition: {
                        staggerChildren: 0.06,
                        delayChildren: wordIdx * 0.3
                      }
                    }
                  }}
                  initial="initial"
                  animate="animate"
                >
                  {word.split("").map((letter, letterIdx) => (
                    <motion.span
                      key={letterIdx}
                      className="inline-block"
                      style={{ marginRight: '0.01em' }}
                      variants={{
                        initial: { opacity: 0, y: 25 },
                        animate: { 
                          opacity: 1, 
                          y: [25, -12, 0],
                          transition: { 
                            duration: 0.5,
                            ease: "easeOut"
                          } 
                        }
                      }}
                    >
                      {letter}
                    </motion.span>
                  ))}
                </motion.span>
              ))}
            </motion.h1>

            {/* Envelope 3D Container */}
            <div 
              className="relative w-[90%] max-w-[480px] aspect-[4/3] flex items-center justify-center cursor-pointer select-none"
              style={{ perspective: '1200px' }}
              onClick={handleOpenInvitation}
            >
              {/* Envelope slow floating motion wrapper */}
              <motion.div
                className="w-full h-full"
                animate={!isOpening ? { y: [0, -8, 0] } : { y: 0 }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Envelope Body Wrapper */}
                <div 
                  className="relative w-full h-full rounded-lg shadow-2xl transition-all duration-500"
                  style={{ 
                    transformStyle: 'preserve-3d',
                  }}
                >
                
                {/* 1. BACK FLAP / BOTTOM POCKET BASE (Solid themeColor background with dark overlay) */}
                <div 
                  className="absolute inset-0 rounded-lg overflow-hidden shadow-inner"
                  style={{ 
                    transform: 'translateZ(0px)',
                    backgroundColor: data.themeColor || '#3b533b'
                  }}
                >
                  {/* Darken overlay to make the inside look deeper */}
                  <div className="absolute inset-0 bg-black/20"></div>
                  {/* Outer slight border highlight */}
                  <div className="absolute inset-0 border border-white/5 opacity-10"></div>
                </div>

                {/* 2. WEDDING CARD WRAPPER (Slides out from inside) */}
                <motion.div
                  initial={{ y: 0, scale: 0.98, zIndex: 20 }}
                  animate={isOpening ? { 
                    y: '-52%', 
                    scale: 1.03,
                  } : {}}
                  transition={{ 
                    y: { delay: 0.55, duration: 1.1, ease: [0.16, 1, 0.3, 1] },
                    scale: { delay: 0.55, duration: 1.1, ease: [0.16, 1, 0.3, 1] }
                  }}
                  className="absolute left-[3%] right-[3%] bottom-[3%] h-[90%] overflow-visible"
                  style={{ 
                    transform: 'translateZ(10px)',
                  }}
                >
                  {/* Actual Card Body with overflow-hidden */}
                  <div 
                    className="w-full h-full rounded-lg bg-cover bg-center overflow-hidden shadow-lg border border-gold-300/30 relative"
                    style={{ 
                      backgroundImage: `linear-gradient(to bottom, rgba(40,35,25,0.7), rgba(40,35,25,0.85)), url(${data.heroImage || data.gallery[0]?.url || '/uploads/1779423877118_thiep.jpg'})`,
                    }}
                  >
                    {/* Inner gold border container */}
                    <div className="border border-gold-300/40 m-2 h-[calc(100%-1rem)] rounded-md flex flex-col items-center justify-between p-4 text-center">
                      
                      {/* Corner Ornaments */}
                      <div className="absolute top-3 left-3 text-gold-200/30"><CornerOrnament /></div>
                      <div className="absolute top-3 right-3 rotate-90 text-gold-200/30"><CornerOrnament /></div>
                      <div className="absolute bottom-3 left-3 -rotate-90 text-gold-200/30"><CornerOrnament /></div>
                      <div className="absolute bottom-3 right-3 rotate-180 text-gold-200/30"><CornerOrnament /></div>

                      {/* Card Content */}
                      <div className="mt-4">
                        <span className="text-[10px] tracking-[0.25em] uppercase text-gold-200/80 font-serif font-semibold">
                          Wedding Invitation
                        </span>
                        <div className="h-[1px] w-8 bg-gold-300/30 mx-auto mt-1"></div>
                      </div>

                      <div className="my-auto">
                        <h4 className="text-[11px] font-serif uppercase tracking-widest text-gold-200 mb-1">Thiệp mời cưới</h4>
                        <div className="h-[1px] w-20 bg-gold-200/40 mx-auto mb-3"></div>
                        
                        <h2 className="font-serif text-xl sm:text-2xl text-white font-medium tracking-wide leading-relaxed">
                          {data.groomShortName}
                        </h2>
                        <div className="text-gold-200 text-lg font-serif italic my-0.5">&</div>
                        <h2 className="font-serif text-xl sm:text-2xl text-white font-medium tracking-wide leading-relaxed">
                          {data.brideShortName}
                        </h2>
                      </div>

                      <div className="mb-4">
                        <p className="text-[9px] font-serif italic text-gold-300/70 tracking-wider">
                          Trân trọng kính mời
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* Floating Particles Effect (hearts, flowers, and leaves) */}
                  {isOpening && (
                    <div className="absolute inset-0 pointer-events-none overflow-visible z-50">
                      {particles.map((p) => {
                        const isHeart = p.type === 'heart';
                        const isFlower = p.type === 'flower';
                        return (
                          <motion.div
                            key={p.id}
                            initial={{ 
                              x: `calc(50% + ${p.x}px)`, 
                              y: `calc(50% + ${p.y}px)`, 
                              scale: 0, 
                              opacity: 0,
                              rotate: 0 
                            }}
                            animate={{
                              x: `calc(50% + ${p.x + p.drift}px)`,
                              y: `calc(50% - ${p.flightHeight}px)`,
                              scale: [0, p.scale, p.scale, 0],
                              opacity: [0, 0.9, 0.9, 0],
                              rotate: p.rotateTarget
                            }}
                            transition={{
                              duration: p.duration,
                              delay: p.delay,
                              ease: "easeOut"
                            }}
                            className="absolute w-5 h-5 flex items-center justify-center"
                            style={{ color: p.color }}
                          >
                            {isHeart ? (
                              <svg viewBox="0 0 24 24" className="w-full h-full fill-current drop-shadow-md">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                              </svg>
                            ) : isFlower ? (
                              <svg viewBox="0 0 24 24" className="w-full h-full fill-current drop-shadow-md">
                                <path d="M12 8.5c.83 0 1.5-.67 1.5-1.5S12.83 5.5 12 5.5s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm0 7c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm3.5-3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5zm-7 0c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5zm3.5-2.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5-2.5-1.12-2.5-2.5 1.12-2.5 2.5-2.5z" />
                              </svg>
                            ) : (
                              <svg viewBox="0 0 24 24" className="w-full h-full fill-current drop-shadow-md">
                                <path d="M17 8C17 6.34 15.66 5 14 5C12.9 5 11.94 5.59 11.41 6.48C10.88 5.59 9.92 5 8.82 5C7.16 5 5.82 6.34 5.82 8C5.82 9.1 6.41 10.06 7.3 10.59C6.41 11.12 5.82 12.08 5.82 13.18C5.82 14.84 7.16 16.18 8.82 16.18C9.92 16.18 10.88 15.59 11.41 14.7C11.94 15.59 12.9 16.18 14 16.18C15.66 16.18 17 14.84 17 13.18C17 12.08 16.41 11.12 15.52 10.59C16.41 10.06 17 9.1 17 8Z" />
                              </svg>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>

                {/* 3. ENVELOPE FRONT POCKET (The V-shaped bottom pocket in themeColor) */}
                <div 
                  className="absolute inset-0 rounded-lg shadow-[0_-5px_15px_rgba(0,0,0,0.1)]"
                  style={{ 
                    clipPath: 'polygon(0% 38%, 50% 68%, 100% 38%, 100% 100%, 0% 100%)',
                    transform: 'translateZ(25px)',
                    zIndex: 30,
                    backgroundColor: data.themeColor || '#3b533b'
                  }}
                >
                  {/* Subtle inner highlight to give depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/5 rounded-lg"></div>
                  <div 
                    className="absolute inset-0 border border-white/5 rounded-lg"
                    style={{ clipPath: 'polygon(0% 38%, 50% 68%, 100% 38%, 100% 100%, 0% 100%)' }}
                  ></div>
                </div>

                {/* 4. ENVELOPE TOP FLAP (Folds up) */}
                <motion.div 
                  initial={{ 
                    rotateX: 0, 
                    z: 35, 
                    zIndex: 40,
                    filter: 'drop-shadow(0px 12px 18px rgba(0,0,0,0.35))'
                  }}
                  animate={isOpening ? { 
                    rotateX: 180, 
                    z: -5,
                    zIndex: 15,
                    filter: 'drop-shadow(0px 0px 0px rgba(0,0,0,0))'
                  } : { 
                    rotateX: 0, 
                    z: 35,
                    zIndex: 40,
                    filter: 'drop-shadow(0px 12px 18px rgba(0,0,0,0.35))'
                  }}
                  transition={{
                    duration: 0.8,
                    ease: [0.25, 1, 0.5, 1],
                    zIndex: { delay: 0.55, duration: 0 },
                    z: { delay: 0.55, duration: 0 },
                    filter: { duration: 0.4 }
                  }}
                  className="absolute inset-0"
                  style={{ 
                    transformOrigin: 'top',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Clipped envelope flap to project shadow correctly */}
                  <div 
                    className="absolute inset-0"
                    style={{
                      clipPath: 'polygon(0% 0%, 100% 0%, 100% 40%, 50% 70%, 0% 40%)',
                    }}
                  >
                    {/* Front Side of Flap (Visible when closed: Solid themeColor) */}
                    <div 
                      className="absolute inset-0 border-t border-white/10"
                      style={{ 
                        backfaceVisibility: 'hidden',
                        backgroundColor: data.themeColor || '#3b533b'
                      }}
                    >
                      {/* Shadow border for the V-shape */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/30"></div>
                      
                      {/* Darker shadow crease line at the very top (fold) */}
                      <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-black/45 via-black/10 to-transparent pointer-events-none"></div>
                      
                      {/* A subtle fold line at the top to highlight the crease */}
                      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-black/35 pointer-events-none"></div>
                    </div>

                    {/* Back Side of Flap (Visible when flipped open: slightly darker themeColor) */}
                    <div 
                      className="absolute inset-0"
                      style={{ 
                        transform: 'rotateY(180deg)',
                        backfaceVisibility: 'hidden',
                        backgroundColor: data.themeColor || '#3b533b'
                      }}
                    >
                      {/* Dark overlay when open */}
                      <div className="absolute inset-0 bg-black/25"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/5"></div>
                    </div>
                  </div>
                </motion.div>

                {/* 5. WAX SEAL (Centered at the V tip) */}
                <AnimatePresence>
                  {!isOpening && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0, x: "-50%", y: "-50%", z: 45 }}
                      animate={{ scale: 1, opacity: 1, x: "-50%", y: "-50%", z: 45 }}
                      exit={{ 
                        scale: 0.6, 
                        opacity: 0,
                        x: "-50%",
                        y: "-50%",
                        z: 45,
                        transition: { duration: 0.3, ease: 'easeIn' }
                      }}
                      className="absolute left-1/2 top-[70%] flex flex-col items-center"
                      style={{ 
                        zIndex: 45
                      }}
                    >
                      {/* Wax Seal outer organic circle */}
                      <div className="w-16 h-16 rounded-full bg-[#8c5b36] hover:bg-[#a66f44] active:scale-95 transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.2),inset_0_-2px_4px_rgba(0,0,0,0.4)] flex items-center justify-center relative group">
                        
                        {/* Organic circular border */}
                        <div className="absolute inset-[4px] rounded-full border border-dashed border-[#b87e53] flex items-center justify-center bg-[#8c5b36] shadow-inner">
                          
                          {/* Elegant Leaf Branch SVG inside the seal */}
                          <svg className="w-8 h-8 text-[#f0dfd2] fill-[#f0dfd2]" viewBox="0 0 24 24">
                            <path d="M12 2C11.5 4 10 7 7 9C6.5 9.3 6.2 9.8 6.2 10.3C6.2 11.2 7 11.8 7.8 11.6C10.5 10.8 12 8.5 12 8.5C12 8.5 13.5 10.8 16.2 11.6C17 11.8 17.8 11.2 17.8 10.3C17.8 9.8 17.5 9.3 17 9C14 7 12.5 4 12 2Z" />
                            <path d="M12 9C12.5 11 14 14 17 16C17.5 16.3 17.8 16.8 17.8 17.3C17.8 18.2 17 18.8 16.2 18.6C13.5 17.8 12 15.5 12 15.5C12 15.5 10.5 17.8 7.8 18.6C7 18.8 6.2 18.2 6.2 17.3C6.2 16.8 6.5 16.3 7 16C10 14 11.5 11 12 9Z" />
                            <path d="M12 15V22" stroke="#f0dfd2" strokeWidth="2" strokeLinecap="round" />
                          </svg>

                        </div>

                        {/* Pulse glow effect */}
                        <span className="absolute -inset-2 rounded-full bg-[#8c5b36] opacity-25 group-hover:opacity-35 animate-ping -z-10"></span>
                        <span className="absolute -inset-4 rounded-full bg-[#8c5b36] opacity-15 group-hover:opacity-25 animate-ping -z-10" style={{ animationDelay: '0.7s' }}></span>
                      </div>

                      {/* Text prompt below the seal */}
                      <motion.p
                        animate={{ opacity: [0.6, 1, 0.6], y: [0, -2, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-[10px] font-serif italic text-gold-800 mt-3.5 tracking-widest font-semibold uppercase bg-white/70 px-3 py-1 rounded-full shadow-xs border border-[#dac06b]/20"
                      >
                        Chạm để mở thiệp
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
              </motion.div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Wedding Card Content */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="w-full flex flex-col"
        >
          {/* HERO SECTION */}
          <section className="relative h-screen flex flex-col items-center justify-center text-white overflow-hidden">
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
              style={{ 
                backgroundImage: `url(${data.heroImage})`,
              }}
            ></div>
            <div className="absolute inset-0 cinematic-overlay"></div>

            <div className="relative z-10 text-center max-w-2xl px-6 flex flex-col items-center select-none">
              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 1 }}
                className="text-gold-300 font-serif tracking-[0.3em] text-xs uppercase mb-4"
                style={{ color: data.themeColor }}
              >
                Lời Mời Thành Hôn
              </motion.span>
              
              <motion.h2 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 1.2 }}
                className="font-serif text-4xl sm:text-6xl md:text-8xl font-light mb-6 leading-tight"
              >
                <div className="mb-2">{data.groomShortName}</div>
                <div className="text-gold-300 text-3xl sm:text-4xl md:text-5xl font-serif italic" style={{ color: data.themeColor }}>&</div>
                <div className="mt-2">{data.brideShortName}</div>
              </motion.h2>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="w-12 h-[1px] bg-white/40 my-6"
              ></motion.div>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 1 }}
                className="font-serif italic tracking-wide text-gray-200 text-base sm:text-lg"
              >
                {new Date(data.weddingDate).toLocaleDateString('vi-VN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </motion.p>

              {/* Parallax bottom fade indicator */}
              <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce opacity-70">
                <div className="w-6 h-10 rounded-full border border-white/50 flex items-start justify-center p-1">
                  <div className="w-1.5 h-3 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </section>

          {/* COUNTDOWN SECTION */}
          <section className="py-16 bg-[#FDFBF7] border-b border-gold-100 flex flex-col items-center">
            <div className="max-w-4xl w-full px-6 text-center select-none">
              <h3 className="font-serif text-2xl md:text-3xl text-gold-600 mb-8 italic" style={{ color: data.themeColor }}>
                Ngày trọng đại đang cận kề
              </h3>
              
              <div className="grid grid-cols-4 gap-3 max-w-xl mx-auto">
                {[
                  { value: timeLeft.days, label: 'Ngày' },
                  { value: timeLeft.hours, label: 'Giờ' },
                  { value: timeLeft.minutes, label: 'Phút' },
                  { value: timeLeft.seconds, label: 'Giây' }
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 rounded-xl glass-card flex flex-col items-center border border-gold-200"
                    style={{ borderColor: `${data.themeColor}33` }}
                  >
                    <span className="font-serif text-2xl sm:text-4xl font-semibold text-gray-800">
                      {String(item.value).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] sm:text-xs uppercase tracking-widest text-gold-700 mt-2 font-medium" style={{ color: data.themeColor }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* COUPLE INTRO SECTION */}
          <section className="py-24 px-6 bg-[#F7F4EB]">
            <div className="max-w-5xl mx-auto">
              <div className="text-center max-w-2xl mx-auto mb-16 select-none">
                <span className="text-xs uppercase tracking-[0.2em] text-gold-600 font-semibold" style={{ color: data.themeColor }}>
                  {data.aboutTitle}
                </span>
                <h2 className="font-serif text-3xl md:text-5xl mt-3 mb-6 font-light">Cô Dâu & Chú Rể</h2>
                <p className="text-gray-600 font-serif italic leading-relaxed text-sm md:text-base">
                  {data.aboutText}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-10">
                {/* Groom Card */}
                <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white shadow-sm border border-gold-100">
                  <div 
                    className="w-56 h-72 rounded-t-full bg-cover bg-center mb-6 shadow-md border-2 border-gold-200"
                    style={{ backgroundImage: `url(${data.groomImage})`, borderColor: data.themeColor }}
                  ></div>
                  <h3 className="font-serif text-2xl font-semibold text-gray-800">{data.groomName}</h3>
                  <span className="text-xs uppercase tracking-[0.2em] text-gold-500 font-medium my-2" style={{ color: data.themeColor }}>Chú rể</span>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-sm mt-2">{data.groomAbout}</p>
                </div>

                {/* Bride Card */}
                <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white shadow-sm border border-gold-100">
                  <div 
                    className="w-56 h-72 rounded-t-full bg-cover bg-center mb-6 shadow-md border-2 border-gold-200"
                    style={{ backgroundImage: `url(${data.brideImage})`, borderColor: data.themeColor }}
                  ></div>
                  <h3 className="font-serif text-2xl font-semibold text-gray-800">{data.brideName}</h3>
                  <span className="text-xs uppercase tracking-[0.2em] text-gold-500 font-medium my-2" style={{ color: data.themeColor }}>Cô dâu</span>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-sm mt-2">{data.brideAbout}</p>
                </div>
              </div>
            </div>
          </section>

          {/* TIMELINE / STORY SECTION */}
          {data.timeline.length > 0 && (
            <section className="py-24 px-6 bg-[#FDFBF7] border-y border-gold-100 overflow-hidden">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16 select-none">
                  <span className="text-xs uppercase tracking-[0.2em] text-gold-600 font-semibold" style={{ color: data.themeColor }}>
                    Timeline
                  </span>
                  <h2 className="font-serif text-3xl md:text-5xl mt-3 font-light">Câu Chuyện Của Chúng Mình</h2>
                </div>

                {/* Vertical Timeline */}
                <div className="relative border-l border-gold-200/50 md:mx-auto md:w-full md:border-l-0">
                  {data.timeline.map((item, idx) => {
                    const isEven = idx % 2 === 0;
                    return (
                      <div key={item.id} className="relative mb-16 md:flex md:justify-between items-center w-full">
                        {/* Timeline Node dot */}
                        <div 
                          className="absolute left-[-20px] md:left-1/2 md:translate-x-[-50%] flex items-center justify-center w-10 h-10 rounded-full bg-[#fdfbf7] border border-gold-300 z-10"
                          style={{ borderColor: data.themeColor }}
                        >
                          <Heart className="w-4 h-4 fill-current text-gold-500" style={{ color: data.themeColor }} />
                        </div>

                        {/* Story Content Block */}
                        <div className={`pl-8 md:pl-0 w-full md:w-[45%] ${isEven ? 'md:order-1' : 'md:order-2 text-left md:text-right'}`}>
                          <div className="p-6 rounded-2xl bg-[#F7F4EB] shadow-sm border border-gold-100 transition hover:shadow-md">
                            <span className="text-gold-600 font-serif italic text-sm font-semibold" style={{ color: data.themeColor }}>
                              {item.dateString}
                            </span>
                            <h4 className="font-serif text-xl font-bold text-gray-800 mt-1 mb-3">{item.title}</h4>
                            
                            {item.imageUrl && (
                              <div 
                                className="w-full h-44 rounded-lg bg-cover bg-center mb-4 border border-gold-100 shadow-inner"
                                style={{ backgroundImage: `url(${item.imageUrl})` }}
                              ></div>
                            )}

                            <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                          </div>
                        </div>

                        {/* Empty spacing for matching side layout */}
                        <div className="hidden md:block w-[45%]"></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* WEDDING DETAILS & DIRECTIONS */}
          <section className="py-24 px-6 bg-[#F7F4EB]">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16 select-none">
                <span className="text-xs uppercase tracking-[0.2em] text-gold-600 font-semibold" style={{ color: data.themeColor }}>
                  Wedding Info
                </span>
                <h2 className="font-serif text-3xl md:text-5xl mt-3 font-light">Thông Tin Tiệc Cưới</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
                {/* Details box */}
                <div className="lg:col-span-2 p-8 rounded-2xl bg-white shadow-sm border border-gold-100 flex flex-col justify-between h-full">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-6 text-gold-600" style={{ color: data.themeColor }}>
                      <Calendar className="w-6 h-6" />
                      <span className="font-serif text-lg font-bold">Thời Gian & Địa Điểm</span>
                    </div>

                    <div className="mb-6">
                      <h4 className="text-gray-400 uppercase text-[10px] tracking-widest font-semibold mb-1">Thời Gian</h4>
                      <p className="text-gray-800 font-semibold font-serif text-lg">
                        {new Date(data.weddingDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {new Date(data.weddingDate).toLocaleDateString('vi-VN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>

                    <div className="mb-6">
                      <h4 className="text-gray-400 uppercase text-[10px] tracking-widest font-semibold mb-1">Nơi Tổ Chức</h4>
                      <p className="text-gray-800 font-bold font-serif text-lg">{data.locationName}</p>
                      <p className="text-gray-600 text-sm leading-relaxed mt-1">{data.locationAddress}</p>
                    </div>
                  </div>

                  {data.googleMapsDirectionUrl && (
                    <a 
                      href={data.googleMapsDirectionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-full text-white font-medium bg-gold-600 transition hover:bg-gold-500 shadow-md hover:scale-102 active:scale-98"
                      style={{ backgroundColor: data.themeColor }}
                    >
                      <Navigation className="w-4 h-4 fill-current" />
                      Chỉ Đường Google Map
                    </a>
                  )}
                </div>

                {/* Google Map Box */}
                <div className="lg:col-span-3 h-96 w-full rounded-2xl overflow-hidden border border-gold-200/50 shadow-inner">
                  {data.googleMapsEmbedUrl ? (
                    <iframe 
                      src={data.googleMapsEmbedUrl}
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }} 
                      allowFullScreen={true}
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-sm">
                      Bản đồ chưa được tích hợp
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* GALLERY MASONRY */}
          {data.gallery.length > 0 && (
            <section className="py-24 px-6 bg-[#FDFBF7]">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16 select-none">
                  <span className="text-xs uppercase tracking-[0.2em] text-gold-600 font-semibold" style={{ color: data.themeColor }}>
                    Gallery
                  </span>
                  <h2 className="font-serif text-3xl md:text-5xl mt-3 font-light">Album Ảnh Cưới</h2>
                </div>

                {/* Image Grid */}
                <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
                  {data.gallery.map((image, idx) => (
                    <motion.div 
                      key={image.id}
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                      className="break-inside-avoid overflow-hidden rounded-xl cursor-zoom-in border border-gold-100 shadow-sm transition hover:shadow-md"
                      onClick={() => openLightbox(idx)}
                    >
                      <img 
                        src={image.url} 
                        alt="Wedding photo"
                        loading="lazy"
                        className="w-full h-auto object-cover max-h-[500px]"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Lightbox Modal */}
          <AnimatePresence>
            {lightboxIndex !== null && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 select-none"
                onClick={closeLightbox}
              >
                <button 
                  onClick={closeLightbox}
                  className="absolute top-6 right-6 text-white/80 hover:text-white cursor-pointer z-50 p-2"
                >
                  <X className="w-8 h-8" />
                </button>

                {/* Left arrow */}
                <button 
                  onClick={showPrevImage}
                  className="absolute left-6 text-white/80 hover:text-white cursor-pointer z-50 bg-black/30 p-3 rounded-full hover:bg-black/50"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <motion.div 
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="relative max-w-4xl max-h-[85vh] overflow-hidden flex items-center justify-center"
                  onClick={e => e.stopPropagation()}
                >
                  <img 
                    src={data.gallery[lightboxIndex].url}
                    alt="Wedding photo lightbox"
                    className="max-w-full max-h-[85vh] object-contain rounded"
                  />
                </motion.div>

                {/* Right arrow */}
                <button 
                  onClick={showNextImage}
                  className="absolute right-6 text-white/80 hover:text-white cursor-pointer z-50 bg-black/30 p-3 rounded-full hover:bg-black/50"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* WEDDING GIFT / QR CODE SECTION */}
          {(data.groomQrUrl || data.brideQrUrl || data.groomAccountNumber || data.brideAccountNumber) && (
            <section className="py-24 px-6 bg-[#FDFBF7] border-t border-gold-100 select-none">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16 select-none">
                  <span className="text-xs uppercase tracking-[0.2em] text-gold-600 font-semibold" style={{ color: data.themeColor }}>
                    Wedding Gift
                  </span>
                  <h2 className="font-serif text-3xl md:text-5xl mt-3 font-light">Hộp Mừng Cưới</h2>
                  <p className="text-gray-500 text-sm mt-4 max-w-lg mx-auto leading-relaxed font-serif italic">
                    Sự hiện diện của quý vị là niềm vui lớn nhất đối với gia đình chúng tôi. Nếu quý vị muốn gửi quà chúc mừng đến cô dâu và chú rể, có thể gửi qua tài khoản dưới đây.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                  {/* Groom Account info */}
                  {(data.groomQrUrl || data.groomAccountNumber) && (
                    <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-white shadow-sm border border-gold-100/50">
                      <span className="text-xs uppercase tracking-[0.2em] text-gold-600 font-semibold mb-6" style={{ color: data.themeColor }}>
                        Mừng Cưới Chú Rể
                      </span>
                      {data.groomQrUrl && (
                        <div className="w-48 h-48 border border-gold-100 rounded-xl p-2 bg-white flex items-center justify-center shadow-xs mb-6">
                          <img src={data.groomQrUrl} alt="Mã QR Chú rể" className="max-w-full max-h-full object-contain rounded-lg" />
                        </div>
                      )}
                      <div className="space-y-1.5 text-xs text-gray-500 w-full max-w-xs">
                        {data.groomBankName && (
                          <p>Ngân hàng: <span className="font-semibold text-gray-800">{data.groomBankName}</span></p>
                        )}
                        {data.groomAccountNumber && (
                          <div className="flex items-center justify-center gap-2">
                            <p>Số TK: <span className="font-bold text-gray-800 text-sm">{data.groomAccountNumber}</span></p>
                            <button 
                              onClick={handleCopyGroom}
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium transition border cursor-pointer select-none active:scale-95"
                              style={{ 
                                color: data.themeColor, 
                                borderColor: `${data.themeColor}33`, 
                                backgroundColor: copiedGroom ? `${data.themeColor}22` : `${data.themeColor}11` 
                              }}
                            >
                              {copiedGroom ? (
                                <>
                                  <Check className="w-2.5 h-2.5" />
                                  Đã sao chép
                                </>
                              ) : (
                                <>
                                  <Copy className="w-2.5 h-2.5" />
                                  Sao chép
                                </>
                              )}
                            </button>
                          </div>
                        )}
                        {data.groomAccountName && (
                          <p>Chủ TK: <span className="font-semibold text-gray-800 uppercase">{data.groomAccountName}</span></p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bride Account info */}
                  {(data.brideQrUrl || data.brideAccountNumber) && (
                    <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-white shadow-sm border border-gold-100/50">
                      <span className="text-xs uppercase tracking-[0.2em] text-gold-600 font-semibold mb-6" style={{ color: data.themeColor }}>
                        Mừng Cưới Cô Dâu
                      </span>
                      {data.brideQrUrl && (
                        <div className="w-48 h-48 border border-gold-100 rounded-xl p-2 bg-white flex items-center justify-center shadow-xs mb-6">
                          <img src={data.brideQrUrl} alt="Mã QR Cô dâu" className="max-w-full max-h-full object-contain rounded-lg" />
                        </div>
                      )}
                      <div className="space-y-1.5 text-xs text-gray-500 w-full max-w-xs">
                        {data.brideBankName && (
                          <p>Ngân hàng: <span className="font-semibold text-gray-800">{data.brideBankName}</span></p>
                        )}
                        {data.brideAccountNumber && (
                          <div className="flex items-center justify-center gap-2">
                            <p>Số TK: <span className="font-bold text-gray-800 text-sm">{data.brideAccountNumber}</span></p>
                            <button 
                              onClick={handleCopyBride}
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium transition border cursor-pointer select-none active:scale-95"
                              style={{ 
                                color: data.themeColor, 
                                borderColor: `${data.themeColor}33`, 
                                backgroundColor: copiedBride ? `${data.themeColor}22` : `${data.themeColor}11` 
                              }}
                            >
                              {copiedBride ? (
                                <>
                                  <Check className="w-2.5 h-2.5" />
                                  Đã sao chép
                                </>
                              ) : (
                                <>
                                  <Copy className="w-2.5 h-2.5" />
                                  Sao chép
                                </>
                              )}
                            </button>
                          </div>
                        )}
                        {data.brideAccountName && (
                          <p>Chủ TK: <span className="font-semibold text-gray-800 uppercase">{data.brideAccountName}</span></p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* RSVP & BLESSING SECTION */}
          <section className="py-24 px-6 bg-[#F7F4EB] border-t border-gold-100">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                
                {/* RSVP Form */}
                <div className="p-8 rounded-2xl bg-white shadow-sm border border-gold-100">
                  <div className="flex items-center gap-3 mb-6 text-gold-600" style={{ color: data.themeColor }}>
                    <Heart className="w-6 h-6 fill-current" />
                    <span className="font-serif text-lg font-bold">Xác Nhận Tham Dự (RSVP)</span>
                  </div>

                  <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                    Sự hiện diện của quý vị là niềm vinh hạnh lớn cho chúng tôi. Xin vui lòng gửi xác nhận trước ngày cưới để gia đình chuẩn bị chu đáo nhất.
                  </p>

                  <form onSubmit={handleRsvpSubmit} className="space-y-5">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">Họ tên của bạn</label>
                      <input 
                        type="text" 
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="VD: Anh Tuấn (Bạn chú rể)"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none text-sm focus:border-gold-400 bg-[#FDFBF7]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">Số điện thoại</label>
                      <input 
                        type="tel" 
                        required
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="Số điện thoại liên lạc"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none text-sm focus:border-gold-400 bg-[#FDFBF7]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">Số lượng khách tham gia</label>
                      <div className="flex items-center gap-4">
                        <select 
                          value={guestsCount}
                          onChange={e => setGuestsCount(Number(e.target.value))}
                          className="w-24 px-4 py-3 rounded-xl border border-gray-200 outline-none text-sm bg-[#FDFBF7] focus:border-gold-400"
                        >
                          {[1, 2, 3, 4, 5].map(n => (
                            <option key={n} value={n}>{n} người</option>
                          ))}
                        </select>
                        <span className="text-xs text-gray-400">(Bao gồm cả bạn)</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">Lời chúc / Ghi chú</label>
                      <textarea 
                        rows={4}
                        value={wishes}
                        onChange={e => setWishes(e.target.value)}
                        placeholder="Gửi lời chúc ấm áp nhất tới cô dâu & chú rể..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none text-sm focus:border-gold-400 bg-[#FDFBF7] resize-none"
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-white font-medium bg-gold-600 transition hover:bg-gold-500 shadow-md hover:scale-102 active:scale-98 disabled:opacity-50 cursor-pointer"
                      style={{ backgroundColor: data.themeColor }}
                    >
                      <Send className="w-4 h-4" />
                      {isSubmitting ? 'Đang gửi...' : 'Gửi Xác Nhận'}
                    </button>

                    {submitSuccess && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl text-center font-medium mt-4"
                      >
                        Cảm ơn bạn đã gửi xác nhận và lời chúc tới đám cưới!
                      </motion.div>
                    )}
                  </form>
                </div>

                {/* Wishes Wall Board */}
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-6 text-gold-600" style={{ color: data.themeColor }}>
                      <MessageSquare className="w-6 h-6" />
                      <span className="font-serif text-lg font-bold">Hòm Thư Lời Chúc</span>
                    </div>
                    
                    <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                      Cùng ngắm nhìn những lời chúc yêu thương của người thân và bạn bè gửi gắm đến hạnh phúc lứa đôi.
                    </p>
                  </div>

                  {/* Wishes container */}
                  <div className="h-[430px] overflow-y-auto pr-2 space-y-4 rounded-xl border border-gold-200/20 bg-white/50 p-4">
                    {wishesList.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs italic">
                        Chưa có lời chúc nào. Hãy là người đầu tiên!
                      </div>
                    ) : (
                      wishesList.map((wish) => (
                        <div 
                          key={wish.id} 
                          className="p-4 rounded-xl bg-white shadow-xs border border-gold-100 flex flex-col"
                        >
                          <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                            <span className="font-serif font-bold text-gray-800 text-sm">{wish.name}</span>
                            <span className="text-[10px] text-gray-400">
                              {new Date(wish.createdAt).toLocaleDateString('vi-VN', {
                                month: 'numeric',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-gray-600 text-xs leading-relaxed italic">
                            "{wish.content}"
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="py-16 text-center bg-[#1a1a1a] text-white/55 select-none text-xs border-t border-gold-800/10">
            <p className="font-serif text-gold-300 italic mb-2 tracking-[0.1em] text-sm" style={{ color: data.themeColor }}>
              {data.groomShortName} & {data.brideShortName}
            </p>
            <p className="mb-4">Thank you for sharing our special day!</p>
            <p>© {new Date().getFullYear()} • Designed with love</p>
          </footer>
        </motion.div>
      )}
    </div>
  );
}
