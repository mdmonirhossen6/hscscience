import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface Profile {
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

interface UserProfileDisplayProps {
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  showEmail?: boolean;
}

export function UserProfileDisplay({ 
  size = "md", 
  showName = true, 
  showEmail = false 
}: UserProfileDisplayProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, email, avatar_url")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setProfile(data);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <Skeleton className={`rounded-full ${sizeClasses[size]}`} />
        {showName && <Skeleton className="h-4 w-24" />}
      </div>
    );
  }

  // Get display name or email fallback
  const displayName = profile?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0];
  const email = profile?.email || user.email;
  
  // Get avatar - prioritize Google avatar from user metadata
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || profile?.avatar_url;
  
  // Get initials for fallback
  const initials = displayName
    ? displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : email?.slice(0, 2).toUpperCase() || "U";

  return (
    <div className="flex items-center gap-3">
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={avatarUrl} alt={displayName || "User"} />
        <AvatarFallback className="bg-primary/10 text-primary font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>
      {(showName || showEmail) && (
        <div className="flex flex-col">
          {showName && (
            <span className={`font-medium text-foreground ${textSizeClasses[size]}`}>
              {displayName}
            </span>
          )}
          {showEmail && email && (
            <span className="text-xs text-muted-foreground truncate max-w-[150px]">
              {email}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
