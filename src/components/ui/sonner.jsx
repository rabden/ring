import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      closeButton={(id) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            // This function is provided by sonner to close a specific toast
            props.dismiss?.(id)
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      {...props}
    />
  )
}

export { Toaster }