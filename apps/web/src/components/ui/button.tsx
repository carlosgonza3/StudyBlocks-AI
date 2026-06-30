import type { ComponentProps } from "react";

import type { VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

type ButtonProps = ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
};

function Button({
                    className,
                    variant = "default",
                    size = "default",
                    asChild = false,
                    ...props
                }: ButtonProps) {
    const Component = asChild ? Slot.Root : "button";

    return (
        <Component
            data-slot="button"
            data-variant={variant}
            data-size={size}
            className={cn(
                buttonVariants({
                    variant,
                    size,
                    className,
                }),
            )}
            {...props}
        />
    );
}

export { Button };