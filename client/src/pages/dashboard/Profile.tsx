/**
 * Profile Page
 * User profile management with Clerk integration
 * Sprint 8: User Dashboard & Protected Routes
 */

import { useUser, UserProfile } from "@clerk/clerk-react";
import { Link } from "wouter";
import { 
    User, 
    Mail, 
    Calendar, 
    Shield, 
    ArrowLeft,
    Settings,
    BookOpen,
    Users
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Profile() {
    return (
        <ProtectedRoute>
            <ProfileContent />
        </ProtectedRoute>
    );
}

function ProfileContent() {
    const { user, isLoaded } = useUser();
  
    if (!isLoaded || !user) {
        return null;
    }
  
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard">
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <ArrowLeft className="h-4 w-4" />
                                    Dashboard
                                </Button>
                            </Link>
                            <h1 className="text-xl font-semibold text-slate-900">Mon Profil</h1>
                        </div>
                        <Link href="/app/settings">
                            <Button variant="outline" size="sm" className="gap-2">
                                <Settings className="h-4 w-4" />
                                Paramètres
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>
          
            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Summary Card */}
                    <div className="lg:col-span-1">
                        <Card className="bg-white shadow-sm border-slate-200">
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-[#145A5B] flex items-center justify-center text-white text-3xl font-bold mb-4">
                                        {user.firstName?.[0] || user.emailAddresses[0]?.emailAddress[0]?.toUpperCase()}
                                    </div>
                                    <h2 className="text-xl font-semibold text-slate-900">
                                        {user.fullName || "Utilisateur"}
                                    </h2>
                                    <p className="text-slate-500 text-sm mt-1">
                                        {user.emailAddresses[0]?.emailAddress}
                                    </p>
                                    <div className="flex items-center gap-2 mt-3 text-sm text-slate-500">
                                        <Calendar className="h-4 w-4" />
                                        <span>Membre depuis {new Date(user.createdAt!).toLocaleDateString('fr-CA', { month: 'long', year: 'numeric' })}</span>
                                    </div>
                                </div>
                                
                                {/* Quick Stats */}
                                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100">
                                    <div className="text-center">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 mx-auto mb-2">
                                            <BookOpen className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <p className="text-2xl font-bold text-slate-900">0</p>
                                        <p className="text-xs text-slate-500">Cours</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#E7F2F2] mx-auto mb-2">
                                            <Users className="h-5 w-5 text-[#0F3D3E]" />
                                        </div>
                                        <p className="text-2xl font-bold text-slate-900">0</p>
                                        <p className="text-xs text-slate-500">Sessions</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        {/* Account Info Card */}
                        <Card className="bg-white shadow-sm border-slate-200 mt-6">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-slate-600" />
                                    Informations du compte
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <User className="h-4 w-4 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500">Nom complet</p>
                                        <p className="text-sm font-medium text-slate-900">{user.fullName || "Non défini"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500">Email</p>
                                        <p className="text-sm font-medium text-slate-900">{user.emailAddresses[0]?.emailAddress}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-4 w-4 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500">Date d'inscription</p>
                                        <p className="text-sm font-medium text-slate-900">
                                            {new Date(user.createdAt!).toLocaleDateString('fr-CA', { 
                                                day: 'numeric',
                                                month: 'long', 
                                                year: 'numeric' 
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    
                    {/* Clerk UserProfile Component */}
                    <div className="lg:col-span-2">
                        <Card className="bg-white shadow-sm border-slate-200 overflow-hidden">
                            <CardContent className="p-0">
                                <UserProfile 
                                    appearance={{
                                        elements: {
                                            rootBox: "w-full",
                                            card: "shadow-none border-0 w-full",
                                            navbar: "hidden",
                                            pageScrollBox: "p-6",
                                            profileSection: "border-slate-200",
                                            formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
                                        }
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
