import { useState } from "react";
import {
  Bell,
  Search,
  UserCircle,
  LogOut,
  User
} from "lucide-react";

export default function Navbar() {

  const username =
    localStorage.getItem("username") || "Guest";

  const [open,setOpen]=useState(false);

  const logout=()=>{

    localStorage.removeItem("token");
    localStorage.removeItem("username");

    window.location.href="/login";

  };

  return (

<header className="h-20 bg-slate-950 border-b border-slate-800 px-8 flex justify-between items-center">

<div>

<h2 className="text-2xl font-bold">
Dashboard
</h2>

<p className="text-slate-400">
Drone Image Reconstruction
</p>

</div>

<div className="flex items-center gap-5">

<div className="relative">

<Search
size={18}
className="absolute left-3 top-3 text-slate-400"
/>

<input
placeholder="Search Project..."
className="bg-slate-900 border border-slate-700 rounded-xl pl-10 py-2 pr-4"
/>

</div>

<div className="relative">

<Bell
className="cursor-pointer hover:text-cyan-400"
/>

<span
className="absolute -top-2 -right-2 bg-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center"
>
3
</span>

</div>

<div className="relative">

<UserCircle
size={36}
className="cursor-pointer hover:text-cyan-400"
onClick={()=>setOpen(!open)}
/>

{open && (

<div className="absolute right-0 mt-3 w-52 bg-slate-900 rounded-xl border border-slate-700 shadow-lg">

<div className="px-4 py-3 border-b border-slate-700">

<p className="font-semibold">

{username}

</p>

<p className="text-xs text-slate-400">

Logged In

</p>

</div>

<button
className="flex items-center gap-2 w-full px-4 py-3 hover:bg-slate-800"
>

<User size={18}/>

Profile

</button>

<button
onClick={logout}
className="flex items-center gap-2 w-full px-4 py-3 hover:bg-red-600"
>

<LogOut size={18}/>

Logout

</button>

</div>

)}

</div>

</div>

</header>

  );

}