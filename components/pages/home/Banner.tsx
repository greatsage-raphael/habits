import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const Banner = () => {
  return (
    <>
      <main className="flex flex-col items-center justify-center w-full relative overflow-hidden">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Track Your Habits, Transform Your Life
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-700 md:text-xl">
                  Build lasting habits with our 52-week habit tracker. Simple, beautiful, and effective.
                </p>
              </div>
              <div className="space-x-4">
                <Button className="bg-[#8B4513] hover:bg-[#654321]">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline">Learn More</Button>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 bg-[#efcd9b] rounded-full">
                  <CheckCircle className="h-6 w-6 text-[#8B4513]" />
                </div>
                <h2 className="text-xl font-bold">Easy Tracking</h2>
                <p className="text-gray-700">Simple daily check-ins to keep you accountable and motivated.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 bg-[#efcd9b] rounded-full">
                  <Calendar className="h-6 w-6 text-[#8B4513]" />
                </div>
                <h2 className="text-xl font-bold">52 Week View</h2>
                <p className="text-gray-700">See your progress over the entire year at a glance.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 bg-[#efcd9b] rounded-full">
                  <TrendingUp className="h-6 w-6 text-[#8B4513]" />
                </div>
                <h2 className="text-xl font-bold">Progress Insights</h2>
                <p className="text-gray-700">Track your success and identify areas for improvement.</p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 lg:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Your Habits, Your Way</h2>
                <p className="text-gray-700 md:text-lg">
                  Customize your habit tracking with categories that matter to you. From health and fitness to reading and
                  productivity, make your journey unique.
                </p>
                <ul className="grid gap-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[#8B4513]" /> Track multiple habits simultaneously
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[#8B4513]" /> Daily, weekly, and monthly views
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[#8B4513]" /> Detailed progress analytics
                  </li>
                </ul>
              </div>
              <div className="rounded-lg border bg-white p-6 shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-[#8B4513]">52 Week Habit Tracker</h3>
                    <Button variant="ghost" size="icon">
                      <Clock className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid gap-2">
                    {["WATER", "WORKOUT", "READ", "WRITING"].map((habit) => (
                      <div
                        key={habit}
                        className="flex items-center justify-between p-2 rounded"
                        style={{ backgroundColor: `${habit === "WATER" ? "#e6f7ff" : "#f5f5f5"}` }}
                      >
                        <span>{habit}</span>
                        <div className="flex gap-2">
                          {[...Array(7)].map((_, i) => (
                            <div
                              key={i}
                              className="w-6 h-6 rounded-full border-2 border-[#8B4513]"
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      {/* background gradient */}
      <div className="absolute bottom-0 left-0 right-0 top-0 z-[-1] hidden h-full w-full grid-cols-3 md:grid">
        <BackgroundGradient />
        <BackgroundGradient />
        <BackgroundGradient />
      </div>
    </>
  );
};


function BackgroundGradient() {
  return (
    <div
      className="h-64 w-full rounded-lg"
      style={{
        opacity: '0.8',
        background:
          'radial-gradient(54.14% 54.14% at 50% 50%, #efcd9b 0%, rgba(103, 2, 139, 0.02) 100%)',
        filter: 'blur(120px)',
      }}
    />
  );
}

export default Banner;