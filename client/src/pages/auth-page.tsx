import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Loader2, 
  Check, 
  User, 
  Lock, 
  Mail, 
  BookOpen, 
  Lightbulb, 
  BarChart4,
  UserPlus
} from 'lucide-react';

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

const registerSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

const AuthPage: React.FC = () => {
  const { user, loginMutation, registerMutation, isLoading } = useAuth();
  const [location, navigate] = useLocation();
  const [activeTab, setActiveTab] = React.useState("login");
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);
  
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });
  
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };
  
  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-secondary" />
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Auth form section */}
      <div className="w-full md:w-1/2 py-12 px-6 md:px-12 lg:px-16 flex flex-col justify-center relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 z-0 opacity-5">
          <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-accent"></div>
          <div className="absolute bottom-20 right-10 w-60 h-60 rounded-full bg-secondary"></div>
        </div>
        
        <div className="max-w-md mx-auto w-full z-10 bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold font-header text-primary mb-3">
              <span className="text-accent">Question</span>
              <span className="text-primary">Pro</span>{' '}
              <span className="text-secondary">AI</span>
            </h1>
            <p className="text-gray-600">
              Enhance your business problem-solving skills with AI-powered frameworks
            </p>
          </div>
          
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-8 bg-gray-100/80">
              <TabsTrigger value="login" className="rounded-lg py-2.5 data-[state=active]:bg-white">Login</TabsTrigger>
              <TabsTrigger value="register" className="rounded-lg py-2.5 data-[state=active]:bg-white">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Username</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input 
                              placeholder="Enter your username" 
                              className="pl-10 py-6 h-11 rounded-lg border-gray-200 focus:border-secondary" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center">
                          <FormLabel className="text-gray-700">Password</FormLabel>
                          <a href="#" className="text-xs text-secondary hover:text-secondary/80 transition-colors">
                            Forgot password?
                          </a>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input 
                              type="password" 
                              placeholder="Enter your password" 
                              className="pl-10 py-6 h-11 rounded-lg border-gray-200 focus:border-secondary" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0 my-2">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                            className="text-secondary border-gray-300 rounded"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-gray-600 font-normal text-sm">Remember me for 14 days</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-secondary hover:bg-secondary/90 text-white py-6 h-11 rounded-lg font-medium mt-2 transition-all duration-200 ease-in-out transform hover:translate-y-[-2px] hover:shadow-md"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Log in"
                    )}
                  </Button>
                </form>
              </Form>
              
              <p className="text-center mt-6 text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  onClick={() => setActiveTab("register")}
                  className="text-secondary hover:text-secondary/80 font-medium transition-colors"
                >
                  Register now
                </button>
              </p>
            </TabsContent>
            
            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Full Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input 
                              placeholder="John Doe" 
                              className="pl-10 py-5 h-11 rounded-lg border-gray-200 focus:border-secondary"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Username</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input 
                              placeholder="johndoe" 
                              className="pl-10 py-5 h-11 rounded-lg border-gray-200 focus:border-secondary"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input 
                              type="email" 
                              placeholder="john.doe@example.com" 
                              className="pl-10 py-5 h-11 rounded-lg border-gray-200 focus:border-secondary"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input 
                                type="password" 
                                placeholder="Create a password" 
                                className="pl-10 py-5 h-11 rounded-lg border-gray-200 focus:border-secondary"
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Confirm Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input 
                                type="password" 
                                placeholder="Confirm password" 
                                className="pl-10 py-5 h-11 rounded-lg border-gray-200 focus:border-secondary"
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-secondary hover:bg-secondary/90 text-white py-6 h-11 rounded-lg font-medium mt-2 transition-all duration-200 ease-in-out transform hover:translate-y-[-2px] hover:shadow-md"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create account"
                    )}
                  </Button>
                </form>
              </Form>
              
              <p className="text-center mt-6 text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  onClick={() => setActiveTab("login")}
                  className="text-secondary hover:text-secondary/80 font-medium transition-colors"
                >
                  Log in
                </button>
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Hero section */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary to-primary-800 text-white flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iODAiIGhlaWdodD0iODAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gODAgMCBMIDAgMCAwIDgwIiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMSIgLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiIC8+PC9zdmc+')]"></div>
        </div>
        
        <div className="max-w-md mx-auto px-8 py-16 z-10">
          <div className="bg-white/10 backdrop-blur-sm p-2 inline-block rounded-lg mb-6">
            <div className="bg-secondary/20 text-secondary p-1 px-3 rounded text-sm font-medium">
              Professional Development Platform
            </div>
          </div>
          
          <h2 className="text-4xl font-bold font-header mb-6 leading-tight text-white">
            Enhance Your Business Problem-Solving Skills
          </h2>
          
          <p className="mb-10 text-gray-100 text-lg">
            QuestionPro AI provides business professionals with structured frameworks and AI assistance
            to solve complex business problems effectively.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start group">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary mr-4 group-hover:bg-secondary group-hover:text-white transition-all duration-300">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium text-white text-lg mb-1">10 Business Frameworks</h3>
                <p className="text-gray-200">Access proven problem-solving frameworks with detailed implementation guidance</p>
              </div>
            </div>
            
            <div className="flex items-start group">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary mr-4 group-hover:bg-secondary group-hover:text-white transition-all duration-300">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium text-white text-lg mb-1">AI-Powered Assistance</h3>
                <p className="text-gray-200">Connect with AI for personalized problem-solving support and advanced insights</p>
              </div>
            </div>
            
            <div className="flex items-start group">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary mr-4 group-hover:bg-secondary group-hover:text-white transition-all duration-300">
                <BarChart4 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium text-white text-lg mb-1">Progress Tracking</h3>
                <p className="text-gray-200">Track your learning journey and build professional skills with comprehensive analytics</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
