"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { BookOpen, Sparkles, BrainCircuit, GraduationCap, ArrowRight, CheckCircle2, Bot, Layers } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-primary/20">
      
      {/* ===== NAVBAR ===== */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <BookOpen className="size-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">NoteSeek</span>
          </div>
          
          <nav className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-primary transition-colors">How it works</Link>
            <Link href="#testimonials" className="hover:text-primary transition-colors">For Educators</Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hidden sm:inline-flex font-medium">Log in</Button>
            <Button className="font-semibold shadow-md shadow-primary/20">Get Started</Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ===== HERO SECTION ===== */}
        <section className="relative overflow-hidden pt-24 pb-32 lg:pt-36 lg:pb-40">
          {/* Background Decorative Blobs */}
          <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-[600px] overflow-hidden -z-10 opacity-70">
            <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-400/20 blur-[100px] mix-blend-multiply" />
            <div className="absolute top-20 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-400/20 blur-[100px] mix-blend-multiply" />
          </div>

          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
            }}
            className="container mx-auto px-4 md:px-6 text-center"
          >
            <motion.div variants={{ hidden: { opacity: 0, y: 30, filter: "blur(10px)", scale: 0.9 }, visible: { opacity: 1, y: 0, filter: "blur(0px)", scale: 1, transition: { type: "spring", bounce: 0.5, duration: 0.8 } } }}>
              <Badge variant="outline" className="mb-6 py-1.5 px-4 bg-white/50 backdrop-blur-sm border-primary/20 text-primary font-medium tracking-wide">
                <Sparkles className="size-3.5 mr-2 inline" /> Introducing NoteSeek 2.0
              </Badge>
            </motion.div>
            
            <motion.h1 variants={{ hidden: { opacity: 0, y: 40, filter: "blur(20px)", scale: 0.95 }, visible: { opacity: 1, y: 0, filter: "blur(0px)", scale: 1, transition: { type: "spring", bounce: 0.4, duration: 1 } } }} className="max-w-4xl mx-auto text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              The AI-Powered Hub for <br className="hidden sm:block" /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Modern Education
              </span>
            </motion.h1>
            
            <motion.p variants={{ hidden: { opacity: 0, y: 20, filter: "blur(10px)" }, visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", bounce: 0.3, duration: 0.8 } } }} className="max-w-2xl mx-auto mt-6 text-lg md:text-xl text-slate-600 leading-relaxed">
              Transform static lectures into interactive study material. Teachers upload content effortlessly, while students generate bespoke flashcards, summaries, and quizzes on demand.
            </motion.p>
            
            <motion.div variants={{ hidden: { opacity: 0, y: 20, filter: "blur(10px)", scale: 0.9 }, visible: { opacity: 1, y: 0, filter: "blur(0px)", scale: 1, transition: { type: "spring", bounce: 0.4, duration: 0.8 } } }} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="h-14 px-8 text-base shadow-lg shadow-blue-500/25 rounded-full hover:scale-105 transition-transform duration-300 w-full sm:w-auto">
                <Link href="/login">
                  Enter Student Portal <ArrowRight className="ml-2 size-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base bg-white shadow-sm rounded-full w-full sm:w-auto hover:bg-slate-50">
                <Link href="/login">
                  Access Teacher Dashboard <GraduationCap className="ml-2 size-5" />
                </Link>
              </Button>
            </motion.div>
            
            <motion.p variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="mt-6 text-sm text-slate-500 font-medium">No credit card required • Free for individual students</motion.p>
          </motion.div>
        </section>

        {/* ===== VALUE PROPOSITION SPLIT ===== */}
        <section id="features" className="py-24 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div 
              initial={{ opacity: 0, y: 50, filter: "blur(10px)", scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ type: "spring", bounce: 0.4, duration: 1 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">One Platform. Two Powerful Perspectives.</h2>
              <p className="text-slate-600 text-lg max-w-2xl mx-auto">NoteSeek bridges the gap between instruction and comprehension with dedicated workflows for both sides of the classroom.</p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 max-w-6xl mx-auto">
              {/* For Students Card */}
              <motion.div 
                initial={{ opacity: 0, x: -60, filter: "blur(15px)", rotateY: 10 }}
                whileInView={{ opacity: 1, x: 0, filter: "blur(0px)", rotateY: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ type: "spring", bounce: 0.3, duration: 1, delay: 0.1 }}
                className="group relative rounded-3xl border bg-slate-50 p-8 md:p-10 overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-300 transform perspective-1000"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full blur-[80px] -z-10 group-hover:bg-blue-200 transition-colors" />
                <div className="size-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-6 shadow-md shadow-blue-600/20">
                  <BrainCircuit className="size-7" />
                </div>
                <h3 className="text-2xl font-bold mb-3">For Students</h3>
                <p className="text-slate-600 mb-8 leading-relaxed">Stop rereading the textbook. NoteSeek lets you select specific pages from your professor's slides or your own personal uploads, instantly generating tailored study materials.</p>
                
                <ul className="space-y-4">
                  {[
                    "Generate instant flashcards and summaries",
                    "Take AI-created practice quizzes to test retention",
                    "Upload personal PDFs to the private Study Vault",
                    "Submit assignments and track grades in one place"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="size-5 text-blue-600 shrink-0 mt-0.5" />
                      <span className="text-slate-700 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-10">
                  <Link href="/student" className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700">
                    Try the Student experience <ArrowRight className="ml-1 size-4" />
                  </Link>
                </div>
              </motion.div>

              {/* For Teachers Card */}
              <motion.div 
                initial={{ opacity: 0, x: 60, filter: "blur(15px)", rotateY: -10 }}
                whileInView={{ opacity: 1, x: 0, filter: "blur(0px)", rotateY: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ type: "spring", bounce: 0.3, duration: 1, delay: 0.2 }}
                className="group relative rounded-3xl border bg-slate-50 p-8 md:p-10 overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-300 transform perspective-1000"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 rounded-full blur-[80px] -z-10 group-hover:bg-indigo-200 transition-colors" />
                <div className="size-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-6 shadow-md shadow-indigo-600/20">
                  <Layers className="size-7" />
                </div>
                <h3 className="text-2xl font-bold mb-3">For Educators</h3>
                <p className="text-slate-600 mb-8 leading-relaxed">Build your digital course in minutes. Upload your existing syllabi, slide decks, and readings, then let NoteSeek's AI help you build assessments and grade submissions effortlessly.</p>
                
                <ul className="space-y-4">
                  {[
                    "Create and manage multiple courses & sections",
                    "Auto-generate quiz questions from chosen slides",
                    "Centralized grading dashboard for all submissions",
                    "Monitor student engagement and assessment scores"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="size-5 text-indigo-600 shrink-0 mt-0.5" />
                      <span className="text-slate-700 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-10">
                  <Link href="/teacher" className="inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-700">
                    Explore the Teacher tools <ArrowRight className="ml-1 size-4" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ===== HIGHLIGHT FEATURE ===== */}
        <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
           <div className="container mx-auto px-4 md:px-6 relative z-10">
              <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24 max-w-6xl mx-auto">
                 <motion.div 
                   initial={{ opacity: 0, y: 50, filter: "blur(20px)" }}
                   whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                   viewport={{ once: true }}
                   transition={{ type: "spring", bounce: 0.4, duration: 1 }}
                   className="lg:w-1/2 space-y-6"
                 >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-300 font-medium text-sm backdrop-blur-md border border-white/10">
                      <Bot className="size-4" /> The magic of Granular AI
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold leading-tight">Generate from exactly what matters.</h2>
                    <p className="text-slate-300 text-lg leading-relaxed">
                      Don't summarize the entire textbook. With NoteSeek's Context Selection interface, you can select specific files, pages, or even individual slides to generate the perfect, hyper-focused study guide or quiz.
                    </p>
                    <ul className="space-y-3 pt-4 border-t border-white/10">
                      <li className="flex items-center gap-3 text-slate-200"><Sparkles className="size-5 text-blue-400"/> Context-aware algorithms</li>
                      <li className="flex items-center gap-3 text-slate-200"><Sparkles className="size-5 text-purple-400"/> Multiple file merging</li>
                      <li className="flex items-center gap-3 text-slate-200"><Sparkles className="size-5 text-pink-400"/> Custom prompting</li>
                    </ul>
                 </motion.div>
                 
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.8, rotateX: 30, rotateY: -20, filter: "blur(20px)", z: -500 }}
                   whileInView={{ opacity: 1, scale: 1, rotateX: 5, rotateY: -5, filter: "blur(0px)", z: 0 }}
                   viewport={{ once: true }}
                   transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.3 }}
                   className="lg:w-1/2 w-full perspective-1000 transform-style-3d hover:rotate-3d transition-all duration-700 hover:scale-105"
                 >
                    {/* Mock UI Frame */}
                    <div className="rounded-2xl border border-white/10 bg-slate-800/50 backdrop-blur-xl p-2 shadow-2xl">
                       <div className="rounded-xl border border-white/5 bg-slate-950/80 p-6">
                          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/10">
                            <div className="size-3 rounded-full bg-red-500"></div>
                            <div className="size-3 rounded-full bg-amber-500"></div>
                            <div className="size-3 rounded-full bg-green-500"></div>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="h-6 w-3/4 bg-white/10 rounded-md animate-pulse"></div>
                            <div className="h-4 w-full bg-white/5 rounded-md animate-pulse animation-delay-150"></div>
                            <div className="h-4 w-5/6 bg-white/5 rounded-md animate-pulse animation-delay-300"></div>
                            
                            <div className="mt-8 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                              <div className="flex items-center justify-between">
                                <span className="text-blue-200 font-medium text-sm">Target Scope: Pages 12-14</span>
                                <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-md">Generate Quiz</Button>
                              </div>
                            </div>
                          </div>
                       </div>
                    </div>
                 </motion.div>
              </div>
           </div>
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="bg-white border-t py-12 text-center text-slate-500">
        <div className="container mx-auto px-4 flex flex-col items-center">
          <div className="flex items-center gap-2.5 mb-6 text-slate-900">
            <BookOpen className="size-6 text-primary" />
            <span className="font-bold text-xl tracking-tight">NoteSeek</span>
          </div>
          <p className="max-w-md mx-auto text-sm mb-8">
            The next-generation platform bridging the gap between educators and students with the power of artificial intelligence.
          </p>
          <div className="flex gap-6 text-sm font-medium">
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-primary transition-colors">Contact Support</Link>
          </div>
          <p className="mt-12 text-xs opacity-60">© {new Date().getFullYear()} NoteSeek Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
