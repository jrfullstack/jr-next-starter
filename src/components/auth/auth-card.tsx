import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldDescription } from "@/components/ui/field";

/** Layout shared by the auth pages: title, description, content and an optional footer link */
export function AuthCard({
  title,
  description,
  footer,
  children,
}: {
  title: string;
  description: string;
  footer?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h1>{title}</h1>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {children}
        {footer && (
          <FieldDescription className="text-center">{footer}</FieldDescription>
        )}
      </CardContent>
    </Card>
  );
}
