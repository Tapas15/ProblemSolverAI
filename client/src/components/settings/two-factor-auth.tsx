import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Shield, ShieldCheck, ShieldAlert, Download, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { setup2FA, verify2FA, disable2FA, use2FABackupCode, generateNew2FABackupCodes } from "@/lib/api";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const tokenSchema = z.object({
  token: z.string().min(6, "Token must be at least 6 characters").max(8, "Token cannot exceed 8 characters"),
});

const backupCodeSchema = z.object({
  backupCode: z.string().min(9, "Backup code must be at least 9 characters")
});

const disableSchema = z.object({
  currentPassword: z.string().min(6, "Password must be at least 6 characters"),
  token: z.string().min(6, "Token must be at least 6 characters").max(8, "Token cannot exceed 8 characters"),
});

type TokenFormValues = z.infer<typeof tokenSchema>;
type BackupCodeFormValues = z.infer<typeof backupCodeSchema>;
type DisableFormValues = z.infer<typeof disableSchema>;

export function TwoFactorAuth() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [setupData, setSetupData] = useState<{ secret: string; qrCode: string } | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [showBackupCodeInput, setShowBackupCodeInput] = useState(false);
  const [step, setStep] = useState<'setup' | 'verify' | 'complete'>('setup');
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  
  const tokenForm = useForm<TokenFormValues>({
    resolver: zodResolver(tokenSchema),
    defaultValues: {
      token: '',
    }
  });
  
  const backupCodeForm = useForm<BackupCodeFormValues>({
    resolver: zodResolver(backupCodeSchema),
    defaultValues: {
      backupCode: '',
    }
  });
  
  const disableForm = useForm<DisableFormValues>({
    resolver: zodResolver(disableSchema),
    defaultValues: {
      currentPassword: '',
      token: '',
    }
  });

  const handleSetup = async () => {
    try {
      setIsLoading(true);
      const data = await setup2FA();
      setSetupData(data);
      setStep('verify');
    } catch (error: any) {
      toast({
        title: "2FA Setup Error",
        description: error.message || "Failed to initialize 2FA setup",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (values: TokenFormValues) => {
    try {
      setIsLoading(true);
      const result = await verify2FA(values.token);
      setBackupCodes(result.backupCodes);
      setShowBackupCodes(true);
      setStep('complete');
      
      // Update cache with new user data
      queryClient.setQueryData(['/api/user'], result.user);
      
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been successfully enabled",
      });
    } catch (error: any) {
      toast({
        title: "Verification Error",
        description: error.message || "Failed to verify the authentication code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async (values: DisableFormValues) => {
    try {
      setIsDisabling(true);
      const result = await disable2FA(values.currentPassword, values.token);
      
      // Update cache with new user data
      queryClient.setQueryData(['/api/user'], result.user);
      
      setShowDisableDialog(false);
      disableForm.reset();
      
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been successfully disabled",
      });
    } catch (error: any) {
      toast({
        title: "Error Disabling 2FA",
        description: error.message || "Failed to disable two-factor authentication",
        variant: "destructive",
      });
    } finally {
      setIsDisabling(false);
    }
  };

  const handleBackupCode = async (values: BackupCodeFormValues) => {
    try {
      setIsLoading(true);
      const result = await use2FABackupCode(values.backupCode);
      
      // Update cache with new user data
      queryClient.setQueryData(['/api/user'], result.user);
      
      toast({
        title: "Success",
        description: "Backup code verified successfully",
      });
      
      setShowBackupCodeInput(false);
      backupCodeForm.reset();
    } catch (error: any) {
      toast({
        title: "Backup Code Error",
        description: error.message || "Failed to verify backup code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateNewBackupCodes = async () => {
    try {
      setIsLoading(true);
      const token = await tokenForm.getValues().token;
      if (!token) {
        toast({
          title: "Token Required",
          description: "Please enter your current 2FA token to generate new backup codes",
          variant: "destructive",
        });
        return;
      }
      
      const result = await generateNew2FABackupCodes(token);
      setBackupCodes(result.backupCodes);
      setShowBackupCodes(true);
      
      toast({
        title: "New Backup Codes",
        description: "New backup codes have been generated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate new backup codes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadBackupCodes = () => {
    if (backupCodes.length === 0) return;
    
    const content = `Framework Pro - Two-Factor Authentication Backup Codes\nGenerated: ${new Date().toISOString()}\n\n${backupCodes.join('\n')}\n\nKeep these codes in a safe place!`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `2fa-backup-codes-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // If 2FA is not enabled, show the setup screen
  if (!user?.twoFactorEnabled) {
    if (step === 'setup') {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" /> Two-Factor Authentication
            </CardTitle>
            <CardDescription>
              Add an extra layer of security to your account by requiring a verification code in addition to your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Protect your account</AlertTitle>
              <AlertDescription>
                Two-factor authentication adds an additional layer of security to your account by requiring access to your phone in addition to your password.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setShowBackupCodeInput(prev => !prev)}>
              Use Backup Code
            </Button>
            <Button onClick={handleSetup} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Setting up...
                </>
              ) : (
                <>Setup 2FA</>
              )}
            </Button>
          </CardFooter>
        </Card>
      );
    }
    
    if (step === 'verify') {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Verify Two-Factor Authentication</CardTitle>
            <CardDescription>
              Scan the QR code with your authenticator app (like Google Authenticator or Authy) and enter the verification code.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-center">
                {setupData?.qrCode && (
                  <img src={setupData.qrCode} alt="QR Code" className="border rounded-md" />
                )}
              </div>
              
              <div className="bg-muted p-3 rounded-md">
                <p className="text-xs text-muted-foreground mb-1">Manual setup code:</p>
                <code className="text-sm font-mono bg-slate-200 dark:bg-slate-800 p-1 rounded">
                  {setupData?.secret}
                </code>
              </div>
              
              <Form {...tokenForm}>
                <form onSubmit={tokenForm.handleSubmit(handleVerify)} className="space-y-4">
                  <FormField
                    control={tokenForm.control}
                    name="token"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verification Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter the 6-digit code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setStep('setup')}>
                      Back
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
                        </>
                      ) : (
                        <>Verify</>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    if (step === 'complete' && showBackupCodes) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Backup Codes</CardTitle>
            <CardDescription>
              Save these backup codes in a secure location. You can use them to access your account if you lose your authentication device.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-md mb-4">
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <code key={index} className="text-sm font-mono bg-slate-200 dark:bg-slate-800 p-1 rounded">
                    {code}
                  </code>
                ))}
              </div>
            </div>
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={downloadBackupCodes}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" /> Download Codes
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={() => setShowBackupCodes(false)}>
              Done
            </Button>
          </CardFooter>
        </Card>
      );
    }
  }
  
  // If 2FA is enabled, show the management screen
  if (user?.twoFactorEnabled) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" /> Two-Factor Authentication Enabled
            </CardTitle>
            <CardDescription>
              Your account is protected with two-factor authentication.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <ShieldCheck className="h-4 w-4" />
              <AlertTitle>Account secured</AlertTitle>
              <AlertDescription>
                Two-factor authentication is currently enabled for your account. This provides an additional layer of security.
              </AlertDescription>
            </Alert>
            
            {showBackupCodes && (
              <div className="mb-4">
                <h3 className="font-medium mb-2">Backup Codes</h3>
                <div className="bg-muted p-4 rounded-md mb-2">
                  <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((code, index) => (
                      <code key={index} className="text-sm font-mono bg-slate-200 dark:bg-slate-800 p-1 rounded">
                        {code}
                      </code>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={downloadBackupCodes}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" /> Download Codes
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowBackupCodes(false)}
                  >
                    Hide Codes
                  </Button>
                </div>
              </div>
            )}
            
            {showBackupCodeInput && (
              <div className="mb-4">
                <h3 className="font-medium mb-2">Use Backup Code</h3>
                <Form {...backupCodeForm}>
                  <form onSubmit={backupCodeForm.handleSubmit(handleBackupCode)} className="space-y-4">
                    <FormField
                      control={backupCodeForm.control}
                      name="backupCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Enter backup code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setShowBackupCodeInput(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
                          </>
                        ) : (
                          <>Verify</>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-wrap justify-between gap-2">
            <div className="flex gap-2">
              <Button 
                variant={showBackupCodes ? "outline" : "secondary"}
                onClick={() => setShowBackupCodes(prev => !prev)}
              >
                {showBackupCodes ? 'Hide Backup Codes' : 'Show Backup Codes'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowBackupCodeInput(prev => !prev)}
              >
                Use Backup Code
              </Button>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleGenerateNewBackupCodes} 
                disabled={isLoading}
                className="flex items-center gap-1"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Generate New Codes
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => setShowDisableDialog(true)}
              >
                Disable 2FA
              </Button>
            </div>
          </CardFooter>
        </Card>
        
        {/* Disable 2FA Dialog */}
        <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
              <DialogDescription>
                This will remove the additional security layer from your account. You will only need your password to log in.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...disableForm}>
              <form onSubmit={disableForm.handleSubmit(handleDisable)} className="space-y-4">
                <FormField
                  control={disableForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Your current password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={disableForm.control}
                  name="token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Authentication Code</FormLabel>
                      <FormControl>
                        <Input placeholder="6-digit code from your app" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" variant="destructive" disabled={isDisabling}>
                    {isDisabling ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Disabling...
                      </>
                    ) : (
                      <>Disable 2FA</>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </>
    );
  }
  
  return null;
}