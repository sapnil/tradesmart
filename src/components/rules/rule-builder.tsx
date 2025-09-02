
'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  type Rule,
  type Condition,
  type Action,
  ConditionTypeSchema,
  ActionTypeSchema,
} from '@/types/rules';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  GripVertical,
  PlusCircle,
  Trash2,
  Calendar,
  Building,
  Box,
  ShoppingBag,
  CircleDollarSign,
  Package,
  Percent,
  Sparkles,
  X,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  organizationHierarchy,
  productHierarchy,
  products,
} from '@/lib/data';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

interface RuleBuilderProps {
  rule: Rule;
  onRuleChange: (rule: Rule) => void;
}

const conditionMetadata = {
  DATE_RANGE: {
    icon: Calendar,
    label: 'Date Range',
    description: 'Is the order placed within a specific date range?',
  },
  CUSTOMER_HIERARCHY: {
    icon: Building,
    label: 'Customer Hierarchy',
    description: 'Does the customer belong to a specific region or group?',
  },
  PRODUCT_HIERARCHY: {
    icon: Box,
    label: 'Product Hierarchy',
    description: 'Does the order contain products from a specific category?',
  },
  PRODUCT_PURCHASE: {
    icon: ShoppingBag,
    label: 'Specific Product Purchase',
    description: 'Does the order contain a minimum quantity of a specific SKU?',
  },
  TOTAL_ORDER_VALUE: {
    icon: CircleDollarSign,
    label: 'Total Order Value',
    description: 'Is the total value of the order above a certain amount?',
  },
  TOTAL_ORDER_QUANTITY: {
    icon: Package,
    label: 'Total Order Quantity',
    description: 'Is the total quantity of items above a certain amount?',
  },
};

const actionMetadata = {
  PERCENTAGE_DISCOUNT: {
    icon: Percent,
    label: 'Percentage Discount',
    description: 'Apply a percentage discount to matching products.',
  },
  FIXED_VALUE_DISCOUNT: {
    icon: CircleDollarSign,
    label: 'Fixed Value Discount',
    description: 'Apply a fixed amount off the total order.',
  },
  FREE_PRODUCT: {
    icon: ShoppingBag,
    label: 'Give Free Product',
    description: 'Add a specific product to the order for free.',
  },
  BUNDLE_PRICE: {
    icon: Box,
    label: 'Set Bundle Price',
    description:
      'Set a fixed total price for all items matching the conditions.',
  },
};

const SortableItem = ({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-2">
      <Button
        variant="ghost"
        size="icon"
        {...attributes}
        {...listeners}
        className="cursor-grab"
      >
        <GripVertical className="h-5 w-5" />
      </Button>
      <div className="flex-grow">{children}</div>
    </div>
  );
};


export function RuleBuilder({ rule, onRuleChange }: RuleBuilderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const updateCondition = (index: number, newConfig: Condition['config']) => {
    const newConditions = [...rule.conditions];
    newConditions[index].config = newConfig as any;
    onRuleChange({ ...rule, conditions: newConditions });
  };
  
  const handleMultiSelectChange = (
    currentValues: string[] | undefined,
    value: string,
    onChange: (values: string[]) => void
  ) => {
    const newValues = currentValues ? [...currentValues] : [];
    if (newValues.includes(value)) {
      onChange(newValues.filter((v: string) => v !== value));
    } else {
      onChange([...newValues, value]);
    }
  };

  const updateAction = (index: number, newConfig: Action['config']) => {
    const newActions = [...rule.actions];
    newActions[index].config = newConfig as any;
    onRuleChange({ ...rule, actions: newActions });
  };

  const renderConditionContent = (condition: Condition, index: number) => {
    switch(condition.type) {
        case 'DATE_RANGE':
            return (
                <div className='grid grid-cols-2 gap-4'>
                    <div>
                        <Label>Start Date</Label>
                        <Input type='date' value={condition.config.startDate} onChange={e => updateCondition(index, {...condition.config, startDate: e.target.value})} />
                    </div>
                    <div>
                        <Label>End Date</Label>
                        <Input type='date' value={condition.config.endDate} onChange={e => updateCondition(index, {...condition.config, endDate: e.target.value})} />
                    </div>
                </div>
            )
        case 'CUSTOMER_HIERARCHY':
            return (
                <div>
                  <Label>Hierarchy Levels</Label>
                  <Select onValueChange={(value) => handleMultiSelectChange(condition.config.hierarchyIds, value, (values: string[]) => updateCondition(index, { hierarchyIds: values }))}>
                      <SelectTrigger><SelectValue placeholder="Select hierarchy levels..." /></SelectTrigger>
                      <SelectContent>
                          {organizationHierarchy.map(item => <SelectItem key={item.id} value={item.id}>{item.name} ({item.level})</SelectItem>)}
                      </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {condition.config.hierarchyIds.map(id => {
                        const item = organizationHierarchy.find(h => h.id === id);
                        return item ? (
                            <Badge key={id} variant="secondary" className="flex items-center gap-1">
                                {item.name}
                                <button type="button" onClick={() => handleMultiSelectChange(condition.config.hierarchyIds, id, (values: string[]) => updateCondition(index, { hierarchyIds: values }))} className="rounded-full hover:bg-muted-foreground/20 p-0.5">
                                    <X className="h-3 w-3"/>
                                </button>
                            </Badge>
                        ) : null
                    })}
                  </div>
                </div>
            )
        case 'PRODUCT_HIERARCHY':
             return (
                <div>
                  <Label>Product Hierarchy</Label>
                  <Select onValueChange={(value) => handleMultiSelectChange(condition.config.productHierarchyIds, value, (values: string[]) => updateCondition(index, { productHierarchyIds: values }))}>
                      <SelectTrigger><SelectValue placeholder="Select product hierarchy levels..." /></SelectTrigger>
                      <SelectContent>
                          {productHierarchy.map(item => <SelectItem key={item.id} value={item.id}>{item.name} ({item.level})</SelectItem>)}
                      </SelectContent>
                  </Select>
                   <div className="flex flex-wrap gap-2 pt-2">
                    {condition.config.productHierarchyIds.map(id => {
                        const item = productHierarchy.find(h => h.id === id);
                        return item ? (
                            <Badge key={id} variant="secondary" className="flex items-center gap-1">
                                {item.name}
                                <button type="button" onClick={() => handleMultiSelectChange(condition.config.productHierarchyIds, id, (values: string[]) => updateCondition(index, { productHierarchyIds: values }))} className="rounded-full hover:bg-muted-foreground/20 p-0.5">
                                    <X className="h-3 w-3"/>
                                </button>
                            </Badge>
                        ) : null
                    })}
                  </div>
                </div>
            )
        case 'PRODUCT_PURCHASE':
            return (
                 <div className='grid grid-cols-2 gap-4'>
                    <div>
                        <Label>Product</Label>
                        <Select value={condition.config.productId} onValueChange={value => updateCondition(index, {...condition.config, productId: value})}>
                           <SelectTrigger><SelectValue placeholder="Select product..." /></SelectTrigger>
                            <SelectContent>
                                {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Minimum Quantity</Label>
                        <Input type='number' value={condition.config.quantity} onChange={e => updateCondition(index, {...condition.config, quantity: parseInt(e.target.value) || 0})} />
                    </div>
                </div>
            )
        case 'TOTAL_ORDER_VALUE':
             return (
                <div>
                    <Label>Minimum Value</Label>
                    <Input type='number' value={condition.config.minValue} onChange={e => updateCondition(index, {...condition.config, minValue: parseInt(e.target.value) || 0})} />
                </div>
             )
        case 'TOTAL_ORDER_QUANTITY':
            return (
                 <div>
                    <Label>Minimum Quantity</Label>
                    <Input type='number' value={condition.config.minQuantity} onChange={e => updateCondition(index, {...condition.config, minQuantity: parseInt(e.target.value) || 0})} />
                </div>
            )
        default:
            return null
    }
  }

  const renderActionContent = (action: Action, index: number) => {
    switch(action.type) {
        case 'PERCENTAGE_DISCOUNT':
            return (
                <div>
                    <Label>Discount Percentage</Label>
                    <Input type='number' value={action.config.discountPercentage} onChange={e => updateAction(index, { ...action.config, discountPercentage: parseInt(e.target.value) || 0 })} />
                </div>
            )
        case 'FIXED_VALUE_DISCOUNT':
            return (
                <div>
                    <Label>Discount Amount</Label>
                    <Input type='number' value={action.config.discountValue} onChange={e => updateAction(index, { discountValue: parseInt(e.target.value) || 0 })} />
                </div>
            )
        case 'FREE_PRODUCT':
             return (
                 <div className='grid grid-cols-2 gap-4'>
                    <div>
                        <Label>Product</Label>
                        <Select value={action.config.productId} onValueChange={value => updateAction(index, {...action.config, productId: value})}>
                           <SelectTrigger><SelectValue placeholder="Select product..." /></SelectTrigger>
                            <SelectContent>
                                {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Quantity</Label>
                        <Input type='number' value={action.config.quantity} onChange={e => updateAction(index, {...action.config, quantity: parseInt(e.target.value) || 0})} />
                    </div>
                </div>
            )
        case 'BUNDLE_PRICE':
            return (
                <div>
                    <Label>Bundle Price</Label>
                    <Input type='number' value={action.config.bundlePrice} onChange={e => updateAction(index, { bundlePrice: parseInt(e.target.value) || 0 })} />
                </div>
            )
        default:
            return null
    }
  }


  const handleDragEnd = (
    event: DragEndEvent,
    type: 'conditions' | 'actions'
  ) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = rule[type].findIndex((item, i) => `${type}-${i}` === active.id);
      const newIndex = rule[type].findIndex((item, i) => `${type}-${i}` === over.id);

      onRuleChange({
        ...rule,
        [type]: arrayMove(rule[type], oldIndex, newIndex),
      });
    }
  };

  const addCondition = (type: Condition['type']) => {
    let newCondition: Condition;
    switch (type) {
      case 'DATE_RANGE':
        newCondition = {
          type,
          config: { startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0] },
        };
        break;
      case 'CUSTOMER_HIERARCHY':
        newCondition = { type, config: { hierarchyIds: [] } };
        break;
      case 'PRODUCT_HIERARCHY':
        newCondition = { type, config: { productHierarchyIds: [] } };
        break;
      case 'PRODUCT_PURCHASE':
        newCondition = { type, config: { productId: '', quantity: 1 } };
        break;
      case 'TOTAL_ORDER_VALUE':
        newCondition = { type, config: { minValue: 0 } };
        break;
      case 'TOTAL_ORDER_QUANTITY':
        newCondition = { type, config: { productHierarchyIds: [], minQuantity: 1 } };
        break;
    }
    onRuleChange({
      ...rule,
      conditions: [...rule.conditions, newCondition],
    });
  };

  const addAction = (type: Action['type']) => {
    let newAction: Action;
    switch (type) {
      case 'PERCENTAGE_DISCOUNT':
        newAction = { type, config: { discountPercentage: 10, applicableProductHierarchyIds: [] } };
        break;
      case 'FIXED_VALUE_DISCOUNT':
        newAction = { type, config: { discountValue: 100 } };
        break;
      case 'FREE_PRODUCT':
        newAction = { type, config: { productId: '', quantity: 1 } };
        break;
      case 'BUNDLE_PRICE':
        newAction = { type, config: { bundlePrice: 100 } };
        break;
    }
    onRuleChange({ ...rule, actions: [...rule.actions, newAction] });
  };

  const removeCondition = (index: number) => {
    onRuleChange({
      ...rule,
      conditions: rule.conditions.filter((_, i) => i !== index),
    });
  };

  const removeAction = (index: number) => {
    onRuleChange({
      ...rule,
      actions: rule.actions.filter((_, i) => i !== index),
    });
  };

  const renderCondition = (condition: Condition, index: number) => {
    const meta = conditionMetadata[condition.type];
    return (
      <Card key={index} className="w-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-3">
            <meta.icon className="h-6 w-6 text-muted-foreground" />
            <div>
              <CardTitle className="text-lg">{meta.label}</CardTitle>
              <CardDescription className="text-xs">
                {meta.description}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeCondition(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {renderConditionContent(condition, index)}
        </CardContent>
      </Card>
    );
  };

  const renderAction = (action: Action, index: number) => {
    const meta = actionMetadata[action.type];
    return (
      <Card key={index} className="w-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-3">
            <meta.icon className="h-6 w-6 text-muted-foreground" />
            <div>
              <CardTitle className="text-lg">{meta.label}</CardTitle>
              <CardDescription className="text-xs">
                {meta.description}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeAction(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
           {renderActionContent(action, index)}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Rule Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
                <Label htmlFor="rule-name">Rule Name</Label>
                <Input id="rule-name" value={rule.name} onChange={(e) => onRuleChange({...rule, name: e.target.value})} />
            </div>
             <div>
                <Label htmlFor="rule-description">Description</Label>
                <Input id="rule-description" value={rule.description} onChange={(e) => onRuleChange({...rule, description: e.target.value})} />
            </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Conditions Column */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center font-bold text-sm">
              IF
            </span>
            <span>Conditions are met</span>
          </h2>
          <p className="text-muted-foreground text-sm">
              An order must satisfy ALL of these conditions for the promotion to apply.
          </p>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(e) => handleDragEnd(e, 'conditions')}
          >
            <SortableContext
              items={rule.conditions.map((_, i) => `conditions-${i}`)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {rule.conditions.map((c, i) => (
                  <SortableItem key={`conditions-${i}`} id={`conditions-${i}`}>
                    {renderCondition(c, i)}
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Condition
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72">
              {ConditionTypeSchema.options.map((type) => (
                <DropdownMenuItem key={type} onSelect={() => addCondition(type)}>
                  <conditionMetadata[type].icon className="mr-2 h-4 w-4" />
                  <span>{conditionMetadata[type].label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Actions Column */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="bg-accent text-accent-foreground rounded-full h-8 w-8 flex items-center justify-center font-bold text-sm">
              THEN
            </span>
            <span>Apply benefits</span>
          </h2>
           <p className="text-muted-foreground text-sm">
              If all conditions are met, the following benefits will be applied to the order.
          </p>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(e) => handleDragEnd(e, 'actions')}
          >
            <SortableContext
              items={rule.actions.map((_, i) => `actions-${i}`)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {rule.actions.map((a, i) => (
                  <SortableItem key={`actions-${i}`} id={`actions-${i}`}>
                    {renderAction(a, i)}
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Action
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72">
              {ActionTypeSchema.options.map((type) => (
                <DropdownMenuItem key={type} onSelect={() => addAction(type)}>
                  <actionMetadata[type].icon className="mr-2 h-4 w-4" />
                  <span>{actionMetadata[type].label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Separator />
      <div className="flex justify-end">
          <Button size="lg">
            <Sparkles className="mr-2 h-4 w-4" />
            Save Dynamic Rule
          </Button>
      </div>
    </div>
  );
}
