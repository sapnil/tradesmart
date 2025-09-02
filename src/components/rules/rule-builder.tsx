
"use client";

import { useState } from "react";
import {
  Rule,
  Condition,
  Action,
  ConditionType,
  ActionType,
  conditionTypes,
  actionTypes,
  conditionLabels,
  actionLabels,
} from "@/types/rules";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { products, organizationHierarchy, productHierarchy } from "@/lib/data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/hooks/use-toast";

// Helper to generate a unique ID
const generateId = () => `_${Math.random().toString(36).substr(2, 9)}`;

// Default configs for new blocks
const getDefaultConditionConfig = (type: ConditionType) => {
  switch (type) {
    case "dateRange":
      return { startDate: new Date().toISOString(), endDate: new Date().toISOString() };
    case "customerHierarchy":
    case "productHierarchy":
    case "totalOrderValue":
    case "totalOrderQuantity":
      return { hierarchyIds: [] };
    case "productPurchase":
      return { productId: "", quantity: 1 };
    default:
      return {};
  }
};

const getDefaultActionConfig = (type: ActionType) => {
  switch (type) {
    case "applyPercentageDiscount":
      return { productHierarchyIds: [], discount: 10 };
    case "applyFixedValueDiscount":
      return { discount: 100 };
    case "addFreeProduct":
      return { productId: "", quantity: 1 };
    case "setBundlePrice":
        return { productIds: [], price: 100 };
    default:
      return {};
  }
};

interface ConditionBlockProps {
  condition: Condition;
  onUpdate: (id: string, config: any) => void;
  onRemove: (id: string) => void;
}

const ConditionBlock: React.FC<ConditionBlockProps> = ({ condition, onUpdate, onRemove }) => {
    const renderContent = () => {
        switch (condition.type) {
            case "dateRange":
                return (
                    <div className="flex gap-4">
                        <DatePicker
                            value={new Date(condition.config.startDate)}
                            onChange={(date) => onUpdate(condition.id, { ...condition.config, startDate: date?.toISOString() })}
                        />
                        <DatePicker
                            value={new Date(condition.config.endDate)}
                            onChange={(date) => onUpdate(condition.id, { ...condition.config, endDate: date?.toISOString() })}
                        />
                    </div>
                );
            case "customerHierarchy":
                 return (
                    <Select onValueChange={(value) => onUpdate(condition.id, { ...condition.config, hierarchyIds: [value] })}>
                        <SelectTrigger><SelectValue placeholder="Select customer hierarchy..." /></SelectTrigger>
                        <SelectContent>
                            {organizationHierarchy.map(h => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                );
            case "productHierarchy":
                 return (
                    <Select onValueChange={(value) => onUpdate(condition.id, { ...condition.config, hierarchyIds: [value] })}>
                        <SelectTrigger><SelectValue placeholder="Select product hierarchy..." /></SelectTrigger>
                        <SelectContent>
                            {productHierarchy.map(h => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                );
            case "productPurchase":
                return (
                    <div className="flex gap-4">
                        <Select value={condition.config.productId} onValueChange={(value) => onUpdate(condition.id, { ...condition.config, productId: value })}>
                            <SelectTrigger><SelectValue placeholder="Select product..." /></SelectTrigger>
                            <SelectContent>
                                {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Input
                            type="number"
                            placeholder="Quantity"
                            value={condition.config.quantity}
                            onChange={(e) => onUpdate(condition.id, { ...condition.config, quantity: parseInt(e.target.value) })}
                        />
                    </div>
                );
            case 'totalOrderValue':
                return (
                    <div className="flex gap-4 items-center">
                        <span>Total value of products from</span>
                        <Select onValueChange={(value) => onUpdate(condition.id, { ...condition.config, productHierarchyIds: [value] })}>
                            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select hierarchy..." /></SelectTrigger>
                            <SelectContent>
                                {productHierarchy.map(h => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                         <span>is at least</span>
                         <Input type="number" value={condition.config.value} onChange={(e) => onUpdate(condition.id, { ...condition.config, value: parseInt(e.target.value) })} className="w-[100px]"/>
                    </div>
                );
            case 'totalOrderQuantity':
                 return (
                    <div className="flex gap-4 items-center">
                        <span>Total quantity of products from</span>
                        <Select onValueChange={(value) => onUpdate(condition.id, { ...condition.config, productHierarchyIds: [value] })}>
                            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select hierarchy..." /></SelectTrigger>
                            <SelectContent>
                                {productHierarchy.map(h => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                         <span>is at least</span>
                         <Input type="number" value={condition.config.quantity} onChange={(e) => onUpdate(condition.id, { ...condition.config, quantity: parseInt(e.target.value) })} className="w-[100px]"/>
                    </div>
                );
            default:
                return <p>Condition type not configured.</p>;
        }
    }
    return (
        <Card className="bg-muted/30">
            <CardHeader className="flex flex-row items-center justify-between p-4">
                <div className="flex items-center gap-2">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                    <h4 className="font-semibold">{conditionLabels[condition.type]}</h4>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onRemove(condition.id)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                {renderContent()}
            </CardContent>
        </Card>
    );
}

interface ActionBlockProps {
    action: Action;
    onUpdate: (id: string, config: any) => void;
    onRemove: (id: string) => void;
}

const ActionBlock: React.FC<ActionBlockProps> = ({ action, onUpdate, onRemove }) => {
    const renderContent = () => {
         switch (action.type) {
            case "applyPercentageDiscount":
                 return (
                    <div className="flex gap-4 items-center">
                        <span>Apply a</span>
                        <Input type="number" value={action.config.discount} onChange={e => onUpdate(action.id, {...action.config, discount: parseInt(e.target.value)})} className="w-20" />
                        <span>% discount to products in</span>
                         <Select onValueChange={(value) => onUpdate(action.id, { ...action.config, productHierarchyIds: [value] })}>
                            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select hierarchy..." /></SelectTrigger>
                            <SelectContent>
                                {productHierarchy.map(h => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                );
            case "applyFixedValueDiscount":
                 return (
                    <div className="flex gap-4 items-center">
                        <span>Apply a fixed discount of</span>
                        <Input type="number" value={action.config.discount} onChange={e => onUpdate(action.id, {...action.config, discount: parseInt(e.target.value)})} className="w-28" />
                        <span>to the order total.</span>
                    </div>
                );
            case "addFreeProduct":
                return (
                     <div className="flex gap-4 items-center">
                        <span>Add</span>
                        <Input type="number" value={action.config.quantity} onChange={e => onUpdate(action.id, {...action.config, quantity: parseInt(e.target.value)})} className="w-20" />
                        <span>of product</span>
                        <Select value={action.config.productId} onValueChange={(value) => onUpdate(action.id, { ...action.config, productId: value })}>
                            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select product..." /></SelectTrigger>
                            <SelectContent>
                                {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                         <span>for free.</span>
                    </div>
                );
            case "setBundlePrice":
                 return (
                    <div className="flex gap-4 items-center">
                        <span>Set a fixed price of</span>
                         <Input type="number" value={action.config.price} onChange={e => onUpdate(action.id, {...action.config, price: parseInt(e.target.value)})} className="w-28" />
                        <span>for the bundle of products from</span>
                         <Select onValueChange={(value) => onUpdate(action.id, { ...action.config, productIds: [value] })}>
                            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select product..." /></SelectTrigger>
                            <SelectContent>
                                {products.map(h => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                );
            default:
                return <p>Action type not configured.</p>;
        }
    }
    return (
        <Card className="bg-muted/30">
            <CardHeader className="flex flex-row items-center justify-between p-4">
                <div className="flex items-center gap-2">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                    <h4 className="font-semibold">{actionLabels[action.type]}</h4>
                </div>
                 <Button variant="ghost" size="icon" onClick={() => onRemove(action.id)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                {renderContent()}
            </CardContent>
        </Card>
    )
}


export function RuleBuilder() {
    const { toast } = useToast();
  const [rule, setRule] = useState<Rule>({
    id: generateId(),
    name: "",
    description: "",
    conditions: [],
    actions: [],
  });

  const addCondition = (type: ConditionType) => {
    const newCondition: Condition = {
      id: generateId(),
      type,
      config: getDefaultConditionConfig(type),
    };
    setRule((prev) => ({ ...prev, conditions: [...prev.conditions, newCondition] }));
  };

  const updateCondition = (id: string, config: any) => {
    setRule((prev) => ({
      ...prev,
      conditions: prev.conditions.map((c) => (c.id === id ? { ...c, config } : c)),
    }));
  };

  const removeCondition = (id: string) => {
    setRule((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((c) => c.id !== id),
    }));
  };

  const addAction = (type: ActionType) => {
    const newAction: Action = {
      id: generateId(),
      type,
      config: getDefaultActionConfig(type),
    };
    setRule((prev) => ({ ...prev, actions: [...prev.actions, newAction] }));
  };

  const updateAction = (id: string, config: any) => {
    setRule((prev) => ({
      ...prev,
      actions: prev.actions.map((a) => (a.id === id ? { ...a, config } : a)),
    }));
  };

  const removeAction = (id: string) => {
    setRule((prev) => ({
      ...prev,
      actions: prev.actions.filter((a) => a.id !== id),
    }));
  };

  const handleSave = () => {
    // In a real app, you'd save this to a database.
    // For now, we'll save to localStorage.
    const existingRules = JSON.parse(localStorage.getItem("dynamicRules") || "[]");
    const ruleIndex = existingRules.findIndex((r: Rule) => r.id === rule.id);

    if (ruleIndex > -1) {
        existingRules[ruleIndex] = rule;
    } else {
        existingRules.push(rule);
    }
    
    localStorage.setItem("dynamicRules", JSON.stringify(existingRules));

    toast({
        title: "Rule Saved!",
        description: `The rule "${rule.name}" has been saved successfully.`
    })
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Rule Details</CardTitle>
          <CardDescription>Give your new dynamic rule a name and description.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Input
              placeholder="Rule Name (e.g., 'High-Value Customer Discount')"
              value={rule.name}
              onChange={(e) => setRule((prev) => ({ ...prev, name: e.target.value }))}
            />
            <Textarea
                placeholder="Rule Description"
                value={rule.description}
                onChange={(e) => setRule((prev) => ({...prev, description: e.target.value}))}
            />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Conditions</CardTitle>
          <CardDescription>All of these conditions must be met for the actions to trigger.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-4">
                {rule.conditions.map(condition => (
                    <ConditionBlock key={condition.id} condition={condition} onUpdate={updateCondition} onRemove={removeCondition} />
                ))}
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline"><Plus className="mr-2 h-4 w-4" /> Add Condition</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {conditionTypes.map(type => (
                        <DropdownMenuItem key={type} onClick={() => addCondition(type)}>{conditionLabels[type]}</DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>If all conditions are met, these actions will be applied.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="space-y-4">
                {rule.actions.map(action => (
                    <ActionBlock key={action.id} action={action} onUpdate={updateAction} onRemove={removeAction} />
                ))}
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline"><Plus className="mr-2 h-4 w-4" /> Add Action</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {actionTypes.map(type => (
                        <DropdownMenuItem key={type} onClick={() => addAction(type)}>{actionLabels[type]}</DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">Save Rule</Button>
      </div>
    </div>
  );
}
