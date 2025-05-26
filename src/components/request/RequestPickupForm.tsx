import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { useToast } from "@/components/ui/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusCircle, CheckCircle, AlertTriangle } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { createRequest } from "@/lib/request-actions"
import { useAuth } from "@/lib/auth"
import { useNavigate } from "react-router-dom"
import { DeliveryRequest } from '@/types/delivery';

const quickServices = [
  {
    id: "qs-1",
    name: "Medical Supplies - Hospital A to Hospital B",
    pickup: "Hospital A, 123 Main St",
    delivery: "Hospital B, 456 Elm St",
    type: "medical_supplies",
    priority: "urgent",
  },
  {
    id: "qs-2",
    name: "Lab Samples - Clinic X to Lab Y",
    pickup: "Clinic X, 789 Oak St",
    delivery: "Lab Y, 101 Pine St",
    type: "lab_samples",
    priority: "normal",
  },
  {
    id: "qs-3",
    name: "Medication - Pharmacy P to Patient Q",
    pickup: "Pharmacy P, 1122 Willow St",
    delivery: "Patient Q, 3344 Maple St",
    type: "medication",
    priority: "urgent",
  },
]

const formSchema = z.object({
  pickupLocation: z.string().min(2, {
    message: "Pickup location must be at least 2 characters.",
  }),
  deliveryLocation: z.string().min(2, {
    message: "Delivery location must be at least 2 characters.",
  }),
  priority: z.enum(["normal", "urgent"], {
    required_error: "Please select a priority level.",
  }),
  packageType: z.string({
    required_error: "Please select a package type.",
  }),
})

const RequestPickupForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [trackingId, setTrackingId] = useState(
    "TRK-" + Math.random().toString(36).substring(2, 10).toUpperCase()
  )
  const [selectedQuickService, setSelectedQuickService] = useState(null)
  const { toast } = useToast()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [pickupLocation, setPickupLocation] = useState("")
  const [deliveryLocation, setDeliveryLocation] = useState("")
  const [priority, setPriority] = useState("normal")
  const [packageType, setPackageType] = useState("")
  const [email, setEmail] = useState(user?.email || "")

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email)
    }
  }, [user])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pickupLocation: "",
      deliveryLocation: "",
      priority: "normal",
      packageType: "",
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pickupLocation || !deliveryLocation || !priority || !packageType || !email) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const deliveryRequest: DeliveryRequest = {
        id: trackingId,
        trackingId,
        status: 'pending' as const, // Proper type casting
        pickup_location: pickupLocation,
        delivery_location: deliveryLocation,
        priority: priority as 'normal' | 'urgent', // Proper type casting
        packageType,
        email,
        created_at: new Date().toISOString() // Add required field
      };
      
      // const response = await createRequest(deliveryRequest)
      toast({
        title: "Success!",
        description: "Your request has been submitted.",
      })
      navigate("/tracking?id=" + trackingId)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      })
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickSubmit = async () => {
    if (!selectedQuickService) return;
    
    setIsSubmitting(true);
    
    try {
      const deliveryRequest: DeliveryRequest = {
        id: trackingId,
        trackingId,
        status: 'pending' as const, // Proper type casting
        pickup_location: selectedQuickService.pickup,
        delivery_location: selectedQuickService.delivery,
        priority: selectedQuickService.priority as 'normal' | 'urgent', // Proper type casting
        packageType: selectedQuickService.type,
        email: email || '',
        created_at: new Date().toISOString() // Add required field
      };
      
      // const response = await createRequest(deliveryRequest)
      toast({
        title: "Success!",
        description: "Your request has been submitted.",
      })
      navigate("/tracking?id=" + trackingId)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      })
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="w-full md:w-1/2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Services</CardTitle>
            <CardDescription>Select a pre-defined service</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickServices.map((service) => (
              <Button
                key={service.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setSelectedQuickService(service)
                  setPickupLocation(service.pickup)
                  setDeliveryLocation(service.delivery)
                  setPackageType(service.type)
                  setPriority(service.priority)
                }}
              >
                {service.name}
              </Button>
            ))}
            {selectedQuickService && (
              <div className="mt-4">
                <Button
                  onClick={handleQuickSubmit}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? "Submitting..." : "Submit Quick Request"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="w-full md:w-1/2">
        <Card>
          <CardHeader>
            <CardTitle>Create New Request</CardTitle>
            <CardDescription>Define your own pickup and delivery</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="pickup">Pickup Location</Label>
                  <Input
                    id="pickup"
                    placeholder="Enter pickup location"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="delivery">Delivery Location</Label>
                  <Input
                    id="delivery"
                    placeholder="Enter delivery location"
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="packageType">Package Type</Label>
                  <Select
                    onValueChange={(value) => setPackageType(value)}
                    defaultValue={packageType}
                  >
                    <SelectTrigger id="packageType">
                      <SelectValue placeholder="Select package type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medical_supplies">
                        Medical Supplies
                      </SelectItem>
                      <SelectItem value="lab_samples">Lab Samples</SelectItem>
                      <SelectItem value="medication">Medication</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Priority</Label>
                  <RadioGroup
                    defaultValue={priority}
                    className="flex flex-col space-y-1"
                    onValueChange={(value) => setPriority(value)}
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="normal" id="r1" />
                      </FormControl>
                      <FormLabel htmlFor="r1">Normal</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="urgent" id="r2" />
                      </FormControl>
                      <FormLabel htmlFor="r2">Urgent</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </div>
                <Button disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default RequestPickupForm
