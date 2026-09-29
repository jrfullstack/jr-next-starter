"use client";

import { CircleUser } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth/client";
import { authRoutes } from "@/lib/auth/routes";

/**
 * Reads the session on the client so pages that include the header
 * (like the landing page) can stay static.
 */
export function UserMenu() {
  const t = useTranslations("UserMenu");
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  // Same size as the button, so the header doesn't jump while loading
  if (isPending) return <div className="size-8" aria-hidden />;

  if (!session) {
    return (
      <Link
        href={authRoutes.signIn}
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        {t("signIn")}
      </Link>
    );
  }

  const signOut = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="icon" />}>
        <CircleUser />
        <span className="sr-only">{t("account")}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <p className="font-medium text-foreground">{session.user.name}</p>
            <p className="text-xs">{session.user.email}</p>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href={authRoutes.afterSignIn} />}>
          {t("dashboard")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={signOut}>{t("signOut")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
