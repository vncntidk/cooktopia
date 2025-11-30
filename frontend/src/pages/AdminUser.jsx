import React, { useState, useEffect, useRef } from "react";
import SidebarLogoAdmin from "../components/SidebarLogoAdmin";
import SearchBarUser from "../components/SearchBarUser";

export default function AdminUser() {
  const [searchQuery, setSearchQuery] = useState("");

  const inputRef = useRef(null);


  const users = [
    { username: "chef_maria", email: "maria.santos@gmail.com", posts: 24, created: "01/15/2024 09:30 AM", avatar: "https://i.pravatar.cc/150?img=1" },
    { username: "john_foodie", email: "john.doe@yahoo.com", posts: 7, created: "03/22/2024 02:15 PM", avatar: "https://i.pravatar.cc/150?img=12" },
    { username: "sarah_cooks", email: "sarah.lee@outlook.com", posts: 32, created: "05/08/2024 11:45 AM", avatar: "https://i.pravatar.cc/150?img=5" },
    { username: "mike_baker", email: "mike.brown@gmail.com", posts: 15, created: "07/12/2024 04:20 PM", avatar: "https://i.pravatar.cc/150?img=33" },
    { username: "anna_recipes", email: "anna.garcia@hotmail.com", posts: 41, created: "02/10/2024 10:00 AM", avatar: "https://i.pravatar.cc/150?img=47" },
    { username: "david_meals", email: "david.kim@gmail.com", posts: 18, created: "09/30/2024 08:00 AM", avatar: "https://i.pravatar.cc/150?img=68" },
  ];

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

    useEffect(() => {
    if (!inputRef.current) {
      inputRef.current = document.querySelector("input[placeholder='Search recipe, profile, and more']");
    }

    if (inputRef.current) {
      inputRef.current.addEventListener("input", (e) => {
        setSearchQuery(e.target.value);
      });
    }
  }, []);

  return (
    <div className="w-full h-screen flex bg-gray-50">
      <SidebarLogoAdmin />


      <div className="flex-1 ml-0 lg:ml-48 flex flex-col h-screen min-w-0 ">
        {/* SEARCH BAR */}
          <div className="self-stretch flex justify-center items-center mt-8 sm:mt-12 md:mt-16" style={{ paddingTop: '20px'}}>
            <SearchBarUser />
          </div>

        <main className="flex-1 overflow-y-auto w-full max-w-full overflow-x-auto" style={{ paddingTop: '20px', paddingRight: '20px'}}>
          <div className="w-full px-3 sm:px-5 md:px-6 lg:px-8 flex flex-col justify-start gap-6 sm:gap-8 md:gap-10 py-4 sm:py-6">

            <div className="self-stretch px-3 sm:px-7 inline-flex flex-col justify-start mt-12 sm:mt-16">
              {/* TABLE HEADER */}
              <div className="self-stretch h-12 sm:h-16 justify-start items-center gap-3 sm:gap-3.5" style={{ paddingLeft: '20px' }}>
                <div className="flex items-center gap-3 font-semibold text-black px-5">
                  <div className="w-10 sm:w-12 flex-shrink-0"></div>
                  <div className="flex-1 min-w-[120px] text-center text-black text-sm sm:text-base md:text-lg font-normal font-['Poppins']">Username</div>
                  <div className="flex-1 min-w-[200px] text-center text-black text-sm sm:text-base md:text-lg font-normal font-['Poppins']">Email</div>
                  <div className="flex-1 min-w-[150px] text-center text-black text-sm sm:text-base md:text-lg font-normal font-['Poppins']">Number of Posts</div>
                  <div className="flex-1 min-w-[180px] text-center text-black text-sm sm:text-base md:text-lg font-normal font-['Poppins']">Account Created</div>
                </div>
              </div>

              {/* USER LIST */}
              <div className="self-stretch flex flex-col justify-start gap-1" style={{ paddingLeft: '20px' }}>

                {/* No result found */}
                {filteredUsers.length === 0 && (
                  <div className="text-center text-gray-500 text-lg py-6">
                    No matching result
                  </div>
                )}

                {filteredUsers.map((user, index) => (
                  <div
                    key={index}
                    className={`
                      inline-flex items-center gap-3 px-5
                      ${index % 2 === 0 ? "bg-[#DFF1EB]" : ""}
                      hover:bg-[#c9edd3] transition
                    `}
                  >
                    <img
                      className="w-12 h-12 rounded-full object-cover ml-2"
                      src={user.avatar}
                      alt="User avatar"
                    />
                    <div className="flex-1 text-center min-w-[120px] p-2.5 text-sm sm:text-base font-normal font-['Poppins']">{user.username}</div>
                    <div className="flex-1 text-center min-w-[200px] p-2.5 text-sm sm:text-base font-normal font-['Poppins'] underline">
                      {user.email}
                    </div>
                    <div className="flex-1 text-center min-w-[150px] p-2.5 text-sm sm:text-base font-normal font-['Poppins']">{user.posts}</div>
                    <div className="flex-1 text-center min-w-[180px] p-2.5 text-xs sm:text-sm font-medium font-['Poppins']">
                      {user.created}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
