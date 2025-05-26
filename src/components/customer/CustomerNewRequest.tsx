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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { createDeliveryRequest } from "@/services/customerService";
import { useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  pickup_location: z.string().min(5, {
    message: "Pickup location must be at least 5 characters.",
  }),
  delivery_location: z.string().min(5, {
    message: "Delivery location must be at least 5 characters.",
  }),
  package_type: z.string({
    required_error: "Please select a package type.",
  }),
  priority: z.enum(["normal", "urgent"], {
    required_error: "Please select a priority level.",
  }),
  notes: z.string().optional(),
  temperature_sensitive: z.boolean().default(false),
  temperature_range: z.string().optional(),
  needs_signature: z.boolean().default(false),
  recipient_name: z.string().optional(),
  recipient_phone: z.string().optional(),
});

export default function CustomerNewRequest() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pickup_location: "",
      delivery_location: "",
      package_type: "",
      priority: "normal",
      notes: "",
      temperature_sensitive: false,
      temperature_range: "",
      needs_signature: false,
      recipient_name: "",
      recipient_phone: "",
    },
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication error",
        description: "You must be logged in to create delivery requests.",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Build the delivery request with user info and proper typing
      const deliveryRequest = {
        ...values,
        email: user.email,
        user_id: user.id,
        status: 'pending' as const, // Proper type casting
      };
      
      // Submit to the API service
      const response = await createDeliveryRequest(deliveryRequest);
      
      toast({
        title: "Request submitted successfully",
        description: `Your delivery request has been created with ID: ${response.id}`,
      });
      
      // Reset the form
      form.reset();
      
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["customerDeliveries"] });
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to submit request",
        description: "There was an error submitting your request. Please try again.",
      });
      console.error("Error submitting delivery request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Show temperature range input only when the temperature sensitive checkbox is checked
  const showTempRange = form.watch("temperature_sensitive");
  
  // Show recipient fields when signature is required
  const showRecipientInfo = form.watch("needs_signature");
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="pickup_location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pickup Location</FormLabel>
                <FormControl>
                  <Input placeholder="Enter full address" {...field} />
                </FormControl>
                <FormDescription>
                  Enter the complete address for pickup
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="delivery_location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delivery Location</FormLabel>
                <FormControl>
                  <Input placeholder="Enter full address" {...field} />
                </FormControl>
                <FormDescription>
                  Enter the complete address for delivery
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="package_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Package Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a package type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="medical_supplies">Medical Supplies</SelectItem>
                    <SelectItem value="lab_samples">Lab Samples</SelectItem>
                    <SelectItem value="medication">Medication</SelectItem>
                    <SelectItem value="equipment">Medical Equipment</SelectItem>
                    <SelectItem value="documents">Medical Documents</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Priority</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="normal" />
                      </FormControl>
                      <FormLabel className="font-normal">Standard Delivery</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="urgent" />
                      </FormControl>
                      <FormLabel className="font-normal">Urgent Delivery</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <FormField
            control={form.control}
            name="temperature_sensitive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Temperature Sensitive</FormLabel>
                  <FormDescription>
                    Check if the package requires temperature control
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          
          {showTempRange && (
            <FormField
              control={form.control}
              name="temperature_range"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temperature Range</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 2-8°C" {...field} />
                  </FormControl>
                  <FormDescription>
                    Specify the required temperature range
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          <FormField
            control={form.control}
            name="needs_signature"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Requires Signature</FormLabel>
                  <FormDescription>
                    Check if a signature is required upon delivery
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          
          {showRecipientInfo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="recipient_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full name of recipient" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="recipient_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
          
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Notes</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Any special handling instructions or other information"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Delivery Request"}
        </Button>
      </form>
    </Form>
  );
}
