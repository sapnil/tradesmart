
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, PlusCircle, Trash, X } from "lucide-react";
import { format } from "date-fns";
import { promotionTypes, type Promotion } from "@/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { products, organizationHierarchy, productHierarchy } from "@/lib/data";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const promotionProductSchema = z.object({
  productId: z.string().min(1, "Product is required."),
  buyQuantity: z.coerce.number().min(1, "Buy quantity must be at least 1."),
  getQuantity: z.coerce.number().min(1, "Get quantity must be at least 1."),
  getSKU: z.string().min(1, "Get SKU is required."),
});

const formSchema = z.object({
  schemeName: z.string().min(3, "Scheme name must be at least 3 characters."),
  type: z.enum(promotionTypes),
  status: z.enum(["Active", "Upcoming", "Expired"]),
  startDate: z.date(),
  endDate: z.date(),
  uplift: z.coerce.number().optional(),
  products: z.array(promotionProductSchema),
  hierarchyIds: z.array(z.string()).min(1, "At least one hierarchy level is required."),
  productHierarchyIds: z.array(z.string()).min(1, "At least one product hierarchy level is required."),
});

type PromotionFormValues = z.infer<typeof formSchema>;

export function PromotionForm({ promotion }: { promotion?: Promotion }) {
  const router = useRouter();
  const { toast } = useToast();
  
  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: promotion ? {
        ...promotion,
        startDate: new Date(promotion.startDate),
        endDate: new Date(promotion.endDate),
    } : {
        schemeName: "",
        type: "Discount",
        status: "Upcoming",
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
        uplift: 0,
        products: [],
        hierarchyIds: [],
        productHierarchyIds: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "products",
  });

  const onSubmit = (data: PromotionFormValues) => {
    // Here you would typically call an API to save the data
    console.log("Form submitted", data);
    toast({
      title: `Promotion ${promotion ? 'updated' : 'created'}`,
      description: `The promotion "${data.schemeName}" has been successfully ${promotion ? 'updated' : 'created'}.`,
    });
    router.push("/promotions");
    // In a real app, you might want to revalidate the data
    // For this example, we'll just navigate back
  };

  const onDelete = () => {
    if (!promotion) return;
    // Here you would call an API to delete the promotion
    console.log("Deleting promotion", promotion.id);
    toast({
        title: "Promotion deleted",
        description: `The promotion "${promotion.schemeName}" has been deleted.`,
        variant: "destructive",
    });
    router.push("/promotions");
  };

  function handleMultiSelectChange(field: any, value: string) {
    const currentValues = field.value || [];
    if (currentValues.includes(value)) {
      field.onChange(currentValues.filter((v: string) => v !== value));
    } else {
      field.onChange([...currentValues, value]);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{promotion ? "Edit" : "Create"} Promotion</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="schemeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scheme Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Monsoon Bonanza" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Promotion Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a promotion type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {promotionTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Upcoming">Upcoming</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="hierarchyIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Hierarchy</FormLabel>
                  <Select onValueChange={(value) => handleMultiSelectChange(field, value)} >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select hierarchy levels to apply this promotion" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {organizationHierarchy.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} ({item.level})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {field.value?.map(id => {
                        const item = organizationHierarchy.find(h => h.id === id);
                        return item ? (
                            <Badge key={id} variant="secondary" className="flex items-center gap-1">
                                {item.name}
                                <button type="button" onClick={() => handleMultiSelectChange(field, id)} className="rounded-full hover:bg-muted-foreground/20 p-0.5">
                                    <X className="h-3 w-3"/>
                                </button>
                            </Badge>
                        ) : null
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="productHierarchyIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Hierarchy</FormLabel>
                   <Select onValueChange={(value) => handleMultiSelectChange(field, value)} >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product hierarchy levels to apply this promotion" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {productHierarchy.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} ({item.level})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {field.value?.map(id => {
                        const item = productHierarchy.find(h => h.id === id);
                        return item ? (
                            <Badge key={id} variant="secondary" className="flex items-center gap-1">
                                {item.name}
                                <button type="button" onClick={() => handleMultiSelectChange(field, id)} className="rounded-full hover:bg-muted-foreground/20 p-0.5">
                                    <X className="h-3 w-3"/>
                                </button>
                            </Badge>
                        ) : null
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Card>
                <CardHeader>
                    <CardTitle>Products & Offers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {fields.map((field, index) => (
                        <div key={field.id} className="space-y-4 border p-4 rounded-md relative">
                             <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={() => remove(index)}
                                >
                                <Trash className="h-4 w-4" />
                            </Button>
                            <FormField
                                control={form.control}
                                name={`products.${index}.productId`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Buy Product</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a product to apply promotion" />
                                                </Trigger>
                                            </FormControl>
                                            <SelectContent>
                                                {products.map((product) => (
                                                    <SelectItem key={product.id} value={product.id}>
                                                        {product.name} ({product.sku})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid md:grid-cols-3 gap-4">
                               <FormField
                                    control={form.control}
                                    name={`products.${index}.buyQuantity`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Buy Quantity</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g. 6" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`products.${index}.getQuantity`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Get Quantity</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g. 1" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`products.${index}.getSKU`}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Get Product (Free)</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select free product" />
                                                </Trigger>
                                            </FormControl>
                                            <SelectContent>
                                                {products.map((product) => (
                                                    <SelectItem key={product.id} value={product.id}>
                                                        {product.name} ({product.sku})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            </div>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ productId: '', buyQuantity: 1, getQuantity: 1, getSKU: '' })}
                    >
                       <PlusCircle className="mr-2 h-4 w-4" /> Add Product Rule
                    </Button>
                </CardContent>
            </Card>

            <FormField
              control={form.control}
              name="uplift"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Uplift (%)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 15.2" {...field} />
                  </FormControl>
                  <FormDescription>
                    The expected or actual sales uplift from this promotion.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between">
              <div>
                {promotion && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Delete Promotion</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the
                          promotion &quot;{promotion.schemeName}&quot;.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onDelete}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
              <div className="flex gap-2">
                 <Button type="button" variant="outline" onClick={() => router.push('/promotions')}>
                    Cancel
                </Button>
                <Button type="submit">{promotion ? "Update" : "Create"} Promotion</Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
