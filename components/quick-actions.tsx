import { Button } from "@/components/ui/button"
import { Send, Download, QrCode, Calendar } from "lucide-react"

export function QuickActions() {
  return (
    <div className="grid grid-cols-4 gap-3">
      <Button variant="outline" className="flex-col h-auto py-4 gap-2 bg-transparent">
        <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
          <Send className="h-5 w-5" />
        </div>
        <span className="text-xs">Send</span>
      </Button>

      <Button variant="outline" className="flex-col h-auto py-4 gap-2 bg-transparent">
        <div className="h-10 w-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
          <Download className="h-5 w-5" />
        </div>
        <span className="text-xs">Receive</span>
      </Button>

      <Button variant="outline" className="flex-col h-auto py-4 gap-2 bg-transparent">
        <div className="h-10 w-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
          <QrCode className="h-5 w-5" />
        </div>
        <span className="text-xs">QR Code</span>
      </Button>

      <Button variant="outline" className="flex-col h-auto py-4 gap-2 bg-transparent">
        <div className="h-10 w-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
          <Calendar className="h-5 w-5" />
        </div>
        <span className="text-xs">Schedule</span>
      </Button>
    </div>
  )
}
