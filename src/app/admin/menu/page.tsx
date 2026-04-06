'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Edit, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const initialMenuData = {
  appetizers: [
    {
      id: 'app1',
      name: 'Gator Bites',
      description: 'Crispy fried alligator tail served with a zesty datil pepper aioli. A true taste of Florida.',
      price: 18.00,
      image: { src: 'https://firebasestorage.googleapis.com/v0/b/gastronomic-ai-landing.firebasestorage.app/o/Chez%20Lui%20Cafe%2FGastronomic%20Ai%2FImages%2FGator_Bites_with.jpeg?alt=media&token=608f7f95-9e53-45ab-a340-00165eeec108', hint: 'gator bites' },
      modifiers: [
        { name: 'Extra Aioli', price: 1.50 },
        { name: 'Make it Spicy', price: 1.00 },
      ],
    },
    {
      id: 'app2',
      name: 'Key West Conch Fritters',
      description: 'Golden brown and delicious fritters packed with fresh conch, served with a lime-mustard sauce.',
      price: 16.00,
      image: { src: 'https://firebasestorage.googleapis.com/v0/b/gastronomic-ai-landing.firebasestorage.app/o/Chez%20Lui%20Cafe%2FGastronomic%20Ai%2FImages%2FConch%20fritters.jpeg?alt=media&token=6856c76e-870f-4567-aa3e-3745a3810bc0', hint: 'conch fritters' },
      modifiers: [],
    },
  ],
  mainCourses: [
    {
      id: 'main1',
      name: 'Pan-Seared Gulf Snapper',
      description: 'Locally sourced snapper with a citrus butter sauce, served over coconut-infused rice and seasonal vegetables.',
      price: 38.00,
      image: { src: 'https://firebasestorage.googleapis.com/v0/b/gastronomic-ai-landing.firebasestorage.app/o/Chez%20Lui%20Cafe%2FGastronomic%20Ai%2FImages%2FPan-Seared%20Gulf%20Snapper.jpeg?alt=media&token=c10ec2b2-a659-4f34-a26f-9c2fe46c812c', hint: 'seared snapper' },
      modifiers: [
        { name: 'Add Grilled Shrimp', price: 12.00 },
        { name: 'Blackened Seasoning', price: 2.00 },
      ],
    },
    {
      id: 'main2',
      name: 'Floridian Skirt Steak',
      description: 'Marinated in sour orange and fresh herbs, this grilled skirt steak is served with yucca fries and chimichurri.',
      price: 42.00,
      image: { src: 'https://firebasestorage.googleapis.com/v0/b/gastronomic-ai-landing.firebasestorage.app/o/Chez%20Lui%20Cafe%2FGastronomic%20Ai%2FImages%2FFloridian%20Skirt%20Steak.jpeg?alt=media&token=2fb45026-429b-4a89-91cb-e7d5268fbd05', hint: 'skirt steak' },
      modifiers: [
        { name: 'Add Blue Cheese', price: 4.00 },
        { name: 'Sautéed Onions', price: 3.00 },
      ],
    },
  ],
  desserts: [
    {
      id: 'des1',
      name: 'Key Lime Pie',
      description: 'An iconic Florida dessert. Tangy, sweet, and creamy with a graham cracker crust and whipped cream.',
      price: 12.00,
      image: { src: 'https://firebasestorage.googleapis.com/v0/b/gastronomic-ai-landing.firebasestorage.app/o/Chez%20Lui%20Cafe%2FGastronomic%20Ai%2FImages%2FKey%20Lime%20Pie.jpeg?alt=media&token=bedfa68c-0441-4370-82be-ef0d0666197a', hint: 'key lime pie' },
      modifiers: [],
    },
  ],
};

const modifierSchema = z.object({
  name: z.string().min(1, 'Modifier name is required.'),
  price: z.coerce.number().min(0, 'Price cannot be negative.'),
});

const menuItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Item name is required.'),
  description: z.string().min(1, 'Description is required.'),
  price: z.coerce.number().positive('Price must be a positive number.'),
  image: z.object({
    src: z.string().url('Must be a valid URL.'),
    hint: z.string().optional(),
  }),
  modifiers: z.array(modifierSchema),
  category: z.enum(['appetizers', 'mainCourses', 'desserts']),
});

type MenuItemFormData = z.infer<typeof menuItemSchema>;

type MenuItem = {
    id: string;
    name: string;
    description: string;
    price: number;
    image: { src: string; hint?: string | undefined; };
    modifiers: { name: string; price: number; }[];
}

type MenuData = {
  appetizers: MenuItem[];
  mainCourses: MenuItem[];
  desserts: MenuItem[];
};
type MenuCategoryKey = keyof MenuData;

type MenuCategoryProps = {
    title: string;
    items: MenuItem[];
    onEdit: (item: MenuItem) => void;
}

const MenuCategory = ({ title, items, onEdit }: MenuCategoryProps) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-headline font-bold">{title}</h2>
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map(item => (
        <Card key={item.id} className="flex flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="p-0">
            <Image
              src={item.image.src}
              alt={item.name}
              data-ai-hint={item.image.hint}
              width={600}
              height={400}
              className="rounded-t-lg object-cover aspect-video"
            />
          </CardHeader>
          <CardContent className="pt-6 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-2">
                <CardTitle className="text-xl font-headline">{item.name}</CardTitle>
                <div className="text-lg font-bold text-primary">${item.price.toFixed(2)}</div>
            </div>
            <CardDescription className="mb-4 flex-1">{item.description}</CardDescription>
            {item.modifiers.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Modifiers:</h4>
                    <div className="flex flex-wrap gap-2">
                        {item.modifiers.map(mod => (
                            <Badge key={mod.name} variant="secondary">{mod.name} (+${mod.price.toFixed(2)})</Badge>
                        ))}
                    </div>
                </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => onEdit(item)}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  </div>
);


export default function MenuManagementPage() {
  const { toast } = useToast();
  const [menuData, setMenuData] = useState<MenuData>(initialMenuData);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemFormData | null>(null);

  const form = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "modifiers",
  });
  
  useEffect(() => {
      if (isFormOpen) {
          form.reset(editingItem ?? {
              name: '',
              description: '',
              price: 0,
              image: { src: '', hint: '' },
              modifiers: [],
              category: 'appetizers',
          });
      }
  }, [isFormOpen, editingItem, form]);

  const handleEdit = (item: MenuItem) => {
    const category = Object.keys(menuData).find(cat => 
        menuData[cat as MenuCategoryKey].some(i => i.id === item.id)
    ) as MenuCategoryKey;

    if (category) {
        setEditingItem({ ...item, category });
        setIsFormOpen(true);
    }
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const onSubmit = (data: MenuItemFormData) => {
    const categoryKey = data.category;

    setMenuData(prevData => {
        const newData = { ...prevData };
        
        if (editingItem && editingItem.id) { // This is an update
            // Remove from old category if category changed
            if(editingItem.category !== data.category) {
                 newData[editingItem.category] = newData[editingItem.category].filter(i => i.id !== editingItem.id);
            }
            
            const targetCategory = newData[categoryKey].filter(i => i.id !== editingItem.id);
            const newItem: MenuItem = { ...data, id: editingItem.id };
            newData[categoryKey] = [...targetCategory, newItem].sort((a,b) => a.name.localeCompare(b.name));
            
            toast({ title: "Item Updated", description: `"${data.name}" has been updated.` });
        } else { // This is a new item
            const newItem: MenuItem = { ...data, id: new Date().toISOString() };
            newData[categoryKey] = [...newData[categoryKey], newItem].sort((a,b) => a.name.localeCompare(b.name));
            
            toast({ title: "Item Added", description: `"${data.name}" has been added to the menu.` });
        }

        return newData;
    });

    setIsFormOpen(false);
    setEditingItem(null);
  };
  
  return (
    <>
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-4">
          <div>
              <h1 className="text-3xl font-headline font-bold">Online Ordering & Menu Management</h1>
              <p className="text-muted-foreground">Menu for Floridian Modern Cuisine. Manage your menu items, descriptions, prices, and modifiers below.</p>
          </div>
          <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2" />
            Add New Menu Item
          </Button>
        </div>
        <Separator className="my-8" />
        <div className="space-y-12">
          <MenuCategory title="Appetizers" items={menuData.appetizers} onEdit={handleEdit}/>
          <MenuCategory title="Main Courses" items={menuData.mainCourses} onEdit={handleEdit} />
          <MenuCategory title="Desserts" items={menuData.desserts} onEdit={handleEdit} />
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline">{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
            <DialogDescription>
              {editingItem ? `Make changes to "${editingItem.name}".` : "Add a new item to your menu."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-6">
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Item Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="price" render={({ field }) => (
                        <FormItem><FormLabel>Price ($)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="category" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="appetizers">Appetizers</SelectItem>
                                    <SelectItem value="mainCourses">Main Courses</SelectItem>
                                    <SelectItem value="desserts">Desserts</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}/>
                </div>
                 <FormField control={form.control} name="image.src" render={({ field }) => (
                    <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <Separator />
                 <div>
                    <Label>Modifiers</Label>
                    <div className="space-y-2 mt-2">
                        {fields.map((field, index) => (
                             <div key={field.id} className="flex items-center gap-2">
                                <FormField control={form.control} name={`modifiers.${index}.name`} render={({ field }) => (
                                    <FormItem className="flex-1"><FormControl><Input placeholder="Modifier name" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name={`modifiers.${index}.price`} render={({ field }) => (
                                     <FormItem><FormControl><Input type="number" step="0.01" placeholder="Price" className="w-24" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><X className="h-4 w-4 text-destructive"/></Button>
                            </div>
                        ))}
                    </div>
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ name: '', price: 0 })}>
                        <PlusCircle className="mr-2 h-4 w-4"/> Add Modifier
                    </Button>
                 </div>
              <DialogFooter className="sticky bottom-0 bg-background pt-4 pb-0 -mb-4">
                <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
