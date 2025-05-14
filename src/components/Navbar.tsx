'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f0f]/80 backdrop-blur-sm border-b border-[#2a2a2a]"
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/" className="text-xl font-medium text-white">
              FinTrack
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center space-x-4"
          >
            {session ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="text-neutral-400 hover:text-neutral-200 transition-all duration-200 hover:scale-105"
                >
                  Dashboard
                </Link>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-lg"
                >
                  Logout
                </motion.button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-neutral-400 hover:text-neutral-200 transition-all duration-200 hover:scale-105"
                >
                  Login
                </Link>
                <Link 
                  href="/signup" 
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg"
                >
                  Sign Up
                </Link>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
} 