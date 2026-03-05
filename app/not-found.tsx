import Link from "next/link";
import { PackageX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 flex items-center justify-center blur-2xl opacity-20">
          <div className="h-32 w-32 rounded-full bg-primary" />
        </div>
        <PackageX
          className="relative h-20 w-20 text-muted-foreground/60"
          strokeWidth={1.2}
        />
      </div>

      <h1 className="text-7xl font-extrabold tracking-tighter text-foreground">
        404
      </h1>
      <p className="mt-2 text-xl font-medium text-muted-foreground">
        Page not found
      </p>
      <p className="mt-4 max-w-md text-sm text-muted-foreground/80">
        Sorry, the page you&apos;re looking for doesn&apos;t exist or has been
        moved.
      </p>

      <div className="mt-8 flex gap-3">
        <Link href="/">
          <Button size="lg">Back to Home</Button>
        </Link>
        <Link href="/products">
          <Button variant="outline" size="lg">
            Browse Products
          </Button>
        </Link>
      </div>
    </div>
  );
}
