import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search, Pencil, Trash2 } from "lucide-react"

// Mock product data
const products = [
  {
    id: 1,
    name: "Premium Headphones",
    category: "Electronics",
    price: "$299.99",
    stock: 45,
    status: "active",
  },
  {
    id: 2,
    name: "Wireless Mouse",
    category: "Electronics",
    price: "$49.99",
    stock: 120,
    status: "active",
  },
  {
    id: 3,
    name: "Mechanical Keyboard",
    category: "Electronics",
    price: "$159.99",
    stock: 8,
    status: "low-stock",
  },
  {
    id: 4,
    name: "USB-C Cable",
    category: "Accessories",
    price: "$19.99",
    stock: 0,
    status: "out-of-stock",
  },
  {
    id: 5,
    name: "Laptop Stand",
    category: "Accessories",
    price: "$79.99",
    stock: 67,
    status: "active",
  },
]

function getStatusBadge(status: string) {
  switch (status) {
    case "active":
      return <Badge variant="default">Active</Badge>
    case "low-stock":
      return <Badge variant="secondary">Low Stock</Badge>
    case "out-of-stock":
      return <Badge variant="destructive">Out of Stock</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function ProductsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">
            Manage your product inventory
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product List</CardTitle>
          <CardDescription>
            A list of all products in your store
          </CardDescription>
          <div className="flex items-center space-x-2 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.price}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>{getStatusBadge(product.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
