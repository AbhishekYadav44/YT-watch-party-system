"use client"

import { UserRound } from "lucide-react";
import Link from "next/link";
import { FaYoutube } from "react-icons/fa";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();

  const [joinCode, setJoinCode] = useState("");
  const [isLoggedin, setisLoggedin] = useState(false);

  const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL

  useEffect(() => {

    const token = localStorage.getItem("token");

    if (token) {
      setisLoggedin(true);
    } else {
      setisLoggedin(false);
    }

  }, []);

  const logouthandler = () => {

    localStorage.removeItem("token");
    setisLoggedin(false);
    router.push("/");

  };



  const handleNewMeeting = async () => {

    try {

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/signin");
        return;
      }

      const res = await axios.post(
        `${backend_url}/room/create`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const roomId = res.data.roomId;

      router.push(`/room/${roomId}`);

    } catch (err) {

      //@ts-ignore
      console.log(err.response?.data);

      console.error("Failed to create meeting", err);
    }
  };

  const handleJoinMeeting = () => {

    if (!joinCode) {
      return alert("Please enter a valid meeting code");
    }

    router.push(`/room/${joinCode}`);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0">
        <img
          src="/bg.png"
          alt="Watch Party background"
          className="h-full w-full object-cover opacity-60"
        />
      </div>

      <div className="absolute inset-0 bg-black/40" />

      <nav className="relative z-20 flex items-center justify-between px-6 py-5 md:px-10">

        <div className="flex items-center gap-2 font-serif text-2xl font-bold">
          <FaYoutube size={34} className="text-red-600" />
          <span>PARTY</span>
        </div>

        <div className="flex font-sans items-center gap-6">
          <Link href="#about" className="transition hover:text-red-400">
            About
          </Link>


          {isLoggedin ? (
            <button
              onClick={logouthandler}
              className="rounded-lg font-sans bg-red-600 px-5 py-2 transition hover:bg-red-500"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/signin"
              className="rounded-lg font-sans bg-red-600 px-5 py-2 transition hover:bg-red-500"
            >
              Let's Join
            </Link>
          )}

        </div>
      </nav>

      <section className="relative z-10 flex min-h-[85vh] flex-col items-center justify-center px-5 text-center">


        <motion.span
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-6 flex items-center gap-3 rounded-full border border-white/20 px-4 py-2 font-serif text-md text-gray-200"
        >
          <UserRound size={16} className="text-red-600" />
          Different Places. One Shared Moment.
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="max-w-6xl font-serif text-5xl font-extrabold sm:text-6xl md:text-7xl lg:text-8xl"
        >
          Watch <span className="text-red-700">YouTube</span>
          <br />
          <span className="bg-clip-text text-transparent text-white">
            From Anywhere
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-6 max-w-2xl font-serif text-base leading-7 text-amber-50 md:text-lg"
        >
          Watch YouTube videos with your friends in real time.
          Create a room, invite your friends, and enjoy every moment together.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-8 flex flex-col gap-4 sm:flex-row"
        >
          <button onClick={handleNewMeeting} className="rounded-xl bg-red-600 px-8 py-3 font-semibold transition hover:scale-105 hover:bg-red-500">
            Create Room
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">

            <input
              type="text"
              placeholder="Enter meeting code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleJoinMeeting();
              }}
              className="px-4 py-3 rounded-xl border border-white/20 bg-black/60 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 w-full sm:w-52 text-sm"
            />

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleJoinMeeting}
              className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-500 w-full sm:w-auto text-sm"
            >
              Join
            </motion.button>

          </div>
        

        </motion.div>

      </section>
    </main >
  );
}
