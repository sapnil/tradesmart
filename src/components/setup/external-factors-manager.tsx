
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  externalFactors as initialExternalFactors,
  organizationHierarchy,
} from "@/lib/data";
import {
  type ExternalFactor,
  type ExternalFactorType,
  externalFactorTypes,
} from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, X, CalendarIcon, Globe, Wind, Briefcase, PartyPopper } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

const formSchema = z.object({
  name: z.string().min(3, "Factor name must be at least 3 characters."),
  type: z.enum(externalFactorTypes),
  description: z.string().min(10, "Description must be at least 10 characters."),
  startDate: z.date(),
  endDate: z.date(),
  applicableHierarchyIds: z
    .array(z.string())
    .min(1, "At least one hierarchy is required."),
});

type FactorFormValues = z.infer<typeof formSchema>;

export function ExternalFactorsManager() {
  const { toast } = useToast();
  const [factors, setFactors] = useState<ExternalFactor[]>(initialExternalFactors);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<FactorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      startDate: new Date(),
      endDate: new Date(),
      applicableHierarchyIds: [],
    },
  });

  const getHierarchyName = (id: string) => {
    return (
      organizationHierarchy.find((h) => h.id === id)?.name || "Unknown"
    );
  };
  
  const handleMultiSelectChange = (value: string) => {
    const currentValues = form.getValues("applicableHierarchyIds") || [];
    if (currentValues.includes(value)) {
      form.setValue(
        "applicableHierarchyIds",
        currentValues.filter((v) => v !== value)
      );
    } else {
      form.setValue("applicableHierarchyIds", [...currentValues, value]);
    }
  };

  const onSubmit = (data: FactorFormValues) => {
    const newFactor: ExternalFactor = {
      id: `EF-${Date.now()}`,
      ...data,
      startDate: format(data.startDate, "yyyy-MM-dd"),
      endDate: format(data.endDate, "yyyy-MM-dd"),
    };
    setFactors((prev) => [...prev, newFactor]);
    toast({
      title: "External Factor Created",
      description: `The factor "${data.name}" has been successfully created.`,
    });
    form.reset({ name: "", description: "", applicableHierarchyIds: [], startDate: new Date(), endDate: new Date() });
    setIsDialogOpen(false);
  };
  
  const getTypeIcon = (type: ExternalFactorType) => {
    switch (type) {
        case 'Seasonality':
            return <Wind className="h-4 w-4" />;
        case 'CompetitorActivity':
            return <Briefcase className="h-4 w-4" />;
        case 'LocalEvent':
            return <PartyPopper className="h-4 w-4" />;
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle>External Factors</CardTitle>
            <CardDescription>
              A list of market events that can influence promotion outcomes.
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2" />
                Create New Factor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New External Factor</DialogTitle>
                <DialogDescription>
                  Define an external event, its duration, and where it applies.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4 py-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Factor Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. North India Heatwave"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a factor type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {externalFactorTypes.map((type) => (
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
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g. Extended period of high temperatures..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <div className="grid grid-cols-2 gap-4">
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
                        name="applicableHierarchyIds"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Applicable Hierarchies</FormLabel>
                            <Select onValueChange={handleMultiSelectChange}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Select organization hierarchies" />
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
                            {field.value?.map((id) => (
                                <Badge
                                key={id}
                                variant="secondary"
                                className="flex items-center gap-1"
                                >
                                {getHierarchyName(id)}
                                <button
                                    type="button"
                                    onClick={() => handleMultiSelectChange(id)}
                                    className="rounded-full hover:bg-muted-foreground/20 p-0.5"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                                </Badge>
                            ))}
                            </div>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                  <DialogFooter>
                    <Button type="submit">Create Factor</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Applicable Hierarchies</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {factors.map(factor => (
                        <TableRow key={factor.id}>
                            <TableCell className="font-medium">{factor.name}</TableCell>
                            <TableCell>
                                <Badge variant="outline" className="gap-1.5">
                                    {getTypeIcon(factor.type)}
                                    {factor.type}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{factor.description}</TableCell>
                            <TableCell>{factor.startDate} to {factor.endDate}</TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1">
                                    {factor.applicableHierarchyIds.map(id => (
                                        <Badge key={id} variant="secondary">{getHierarchyName(id)}</Badge>
                                    ))}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                    {factors.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                No external factors defined yet.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
