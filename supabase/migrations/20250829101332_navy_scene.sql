/*
  # Initial Schema for TvShow Time MVP

  1. New Tables
    - `profiles`
      - `id` (uuid, references auth.users)
      - `username` (text, unique)
      - `display_name` (text)
      - `avatar_url` (text, optional)
      - `bio` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `user_shows`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `tmdb_id` (integer, TMDb show/movie ID)
      - `media_type` (text, 'tv' or 'movie')
      - `status` (text, 'watching', 'watched', 'to_watch')
      - `rating` (integer, 1-10, optional)
      - `favorite` (boolean, default false)
      - `current_episode` (integer, for TV shows)
      - `current_season` (integer, for TV shows)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `follows`
      - `id` (uuid, primary key)
      - `follower_id` (uuid, references profiles)
      - `following_id` (uuid, references profiles)
      - `created_at` (timestamp)
    
    - `activities`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `type` (text, activity type)
      - `tmdb_id` (integer, optional)
      - `media_type` (text, optional)
      - `metadata` (jsonb, flexible data storage)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public read access to profiles and activities
    - Add policies for following relationships
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  display_name text NOT NULL,
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_shows table for tracking
CREATE TABLE IF NOT EXISTS user_shows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  tmdb_id integer NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('tv', 'movie')),
  status text NOT NULL CHECK (status IN ('watching', 'watched', 'to_watch')) DEFAULT 'to_watch',
  rating integer CHECK (rating >= 1 AND rating <= 10),
  favorite boolean DEFAULT false,
  current_episode integer DEFAULT 0,
  current_season integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, tmdb_id, media_type)
);

-- Create follows table for social features
CREATE TABLE IF NOT EXISTS follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  following_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Create activities table for social feed
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  tmdb_id integer,
  media_type text CHECK (media_type IN ('tv', 'movie')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Policies for profiles table
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policies for user_shows table
CREATE POLICY "Users can manage own shows"
  ON user_shows
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for follows table
CREATE POLICY "Users can manage own follows"
  ON follows
  FOR ALL
  TO authenticated
  USING (auth.uid() = follower_id)
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Follows are viewable by everyone"
  ON follows
  FOR SELECT
  USING (true);

-- Policies for activities table
CREATE POLICY "Users can create own activities"
  ON activities
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Activities are viewable by everyone"
  ON activities
  FOR SELECT
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS user_shows_user_id_idx ON user_shows(user_id);
CREATE INDEX IF NOT EXISTS user_shows_tmdb_id_idx ON user_shows(tmdb_id);
CREATE INDEX IF NOT EXISTS user_shows_status_idx ON user_shows(status);
CREATE INDEX IF NOT EXISTS follows_follower_id_idx ON follows(follower_id);
CREATE INDEX IF NOT EXISTS follows_following_id_idx ON follows(following_id);
CREATE INDEX IF NOT EXISTS activities_user_id_idx ON activities(user_id);
CREATE INDEX IF NOT EXISTS activities_created_at_idx ON activities(created_at DESC);

-- Function to handle updated_at timestamps
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_user_shows_updated_at
  BEFORE UPDATE ON user_shows
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();