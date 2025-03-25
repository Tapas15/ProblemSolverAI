import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Card className="bg-white shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="h-24 w-24 md:h-32 md:w-32">
              <AvatarImage src={user.avatarUrl || ''} alt={user.name} />
              <AvatarFallback className="bg-gradient-to-br from-[#3b82f6] to-[#60a5fa] text-white text-xl">
                {user.name?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{user.name}</h1>

              <div className="space-y-3">
                <div className="flex items-center justify-center md:justify-start text-gray-600">
                  <User className="h-5 w-5 mr-2" />
                  <span>{user.username}</span>
                </div>

                <div className="flex items-center justify-center md:justify-start text-gray-600">
                  <Mail className="h-5 w-5 mr-2" />
                  <span>{user.email}</span>
                </div>

                <div className="flex items-center justify-center md:justify-start text-gray-600">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}