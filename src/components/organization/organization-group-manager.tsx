
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { organizationHierarchy, organizationGroups as initialGroups } from "@/lib/data";
import { type OrganizationGroup, type OrganizationHierarchy } from "@/types";
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
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Users, X } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";


const formSchema = z.object({
  name: z.string().min(3, "Group name must be at least 3 characters."),
  memberIds: z.array(z.string()).min(1, "A group must have at least one member."),
});

type GroupFormValues = z.infer<typeof formSchema>;

export function OrganizationGroupManager() {
  const { toast } = useToast();
  const [groups, setGroups] = useState<OrganizationGroup[]>(initialGroups);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<GroupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      memberIds: [],
    },
  });

  const getMemberName = (memberId: string) => {
    return organizationHierarchy.find((m) => m.id === memberId)?.name || "Unknown Member";
  };
  
  const getMemberLevel = (memberId: string) => {
      return organizationHierarchy.find((m) => m.id === memberId)?.level;
  }

  const handleMultiSelectChange = (value: string) => {
    const currentValues = form.getValues("memberIds") || [];
    if (currentValues.includes(value)) {
      form.setValue("memberIds", currentValues.filter((v) => v !== value));
    } else {
      form.setValue("memberIds", [...currentValues, value]);
    }
  };

  const onSubmit = (data: GroupFormValues) => {
    const newGroup: OrganizationGroup = {
      id: `GROUP-${Date.now()}`,
      ...data,
    };
    setGroups((prev) => [...prev, newGroup]);
    toast({
        title: "Group Created",
        description: `The group "${data.name}" has been successfully created.`,
    });
    form.reset();
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-end">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2" />
                  Create New Group
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Organization Group</DialogTitle>
                  <DialogDescription>
                    Define a name for your group and select its members.
                  </DialogDescription>
                </DialogHeader>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Group Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. High-Value Retailers" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="memberIds"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Group Members</FormLabel>
                                    <Select onValueChange={handleMultiSelectChange}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select members to add to the group" />
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
                                                    <button type="button" onClick={() => handleMultiSelectChange(id)} className="rounded-full hover:bg-muted-foreground/20 p-0.5">
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
                         <DialogFooter>
                            <Button type="submit">Create Group</Button>
                        </DialogFooter>
                    </form>
                </Form>
              </DialogContent>
            </Dialog>
        </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <Card key={group.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="text-primary" />
                {group.name}
              </CardTitle>
              <CardDescription>
                This group contains {group.memberIds.length} member(s).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Members:</h4>
                <div className="flex flex-wrap gap-2">
                    {group.memberIds.map((memberId) => (
                        <Badge key={memberId} variant="outline">
                            {getMemberName(memberId)} ({getMemberLevel(memberId)})
                        </Badge>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

       {groups.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No Groups Yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Get started by creating your first organization group.
              </p>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
