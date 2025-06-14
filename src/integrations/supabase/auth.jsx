
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthUI } from './components/AuthUI';
import { AuthProvider, useAuth } from './components/AuthProvider';

export { AuthProvider as SupabaseAuthProvider };
export { useAuth as useSupabaseAuth };
export { AuthUI as SupabaseAuthUI };
