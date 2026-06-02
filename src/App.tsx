import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar, 
  Mail, 
  Phone, 
  ChevronRight, 
  BookOpen, 
  Clock, 
  Heart, 
  ArrowRight, 
  CheckCircle2, 
  User, 
  Sparkles, 
  Check, 
  Star, 
  X, 
  Facebook, 
  Instagram, 
  Youtube, 
  ExternalLink,
  Plus,
  Compass,
  Shield,
  Lock,
  LogOut,
  RefreshCw,
  Search,
  Filter,
  Trash2,
  AlertCircle
} from "lucide-react";
import { AssessmentPCOS } from "./components/AssessmentPCOS";
import { AssessmentPrakriti } from "./components/AssessmentPrakriti";
import { WellnessProgram, BlogArticle, BookingForm } from "./types";
import { BLOG_ARTICLES } from "./data";
import { doc, setDoc, serverTimestamp, collection, getDocs, query, orderBy, deleteDoc } from "firebase/firestore";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { db, auth, handleFirestoreError, OperationType } from "./firebase";

export default function App() {
  // Navigation active anchors/views
  const [activeSection, setActiveSection] = useState("home");
  const [programs, setPrograms] = useState<WellnessProgram[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<WellnessProgram | null>(null);
  
  // Blog Reader modal
  const [selectedBlog, setSelectedBlog] = useState<BlogArticle | null>(null);

  // Booking Form State
  const [booking, setBooking] = useState<BookingForm>({
    name: "",
    email: "",
    phone: "",
    programId: "pcos",
    preferredDate: "",
    preferredTime: "10:00",
    notes: ""
  });
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [emailNoticeStatus, setEmailNoticeStatus] = useState<{
    success: boolean;
    error?: string;
    message: string;
    smtpConfigured: boolean;
  } | null>(null);

  // Interactive Tab for Assessment Section
  const [assessmentTab, setAssessmentTab] = useState<"pcos" | "prakriti">("pcos");

  // Clinical Admin Portal States
  const ADMIN_EMAILS = ["jimmymanalel@gmail.com", "doctorvptalks@gmail.com"];
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminUser, setAdminUser] = useState<FirebaseUser | null>(null);
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [reservations, setReservations] = useState<any[]>([]);
  const [reservationsLoading, setReservationsLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [filterProgram, setFilterProgram] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Track authentication session changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAdminUser(user);
      if (user && user.email && ADMIN_EMAILS.includes(user.email)) {
        fetchReservations();
      } else {
        setReservations([]);
      }
    });
    return () => unsub();
  }, []);

  const fetchReservations = async () => {
    setReservationsLoading(true);
    setAdminError(null);
    const path = "reservations";
    try {
      const q = query(collection(db, path), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const docsList = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setReservations(docsList);
    } catch (err: any) {
      console.error("Error retrieving reservation records:", err);
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (firestoreErr: any) {
        setAdminError(firestoreErr.message || String(firestoreErr));
      }
    } finally {
      setReservationsLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    setIsAdminLoading(true);
    setAdminError(null);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (!user.email || !ADMIN_EMAILS.includes(user.email)) {
        setAdminError("Access Denied: Your Google Account is not configured as a Clinical Administrator.");
        await signOut(auth);
        setAdminUser(null);
        setReservations([]);
      } else {
        setAdminUser(user);
        // Short timeout allows token claims propagation block to settle
        setTimeout(() => {
          fetchReservations();
        }, 500);
      }
    } catch (err: any) {
      console.error("Google Auth popup interaction failed:", err);
      setAdminError(err.message || String(err));
    } finally {
      setIsAdminLoading(false);
    }
  };

  const handleAdminLogout = async () => {
    try {
      await signOut(auth);
      setAdminUser(null);
      setReservations([]);
      setAdminError(null);
    } catch (err: any) {
      console.error("Sign out action failed:", err);
    }
  };

  const handleDeleteReservation = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this reservation inquiry?")) {
      return;
    }
    const path = `reservations/${id}`;
    try {
      await deleteDoc(doc(db, "reservations", id));
      setReservations(prev => prev.filter(item => item.id !== id));
    } catch (err: any) {
      console.error("Delete action failed for record:", id, err);
      try {
        handleFirestoreError(err, OperationType.DELETE, path);
      } catch (firestoreErr: any) {
        alert("Failed to delete record: " + firestoreErr.message);
      }
    }
  };

  // Fetch programs from endpoint
  useEffect(() => {
    fetch("/api/programs")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPrograms(data);
        }
      })
      .catch(err => {
        console.error("Error fetching programs:", err);
      });

    // Handle scroll-spy for highlighting menu items
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      const home = document.getElementById("home");
      const programsSection = document.getElementById("programs");
      const assessments = document.getElementById("assessments");
      const blog = document.getElementById("blog");
      const bookings = document.getElementById("booking-section");

      if (bookings && scrollPos >= bookings.offsetTop) {
        setActiveSection("bookings");
      } else if (blog && scrollPos >= blog.offsetTop) {
        setActiveSection("blog");
      } else if (assessments && scrollPos >= assessments.offsetTop) {
        setActiveSection("assessments");
      } else if (programsSection && scrollPos >= programsSection.offsetTop) {
        setActiveSection("programs");
      } else if (home && scrollPos >= home.offsetTop) {
        setActiveSection("home");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking.name || !booking.email || !booking.phone || !booking.preferredDate) {
      alert("Please fill out all required booking credentials to route your appointment.");
      return;
    }
    
    setIsSubmittingBooking(true);
    setBookingError(null);
    const reservationId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const collectionPath = "reservations";
    
    try {
      await setDoc(doc(db, collectionPath, reservationId), {
        name: booking.name.trim(),
        email: booking.email.trim(),
        phone: booking.phone.trim(),
        programId: booking.programId,
        preferredDate: booking.preferredDate,
        preferredTime: booking.preferredTime || "10:00",
        ...(booking.notes?.trim() ? { notes: booking.notes.trim() } : {}),
        createdAt: serverTimestamp(),
      });
      
      setEmailNoticeStatus(null);
      
      // Dispatch notification emails to patient and admin via backend server API route
      try {
        const response = await fetch("/api/reservations/notify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: booking.name.trim(),
            email: booking.email.trim(),
            phone: booking.phone.trim(),
            programId: booking.programId,
            preferredDate: booking.preferredDate,
            preferredTime: booking.preferredTime || "10:00",
            notes: booking.notes?.trim() || "",
          }),
        });

        if (response.ok) {
          const result = await response.json();
          setEmailNoticeStatus(result);
        } else {
          const errText = await response.text();
          let parsedErr;
          try {
            parsedErr = JSON.parse(errText);
          } catch {
            parsedErr = null;
          }
          setEmailNoticeStatus({
            success: false,
            error: parsedErr?.error || errText || "HTTP " + response.status,
            message: "Reservation saved in database, but SMTP server failed.",
            smtpConfigured: true
          });
        }
      } catch (notifyErr: any) {
        console.warn("Dispatched email notification endpoint failed (non-blocking):", notifyErr);
        setEmailNoticeStatus({
          success: false,
          error: notifyErr.message || String(notifyErr),
          message: "Network exception on email dispatch call.",
          smtpConfigured: true
        });
      }
      
      setIsSubmittingBooking(false);
      setBookingConfirmed(true);
    } catch (err: any) {
      setIsSubmittingBooking(false);
      const isPermissionDenied = err?.message?.includes("permission") || err?.code === "permission-denied";
      setBookingError(isPermissionDenied ? "Access denied by security rules. Only authenticated, valid payloads are authorized." : err.message || "An unexpected error occurred.");
      handleFirestoreError(err, OperationType.WRITE, `${collectionPath}/${reservationId}`);
    }
  };

  const scrollToElement = (id: string, sectionName: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionName);
    }
  };

  if (showAdminPanel) {
    // Filter and search computation
    const filteredReservations = reservations.filter(res => {
      // Filter by Program ID
      const matchesProgram = filterProgram === "all" || res.programId === filterProgram;
      
      // Search by name, email, phone, or notes
      const normalizedSearch = searchQuery.toLowerCase().trim();
      const matchesSearch = !normalizedSearch || 
        (res.name && res.name.toLowerCase().includes(normalizedSearch)) ||
        (res.email && res.email.toLowerCase().includes(normalizedSearch)) ||
        (res.phone && res.phone.toLowerCase().includes(normalizedSearch)) ||
        (res.notes && res.notes.toLowerCase().includes(normalizedSearch));

      return matchesProgram && matchesSearch;
    });

    return (
      <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans antialiased selection:bg-emerald-600 selection:text-white">
        {/* Admin Header */}
        <header className="bg-brand-spruce text-white border-b border-brand-dark/10 py-5 px-6 lg:px-12 shadow-sm">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-700/50 rounded-xl border border-emerald-500/20">
                <Shield className="w-6 h-6 text-emerald-300 animate-pulse" />
              </div>
              <div>
                <h1 className="font-serif text-xl md:text-2xl font-light tracking-wide italic text-emerald-100 flex items-center gap-2">
                  Dr. Vishnupriya — <span className="font-sans font-bold text-sm tracking-widest uppercase bg-emerald-900/80 px-2 py-0.5 rounded text-emerald-300 border border-emerald-700/50">Clinical Admin</span>
                </h1>
                <p className="text-[10px] uppercase font-mono tracking-widest text-emerald-200/70 mt-0.5">
                  Secure Database Dashboard Portal
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 self-stretch md:self-auto">
              <button
                onClick={() => {
                  setShowAdminPanel(false);
                  setSearchQuery("");
                  setFilterProgram("all");
                }}
                className="flex-1 md:flex-none bg-emerald-800/80 hover:bg-emerald-800 text-white/90 hover:text-white px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider font-mono border border-emerald-700/50 transition-all flex items-center justify-center gap-2"
              >
                &larr; Back to Website
              </button>
              
              {adminUser && (
                <button
                  onClick={handleAdminLogout}
                  className="bg-stone-900 hover:bg-black text-rose-300 hover:text-rose-200 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider font-mono border border-stone-800 transition-all flex items-center justify-center gap-1.5"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto p-6 lg:p-12 space-y-8">
          {!adminUser ? (
            /* Secure Access Gate (Locked Mode) */
            <div className="max-w-md mx-auto my-12 bg-white rounded-3xl border border-stone-200 shadow-xl p-8 space-y-6 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
                <Lock className="w-8 h-8" />
              </div>
              
              <div className="space-y-2">
                <h2 className="font-serif text-2xl font-normal text-stone-900">Administrative Verification Required</h2>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Confidential patient wellness inquiries are secured by end-to-end Attribute-Based Access Control policies. Select authorized clinical Google login to access database indexes.
                </p>
              </div>

              {adminError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-left space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold font-mono text-[10px] uppercase tracking-wider text-rose-800">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Authentication Notice
                  </div>
                  <p className="text-[11px] text-rose-900 leading-relaxed font-sans font-medium">
                    {adminError}
                  </p>
                </div>
              )}

              <div className="space-y-4 pt-2">
                <button
                  onClick={handleAdminLogin}
                  disabled={isAdminLoading}
                  className="w-full bg-brand-spruce hover:bg-brand-sage disabled:bg-stone-400 text-white font-semibold py-3 px-6 rounded-2xl text-xs uppercase tracking-widest font-mono shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {isAdminLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Authenticating Google...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      Sign In with Authorized Google
                    </>
                  )}
                </button>

                <p className="text-[10px] text-stone-400 leading-normal">
                  Authorized Administrator Emails: <strong className="text-stone-605">jimmymanalel@gmail.com, doctorvptalks@gmail.com</strong>
                </p>
              </div>

              <div className="border-t border-stone-100 pt-5 text-left space-y-2">
                <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-stone-400 block">Firebase Status & Project Sync</span>
                <p className="text-[10.5px] text-stone-500 leading-normal">
                  The active Firebase project target is <strong className="font-mono text-stone-700 bg-stone-50 px-1 rounded border border-stone-100">gen-lang-client-0754801240</strong>. If you are prompted to choose a project on deployment synchronization, associate it with this project to keep the databases in bridge bounds.
                </p>
              </div>
            </div>
          ) : (
            /* Active Administration Workspace */
            <div className="space-y-8 animate-fade-in">
              {/* Profile Card & Stats Header */}
              <div className="bg-white rounded-3xl border border-stone-200 p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center shadow-xs">
                <div className="flex items-center gap-4">
                  {adminUser.photoURL ? (
                    <img 
                      src={adminUser.photoURL} 
                      alt="Admin avatar" 
                      className="w-12 h-12 rounded-full border border-brand-spruce/20 shadow-xs"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-lg border border-emerald-600 shadow-xs uppercase">
                      {adminUser.email ? adminUser.email.charAt(0) : "A"}
                    </div>
                  )}
                  <div>
                    <h3 className="font-sans font-bold text-stone-900 text-sm">
                      Signed in as: <span className="font-mono text-emerald-800">{adminUser.email}</span>
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Security Clearance Level: <span className="font-bold text-stone-700">Clinical Master Administrator</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center md:text-right border-l md:border-l-0 md:border-r border-stone-150 pl-4 md:pl-0 md:pr-6">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-stone-400 block pb-0.5">Database Sync State</span>
                    <div className="flex items-center md:justify-end gap-1.5 text-xs text-stone-800 font-bold font-mono">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      CONNECTED - CLOUD
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-stone-400 block pb-0.5">Total Inquiry Index</span>
                    <span className="text-xl font-bold text-emerald-800 font-mono">
                      {reservations.length} inquiries
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Toolbar: Filters and Searches */}
              <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
                <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch">
                  {/* Search Bar Input */}
                  <div className="flex-1 relative">
                    <Search className="w-4 h-4 text-stone-440 absolute left-4 top-3.5" />
                    <input
                      type="text"
                      placeholder="Search patient reservations by name, contact details, symptoms..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-stone-50 hover:bg-stone-55 border border-stone-200 focus:bg-white rounded-2xl text-xs font-medium focus:ring-1 focus:ring-brand-spruce focus:border-brand-spruce outline-none transition-all placeholder:text-stone-400"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery("")}
                        className="absolute right-4 top-3 text-[10px] uppercase font-mono font-bold text-zinc-400 hover:text-zinc-650 bg-stone-100 hover:bg-stone-200 px-1.5 py-0.5 rounded animate-fade-in"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Dropdowns Filters */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex items-center">
                      <Filter className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 pointer-events-none" />
                      <select
                        value={filterProgram}
                        onChange={(e) => setFilterProgram(e.target.value)}
                        className="pl-9 pr-6 py-3 bg-stone-50 hover:bg-stone-55 border border-stone-200 rounded-2xl text-xs font-semibold outline-none text-stone-700 min-w-[200px] cursor-pointer appearance-none transition-all focus:bg-white focus:ring-1 focus:ring-brand-spruce"
                      >
                        <option value="all">🗂️ All Wellness Programs</option>
                        <option value="pcos">🌸 PCOS Cyclic (Reversal)</option>
                        <option value="diabetes">🩸 Diabetes Mellitus Care</option>
                        <option value="liver">🥗 Fatty Liver Reverse</option>
                        <option value="weight">⚖️ Weight Adaptability</option>
                        <option value="thyroid">🦋 Thyroid Metabolism</option>
                      </select>
                    </div>

                    {/* Refresh Table Button */}
                    <button
                      type="button"
                      onClick={fetchReservations}
                      disabled={reservationsLoading}
                      className="bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 font-mono font-bold uppercase tracking-wider text-[10px] px-5 py-3 rounded-2xl transition-all flex items-center justify-center gap-1.5 hover:shadow-xs disabled:opacity-50"
                      title="Reload Firestore Database Indices"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${reservationsLoading ? "animate-spin" : ""}`} />
                      <span>{reservationsLoading ? "Syncing..." : "Reload Index"}</span>
                    </button>
                  </div>
                </div>

                {/* Search Match Subtitles */}
                {(searchQuery || filterProgram !== "all") && (
                  <div className="text-xs text-stone-500 font-medium flex items-center gap-2 bg-stone-55 p-2.5 rounded-xl border border-stone-100 animate-fade-in">
                    Showing <strong className="text-stone-850 font-bold">{filteredReservations.length} matches</strong> out of {reservations.length} total records indexes database-wide.
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setFilterProgram("all");
                      }}
                      className="text-emerald-700 hover:text-emerald-800 font-bold underline cursor-pointer ml-auto text-[11px]"
                    >
                      Reset and clear all filters
                    </button>
                  </div>
                )}
              </div>

              {/* Data Table View */}
              {adminError && (
                <div className="p-4 bg-orange-50 border border-orange-200 text-orange-950 rounded-2xl text-xs font-mono space-y-1 shadow-sm">
                  <div className="font-bold flex items-center gap-1.5 text-[10px] uppercase text-orange-900 animate-fade-in">
                    <AlertCircle className="w-4 h-4" />
                    Active Access Exception Logged
                  </div>
                  <p>{adminError}</p>
                </div>
              )}

              {reservationsLoading && filteredReservations.length === 0 ? (
                <div className="bg-white rounded-3xl border border-stone-200 p-16 text-center shadow-xs">
                  <RefreshCw className="w-8 h-8 text-brand-spruce animate-spin mx-auto mb-4" />
                  <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider">Synchronizing cloud indices...</p>
                  <p className="text-[11px] text-stone-400 mt-1">Retrieving the live reservations collection from Firestore.</p>
                </div>
              ) : filteredReservations.length === 0 ? (
                <div className="bg-white rounded-3xl border border-stone-200 p-16 text-center shadow-xs space-y-2">
                  <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center text-stone-400 mx-auto border border-stone-100">
                    <Search className="w-5 h-5" />
                  </div>
                  <h4 className="font-sans font-bold text-stone-800 text-sm">No Patient Records Retrieved</h4>
                  <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                    {searchQuery || filterProgram !== "all" 
                      ? "No records matched your search query. Verify spelling or selection parameters to load target rows."
                      : "The reservations index is currently empty. Incoming inquiries from patient portal forms will manifest safely here in real-time."}
                  </p>
                </div>
              ) : (
                /* Patient Rows list layout */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredReservations.map((res: any) => {
                    // Match program title or map identifier
                    const programMap: Record<string, string> = {
                      pcos: "PCOS Cyclic Reversal Protocol",
                      diabetes: "Diabetes Care & Control",
                      liver: "Fatty Liver Reversal Support",
                      weight: "Weight Gain & Balance Care",
                      thyroid: "Thyroid Metabolism Stabilization"
                    };
                    const matchedTitle = programMap[res.programId] || res.programId;
                    
                    // Format created Date
                    let creationString = "Recently";
                    if (res.createdAt) {
                      try {
                        const dateObj = res.createdAt.toDate ? res.createdAt.toDate() : new Date(res.createdAt);
                        creationString = dateObj.toLocaleString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }) + " (IST)";
                      } catch (err) {
                        creationString = String(res.createdAt);
                      }
                    }

                    return (
                      <div 
                        key={res.id}
                        className="bg-white rounded-3xl border border-stone-200 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all duration-300 p-6 flex flex-col justify-between"
                      >
                        <div className="space-y-4">
                          {/* Row Header */}
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-100/50 px-2.5 py-0.5 rounded-lg inline-block mb-1.5 font-sans">
                                {matchedTitle}
                              </span>
                              <h4 className="font-serif text-lg font-normal text-stone-900 leading-tight">
                                {res.name}
                              </h4>
                              <p className="text-[10px] text-stone-400 font-mono mt-0.5">
                                Subscribed ID: {res.id}
                              </p>
                            </div>

                            {/* Delete Trigger */}
                            <button
                              onClick={() => handleDeleteReservation(res.id)}
                              className="text-stone-400 hover:text-rose-650 p-2 hover:bg-stone-50 rounded-xl transition-all border border-transparent hover:border-stone-100 flex items-center justify-center"
                              title="Archive and Remove Reservation Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Contact Badges */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-2 border-b border-stone-100">
                            <a 
                              href={`mailto:${res.email}`} 
                              className="group flex items-center gap-2 p-2 bg-stone-50 hover:bg-stone-100 border border-stone-100 rounded-xl text-[11px] text-stone-600 hover:text-stone-950 transition-all font-mono truncate"
                              title="Send inquiry email"
                            >
                              <Mail className="w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-700 transition-colors" />
                              <span className="truncate">{res.email}</span>
                            </a>
                            <a 
                              href={`tel:${res.phone}`} 
                              className="group flex flex-row items-center gap-2 p-2 bg-stone-50 hover:bg-stone-100 border border-stone-100 rounded-xl text-[11px] text-stone-600 hover:text-stone-950 transition-all font-mono truncate"
                              title="Initiate clinical telephone triage"
                            >
                              <Phone className="w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-700 transition-colors flex-shrink-0" />
                              <span>{res.phone}</span>
                            </a>
                          </div>

                          {/* Meeting Preferences details */}
                          <div className="flex flex-col sm:flex-row justify-between text-[11px] text-stone-500 font-medium py-1 gap-2 border-b border-stone-100 pb-3">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-stone-400" />
                              <span>Target Date: <strong className="text-stone-850">{res.preferredDate}</strong></span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-stone-400" />
                              <span>Proposed Time: <strong className="text-stone-855">{res.preferredTime || "10:00 AM"}</strong></span>
                            </div>
                          </div>

                          {/* Medical Notes/Patient Description */}
                          <div className="space-y-1">
                            <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-stone-400 block">Symptom History / Notes:</span>
                            <div className="p-3 bg-stone-50/75 border border-stone-100 rounded-2xl text-[11px] text-stone-700 font-normal leading-relaxed italic max-h-[120px] overflow-y-auto whitespace-pre-wrap">
                              {res.notes?.trim() ? res.notes.trim() : "No clinical notes provided by patient."}
                            </div>
                          </div>
                        </div>

                        {/* Timestamp card footer */}
                        <div className="mt-4 pt-3.5 border-t border-stone-100 flex justify-between items-center text-[10px] font-mono tracking-wide text-stone-400">
                          <span>Received: {creationString}</span>
                          <a 
                            href={`mailto:${res.email}?subject=Reservation Conversation - Dr. Vishnupriya Wellness&body=Hello ${res.name},%0D%0DThank you for submitting a reservation inquiry for the 90-Day ${matchedTitle} program.%0D%0DYour target appointment time is scheduled for ${res.preferredDate} at ${res.preferredTime}. Our assistant triage desk is following up on your diagnostic details.%0D%0DBest Wishes,%0D%0ADr. VP Talks Portal`}
                            className="text-emerald-800 hover:text-emerald-950 font-bold border border-emerald-200 hover:border-emerald-350 bg-emerald-50 px-2.5 py-1 rounded inline-flex items-center gap-1 hover:shadow-xs transition-all uppercase tracking-widest text-[9px] font-sans"
                          >
                            Email Reply &rarr;
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream text-brand-dark flex flex-col font-sans antialiased selection:bg-brand-sage selection:text-white">
      
      {/* Top Header Navigation */}
      <header id="editorial-header" className="sticky top-0 z-40 bg-brand-cream/90 backdrop-blur-md border-b border-brand-dark/5 shadow-xs px-6 lg:px-16 py-4 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Brand/Signature Label */}
          <div 
            onClick={() => scrollToElement("home", "home")}
            className="flex flex-col cursor-pointer group"
          >
            <span className="font-serif text-2xl font-light italic tracking-tight text-brand-dark group-hover:text-brand-sage transition-all">
              Dr. Vishnupriya —
            </span>
            <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-brand-dark/50 group-hover:text-brand-dark transition-all">
              Your Wellness Guide
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex gap-8 items-center text-xs font-semibold uppercase tracking-wider">
            <button 
              onClick={() => scrollToElement("home", "home")}
              className={`pb-1 border-b-2 hover:text-brand-sage transition-all ${
                activeSection === "home" ? "border-brand-sage text-brand-sage" : "border-transparent text-brand-dark/70"
              }`}
            >
              Home
            </button>
            <button 
              onClick={() => scrollToElement("programs", "programs")}
              className={`pb-1 border-b-2 hover:text-brand-sage transition-all ${
                activeSection === "programs" ? "border-brand-sage text-brand-sage" : "border-transparent text-brand-dark/70"
              }`}
            >
              Programs
            </button>
            <button 
              onClick={() => scrollToElement("assessments", "assessments")}
              className={`pb-1 border-b-2 hover:text-brand-sage transition-all ${
                activeSection === "assessments" ? "border-brand-sage text-brand-sage" : "border-transparent text-brand-dark/70"
              }`}
            >
              Assessments
            </button>
            <button 
              onClick={() => scrollToElement("blog", "blog")}
              className={`pb-1 border-b-2 hover:text-brand-sage transition-all ${
                activeSection === "blog" ? "border-brand-sage text-brand-sage" : "border-transparent text-brand-dark/70"
              }`}
            >
              Articles
            </button>
            <button 
              onClick={() => scrollToElement("booking-section", "bookings")}
              className="bg-brand-spruce hover:bg-brand-sage text-white px-5 py-2.5 rounded-full text-[10px] tracking-widest uppercase font-mono transition-transform active:scale-95"
            >
              Book Online
            </button>
          </nav>

          {/* Mobile Booking Trigger Icon */}
          <div className="md:hidden">
            <button 
              onClick={() => scrollToElement("booking-section", "bookings")}
              className="bg-brand-spruce text-white px-4 py-2 rounded-full text-[10px] uppercase font-bold font-mono"
            >
              Book Consultation
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full flex flex-col">

        {/* Hero Section */}
        <section id="home" className="px-6 lg:px-16 pt-12 md:pt-20 pb-16 border-b border-brand-dark/5">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <span className="text-xs uppercase tracking-[0.25em] font-bold text-brand-sage mb-3 inline-block">
                Kerala Ayurvedic Medicine Meets Clinical Science
              </span>
              <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight mb-8 text-brand-dark font-normal">
                A Doctor who <span className="italic font-light text-brand-sage">listens.</span>
              </h1>
              
              <p className="text-base md:text-lg text-brand-dark/80 leading-relaxed mb-8 max-w-xl">
                Most of my patients come to me after years of frustration. They don’t need another generic diet checklist — they need someone to finally understand what is going on.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <button 
                  onClick={() => scrollToElement("booking-section", "bookings")}
                  className="bg-brand-sage hover:bg-brand-spruce text-white px-8 py-4 rounded-xl font-semibold shadow-md shadow-emerald-950/10 transition-colors uppercase tracking-wider text-xs flex items-center justify-center gap-2"
                >
                  Book Consultation
                  <ArrowRight className="w-4 h-4 text-emerald-350" strokeWidth={3} />
                </button>
                <button 
                  onClick={() => {
                    setAssessmentTab("pcos");
                    scrollToElement("assessments", "assessments");
                  }}
                  className="border border-brand-dark/15 hover:border-brand-dark/40 bg-white/40 text-brand-dark px-8 py-4 rounded-xl font-semibold transition-colors uppercase tracking-wider text-xs flex items-center justify-center gap-2"
                >
                  Free PCOS Assessment
                </button>
              </div>

              {/* Patient Quote Citation */}
              <div className="pt-8 border-t border-brand-dark/10 max-w-lg">
                <p className="text-[10px] uppercase tracking-[0.15em] text-brand-dark/45 font-bold mb-3">
                  Clinical Philosophy
                </p>
                <blockquote className="font-serif text-xl italic text-brand-dark/75 leading-relaxed">
                  "Every protocol starts with a deep understanding of you — your hormones, habits, background history, and metabolic framework."
                </blockquote>
                <p className="text-xs font-semibold text-brand-sage mt-2">
                  — Dr. Vishnupriya
                </p>
              </div>
            </div>

            {/* Hero Right Interactive Spotlight (Bento style) */}
            <div className="lg:col-span-5 grid grid-cols-1 gap-6">
              
              {/* Doctor Profile Mini Card */}
              <div className="bg-white border border-brand-dark/5 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-14 h-14 rounded-full bg-emerald-50 border border-brand-sage/20 flex items-center justify-center text-brand-spruce font-serif text-lg font-bold uppercase shrink-0">
                    VP
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-brand-dark">Dr. Vishnupriya</h3>
                    <p className="text-xs text-brand-dark/60">Ayurveda Physician & Lifestyle Educator</p>
                    <p className="text-[10px] text-brand-sage font-mono mt-0.5 font-bold">Kerala, India</p>
                  </div>
                </div>
                <p className="text-xs text-brand-dark/70 leading-relaxed mb-4">
                  Clinical expert backing the Doctor VP Talks framework. She specializes in reversing stubborn lifestyle disorders through sustainable 90-day metabolic rehabilitation.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className="text-[10px] bg-brand-cream border border-brand-dark/5 px-2 py-1 rounded text-brand-dark/80 font-medium">90-Day Plans</span>
                  <span className="text-[10px] bg-emerald-50 text-brand-sage px-2 py-1 rounded font-medium">Preventive Medicine</span>
                  <span className="text-[10px] bg-blue-50 text-blue-800 px-2 py-1 rounded font-medium">Prakriti Analysis</span>
                </div>
              </div>



            </div>
          </div>
        </section>

        {/* 90-Day Programs Section */}
        <section id="programs" className="px-6 lg:px-16 py-16 md:py-24 border-b border-brand-dark/5 bg-white/20">
          <div className="max-w-7xl mx-auto">
            
            {/* Section Headings */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
              <div>
                <span className="text-xs uppercase tracking-[0.25em] font-mono text-brand-sage font-bold inline-block mb-2">
                  The Rehearsal of Balance
                </span>
                <h2 className="font-serif text-3xl md:text-5xl font-normal leading-tight text-brand-dark">
                  Our 90-Day Lifestyle <span className="italic font-light">Modification Plans</span>
                </h2>
              </div>
              <p className="text-xs text-brand-dark/60 font-mono max-w-sm mt-4 md:mt-0">
                Customized schedules target hormone imbalances, systemic cell swelling and metabolic sluggishness right from their roots.
              </p>
            </div>

            {/* Programs Listing Grid (Editorial style) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.length > 0 ? (
                programs.map((program) => {
                  const isSelected = selectedProgram?.id === program.id;
                  return (
                    <div 
                      key={program.id}
                      id={`prog-card-${program.id}`}
                      className="group bg-white border border-brand-dark/5 hover:border-brand-sage/40 rounded-3xl p-6 transition-all duration-300 hover:shadow-lg flex flex-col justify-between"
                    >
                      <div>
                        {/* Tags */}
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[9px] font-bold font-mono tracking-wider uppercase text-brand-sage bg-emerald-50 px-2.5 py-1 rounded">
                            90-Day Protocol
                          </span>
                          <span className="text-xs text-brand-dark/30 font-serif italic">
                            0{programs.indexOf(program) + 1}
                          </span>
                        </div>

                        <h3 className="font-serif text-2xl font-bold text-brand-dark group-hover:text-brand-sage transition-all mb-2">
                          {program.title}
                        </h3>
                        
                        <p className="text-xs text-brand-dark/50 font-mono mb-4">
                          Focus: {program.focus}
                        </p>

                        <p className="text-sm text-brand-dark/75 leading-relaxed mb-6">
                          {program.description}
                        </p>
                      </div>

                      {/* Pillars Detail Accordion */}
                      <div>
                        <div className="border-t border-brand-dark/5 pt-4">
                          <button
                            type="button"
                            onClick={() => setSelectedProgram(isSelected ? null : program)}
                            className="w-full flex justify-between items-center text-xs font-semibold text-brand-dark uppercase tracking-wider hover:text-brand-sage transition-colors text-left"
                          >
                            <span>{isSelected ? "Hide Plan Pillars" : "Explore Plan Pillars"}</span>
                            <Plus className={`w-4 h-4 transition-transform duration-300 ${isSelected ? "rotate-45 text-brand-sage" : ""}`} />
                          </button>

                          <AnimatePresence>
                            {isSelected && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <ul className="mt-3 space-y-2 pl-2">
                                  {program.pillars.map((pillar, idx) => (
                                    <li key={idx} className="text-xs text-brand-dark/85 flex items-start gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-brand-sage mt-1.5 shrink-0"></span>
                                      <span>{pillar}</span>
                                    </li>
                                  ))}
                                </ul>
                                <button
                                  onClick={() => {
                                    setBooking(prev => ({
                                      ...prev,
                                      programId: program.id
                                    }));
                                    scrollToElement("booking-section", "bookings");
                                  }}
                                  className="mt-4 w-full bg-brand-spruce hover:bg-brand-sage text-white text-[10px] tracking-widest font-mono uppercase font-bold py-2 rounded-lg transition-colors inline-block text-center"
                                >
                                  Reserve {program.title} Space
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                // Skeleton loading state
                [1, 2, 3, 4, 5].map((ske) => (
                  <div key={ske} className="bg-white border border-brand-dark/5 rounded-3xl p-6 space-y-4 animate-pulse">
                    <div className="h-4 bg-stone-100 rounded w-1/3"></div>
                    <div className="h-6 bg-stone-200 rounded w-2/3"></div>
                    <div className="h-12 bg-stone-100 rounded"></div>
                    <div className="h-4 bg-stone-100 rounded w-1/2"></div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Citation banner */}
            <div className="mt-16 bg-brand-sage/10 rounded-3xl p-8 border border-brand-sage/10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2">
                <h4 className="font-serif text-xl font-bold text-brand-dark leading-snug">
                  Unsure which metabolic program is optimal for your system?
                </h4>
                <p className="text-xs text-brand-dark/70 leading-relaxed mt-1">
                  Schedule an introductory diagnostic assessment with Dr. VP’s team or locate your baseline using our online scoring matrices.
                </p>
              </div>
              <div className="flex gap-3 justify-start md:justify-end">
                <button 
                  onClick={() => scrollToElement("booking-section", "bookings")}
                  className="bg-brand-spruce hover:bg-brand-sage text-white px-5 py-3 rounded-xl text-xs font-semibold tracking-wider uppercase font-mono transition-transform active:scale-95 shrink-0"
                >
                  Book Assessment
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* Dynamic Assessments Center */}
        <section id="assessments" className="px-6 lg:px-16 py-16 md:py-24 border-b border-brand-dark/5 bg-brand-cream">
          <div className="max-w-7xl mx-auto">
            
            {/* Heading */}
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs uppercase tracking-[0.25em] font-mono text-brand-sage font-bold inline-block mb-2">
                Interactive Bioscoring
              </span>
              <h2 className="font-serif text-3xl md:text-5xl font-normal leading-tight text-brand-dark">
                Take Control of Your <span className="italic font-light">Health Metrics</span>
              </h2>
              <p className="text-xs text-brand-dark/60 mt-3 font-mono">
                Select an assessment module below. Your results will dynamically formulate tailored health guidance.
              </p>

              {/* Assessment Selector Tab */}
              <div id="assessment-tab-list" className="inline-flex p-1 bg-stone-200/50 rounded-xl border border-stone-200 mt-8 w-full max-w-md">
                <button
                  type="button"
                  onClick={() => setAssessmentTab("pcos")}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-center transition-all ${
                    assessmentTab === "pcos" 
                      ? "bg-white text-brand-dark font-bold shadow-xs border border-stone-200" 
                      : "text-brand-dark/60 hover:text-brand-dark/95"
                  }`}
                >
                  PCOS Stress Test
                </button>
                <button
                  type="button"
                  onClick={() => setAssessmentTab("prakriti")}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-center transition-all ${
                    assessmentTab === "prakriti" 
                      ? "bg-white text-brand-dark font-bold shadow-xs border border-stone-200" 
                      : "text-brand-dark/60 hover:text-brand-dark/95"
                  }`}
                >
                  Discover Prakriti
                </button>
              </div>
            </div>

            {/* Assessment Render Block */}
            <div className="mt-8">
              {assessmentTab === "pcos" ? (
                <AssessmentPCOS />
              ) : (
                <AssessmentPrakriti />
              )}
            </div>

          </div>
        </section>



        {/* Insights & Blog Columns */}
        <section id="blog" className="px-6 lg:px-16 py-16 md:py-24 border-b border-brand-dark/5 bg-brand-cream">
          <div className="max-w-7xl mx-auto">
            
            {/* Section Heading */}
            <div className="flex justify-between items-end mb-12">
              <div>
                <span className="text-xs uppercase tracking-[0.25em] font-mono text-brand-sage font-bold inline-block mb-2">
                  Clinical Reflections
                </span>
                <h2 className="font-serif text-3xl md:text-5xl font-normal leading-tight text-brand-dark">
                  From Doctor VP's <span className="italic font-light">Expert Column</span>
                </h2>
              </div>
              <span className="hidden md:inline text-xs text-brand-dark/40 font-mono">
                Preventive Knowledge For Everyday Wellness
              </span>
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {BLOG_ARTICLES.map((article) => (
                <article 
                  key={article.id}
                  id={`article-card-${article.id}`}
                  className="bg-white border border-brand-dark/5 rounded-3xl p-6 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-brand-sage font-mono mb-4">
                      <span>{article.category}</span>
                      <span className="text-brand-dark/40">{article.readTime}</span>
                    </div>

                    <h3 className="font-serif text-xl font-bold leading-snug text-brand-dark hover:text-brand-sage transition-all mb-3">
                      {article.title}
                    </h3>
                    
                    <p className="text-xs text-brand-dark/60 leading-relaxed mb-6">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="border-t border-stone-100 pt-4 flex justify-between items-center mt-auto">
                    <span className="text-[10px] text-brand-dark/40 font-mono">
                      {article.date} • {article.author}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedBlog(article)}
                      className="text-xs font-bold text-brand-spruce hover:text-brand-sage transition-colors flex items-center gap-1 uppercase tracking-widest font-mono text-[10px]"
                    >
                      Read Study
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </article>
              ))}
            </div>

          </div>
        </section>

        {/* Appointment scheduler online */}
        <section id="booking-section" className="px-6 lg:px-16 py-16 md:py-24 bg-brand-spruce text-amber-50">
          <div className="max-w-7xl mx-auto">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Form Info Left */}
              <div className="lg:col-span-5 space-y-6">
                <span className="text-xs uppercase tracking-[0.25em] font-mono text-amber-300 font-bold inline-block">
                  Begin Your Recovery Blueprint
                </span>
                <h2 className="font-serif text-3xl md:text-5xl leading-[1.1] font-normal text-amber-50">
                  Book Your <span className="italic font-light">Clinical Evaluation</span>
                </h2>
                <p className="text-sm text-stone-300 leading-relaxed">
                  Start your specialized 90-day protocol. Specify your program interest and preferred slot. Our nursing triage team will reach out within 12 hours via phone or email to complete registration and confirm the time.
                </p>

                <div className="space-y-4 pt-4 border-t border-amber-100/10">
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-amber-100">Patient Helpline</p>
                      <p className="text-sm font-bold text-stone-200">+91 7902 710 112</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-amber-100">Primary Desk Address</p>
                      <p className="text-sm font-bold text-stone-200">vishnupriya@drvptalks.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Compass className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-amber-100">Global Patients Assisted</p>
                      <p className="text-xs text-stone-400">Available globally via offline clinics in Kerala & high-fidelity interactive digital telemetry sessions.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Input Container Right */}
              <div className="lg:col-span-7 bg-white text-stone-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-700"></div>

                <AnimatePresence mode="wait">
                  {!bookingConfirmed ? (
                    <motion.form 
                      key="booking-form"
                      onSubmit={handleBookingSubmit}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-5"
                    >
                      <h4 className="font-serif text-xl font-bold text-stone-900">
                        Inquire Program Reservation
                      </h4>
                      <p className="text-xs text-stone-500 leading-relaxed">
                        Complete your basic details to draft the initial consultation space. No credit card is required at this stage.
                      </p>

                      {bookingError && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs leading-relaxed font-mono">
                          <strong>Submission Failed:</strong> {bookingError}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider font-mono">Your Full Name *</label>
                          <input 
                            type="text"
                            required
                            placeholder="e.g., Anjali Menon"
                            value={booking.name}
                            onChange={(e) => setBooking(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-lg border border-stone-200 focus:border-brand-sage focus:ring-1 focus:ring-brand-sage text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider font-mono">Email Address *</label>
                          <input 
                            type="email"
                            required
                            placeholder="e.g., anjali@example.com"
                            value={booking.email}
                            onChange={(e) => setBooking(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-lg border border-stone-200 focus:border-brand-sage focus:ring-1 focus:ring-brand-sage text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider font-mono">Contact Phone *</label>
                          <input 
                            type="tel"
                            required
                            placeholder="e.g., +91 99460 12345"
                            value={booking.phone}
                            onChange={(e) => setBooking(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-lg border border-stone-200 focus:border-brand-sage focus:ring-1 focus:ring-brand-sage text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider font-mono">Wellness Program *</label>
                          <select 
                            value={booking.programId}
                            onChange={(e) => setBooking(prev => ({ ...prev, programId: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-lg border border-stone-200 focus:border-brand-sage focus:ring-1 focus:ring-brand-sage text-sm bg-white"
                          >
                            <option value="pcos">90-Day PCOS Reversal Program</option>
                            <option value="diabetes">90-Day Diabetes Care Program</option>
                            <option value="liver">90-Day Fatty Liver Care & Reversal</option>
                            <option value="weight">90-Day Specialized Weight Management</option>
                            <option value="thyroid">90-Day Hypothyroidism Support Program</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider font-mono">Preferred Date *</label>
                          <input 
                            type="date"
                            required
                            value={booking.preferredDate}
                            onChange={(e) => setBooking(prev => ({ ...prev, preferredDate: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-lg border border-stone-200 focus:border-brand-sage focus:ring-1 focus:ring-brand-sage text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider font-mono">Preferred Window</label>
                          <select 
                            value={booking.preferredTime}
                            onChange={(e) => setBooking(prev => ({ ...prev, preferredTime: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-lg border border-stone-200 focus:border-brand-sage focus:ring-1 focus:ring-brand-sage text-sm bg-white"
                          >
                            <option value="09:00">09:00 AM – 12:00 PM (Morning)</option>
                            <option value="12:00">12:00 PM – 03:00 PM (Afternoon)</option>
                            <option value="15:00">03:00 PM – 06:00 PM (Late Afternoon)</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider font-mono">Describe Health Symptoms or History (Optional)</label>
                        <textarea 
                          rows={3}
                          placeholder="Please mention any years of frustration, previous diagnoses, or primary targets you wish Dr. VP to address..."
                          value={booking.notes}
                          onChange={(e) => setBooking(prev => ({ ...prev, notes: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-lg border border-stone-200 focus:border-brand-sage focus:ring-1 focus:ring-brand-sage text-sm resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingBooking}
                        className="w-full bg-emerald-800 hover:bg-emerald-900 disabled:bg-stone-300 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest font-mono transition-colors shadow-md shadow-emerald-950/10 flex items-center justify-center gap-2"
                      >
                        {isSubmittingBooking ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Registering Reservation...
                          </>
                        ) : (
                          "Initiate Consultation Space"
                        )}
                      </button>
                    </motion.form>
                  ) : (
                    <motion.div 
                      key="booking-success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12 space-y-6"
                    >
                      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200 shadow-sm">
                        <Check className="w-8 h-8 text-emerald-800" />
                      </div>
                      
                      <div className="space-y-2">
                        <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-150 px-2.5 py-1 rounded font-mono font-bold uppercase tracking-widest">
                          Temporary Reservation Drafted
                        </span>
                        <h4 className="font-serif text-2xl font-bold text-stone-900">
                          Thank you, {booking.name}!
                        </h4>
                        <p className="text-sm text-stone-605 max-w-md mx-auto leading-relaxed">
                          Your draft request for the <strong>{programs.find(p => p.id === booking.programId)?.title || "90-Day Protocol"}</strong> has been registered. 
                        </p>
                      </div>

                      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 max-w-md mx-auto text-left space-y-3 font-mono">
                        <p className="text-xs text-stone-500 uppercase tracking-widest border-b border-stone-200 pb-1.5 font-bold">Registration Data</p>
                        <p className="text-xs text-stone-700"><strong>Patient:</strong> {booking.name}</p>
                        <p className="text-xs text-stone-700"><strong>Contact:</strong> {booking.phone} / {booking.email}</p>
                        <p className="text-xs text-stone-700"><strong>Target Date:</strong> {booking.preferredDate}</p>
                        <p className="text-xs text-stone-700"><strong>Triage Window:</strong> {booking.preferredTime === "09:00" ? "Morning Slot" : booking.preferredTime === "12:00" ? "Afternoon Slot" : "Late Afternoon Slot"}</p>
                      </div>

                      {/* Explicit Interactive Email Status Reporting */}
                      {emailNoticeStatus && (
                        emailNoticeStatus.success ? (
                          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs text-left max-w-md mx-auto space-y-1 shadow-sm">
                            <div className="flex items-center gap-1.5 font-bold font-mono text-[10px] uppercase tracking-wider text-emerald-900">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                              SMTP Dispatch Confirmed
                            </div>
                            <p className="font-sans leading-relaxed text-stone-600">
                              Actual verification and confirmation emails have been dispatched successfully to <strong>{booking.email}</strong> and the <strong>Administrative Desk</strong>!
                            </p>
                          </div>
                        ) : (
                          <div className="p-5 bg-amber-50 border border-amber-200 text-amber-950 rounded-2xl text-xs text-left max-w-md mx-auto space-y-3.5 shadow-sm animate-fade-in">
                            <div className="flex items-center gap-1.5 font-bold font-mono text-[10px] uppercase tracking-wider text-amber-900 border-b border-amber-200/60 pb-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse animate-duration-1000"></span>
                              Zoho Pro SMTP Diagnostic Banner
                            </div>
                            
                            <p className="font-sans leading-relaxed text-stone-705">
                              Your online reservation request has been <strong>saved successfully</strong> in our secure Firestore database, but mail dispatch failed due to an authentication check block.
                            </p>

                            <div className="p-3 bg-white/80 border border-amber-200/50 rounded-lg text-[11px] space-y-1">
                              <span className="text-[9px] uppercase font-bold tracking-widest text-amber-800 font-mono block">SMTP Server Error Log</span>
                              <div className="font-mono text-amber-950 break-words leading-relaxed font-bold">
                                {emailNoticeStatus.error || "Connection or Handshake timeout."}
                              </div>
                            </div>

                            <div className="space-y-1.5 pt-1 text-stone-700">
                              <span className="text-[10px] uppercase font-bold tracking-widest text-stone-800 block">Bridge Guide - Generate Zoho App Password:</span>
                              <ol className="list-decimal pl-4 space-y-1 font-sans text-[11px] leading-relaxed">
                                <li>Log into your Zoho Portal at <strong className="text-zinc-900">accounts.zoho.in</strong></li>
                                <li>Select <strong className="text-zinc-900">Security</strong> on the left panel &rarr; <strong className="text-zinc-900">App Passwords</strong></li>
                                <li>Click <strong className="text-zinc-900">Generate New Password</strong> (Enter an identifier like "Dr VP Portal")</li>
                                <li>Copy the automatic 16-character code (e.g. <span className="font-mono text-[10.5px] bg-stone-100 px-1 rounded text-stone-805">xxxx xxxx xxxx xxxx</span>)</li>
                                <li>Paste this token inside your active app's secrets as <strong className="font-mono text-[10.5px]">SMTP_PASS</strong> instead of your primary master password</li>
                              </ol>
                            </div>
                          </div>
                        )
                      )}

                      <p className="text-xs text-stone-400 max-w-sm mx-auto">
                        A clinical helper from Dr. VP's Kerala administrative desk will call or email you shortly. Please keep your telemetry device active.
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          setBookingConfirmed(false);
                          setBookingError(null);
                          setEmailNoticeStatus(null);
                          setBooking({
                            name: "",
                            email: "",
                            phone: "",
                            programId: "pcos",
                            preferredDate: "",
                            preferredTime: "10:00",
                            notes: ""
                          });
                        }}
                        className="text-xs font-semibold text-brand-sage hover:text-brand-spruce underline uppercase tracking-widest font-mono"
                      >
                        Request Another Slot
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

            </div>

          </div>
        </section>

      </main>

      {/* Interactive Blog Reader Modal */}
      <AnimatePresence>
        {selectedBlog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-brand-cream border border-stone-200 rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-y-auto p-8 shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => setSelectedBlog(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 transition-colors"
                title="Close Modal"
              >
                <X className="w-5 h-5 text-stone-600" />
              </button>

              <div className="mb-6">
                <span className="text-xs font-bold font-mono tracking-wider text-brand-sage uppercase bg-emerald-50 px-2.5 py-1 rounded inline-block mb-3">
                  {selectedBlog.category}
                </span>
                <h2 className="font-serif text-3xl md:text-4xl font-normal leading-tight text-brand-dark mb-3">
                  {selectedBlog.title}
                </h2>
                <div className="flex items-center gap-3 text-xs text-stone-500 font-mono">
                  <span>Published on: {selectedBlog.date}</span>
                  <span>•</span>
                  <span>Author: {selectedBlog.author}</span>
                  <span>•</span>
                  <span className="text-brand-sage bg-emerald-50 px-2.5 py-0.5 rounded font-bold italic">{selectedBlog.readTime}</span>
                </div>
              </div>

              {/* Blog body Content */}
              <div className="prose prose-stone max-w-none text-stone-800 text-sm md:text-base leading-relaxed space-y-4 whitespace-pre-line border-t border-stone-100 pt-6">
                {selectedBlog.content}
              </div>

              <div className="mt-8 pt-6 border-t border-stone-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedBlog(null)}
                  className="px-6 py-2 rounded-lg text-xs font-bold border border-stone-200 hover:bg-stone-55 transition-colors uppercase tracking-widest font-mono text-[10px]"
                >
                  Close Article
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBlog(null);
                    scrollToElement("booking-section", "bookings");
                  }}
                  className="bg-brand-spruce hover:bg-brand-sage text-white px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest font-mono text-[10px] transition-colors"
                >
                  Inquire Reverse Consultation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Primary Footer Section */}
      <footer className="bg-brand-cream border-t border-brand-dark/10 py-12 px-6 lg:px-16 mt-auto">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            
            {/* Column 1: Info and Brand */}
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="font-serif text-xl font-light italic tracking-tight text-brand-dark">
                  Dr. Vishnupriya —
                </span>
                <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-brand-dark/50">
                  Your Wellness Guide
                </span>
              </div>
              <p className="text-xs text-brand-dark/70 leading-relaxed">
                Dedicated 90-day physical and dietary modification programs targeting polycystic syndromes, early stages liver fat, diabetic support patterns, & weight rate adaptation.
              </p>
            </div>

            {/* Column 2: Core Programs Quick Anchors */}
            <div className="space-y-3">
              <p className="text-xs font-mono font-bold uppercase tracking-widest text-brand-sage">
                90-Day Pathways
              </p>
              <ul className="space-y-2 text-xs text-brand-dark/80">
                <li><button onClick={() => scrollToElement("programs", "programs")} className="hover:text-brand-sage text-left">Diabetes Care & Control</button></li>
                <li><button onClick={() => scrollToElement("programs", "programs")} className="hover:text-brand-sage text-left">Liver Health & Reverse</button></li>
                <li><button onClick={() => scrollToElement("programs", "programs")} className="hover:text-brand-sage text-left">Weight Management & Balance</button></li>
                <li><button onClick={() => scrollToElement("programs", "programs")} className="hover:text-brand-sage text-left">Thyroid Metabolism Support</button></li>
                <li><button onClick={() => scrollToElement("programs", "programs")} className="hover:text-brand-sage text-left">PCOS Cyclic Recombination</button></li>
              </ul>
            </div>

            {/* Column 3: Telemedicine Desks */}
            <div className="space-y-3">
              <p className="text-xs font-mono font-bold uppercase tracking-widest text-brand-sage">
                Active Desk Details
              </p>
              <ul className="space-y-2 text-xs text-brand-dark/80">
                <li className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-brand-sage" />
                  <span>+91 7902 710 112</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-brand-sage" />
                  <span>vishnupriya@drvptalks.com</span>
                </li>
                <li className="italic opacity-75 text-[11px]">Primary Care: Kerala, India.</li>
              </ul>
            </div>

            {/* Column 4: Clinical Stance Disclaimer */}
            <div className="space-y-3">
              <p className="text-xs font-mono font-bold uppercase tracking-widest text-brand-sage">
                Regulatory Stance
              </p>
              <p className="text-[10px] text-brand-dark/50 leading-relaxed">
                Nothing provided herein constitutes diagnostic clinical validation or formal medical prescriptions. Interactive assessments and nutritional coaching features operate as informational lifestyle supportive guides.
              </p>
            </div>

          </div>

          {/* Bottom copyright alignment */}
          <div className="pt-8 border-t border-brand-dark/5 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase font-mono tracking-widest text-brand-dark/45 space-y-4 md:space-y-0">
            <div className="flex gap-4 flex-wrap justify-center md:justify-start">
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Accessibility Statement</span>
              <span>•</span>
              <span>Terms & Conditions</span>
              <span>•</span>
              <span>Refund Policy</span>
              <span>•</span>
              <button 
                onClick={() => setShowAdminPanel(true)} 
                className="hover:text-brand-sage text-emerald-800/90 font-bold transition-all uppercase tracking-widest text-[10px] flex items-center gap-1 cursor-pointer"
                title="Physician Portal login"
              >
                <Shield className="w-3 h-3 text-emerald-600/80" />
                Clinical Admin Access
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="hover:text-brand-sage cursor-pointer"><Instagram className="w-4 h-4" /></span>
              <span className="hover:text-brand-sage cursor-pointer"><Youtube className="w-4 h-4" /></span>
              <span>© 2026 Dr VP Talks — All Rights Reserved.</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
