

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, ControllerRenderProps } from "react-hook-form";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, PlusCircle, Sparkles, Trash, X, Loader2, Send } from "lucide-react";
import { format } from "date-fns";
import { promotionTypes, type Promotion, type DistributorInfo } from "@/types";
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
import { products, organizationHierarchy, productHierarchy, promotions as pastPromotions, salesData, organizationGroups } from "@/lib/data";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { predictPromotionUplift } from "@/ai/flows/predict-promotion-uplift";
import { PredictPromotionUpliftOutput } from "@/types/promotions";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "../ui/textarea";
import { generateNotification } from "@/ai/flows/generate-notification";

const promotionProductSchema = z.object({
  productId: z.string().min(1, "Product is required."),
  buyQuantity: z.coerce.number().min(1, "Buy quantity must be at least 1."),
  getQuantity: z.coerce.number().min(1, "Get quantity must be at least 1."),
  getProductId: z.string().min(1, "Get product is required."),
});

const discountTierSchema = z.object({
    minQuantity: z.coerce.number().min(1, "Min quantity must be at least 1."),
    maxQuantity: z.coerce.number().min(1, "Max quantity must be at least 1."),
    discountPercentage: z.coerce.number().min(1, "Discount must be at least 1%.").max(100, "Discount cannot exceed 100%."),
});

const bundleProductSchema = z.object({
    productId: z.string().min(1, "Product is required."),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
});

const mustBuyProductSchema = z.object({
    productId: z.string().min(1, "Product is required."),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
});


const formSchema = z.object({
  schemeName: z.string().min(3, "Scheme name must be at least 3 characters."),
  type: z.enum(promotionTypes),
  status: z.enum(["Active", "Upcoming", "Expired"]),
  startDate: z.date(),
  endDate: z.date(),
  uplift: z.coerce.number().optional(),
  products: z.array(promotionProductSchema).optional(),
  discountTiers: z.array(discountTierSchema).optional(),
  bundleProducts: z.array(bundleProductSchema).optional(),
  bundlePrice: z.coerce.number().optional(),
  hierarchyIds: z.array(z.string()).min(1, "At least one hierarchy level is required."),
  organizationGroupIds: z.array(z.string()).optional(),
  productHierarchyIds: z.array(z.string()).min(1, "At least one product hierarchy level is required."),
  minValue: z.coerce.number().optional(),
  discountValue: z.coerce.number().optional(),
  mustBuyProducts: z.array(mustBuyProductSchema).optional(),
  discountPercentage: z.coerce.number().optional(),
  qpsTargetQuantity: z.coerce.number().optional(),
  qpsDurationMonths: z.coerce.number().optional(),
  qpsReward: z.string().optional(),
});

type PromotionFormValues = z.infer<typeof formSchema>;

export function PromotionForm({ promotion }: { promotion?: Partial<Promotion> }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState<PredictPromotionUpliftOutput | null>(null);
  
  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      schemeName: promotion?.schemeName || "",
      type: promotion?.type || "Discount",
      status: promotion?.status || "Upcoming",
      startDate: promotion?.startDate ? new Date(promotion.startDate) : new Date(),
      endDate: promotion?.endDate ? new Date(promotion.endDate) : new Date(new Date().setDate(new Date().getDate() + 30)),
      uplift: promotion?.uplift || 0,
      products: promotion?.products?.map(p => ({...p, getProductId: p.getProductId || ''})) || [],
      discountTiers: promotion?.discountTiers || [],
      bundleProducts: promotion?.bundleProducts || [],
      bundlePrice: promotion?.bundlePrice || 0,
      hierarchyIds: promotion?.hierarchyIds || [],
      organizationGroupIds: promotion?.organizationGroupIds || [],
      productHierarchyIds: promotion?.productHierarchyIds || [],
      minValue: promotion?.minValue || 0,
      discountValue: promotion?.discountValue || 0,
      mustBuyProducts: promotion?.mustBuyProducts || [],
      discountPercentage: promotion?.discountPercentage || 0,
      qpsTargetQuantity: promotion?.qpsTargetQuantity || 0,
      qpsDurationMonths: promotion?.qpsDurationMonths || 0,
      qpsReward: promotion?.qpsReward || "",
    },
  });

  const { fields: productFields, append: appendProduct, remove: removeProduct } = useFieldArray({
    control: form.control,
    name: "products",
  });

  const { fields: tierFields, append: appendTier, remove: removeTier } = useFieldArray({
    control: form.control,
    name: "discountTiers",
  });

  const { fields: bundleFields, append: appendBundleProduct, remove: removeBundleProduct } = useFieldArray({
    control: form.control,
    name: "bundleProducts",
  });

  const { fields: mustBuyFields, append: appendMustBuy, remove: removeMustBuy } = useFieldArray({
    control: form.control,
    name: "mustBuyProducts",
  });

  const handlePredictUplift = async () => {
    setIsPredicting(true);
    setPrediction(null);
    const formValues = form.getValues();
    try {
        const result = await predictPromotionUplift({
            promotionJson: JSON.stringify(formValues, null, 2),
            salesDataJson: JSON.stringify(salesData, null, 2),
            pastPromotionsJson: JSON.stringify(pastPromotions.filter(p => p.status === 'Expired'), null, 2),
        });
        setPrediction(result);
        form.setValue("uplift", parseFloat(result.predictedUplift.toFixed(2)));
    } catch (error) {
        console.error("Failed to predict uplift:", error);
        toast({
            title: "Prediction Failed",
            description: "An error occurred while trying to predict the uplift.",
            variant: "destructive",
        });
    } finally {
        setIsPredicting(false);
    }
  };


  const onSubmit = (data: PromotionFormValues) => {
    // Here you would typically call an API to save the data
    console.log("Form submitted", data);
    toast({
      title: `Promotion ${promotion?.id ? 'updated' : 'created'}`,
      description: `The promotion "${data.schemeName}" has been successfully ${promotion?.id ? 'updated' : 'created'}.`,
    });
    router.push("/promotions");
  };

  function handleMultiSelectChange(field: ControllerRenderProps<PromotionFormValues, "hierarchyIds" | "productHierarchyIds" | "organizationGroupIds">, value: string) {
    const currentValues = field.value || [];
    if (currentValues.includes(value)) {
      field.onChange(currentValues.filter((v: string) => v !== value));
    } else {
      field.onChange([...currentValues, value]);
    }
  }

  const selectedPromotionType = form.watch("type");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{promotion?.id ? "Edit" : "Create"} Promotion</CardTitle>
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
                  <Select onValueChange={(value) => handleMultiSelectChange(field as any, value)} >
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
                                <button type="button" onClick={() => handleMultiSelectChange(field as any, id)} className="rounded-full hover:bg-muted-foreground/20 p-0.5">
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
              name="organizationGroupIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Groups</FormLabel>
                  <Select onValueChange={(value) => handleMultiSelectChange(field as any, value)} >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select groups to apply this promotion" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {organizationGroups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {field.value?.map(id => {
                        const item = organizationGroups.find(g => g.id === id);
                        return item ? (
                            <Badge key={id} variant="secondary" className="flex items-center gap-1">
                                {item.name}
                                <button type="button" onClick={() => handleMultiSelectChange(field as any, id)} className="rounded-full hover:bg-muted-foreground/20 p-0.5">
                                    <X className="h-3 w-3"/>
                                </button>
                            </Badge>
                        ) : null
                    })}
                  </div>
                   <FormDescription>
                        Optionally target specific organization groups.
                    </FormDescription>
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
                   <Select onValueChange={(value) => handleMultiSelectChange(field as any, value)} >
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
                                <button type="button" onClick={() => handleMultiSelectChange(field as any, id)} className="rounded-full hover:bg-muted-foreground/20 p-0.5">
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
            
            {selectedPromotionType === 'Quantity-Based Freebie (Buy X, Get Y)' && (
            <Card>
                <CardHeader>
                    <CardTitle>Products & Offers</CardTitle>
                    <CardDescription>Define the "Buy X, Get Y" rules for this promotion.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {productFields.map((field, index) => (
                        <div key={field.id} className="space-y-4 border p-4 rounded-md relative">
                             <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={() => removeProduct(index)}
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
                                                </SelectTrigger>
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
                                    name={`products.${index}.getProductId`}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Get Product (Free)</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select free product" />
                                                </SelectTrigger>
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
                        onClick={() => appendProduct({ productId: '', buyQuantity: 1, getQuantity: 1, getProductId: '' })}
                    >
                       <PlusCircle className="mr-2 h-4 w-4" /> Add Product Rule
                    </Button>
                </CardContent>
            </Card>
            )}

            {selectedPromotionType === 'Tiered Volume Discount' && (
            <Card>
                <CardHeader>
                    <CardTitle>Discount Tiers</CardTitle>
                    <FormDescription>Define quantity ranges and the discount for each.</FormDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {tierFields.map((field, index) => (
                        <div key={field.id} className="space-y-4 border p-4 rounded-md relative">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={() => removeTier(index)}
                            >
                                <Trash className="h-4 w-4" />
                            </Button>
                            <div className="grid md:grid-cols-3 gap-4 items-end">
                               <FormField
                                    control={form.control}
                                    name={`discountTiers.${index}.minQuantity`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Min Quantity</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g. 10" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                               <FormField
                                    control={form.control}
                                    name={`discountTiers.${index}.maxQuantity`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Max Quantity</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g. 49" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                               <FormField
                                    control={form.control}
                                    name={`discountTiers.${index}.discountPercentage`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Discount (%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g. 5" {...field} />
                                            </FormControl>
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
                        onClick={() => appendTier({ minQuantity: 1, maxQuantity: 1, discountPercentage: 0 })}
                    >
                       <PlusCircle className="mr-2 h-4 w-4" /> Add Tier
                    </Button>
                </CardContent>
            </Card>
            )}

            {selectedPromotionType === 'Bundle' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Product Bundle</CardTitle>
                        <CardDescription>Define the products included in the bundle and the final bundle price.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {bundleFields.map((field, index) => (
                            <div key={field.id} className="flex gap-4 items-end border p-4 rounded-md relative">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2"
                                    onClick={() => removeBundleProduct(index)}
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                                <FormField
                                    control={form.control}
                                    name={`bundleProducts.${index}.productId`}
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Product</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a product" />
                                                    </SelectTrigger>
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
                                <FormField
                                    control={form.control}
                                    name={`bundleProducts.${index}.quantity`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Quantity</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g. 1" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        ))}
                         <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => appendBundleProduct({ productId: '', quantity: 1 })}
                        >
                           <PlusCircle className="mr-2 h-4 w-4" /> Add Product to Bundle
                        </Button>

                        <Separator />

                         <FormField
                            control={form.control}
                            name="bundlePrice"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Total Bundle Price</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="e.g. 150" {...field} className="max-w-xs" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
            )}

            {selectedPromotionType === 'Value-Based Discount' && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Value-Based Discount</CardTitle>
                        <CardDescription>Give a discount when the order value for targeted products reaches a certain amount.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                           <FormField
                                control={form.control}
                                name="minValue"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Minimum Purchase Value</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="e.g. 10000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="discountValue"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Discount Amount</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="e.g. 500" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {selectedPromotionType === 'Forced-Buy / Must-Stock' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Forced-Buy / Must-Stock</CardTitle>
                        <CardDescription>Define a set of products that must be purchased to qualify for the promotion. The discount will apply to all items targeted by the 'Product Hierarchy' selection.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {mustBuyFields.map((field, index) => (
                            <div key={field.id} className="flex gap-4 items-end border p-4 rounded-md relative">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2"
                                    onClick={() => removeMustBuy(index)}
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                                <FormField
                                    control={form.control}
                                    name={`mustBuyProducts.${index}.productId`}
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Product</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a product" />
                                                    </SelectTrigger>
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
                                <FormField
                                    control={form.control}
                                    name={`mustBuyProducts.${index}.quantity`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Min Quantity</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g. 5" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        ))}
                         <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => appendMustBuy({ productId: '', quantity: 1 })}
                        >
                           <PlusCircle className="mr-2 h-4 w-4" /> Add Must-Buy Product
                        </Button>
                    </CardContent>
                </Card>
            )}

            {(selectedPromotionType === 'Discount' || selectedPromotionType === 'Forced-Buy / Must-Stock') && (
                <Card>
                    <CardHeader>
                        <CardTitle>Discount</CardTitle>
                        <CardDescription>
                            {selectedPromotionType === 'Discount' 
                                ? "Define the percentage discount for this promotion." 
                                : "Define the percentage discount applied when the must-buy conditions are met."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="discountPercentage"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Discount Percentage (%)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="e.g. 10" {...field} className="max-w-xs" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
            )}

            {selectedPromotionType === 'QPS (Long-Term Incentive)' && (
                <Card>
                    <CardHeader>
                        <CardTitle>QPS (Long-Term Incentive) Rules</CardTitle>
                        <CardDescription>Define the long-term sales target and reward for distributors.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                           <FormField
                                control={form.control}
                                name="qpsTargetQuantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Target Quantity</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="e.g. 10000" {...field} />
                                        </FormControl>
                                        <FormDescription>Total quantity of targeted products to be sold.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="qpsDurationMonths"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Duration (Months)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="e.g. 3" {...field} />
                                        </FormControl>
                                        <FormDescription>How many months the distributor has to meet the target.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                         <FormField
                            control={form.control}
                            name="qpsReward"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reward</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="e.g. Bike or Paris Tour for 2" {...field} />
                                    </FormControl>
                                    <FormDescription>Describe the prize for achieving the target.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
            )}


            <div className="space-y-4">
              <FormField
                control={form.control}
                name="uplift"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Uplift (%)</FormLabel>
                     <div className="flex items-center gap-2">
                        <FormControl>
                          <Input type="number" placeholder="e.g. 15.2" {...field} className="max-w-xs" />
                        </FormControl>
                        <Button type="button" variant="outline" onClick={handlePredictUplift} disabled={isPredicting}>
                            {isPredicting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Sparkles className="mr-2 h-4 w-4" />
                            )}
                            Predict with AI
                        </Button>
                    </div>
                    <FormDescription>
                      The expected or actual sales uplift from this promotion. You can use AI to predict this value.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {isPredicting && (
                  <div className="flex items-center text-sm text-muted-foreground">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      The AI is analyzing the data...
                  </div>
              )}
              {prediction && (
                <Alert>
                    <Sparkles className="h-4 w-4" />
                    <AlertTitle>AI Uplift Prediction: {prediction.predictedUplift.toFixed(2)}%</AlertTitle>
                    <AlertDescription className="mt-2 space-y-2">
                        <p>{prediction.reasoning}</p>
                        <p className="text-xs text-muted-foreground">Confidence: {prediction.confidenceScore}%</p>
                    </AlertDescription>
                </Alert>
              )}
            </div>


            <div className="flex justify-end">
              <div className="flex gap-2">
                 <Button type="button" variant="outline" onClick={() => router.push('/promotions')}>
                    Cancel
                </Button>
                <Button type="submit">{promotion?.id ? "Update" : "Create"} Promotion</Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
