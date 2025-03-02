import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { UserButton, useUser } from "@clerk/clerk-react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Header() {
  const { user, isSignedIn } = useUser();
  const [username, setUsername] = useState(user?.username);

  // Detect username changes
  useEffect(() => {
    if (user?.username !== username) {
      console.log("Username changed to:", user?.username);
      //change the username in the backend here
      setUsername(user?.username);
      // sendUsernameToBackend(user?.username);
    }
  }, [user?.username]);

  // Function to send data to backend
  // const sendUsernameToBackend = async (newUsername) => {
  //   try {
  //     await fetch("https://your-backend.com/api/update-username", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ username: newUsername }),
  //     });
  //     console.log("Username update sent to backend");
  //   } catch (error) {
  //     console.error("Error updating username:", error);
  //   }
  // };

  return (
    <div className="p-[45px] px-10 flex justify-between items-center shadow-md bg-white h-16">
      {/* Logo */}
      <Link to="/">
        <img
          src="../src/assets/Intellidocs.svg"
          width={145}
          height={145}
          alt="Logo"
          className="hover:opacity-80 transition-opacity"
        />
      </Link>

      {/* Search Bar (Only on Homepage) */}
      {window.location.pathname === "/" && (
        <div className="relative w-[500px]">
          <Search className="absolute left-3 top-2.5 text-gray-400" />
          <Input type="text" placeholder="Search Here" className="pl-10 rounded-full w-full focus:outline-none" />
        </div>
      )}

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {isSignedIn ? (
          <div className="flex gap-3 items-center">
            <div className="flex flex-col items-end">
              <span className="font-base text-gray-900">{username}</span>
              <span className="font-base text-gray-500">{user?.primaryEmailAddress?.emailAddress}</span>
            </div>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-12 w-12", // Adjust height & width
                  userButtonBox: "h-12 w-12", // Adjust container size
                },
              }}
            />
          </div>
        ) : (
          <Link to="/auth/login">
            <Button className="hover:bg-blue-600 transition">Get Started</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
