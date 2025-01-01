-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_crypto";

-- Create storage buckets
CREATE POLICY "User Images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-images');

CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-images' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user-images' AND
  auth.uid() = owner
);

CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-images' AND
  auth.uid() = owner
);

-- Create profiles table
CREATE TABLE public.profiles (
    id uuid NOT NULL,
    display_name text,
    avatar_url text,
    updated_at timestamp with time zone DEFAULT current_timestamp,
    is_pro boolean DEFAULT false,
    is_pro_request boolean DEFAULT false,
    credit_count integer NOT NULL DEFAULT 50,
    bonus_credits integer NOT NULL DEFAULT 0,
    last_refill_time timestamp with time zone DEFAULT current_timestamp,
    is_admin boolean DEFAULT false,
    followers_count integer DEFAULT 0,
    following_count integer DEFAULT 0,
    CONSTRAINT profiles_pkey PRIMARY KEY (id),
    CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create user_images table
CREATE TABLE public.user_images (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid,
    storage_path text NOT NULL,
    prompt text NOT NULL,
    model text NOT NULL,
    seed integer NOT NULL,
    width integer NOT NULL,
    height integer NOT NULL,
    quality text NOT NULL,
    aspect_ratio text NOT NULL,
    created_at timestamp with time zone DEFAULT current_timestamp,
    is_trending boolean NOT NULL DEFAULT false,
    is_hot boolean NOT NULL DEFAULT false,
    is_private boolean NOT NULL DEFAULT false,
    CONSTRAINT user_images_pkey PRIMARY KEY (id),
    CONSTRAINT user_images_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create user_image_likes table
CREATE TABLE public.user_image_likes (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid,
    image_id uuid,
    created_by uuid,
    created_at timestamp with time zone DEFAULT current_timestamp,
    CONSTRAINT user_image_likes_pkey PRIMARY KEY (id),
    CONSTRAINT user_image_likes_user_id_image_id_key UNIQUE (user_id, image_id),
    CONSTRAINT user_image_likes_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT user_image_likes_image_id_fkey FOREIGN KEY (image_id) REFERENCES user_images(id) ON DELETE CASCADE,
    CONSTRAINT user_image_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create user_follows table
CREATE TABLE public.user_follows (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    follower_id uuid NOT NULL,
    following_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT current_timestamp,
    CONSTRAINT user_follows_pkey PRIMARY KEY (id),
    CONSTRAINT user_follows_follower_id_following_id_key UNIQUE (follower_id, following_id),
    CONSTRAINT user_follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES profiles(id) ON DELETE CASCADE,
    CONSTRAINT user_follows_following_id_fkey FOREIGN KEY (following_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create notifications table
CREATE TABLE public.notifications (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid,
    title text NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT current_timestamp,
    link text,
    image_url text,
    link_names text,
    CONSTRAINT notifications_pkey PRIMARY KEY (id),
    CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create huggingface_api_keys table
CREATE TABLE public.huggingface_api_keys (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    api_key text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT current_timestamp,
    last_used_at timestamp with time zone,
    CONSTRAINT huggingface_api_keys_pkey PRIMARY KEY (id),
    CONSTRAINT huggingface_api_keys_api_key_key UNIQUE (api_key)
);

-- Create indexes
CREATE INDEX idx_user_images_user_id ON public.user_images USING btree (user_id);
CREATE INDEX idx_user_images_privacy ON public.user_images USING btree (user_id, is_private);
CREATE INDEX idx_user_image_likes_user_id ON public.user_image_likes USING btree (user_id);
CREATE INDEX idx_user_image_likes_image_id ON public.user_image_likes USING btree (image_id);
CREATE INDEX idx_user_image_likes_created_by ON public.user_image_likes USING btree (created_by);
CREATE INDEX idx_user_follows_follower ON public.user_follows USING btree (follower_id);
CREATE INDEX idx_user_follows_following ON public.user_follows USING btree (following_id);
CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);
CREATE INDEX idx_huggingface_api_keys_is_active ON public.huggingface_api_keys USING btree (is_active);

-- Create follow count update function
CREATE OR REPLACE FUNCTION public.update_follow_counts()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment following_count for follower
    UPDATE public.profiles
    SET following_count = following_count + 1
    WHERE id = NEW.follower_id;
    
    -- Increment followers_count for following
    UPDATE public.profiles
    SET followers_count = followers_count + 1
    WHERE id = NEW.following_id;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement following_count for follower
    UPDATE public.profiles
    SET following_count = GREATEST(0, following_count - 1)
    WHERE id = OLD.follower_id;
    
    -- Decrement followers_count for following
    UPDATE public.profiles
    SET followers_count = GREATEST(0, followers_count - 1)
    WHERE id = OLD.following_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create follow trigger
CREATE TRIGGER on_follow_changed
AFTER INSERT OR DELETE ON public.user_follows
FOR EACH ROW
EXECUTE FUNCTION update_follow_counts();

-- Create RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_image_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.huggingface_api_keys ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- User images policies
CREATE POLICY "Public images are viewable by everyone"
ON public.user_images FOR SELECT
USING (NOT is_private OR auth.uid() = user_id);

CREATE POLICY "Users can insert own images"
ON public.user_images FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own images"
ON public.user_images FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own images"
ON public.user_images FOR DELETE
USING (auth.uid() = user_id);

-- User image likes policies
CREATE POLICY "Image likes are viewable by everyone"
ON public.user_image_likes FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can like images"
ON public.user_image_likes FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can remove own likes"
ON public.user_image_likes FOR DELETE
USING (auth.uid() = created_by);

-- User follows policies
CREATE POLICY "Follows are viewable by everyone"
ON public.user_follows FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can follow others"
ON public.user_follows FOR INSERT
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
ON public.user_follows FOR DELETE
USING (auth.uid() = follower_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_images;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_image_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_follows;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, authenticated; 