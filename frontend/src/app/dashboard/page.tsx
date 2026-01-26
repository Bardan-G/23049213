"use client";

import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Dsshboard() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }
      try {
        //Sending the token to authorize header
        const response = await api.get("/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (error) {
        localStorage.removeItem("token");
        router.push("/auth/login");
      }
    };
    fetchProfile();
  }, [router]);
  if (!user) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="">
      <h1 className="">Welcome,{user.email}!</h1>
      <p className="">Sucessfully enter using jwt token</p>
      <button
        onClick={() => {
          localStorage.removeItem("token");
          router.push("/auth/login");
        }}
        className="mt-6 bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}
