import React, { useState, useEffect } from "react";
import SidebarLogoAdmin from "../components/SidebarLogoAdmin";
import { User } from "lucide-react";
import { db } from "../config/firebase-config";
import { collection, onSnapshot, query, where } from "firebase/firestore";

export default function AdminDashboard() {
  const [topCreators, setTopCreators] = useState([]);
  const [loadingCreators, setLoadingCreators] = useState(true);
  const [topRecipes, setTopRecipes] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [siteVisits, setSiteVisits] = useState(0);
  const [newUsers, setNewUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [recipesPosted, setRecipesPosted] = useState(0);

  useEffect(() => {
    const unsubscribeUsers = onSnapshot(
      collection(db, "users"),
      (usersSnapshot) => {
        try {
          setLoadingCreators(true);
          const usersMap = new Map();

          // Build user map with basic info
          for (const userDoc of usersSnapshot.docs) {
            const userData = userDoc.data();
            usersMap.set(userDoc.id, {
              uid: userDoc.id,
              displayName: userData.displayName || "Unknown User",
              profileImage: userData.profileImage || "https://placehold.co/65x62",
              followerCount: 0,
            });
          }

          // Listen to follows collection to count followers
          const unsubscribeFollows = onSnapshot(
            collection(db, "follows"),
            (followsSnapshot) => {
              // Reset counts
              usersMap.forEach((user) => {
                user.followerCount = 0;
              });

              // Count followers by followingId
              followsSnapshot.docs.forEach((doc) => {
                const data = doc.data();
                const followingId = data.followingId;
                if (usersMap.has(followingId)) {
                  usersMap.get(followingId).followerCount++;
                }
              });

              // Sort by follower count and take top 10
              const topTen = Array.from(usersMap.values())
                .sort((a, b) => b.followerCount - a.followerCount)
                .slice(0, 10);

              setTopCreators(topTen);
              setLoadingCreators(false);
            },
            (error) => {
              console.error("Error listening to follows:", error);
              setLoadingCreators(false);
            }
          );

          return () => unsubscribeFollows();
        } catch (error) {
          console.error("Error fetching top creators:", error);
          setLoadingCreators(false);
        }
      },
      (error) => {
        console.error("Error listening to users:", error);
      }
    );

    return () => unsubscribeUsers();
  }, []);

  useEffect(() => {
    const unsubscribeRecipes = onSnapshot(
      collection(db, "recipes"),
      (recipesSnapshot) => {
        try {
          setLoadingRecipes(true);
          const recipesArray = [];

          for (const recipeDoc of recipesSnapshot.docs) {
            const recipeData = recipeDoc.data();
            recipesArray.push({
              id: recipeDoc.id,
              title: recipeData.title || "Untitled Recipe",
              imageUrl: recipeData.imageUrls && recipeData.imageUrls.length > 0 
                ? recipeData.imageUrls[0] 
                : "https://placehold.co/400x300",
              likes: recipeData.likes || 0,
              comments: recipeData.comments || 0,
              authorName: recipeData.authorName || "Unknown Author",
              authorId: recipeData.authorId || "",
            });
          }

          // Sort by likes in descending order and take top 10
          const topTen = recipesArray
            .sort((a, b) => b.likes - a.likes)
            .slice(0, 10);

          setTopRecipes(topTen);
        } catch (error) {
          console.error("Error processing recipes snapshot:", error);
        } finally {
          setLoadingRecipes(false);
        }
      },
      (error) => {
        console.error("Error listening to recipes:", error);
      }
    );

    return () => unsubscribeRecipes();
  }, []);

  // Fetch Site Visits (unique sessions today)
  useEffect(() => {
    const unsubscribePageVisits = onSnapshot(
      collection(db, "pageVisits"),
      (snapshot) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const uniqueSessions = new Set();
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const timestamp = data.timestamp?.toDate?.() || new Date(data.timestamp);
          if (timestamp >= today && timestamp < tomorrow) {
            uniqueSessions.add(data.sessionId);
          }
        });

        setSiteVisits(uniqueSessions.size);
      },
      (error) => {
        console.error("Error listening to page visits:", error);
      }
    );

    return () => unsubscribePageVisits();
  }, []);

  // Fetch New Users (created in last 7 days)
  useEffect(() => {
    const unsubscribeNewUsers = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        let count = 0;
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const createdAt = data.createdAt?.toDate?.() || new Date(data.createdAt);
          if (createdAt >= sevenDaysAgo) {
            count++;
          }
        });

        setNewUsers(count);
      },
      (error) => {
        console.error("Error listening to new users:", error);
      }
    );

    return () => unsubscribeNewUsers();
  }, []);

  // Fetch Active Users (users with at least 1 recipe)
  useEffect(() => {
    const fetchActiveUsers = async () => {
      try {
        const unsubscribeRecipes = onSnapshot(
          collection(db, "recipes"),
          (snapshot) => {
            const uniqueAuthors = new Set();
            snapshot.docs.forEach((doc) => {
              const data = doc.data();
              if (data.authorId) {
                uniqueAuthors.add(data.authorId);
              }
            });
            setActiveUsers(uniqueAuthors.size);
          },
          (error) => {
            console.error("Error listening to active users:", error);
          }
        );

        return () => unsubscribeRecipes();
      } catch (error) {
        console.error("Error fetching active users:", error);
      }
    };

    fetchActiveUsers();
  }, []);

  // Fetch Total Recipes Posted
  useEffect(() => {
    const unsubscribeRecipesCount = onSnapshot(
      collection(db, "recipes"),
      (snapshot) => {
        setRecipesPosted(snapshot.size);
      },
      (error) => {
        console.error("Error listening to recipes count:", error);
      }
    );

    return () => unsubscribeRecipesCount();
  }, []);

  return (
    <div className="w-full min-h-screen flex bg-gray-50">
      {/* Admin Sidebar - Assumes it uses lg:w-60 */}
      <SidebarLogoAdmin />

      {/* Main Content Area */}
      {/* We use ml-60 on lg screens to push the content over the sidebar */}
      <div className="flex-1 lg:ml-60 flex flex-col h-screen min-w-0 p-4 lg:p-6 overflow-hidden">
        <main className="flex-1 overflow-y-auto w-full max-w-full overflow-x-hidden min-h-0">
          <div className="w-full inline-flex flex-col justify-start items-start gap-6 sm:gap-8 md:gap-10 py-2 sm:py-4">
            
            {/* ---------------------------------- ROW 1: SITE STATS ---------------------------------- */}
            <div className="self-stretch flex flex-col justify-start items-start gap-4 sm:gap-6" style={{marginLeft: '20px', marginTop: '20px', marginRight: '20px'}}>
              
              {/* Site Stats Box + Stat Cards Row - Now a single responsive flex container */}
              <div className="w-full flex flex-col lg:flex-row justify-start items-stretch gap-4 sm:gap-6">
                
                {/* 1. Site Stats Title Box (Fixed Width/Height) - Main Green Block */}
                {/* Height adjusted for better proportionality across screen sizes */}
                <div className="w-full h-32 lg:w-48 lg:h-auto bg-[#6BC4A6]/100 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <div className="flex flex-col items-center justify-center text-center text-zinc-100 text-3xl md:text-5xl font-bold font-['Poppins'] px-2">
                    <div>Site</div>
                    <div>Metrics</div>
                  </div>
                </div>

                {/* 2. Stat Cards Wrapper - Responsive Grid enforced here for equal spacing */}
                {/* Padding and gap adjusted for cleaner look */}
                <div className="flex-1 p-3 sm:p-4 bg-[#6BC4A6]/40 rounded-2xl shadow-inner min-h-[160px] md:min-h-[180px]">
                  
                  {/* Cards container: Uniform grid for optimal spacing and responsiveness */}
                  <div className="w-full h-full grid grid-cols-2 lg:grid-cols-4 gap-4" style={{padding: '10px'}}>
                    
                    {/*
                      Stat Card Template Refactored:
                      - The grid cell itself is now a flex container (applied via parent div below).
                      - The inner white card now has a fixed height (h-32) and uses flex properties (justify-self-center, self-center) to center itself within the cell, preventing it from stretching.
                    */}
                    
                    {/* Stat Card 1: Site Visits */}
                    <div 
                      className="flex items-center justify-center" // Centering wrapper for the card
                    >
                      <div 
                        data-property-1="Visit Count" 
                        className="h-32 w-full max-w-xs bg-white rounded-4xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 flex flex-col items-center justify-center text-center"
                      >
                      <img 
                        src="/icons/siteVisits.png" // Replace with the actual image path
                        alt="Site Visits Icon"
                        className="w-6 h-6 flex-shrink-0 mb-2 object-contain" style={{marginBottom: '15px'}} // Retaining size and margin
                      />
                        {/* Stat number in the middle */}
                        <div className="text-4xl font-bold text-black font-['Poppins']"style={{marginBottom: '10px'}} >
                          {siteVisits.toLocaleString()}
                        </div>
                        
                        {/* Title/label at the bottom */}
                        <div className="text-sm font-bold text-[#6BC4A6] mt-1 font-['Plus_Jakarta_Sans']">
                          Site Visits
                        </div>
                      </div>
                    </div>

                    {/* Stat Card 2: New Users */}
                    <div 
                      className="flex items-center justify-center" // Centering wrapper for the card
                    >
                      <div 
                        data-property-1="New Users Count" 
                        className="h-32 w-full max-w-xs bg-white rounded-4xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 flex flex-col items-center justify-center text-center"
                      >
                        <img 
                        src="/icons/newUsers.png" // Replace with the actual image path
                        alt="New Users Icon"
                        className="w-7 h-7 flex-shrink-0 mb-2 object-contain"  style={{marginBottom: '15px'}}// Retaining size and margin
                      />
                        
                        {/* Stat number in the middle */}
                        <div className="text-4xl font-bold text-black font-['Poppins']"style={{marginBottom: '10px'}} >
                          {newUsers.toLocaleString()}
                        </div>
                        
                        {/* Title/label at the bottom */}
                        <div className="text-sm font-bold text-[#6BC4A6] mt-1 font-['Plus_Jakarta_Sans']">
                          New Users
                        </div>
                      </div>
                    </div>

                    {/* Stat Card 3: Active Users */}
                    <div 
                      className="flex items-center justify-center" // Centering wrapper for the card
                    >
                      <div 
                        data-property-1="Active Users Count" 
                        className="h-32 w-full max-w-xs bg-white rounded-4xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 flex flex-col items-center justify-center text-center"
                      >
                        <img 
                        src="/icons/activeUsers.png" // Replace with the actual image path
                        alt="Active Users Icon"
                        className="w-7 h-7 flex-shrink-0 mb-2 object-contain"  style={{marginBottom: '15px'}}// Retaining size and margin
                      />
                        
                        {/* Stat number in the middle */}
                        <div className="text-4xl font-bold text-black font-['Poppins']"style={{marginBottom: '10px'}} >
                          {activeUsers.toLocaleString()}
                        </div>
                        
                        {/* Title/label at the bottom */}
                        <div className="text-sm font-bold text-[#6BC4A6] mt-1 font-['Plus_Jakarta_Sans']">
                          Active Users
                        </div>
                      </div>
                    </div>

                    {/* Stat Card 4: Recipes Posted */}
                    <div 
                      className="flex items-center justify-center" // Centering wrapper for the card
                    >
                      <div 
                        data-property-1="Recipe Count" 
                        className="h-32 w-full max-w-xs bg-white rounded-4xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 flex flex-col items-center justify-center text-center"
                      >
                        {/* Icon/Logo at the top center */}
                        <img 
                        src="/icons/recipesPosted.png" // Replace with the actual image path
                        alt="Recipes Posted Icon"
                        className="w-7 h-7 flex-shrink-0 mb-2 object-contain"  style={{marginBottom: '15px'}}// Retaining size and margin
                      />            
                        {/* Stat number in the middle */}
                        <div className="text-4xl font-bold text-black font-['Poppins']"style={{marginBottom: '10px'}} >
                          {recipesPosted.toLocaleString()}
                        </div>
                        
                        {/* Title/label at the bottom */}
                        <div className="text-sm font-bold text-[#6BC4A6] mt-1 font-['Plus_Jakarta_Sans']">
                          Recipes Posted
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>
            
               {/* ---------------------------------- ROW 2: RECIPES & USERS SPLIT ---------------------------------- */}
               <div className="self-stretch flex flex-col lg:flex-row justify-start items-start gap-6 sm:gap-8" style={{marginLeft: '20px'}}>
              
              {/* LEFT: Top Recipes (Main Content Area) - Flex-1 ensures it takes all available space */}
              {/* Restored original recipe container gradient */}
              <div className="w-full lg:w-72 h-full lg:flex-1 p-4 bg-gradient-to-l from-[#FFE8CD] to-[#6BC4A6] rounded-2xl shadow-xl flex flex-col gap-6">
                <h2 className="text-center text-4xl font-bold text-black font-['Poppins'] pb-2"style={{marginTop: '20px'}}>Top Performing Recipes</h2>
                
                {/* Recipes Grid - Exactly 5 columns per row on large screens */}
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-4"
                  style={{ marginLeft: '10px', marginRight: '10px', marginBottom: '10px' }}
                >
                   {loadingRecipes ? (
                    <div className="col-span-full text-center text-black py-4">Loading recipes...</div>
                  ) : topRecipes.length === 0 ? (
                    <div className="col-span-full text-center text-black py-4">No recipes found</div>
                  ) : (
                    topRecipes.map((recipe) => (
                      <div
                        key={recipe.id}
                        className="flex flex-col bg-white p-3 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 hover:scale-[1.02] min-h-[260px]"
                      >
                       <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100">
                          <img className="w-full h-full object-cover" src={recipe.imageUrl} />
                          
                        </div>
                        <div className="text-center text-black text-[15px] s:text-base font-bold font-['Plus_Jakarta_Sans'] truncate px-4" style={{ paddingLeft: '8px', paddingRight: '8px'}}>
                          {recipe.title}
                        </div>
                        <div className="text-center text-zinc-500 text-xs font-medium font-['Poppins']">
                          {recipe.likes.toLocaleString()} likes • {recipe.comments.toLocaleString()} comments
                        </div>
                        <div className="w-full flex justify-center items-center gap-1.5 mt-auto">
                          <User className="w-4 h-4 text-stone-500 flex-shrink-0" />
                          <div className="text-center text-stone-500 text-xs font-['Poppins'] truncate">
                            {recipe.authorName}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                 
                </div>
              </div>

      {/* RIGHT: Top Users List (Fixed Width Sidebar) */}
    <div 
      // Container: Maintains original size (h-175) and gradient.
      className="w-full lg:w-72 h-full flex-shrink-0 bg-gradient-to-l from-[#6BC4A6] to-[#FFE8CD] rounded-2xl shadow-xl flex flex-col justify-start items-start p-4"style={{marginRight: '20px'}}
    >
      
      {/* Title Section (Fixed Height/Space) */}
      <h2 
        className="text-2xl font-extrabold text-black font-['Poppins'] w-full pb-3 text-center mt-1"style={{marginTop: '20px'}}
      >
        Top 10 Creators 
      </h2>
      
      {/* List Container - Takes up all remaining vertical space and enables scrolling */}
      <div 
        className="w-full flex-1 overflow-y-auto mt-4"style={{marginTop: '10px'}}
      >
        {/* Grid: MODIFIED TO grid-cols-1 on ALL screen sizes for one card per row */}
        <div className="grid xl:grid-cols-1 lg:grid-cols-1 md:grid-cols-3 sm:grid-cols-2 xs:grid-cols-2 gap-3 pb-2 justify-items-center" style={{padding:'10px'}}>

      {loadingCreators ? (
        <div className="text-center text-gray-500 py-4">Loading creators...</div>
      ) : topCreators.length === 0 ? (
        <div className="text-center text-gray-500 py-4">No creators found</div>
      ) : (
        topCreators.map((creator, index) => (
          <div 
            key={creator.uid}
            className="w-full max-w-[260px] h-[50px] p-3 bg-white/70 rounded-lg shadow-md flex items-center justify-start gap-3 transition-shadow hover:shadow-lg cursor-pointer"
          >
            <span className="text-xl font-extrabold text-[#006644] flex-shrink-0 w-6 text-center"style={{marginLeft: '1px'}}>{index + 1}</span>
            <img 
              className="w-12 h-12 shadow-inner rounded-full object-cover flex-shrink-0" 
              src={creator.profileImage} 
              alt={`${creator.displayName} Avatar`}
            />
            <div className="flex-1 min-w-0 flex flex-col items-start justify-center truncate">
              <div className="flex-1 text-[14px] text-base font-bold text-black font-['Poppins'] truncate" style={{paddingRight: '4px'}}>{creator.displayName}</div>
              <div className="text-sm text-gray-700">
                <span className="font-semibold text-sm text-[#006644]">{creator.followerCount.toLocaleString()}</span> followers
              </div>
            </div>
          </div>
        ))
      )}

    </div>
  </div>
</div>

            </div>
            
          </div>
        </main>
      </div>
    </div>
  );
}