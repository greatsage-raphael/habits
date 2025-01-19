import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from "@google/generative-ai";

export const supabase = createClient("https://eifeyuvbxmsjjtbtbyuk.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpZmV5dXZieG1zamp0YnRieXVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY3ODc4NjY0NywiZXhwIjoxOTk0MzYyNjQ3fQ.LnuFgfty7CPOwWWor9c5E4oiNNIF_fTAh7KROU3_wHA");

export const genAI = new GoogleGenerativeAI("AIzaSyCCnrDaiXhJY6PwrH_RVM9N7hT6uhRzpAw");