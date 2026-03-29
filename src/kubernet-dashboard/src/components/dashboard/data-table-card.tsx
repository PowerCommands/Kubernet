import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

type DataTableCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function DataTableCard({ title, description, children }: DataTableCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full">
          <div className="min-w-[720px]">{children}</div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
