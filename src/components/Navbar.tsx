'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="border-b border-[#2a2a2a] bg-[#1a1a1a]/80 backdrop-blur-sm fixed w-full z-10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center"
          >
            <Link href="/" className="text-2xl font-bold text-blue-500">
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