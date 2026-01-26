"use client";

import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post("auth/login", { email, password });

      //Saving token to LocalStorage
      localStorage.setItem("token", response.data.access_token);

      alert("Login Sucessfully");
      router.push("/dashboard");
    } catch (error: any) {
      alert(error.response?.data?.message || "Login Failed");
    }
  };

  return(
    <div className="flex min-h-screen justify-center items-center bg-gray-600">
        <form onSubmit={handleLogin}  className="p-8 bg-white shadow-lg rounded-lg w-96">
            <h2 className="text-2xl font-bold m-6 text-center text-gray-800">Login</h2>
            <input type="email" placeholder="Email" required className="w-full p-3 border rounded mb-4 text-black" onChange={(e)=>setEmail(e.target.value)} />
            <input type="password" placeholder="Password" required className="w-full p-3 border rounded mb-6 text-black" onChange={(e)=>setPassword(e.target.value)} />
            <button type="submit" className="w-full bg-blue-800 text-white p-3 rounded font-semibold hover:bg-blue-900 transition">Login</button>
        </form>
    </div>
  )
}
