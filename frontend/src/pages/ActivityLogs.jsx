import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HeaderSidebarLayout from "../components/HeaderSidebarLayout";
import { useAuth } from "../contexts/AuthContext";
import { getUserActivityLogs, groupActivityLogsByDate } from "../services/activityLogs";
import { getUserProfile } from "../services/users";

// Debug flag - set to false in production
const DEBUG_ACTIVITY_LOGS = false;

// Icon components for different activity types
const ActivityIcon = ({ type }) => {
  const iconClasses = "w-7 h-7 flex items-center justify-center";
  
  switch (type) {
    case "like":
      return (
        <div className={`${iconClasses} bg-red-100 rounded-full`}>
          <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        </div>
      );
    case "comment":
      return (
        <div className={`${iconClasses} bg-blue-100 rounded-full`}>
          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
          </svg>
        </div>
      );
    case "rating":
      return (
        <div className={`${iconClasses} bg-yellow-100 rounded-full`}>
          <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      );
    case "save":
      return (
        <div className={`${iconClasses} bg-green-100 rounded-full`}>
          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
          </svg>
        </div>
      );
      case "follow":
			return (
				<div className={`${iconClasses} bg-purple-100 rounded-full`}>
					<svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
					</svg>
				</div>
			);
    default:
      return null;
  }
};

// Activity log item component
const ActivityLogItem = ({ date, time, activity, showDate = true, onView, onItemClick }) => {
  // Determine if this activity is related to a post
  // Check for both targetPostId (original) and recipeId (mapped in grouped data)
  const postId = activity.targetPostId || activity.recipeId;
  
  // Check activity type - handle both original types and UI-mapped types
  const activityType = activity.type || activity.originalType;
  const isPostRelated = postId && (
    activityType === 'comment' ||
    activityType === 'like_post' ||
    activityType === 'like_comment' ||
    activityType === 'like' || // UI-mapped type
    activityType === 'rating' ||
    activityType === 'save'
  );

  const handleItemClick = (e) => {
    // Don't trigger if clicking on the View button or its container
    if (e.target.closest('button')) {
      return;
    }
    if (onItemClick && isPostRelated) {
      onItemClick(activity);
    }
  };

  const handleViewClick = (e) => {
    e.stopPropagation();
    onView(activity);
  };

  return (
    <div 
      className={`w-full bg-white rounded-[20px] border border-black/30 shadow-md ${isPostRelated ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}`}
      style={{ paddingTop: '16px', paddingBottom: '16px', paddingLeft: '20px', paddingRight: '20px' }}
      onClick={handleItemClick}
    >
      <div className="flex justify-between items-end flex-wrap gap-3">
        {/* Left section - Activity details */}
        <div className="flex-1 flex flex-col gap-2">
          {showDate && (
            <div className="text-black text-xs font-normal font-['Poppins']">
              {date}
            </div>
          )}
          <div className="flex items-center gap-3">
        
            
            {/* Activity icon */}
            <ActivityIcon type={activity.type} />
            
            {/* Activity description */}
            <div className="flex-1 text-black text-base font-normal font-['Poppins']">
              {activity.recipeTitle && activity.originalType === 'rating' ? (
                // For rating activities, make the recipe title clickable
                // Description format: "You rated "Recipe Title""
                <span>
                  {activity.description.substring(0, activity.description.indexOf('"'))}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const postId = activity.targetPostId || activity.recipeId;
                      if (postId && onItemClick) {
                        onItemClick(activity);
                      }
                    }}
                    className="text-[#FE982A] hover:text-orange-600 underline font-medium"
                  >
                    "{activity.recipeTitle}"
                  </button>
                </span>
              ) : (
                activity.description
              )}
            </div>
          </div>
        </div>
        
        {/* Right section - Time and View button */}
        <div className="flex items-end gap-2">
          <div className="text-black text-sm font-light font-['Poppins'] text-center">
            {time}
          </div>
          <button
            onClick={handleViewClick}
            className="w-24 h-10 px-3 py-1.5 bg-[#FE982A] rounded-[10px] shadow-[4px_5px_4px_0px_rgba(0,0,0,0.29)] flex items-center justify-center hover:bg-[#e88620] transition-colors"
          >
            <span className="text-white text-xs font-normal font-['Poppins']">
              View
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Activity log group component (for multiple activities on the same day)
const ActivityLogGroup = ({ date, activities, onView, onItemClick }) => {
  return (
    <div className="w-full bg-white rounded-[20px] border border-black/30 shadow-md flex flex-col gap-3" style={{ paddingTop: '16px', paddingBottom: '16px', paddingLeft: '20px', paddingRight: '20px' }}>
      {activities.map((activity, index) => {
        // Determine if this activity is related to a post
        // Check for both targetPostId (original) and recipeId (mapped in grouped data)
        const postId = activity.targetPostId || activity.recipeId;
        
        // Check activity type - handle both original types and UI-mapped types
        const activityType = activity.type || activity.originalType;
        const isPostRelated = postId && (
          activityType === 'comment' ||
          activityType === 'like_post' ||
          activityType === 'like_comment' ||
          activityType === 'like' || // UI-mapped type
          activityType === 'rating' ||
          activityType === 'save'
        );

        const handleItemClick = (e) => {
          // Don't trigger if clicking on the View button or its container
          if (e.target.closest('button')) {
            return;
          }
          if (onItemClick && isPostRelated) {
            onItemClick(activity);
          }
        };

        const handleViewClick = (e) => {
          e.stopPropagation();
          onView(activity);
        };

        return (
          <div 
            key={index}
            className={isPostRelated ? 'cursor-pointer hover:bg-gray-50 transition-colors rounded-lg p-2 -m-2' : ''}
            onClick={handleItemClick}
          >
            <div className="flex justify-between items-end flex-wrap gap-3">
              {/* Left section - Activity details */}
              <div className="flex-1 flex flex-col gap-2">
                {index === 0 && (
                  <div className="text-black text-xs font-normal font-['Poppins']">
                    {date}
                  </div>
                )}
                <div className="flex items-center gap-3">
                  {/* User avatar */}
                  <Avatar
                    userId={activity.userId}
                    size="md"
                  />
                  
                  {/* Activity icon */}
                  <ActivityIcon type={activity.type} />
                  
                  {/* Activity description */}
                  <div className="flex-1 text-black text-base font-normal font-['Poppins']">
                    {activity.recipeTitle && activity.originalType === 'rating' ? (
                      // For rating activities, make the recipe title clickable
                      // Description format: "You rated "Recipe Title""
                      <span>
                        {activity.description.substring(0, activity.description.indexOf('"'))}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const postId = activity.targetPostId || activity.recipeId;
                            if (postId && onItemClick) {
                              onItemClick(activity);
                            }
                          }}
                          className="text-[#FE982A] hover:text-orange-600 underline font-medium"
                        >
                          "{activity.recipeTitle}"
                        </button>
                      </span>
                    ) : (
                      activity.description
                    )}
                  </div>
                </div>
              </div>
              
              {/* Right section - Time and View button */}
              <div className="flex items-end gap-2">
                <div className="text-black text-sm font-light font-['Poppins'] text-center">
                  {activity.time}
                </div>
                <button
                  onClick={handleViewClick}
                  className="w-24 h-10 px-3 py-1.5 bg-[#FE982A] rounded-[10px] shadow-[4px_5px_4px_0px_rgba(0,0,0,0.29)] flex items-center justify-center hover:bg-[#e88620] transition-colors"
                >
                  <span className="text-white text-xs font-normal font-['Poppins']">
                    View
                  </span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ActivityLogs = () => {
  const navigate = useNavigate();
  const { userId: profileUserId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Determine which user's activity logs to show
  // If profileUserId is provided in URL, use it; otherwise use logged-in user's ID
  const targetUserId = profileUserId || user?.uid;
  const isOwnProfile = !profileUserId || profileUserId === user?.uid;

  useEffect(() => {
    const fetchActivityLogs = async () => {
      // Wait for auth to finish loading (only needed if we're using logged-in user)
      if (!profileUserId && authLoading) {
        if (DEBUG_ACTIVITY_LOGS) {
          console.log('[ActivityLogs] Auth still loading, waiting...');
        }
        return;
      }

      // If no target user ID, can't fetch
      if (!targetUserId) {
        if (DEBUG_ACTIVITY_LOGS) {
          console.log('[ActivityLogs] No target user ID, skipping fetch. profileUserId:', profileUserId, 'user.uid:', user?.uid);
        }
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Clear previous logs immediately when switching users
        setActivityLogs([]);
        
        // Fetch profile owner's display name for third-person descriptions
        let profileOwnerName = null;
        if (!isOwnProfile && profileUserId) {
          try {
            const profileData = await getUserProfile(profileUserId);
            profileOwnerName = profileData.displayName || profileData.name || null;
          } catch (error) {
            console.error('[ActivityLogs] Error fetching profile owner name:', error);
          }
        }
        
        if (DEBUG_ACTIVITY_LOGS) {
          console.log('[ActivityLogs] Fetching activity logs for user:', targetUserId, '(profileUserId:', profileUserId, 'logged-in user:', user?.uid, 'isOwnProfile:', isOwnProfile, 'profileOwnerName:', profileOwnerName);
        }
        const logs = await getUserActivityLogs(targetUserId, {
          currentUserId: user?.uid || null,
          profileOwnerName: profileOwnerName,
        });
        if (DEBUG_ACTIVITY_LOGS) {
          console.log('[ActivityLogs] Fetched logs:', logs.length, logs);
        }
        
        const groupedLogs = groupActivityLogsByDate(logs);
        if (DEBUG_ACTIVITY_LOGS) {
          console.log('[ActivityLogs] Grouped logs:', groupedLogs);
        }
        
        setActivityLogs(groupedLogs);
      } catch (error) {
        console.error('[ActivityLogs] Error fetching activity logs:', error);
        setActivityLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivityLogs();
  }, [targetUserId, profileUserId, user?.uid, authLoading, isOwnProfile]);

  const handleViewActivity = (activity) => {
    // Handle view action - navigate to recipe or open modal
    // Check for both targetPostId (original) and recipeId (mapped in grouped data)
    const postId = activity.targetPostId || activity.recipeId;
    const activityType = activity.type || activity.originalType;
    
    if (postId) {
      // Navigate to home with recipe ID in state (same as notifications)
      // This handles all post-related activities including ratings
      try {
        navigate('/home', { 
          state: { openRecipeId: postId } 
        });
      } catch (error) {
        console.error('Error navigating to post:', error);
        // Gracefully handle error - redirect to home without breaking
        navigate('/home');
      }
    } else if (activityType === 'follow' && activity.targetUserId) {
      // Navigate to user profile for follow activities
      navigate(`/profile/${activity.targetUserId}`);
    } else if (activity.userId && activityType === 'follow') {
      // Fallback for follow activities with userId
      navigate(`/profile/${activity.userId}`);
    } else {
      if (DEBUG_ACTIVITY_LOGS) {
        console.log("View activity:", activity);
      }
    }
  };

  const handleActivityItemClick = async (activity) => {
    // Handle click on activity item itself (for post-related activities)
    // This matches the notification behavior
    // Check for both targetPostId (original) and recipeId (mapped in grouped data)
    const postId = activity.targetPostId || activity.recipeId;
    
    if (postId) {
      try {
        // Navigate to home with recipe ID in state (same as notifications)
        // This works for all post-related activities including ratings
        navigate('/home', { 
          state: { openRecipeId: postId } 
        });
      } catch (error) {
        console.error('Error navigating to post:', error);
        // Gracefully handle error - redirect to home without breaking
        navigate('/home');
      }
    }
  };

  if (loading) {
    return (
      <HeaderSidebarLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading activity logs...</p>
          </div>
        </div>
      </HeaderSidebarLayout>
    );
  }

  return (
    <HeaderSidebarLayout>
      <div className="w-full" style={{ paddingTop: '80px', paddingLeft: '20px', paddingRight: '80px', paddingBottom: '20px' }}>
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-4 text-gray-600 hover:text-black transition-colors"
          aria-label="Go back"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Page Title */}
        <div style={{ paddingBottom: '30px' }}>
          <h1 className="text-2xl font-semibold font-['Poppins'] text-black">
            Activity Logs
          </h1>
        </div>

        {/* Activity Logs Content */}
        <div className="flex gap-4">
          {/* Orange vertical line */}
          <div className="w-1 bg-[#bc4f07] rounded-full flex-shrink-0"></div>
          
          {/* Activity logs list */}
          <div className="flex-1 flex flex-col gap-6">
            {activityLogs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No activity logs yet</p>
              </div>
            ) : (
              activityLogs.map((log, index) => (
                <div key={index}>
                  {log.activities.length === 1 ? (
                    <ActivityLogItem
                      date={log.date}
                      time={log.activities[0].time}
                      activity={log.activities[0]}
                      onView={handleViewActivity}
                      onItemClick={handleActivityItemClick}
                    />
                  ) : (
                    <ActivityLogGroup
                      date={log.date}
                      activities={log.activities}
                      onView={handleViewActivity}
                      onItemClick={handleActivityItemClick}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </HeaderSidebarLayout>
  );
};

export default ActivityLogs;