import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RotateCw } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

function Reset({ onReset }: { onReset: () => void }) {
  const [isResetOpen, setIsResetOpen] = useState(false);

  return (
    <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
      <DialogTrigger asChild>
        <Button
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 focus-visible:ring-red-400/20 focus-visible:border-red-400 flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-400/5 hover:border-red-400/30 transition-all"
          title="إعادة تعيين"
        >
          <RotateCw className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">إعادة تعيين؟</DialogTitle>
          <DialogDescription className="text-muted-foreground pt-2">
            هل أنت متأكد من إعادة تعيين جميع أذكار اليوم؟ سيتم تصفير جميع
            العدادات.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            className="rounded"
            onClick={() => setIsResetOpen(false)}
          >
            تراجع
          </Button>
          <Button
            variant="destructive"
            className="rounded"
            onClick={() => {
              onReset();
              setIsResetOpen(false);
            }}
          >
            نعم، ابدأ من جديد
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default Reset;
