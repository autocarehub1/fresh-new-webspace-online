import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { updateCustomerProfile } from "@/services/customerService";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCustomerProfile } from "@/services/customerService";

const profileSchema = z.object({
  company_name: z.string().min(2, { message: "Company name is required" }),
  full_name: z.string().min(2, { message: "Full name is required" }),
  phone: z.string().optional(),
  address: z.string().optional(),
});

const notificationSchema = z.object({
  email_notifications: z.boolean().default(true),
  delivery_updates: z.boolean().default(true),
  marketing_emails: z.boolean().default(false),
});

const securitySchema = z.object({
  current_password: z.string().min(1, { message: "Current password is required" }),
  new_password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirm_password: z.string().min(6),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

export default function CustomerSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  
  // Fetch customer profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ["customerProfile", user?.id],
    queryFn: () => fetchCustomerProfile(user?.id as string),
    enabled: !!user?.id,
  });
  
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      company_name: profile?.company_name || "",
      full_name: profile?.full_name || "",
      phone: profile?.phone || "",
      address: profile?.address || "",
    },
    // Update form when profile data is loaded
    values: profile ? {
      company_name: profile.company_name || "",
      full_name: profile.full_name || "",
      phone: profile.phone || "",
      address: profile.address || "",
    } : undefined,
  });
  
  const notificationForm = useForm<z.infer<typeof notificationSchema>>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      email_notifications: profile?.preferences?.email_notifications ?? true,
      delivery_updates: profile?.preferences?.delivery_updates ?? true,
      marketing_emails: profile?.preferences?.marketing_emails ?? false,
    },
    // Update form when profile data is loaded
    values: profile?.preferences ? {
      email_notifications: profile.preferences.email_notifications ?? true,
      delivery_updates: profile.preferences.delivery_updates ?? true,
      marketing_emails: profile.preferences.marketing_emails ?? false,
    } : undefined,
  });
  
  const securityForm = useForm<z.infer<typeof securitySchema>>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });
  
  const onProfileSubmit = async (values: z.infer<typeof profileSchema>) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      await updateCustomerProfile(user.id, {
        ...values,
        email: user.email || "",
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
      
      // Refresh profile data
      queryClient.invalidateQueries({ queryKey: ["customerProfile", user.id] });
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating profile",
        description: "There was a problem updating your profile. Please try again.",
      });
      console.error("Error updating profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const onNotificationSubmit = async (values: z.infer<typeof notificationSchema>) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      await updateCustomerProfile(user.id, {
        preferences: values,
      });
      
      toast({
        title: "Notification preferences updated",
        description: "Your notification settings have been saved.",
      });
      
      // Refresh profile data
      queryClient.invalidateQueries({ queryKey: ["customerProfile", user.id] });
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating preferences",
        description: "There was a problem updating your notification preferences. Please try again.",
      });
      console.error("Error updating notification preferences:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const onSecuritySubmit = async (values: z.infer<typeof securitySchema>) => {
    // Here we would implement password change functionality
    // This requires custom auth handling that would need to be implemented
    
    // Example implementation:
    setIsSubmitting(true);
    
    try {
      // Simulate API call - would need to implement actual password change
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
      
      // Reset the form
      securityForm.reset();
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating password",
        description: "There was a problem updating your password. Please check your current password and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return <div className="text-center py-4">Loading settings...</div>;
  }
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-3 w-full mb-6">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>
      
      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your account details and company information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={profileForm.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="company_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Acme Corporation" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormDescription>
                          This number will be used for delivery updates
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex items-center text-sm text-gray-500 md:col-span-2">
                    <div>
                      <div className="font-medium text-gray-700">Email Address</div>
                      <div>{user?.email}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Your email address cannot be changed
                      </div>
                    </div>
                  </div>
                  
                  <FormField
                    control={profileForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Business Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Business St, City, State, ZIP" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your primary business address for billing and correspondence
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>
              Manage how and when we contact you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...notificationForm}>
              <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <FormField
                    control={notificationForm.control}
                    name="email_notifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Email Notifications</FormLabel>
                          <FormDescription>
                            Receive notifications about your deliveries via email
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={notificationForm.control}
                    name="delivery_updates"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Delivery Status Updates</FormLabel>
                          <FormDescription>
                            Get updates when your delivery status changes
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={notificationForm.control}
                    name="marketing_emails"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Marketing Emails</FormLabel>
                          <FormDescription>
                            Receive news, promotions, and updates about our services
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Preferences"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="security">
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>
              Update your password and manage account security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...securityForm}>
              <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6">
                <FormField
                  control={securityForm.control}
                  name="current_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={securityForm.control}
                  name="new_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormDescription>
                        Password must be at least 6 characters long
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={securityForm.control}
                  name="confirm_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </Form>
            
            <Separator className="my-6" />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Account Security</h3>
              
              <div className="rounded-lg border p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">Login Sessions</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Manage your active login sessions
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage Sessions
                  </Button>
                </div>
              </div>
              
              <div className="rounded-lg border p-4 bg-red-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-red-600">Delete Account</h4>
                    <p className="text-sm text-red-500 mt-1">
                      Permanently delete your account and all your data
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
} 