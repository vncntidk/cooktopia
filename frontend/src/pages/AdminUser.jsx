import React, { useState, useEffect, useRef } from "react";
import SidebarLogoAdmin from "../components/SidebarLogoAdmin";
import SearchBarUser from "../components/SearchBarUser";
import { getAllUsers, getUserRecipeCount, deleteUser } from "../services/users";

export default function AdminUser() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);

  const inputRef = useRef(null);

  // Format Firestore timestamp to readable date
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    
    // Handle Firestore Timestamp
    if (timestamp.toDate) {
      const date = timestamp.toDate();
      return date.toLocaleString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
    
    // Handle regular Date object
    if (timestamp instanceof Date) {
      return timestamp.toLocaleString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
    
    return "N/A";
  };

  // Fetch all users and their recipe counts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all users
        const allUsers = await getAllUsers({ limit: 500, orderBy: 'createdAt', orderDirection: 'desc' });
        
        // Debug: Log first user to see what data we're getting
        if (allUsers.length > 0) {
          console.log("Sample user data from Firestore:", allUsers[0]);
          console.log("All available fields:", Object.keys(allUsers[0]));
        }
        
        // Fetch recipe count for each user in parallel
        const usersWithCounts = await Promise.all(
          allUsers.map(async (user) => {
            const recipeCount = await getUserRecipeCount(user.id);
            
            // Try multiple possible email field names
            // Note: Email might be stored in Firebase Auth, not Firestore
            const email = user.email || user.userEmail || user.authEmail || '';
            
            // Log if email is missing for debugging
            if (!email && allUsers.indexOf(user) === 0) {
              console.warn("Email not found in Firestore for user:", user.id, "Available fields:", Object.keys(user));
              console.warn("Note: Email might be stored in Firebase Auth. To fix this, ensure email is saved to Firestore during registration.");
            }
            
            return {
              ...user,
              email: email, // Ensure email is set (will be empty string if not in Firestore)
              posts: recipeCount,
              created: formatDate(user.createdAt),
              avatar: user.profileImage || "/profile.png", // Default avatar if none
            };
          })
        );
        
        setUsers(usersWithCounts);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(err.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search query
  const filteredUsers = users.filter((u) => {
    const queryLower = searchQuery.toLowerCase();
    const username = (u.username || "").toLowerCase();
    const email = (u.email || "").toLowerCase();
    return username.includes(queryLower) || email.includes(queryLower);
  });

  // Handle search input
  useEffect(() => {
    if (!inputRef.current) {
      inputRef.current = document.querySelector("input[placeholder='Search recipe, profile, and more']");
    }

    if (inputRef.current) {
      const handleInput = (e) => {
        setSearchQuery(e.target.value);
      };
      
      inputRef.current.addEventListener("input", handleInput);
      
      return () => {
        if (inputRef.current) {
          inputRef.current.removeEventListener("input", handleInput);
        }
      };
    }
  }, []);

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      setDeletingUserId(userId);
      await deleteUser(userId);
      // Remove user from local state
      setUsers(users.filter((u) => u.id !== userId));
      alert("User deleted successfully");
    } catch (err) {
      console.error("Error deleting user:", err);
      alert(`Failed to delete user: ${err.message}`);
    } finally {
      setDeletingUserId(null);
    }
  };

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
        <div className="self-stretch h-10 sm:h-12 justify-start items-center gap-3 sm:gap-3.5"> 
            <div className="flex items-center gap-3 font-semibold text-black px-5"style={{marginLeft:20}}>
                <div className="w-10 sm:w-12 flex-shrink-0"></div>
                {/* REDUCED TEXT SIZE: Max text size is now 'base' */}
                <div className="flex-1 min-w-[120px] text-center text-black text-xs sm:text-sm md:text-base font-normal font-['Poppins']">Username</div>
                <div className="flex-1 min-w-[200px] text-center text-black text-xs sm:text-sm md:text-base font-normal font-['Poppins']">Email</div>
                <div className="flex-1 min-w-[150px] text-center text-black text-xs sm:text-sm md:text-base font-normal font-['Poppins']">Number of Posts</div>
                <div
          className="flex-1 min-w-[120px] text-black text-xs sm:text-sm md:text-base font-normal font-['Poppins']"
        >
            Account Created
        </div>

    </div>
</div>
              {/* USER LIST */}
              <div className="self-stretch flex flex-col justify-start gap-1" style={{ paddingLeft: '20px' }}>
                {/* Loading State */}
                {loading && (
                  <div className="text-center text-gray-500 text-lg py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
                    Loading users...
                  </div>
                )}

                {/* Error State */}
                {error && !loading && (
                  <div className="text-center text-red-500 text-lg py-6">
                    Error: {error}
                    <button
                      onClick={() => window.location.reload()}
                      className="ml-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {/* No result found */}
                {!loading && !error && filteredUsers.length === 0 && (
                  <div className="text-center text-gray-500 text-lg py-6">
                    {searchQuery ? "No matching result" : "No users found"}
                  </div>
                )}

                {/* Users List */}
                {!loading && !error && filteredUsers.map((user, index) => (
                  <div
                    key={user.id}
                    className={`
                      inline-flex items-center gap-3 px-5
                      ${index % 2 === 0 ? "bg-[#DFF1EB]" : ""}
                      hover:bg-[#c9edd3] transition
                    `}
                  >
                    <img
                      className="w-12 h-12 rounded-full object-cover ml-2"
                      src={user.avatar}
                      alt={`${user.username} avatar`}
                      onError={(e) => {
                        e.target.src = "/profile.png";
                      }}
                    />
                    <div className="flex-1 text-center min-w-[120px] p-2.5 text-sm sm:text-base font-normal font-['Poppins']">
                      {user.username || "N/A"}
                    </div>
                    <div className="flex-1 text-center min-w-[200px] p-2.5 text-sm sm:text-base font-normal font-['Poppins'] underline">
                      {user.email || "N/A"}
                    </div>
                    <div className="flex-1 text-center min-w-[150px] p-2.5 text-sm sm:text-base font-normal font-['Poppins']">
                      {user.posts || 0}
                    </div>
                    <div className="flex-1 text-center min-w-[180px] p-2.5 text-xs sm:text-sm font-medium font-['Poppins']">
                      {user.created || "N/A"}
                    </div>
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={deletingUserId === user.id}
                      className="ml-2 px-3 py-1 text-xs bg-red-400 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed w-15"style={{marginRight: 10}}
                      title="Delete user"
                    >
                      {deletingUserId === user.id ? "Deleting..." : "Delete"}
                    </button>
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
