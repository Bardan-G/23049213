'use client';

import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage(){
    const [email,setEmail]= useState('');
    const [password,setPassword]=useState('');
    const [name,setName]=useState('');
    const router = useRouter();


    const handleRegister = async (e: React.FormEvent)=>{
        e.preventDefault();
        try{
            await api.post('auth/register',{email,password,name});
            alert('Register Sucessfully Please Login');
            router.push('/login');
        }catch(error:any){
            alert(error.response?.data?.message || 'Registeration Failed');
        }
    }

    return(
        <div className="flex min-h-screen justify-center items-center bg-gray-400">
            <form onSubmit={handleRegister} className="p-8 bg-white shadow-lg rounded-lg w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create Account</h2>
                <input type="text" placeholder="Full Name" className="w-full p-3 border rounded mb-4 text-black" onChange={(e)=>setName(e.target.value)} />
                <input type="text" placeholder="Email" className="w-full p-3 border rounded mb-4 text-black" onChange={(e)=>setEmail(e.target.value)} />
                <input type="text" placeholder="Password" className="w-full p-3 border rounded mb-6 text-black" onChange={(e)=>setPassword(e.target.value)} />
                 <button className="w-full bg-blue-600 text-white p-3 rounded  font-semibold hover:bg-blue-700 transition" type="submit">Register</button>

            </form>


        </div>
    )
}